import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { insightService, InsightServiceError } from '../services/insightService';
import {
  InsightRecord,
  ChecklistTaskItem,
  ChecklistTaskStatus,
} from '../types/insight';
import { DocumentMetadata } from '../types/document';
import { LegalAnalysisOutput } from '../types/analysis';

export function useDocumentInsights(document: DocumentMetadata | null) {
  const { user } = useAuth();

  const [insightRecord, setInsightRecord] = useState<InsightRecord | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Real-time subscription to stored insights
  useEffect(() => {
    if (!user || !document) {
      setInsightRecord(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = insightService.subscribeDocumentInsights(
      user.uid,
      document.id,
      (record) => {
        setInsightRecord(record);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to sync insights with database.');
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, document?.id]);

  // 2. Real-time subscription to checklist tasks
  useEffect(() => {
    if (!user || !document) {
      setChecklistItems([]);
      return;
    }

    const unsubscribe = insightService.subscribeChecklistItems(
      user.uid,
      document.id,
      (items) => {
        setChecklistItems(items);
      },
      (err) => {
        console.warn('Checklist sync error:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, document?.id]);

  // Check if existing insights are stale relative to the document
  const isStale = useMemo(() => {
    if (!insightRecord || !document) return false;
    const docTime = new Date(document.uploadedAt).getTime();
    const insightTime = new Date(insightRecord.createdAt).getTime();
    return docTime > insightTime;
  }, [insightRecord, document?.uploadedAt]);

  // Generate or regenerate insights
  const generateInsights = useCallback(
    async (existingAnalysis?: LegalAnalysisOutput | null) => {
      if (!user) {
        setError('Please sign in to generate legal insights.');
        return;
      }

      if (!document) {
        setError('No document selected.');
        return;
      }

      if (document.processingStatus !== 'ready' || !document.extractedText) {
        setError('Document is still processing or has no extracted text available.');
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const record = await insightService.requestDocumentInsights({
          documentId: document.id,
          userId: user.uid,
          fileName: document.originalFileName || document.fileName,
          fileType: document.fileType,
          extractedText: document.extractedText,
          processingStatus: document.processingStatus,
          existingAnalysis: existingAnalysis || null,
        });

        setInsightRecord(record);
      } catch (err: any) {
        const msg =
          err instanceof InsightServiceError
            ? err.message
            : err?.message || 'Failed to generate legal insights.';
        setError(msg);
      } finally {
        setIsGenerating(false);
      }
    },
    [user, document]
  );

  // Update checklist task status
  const updateTaskStatus = useCallback(
    async (itemId: string, status: ChecklistTaskStatus) => {
      if (!user || !document) return;
      try {
        await insightService.updateChecklistItemStatus(user.uid, document.id, itemId, status);
      } catch (err: any) {
        console.error('Failed to update task status:', err);
      }
    },
    [user, document]
  );

  // Add custom checklist item
  const addTask = useCallback(
    async (taskData: Omit<ChecklistTaskItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user || !document) return;
      try {
        await insightService.addChecklistItem(user.uid, document.id, taskData);
      } catch (err: any) {
        setError(err?.message || 'Failed to add checklist item.');
      }
    },
    [user, document]
  );

  // Delete checklist item
  const deleteTask = useCallback(
    async (itemId: string) => {
      if (!user || !document) return;
      try {
        await insightService.deleteChecklistItem(user.uid, document.id, itemId);
      } catch (err: any) {
        setError(err?.message || 'Failed to delete checklist item.');
      }
    },
    [user, document]
  );

  return {
    insightRecord,
    checklistItems,
    isLoading,
    isGenerating,
    isStale,
    error,
    generateInsights,
    updateTaskStatus,
    addTask,
    deleteTask,
    clearError: () => setError(null),
  };
}
