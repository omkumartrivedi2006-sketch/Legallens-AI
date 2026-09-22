import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { comparisonService, ComparisonServiceError } from '../services/comparisonService';
import { ComparisonRecord } from '../types/comparison';
import { DocumentMetadata } from '../types/document';

export function useDocumentComparison(initialDocA?: DocumentMetadata | null) {
  const { user } = useAuth();

  const [documentA, setDocumentA] = useState<DocumentMetadata | null>(initialDocA || null);
  const [documentB, setDocumentB] = useState<DocumentMetadata | null>(null);
  const [activeComparison, setActiveComparison] = useState<ComparisonRecord | null>(null);
  const [comparisonsList, setComparisonsList] = useState<ComparisonRecord[]>([]);

  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch past comparisons
  const fetchComparisonsList = useCallback(async () => {
    if (!user) {
      setComparisonsList([]);
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const records = await comparisonService.getComparisons(user.uid);
      setComparisonsList(records);
    } catch (err) {
      console.warn('Failed to load comparison history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    fetchComparisonsList();
  }, [fetchComparisonsList]);

  // Swap documents A and B
  const swapDocuments = useCallback(() => {
    setDocumentA(documentB);
    setDocumentB(documentA);
    setError(null);
  }, [documentA, documentB]);

  // Run new comparison
  const runComparison = useCallback(async () => {
    if (!user) {
      setError('Please sign in to compare documents.');
      return;
    }

    if (!documentA || !documentB) {
      setError('Please select both Document A and Document B to compare.');
      return;
    }

    if (documentA.id === documentB.id) {
      setError('Please select two different documents to compare.');
      return;
    }

    if (documentA.processingStatus !== 'ready' || !documentA.extractedText) {
      setError(`Document A ("${documentA.originalFileName || documentA.fileName}") is still being processed or has no extracted text.`);
      return;
    }

    if (documentB.processingStatus !== 'ready' || !documentB.extractedText) {
      setError(`Document B ("${documentB.originalFileName || documentB.fileName}") is still being processed or has no extracted text.`);
      return;
    }

    setError(null);
    setIsComparing(true);
    setProgressStage('Aligning document sections & running deterministic diff...');

    try {
      setTimeout(() => {
        setProgressStage('Generating semantic explanations with Gemini...');
      }, 1500);

      const record = await comparisonService.requestDocumentComparison({
        documentA,
        documentB,
      });

      setActiveComparison(record);
      setComparisonsList((prev) => [record, ...prev]);
      setProgressStage(null);
    } catch (err: any) {
      const msg =
        err instanceof ComparisonServiceError
          ? err.message
          : err?.message || 'Comparison failed. Please try again.';
      setError(msg);
      setProgressStage(null);
    } finally {
      setIsComparing(false);
    }
  }, [user, documentA, documentB]);

  // Load a single comparison by ID
  const loadComparisonById = useCallback(
    async (comparisonId: string): Promise<ComparisonRecord | null> => {
      if (!user) return null;
      setError(null);

      try {
        const record = await comparisonService.getComparisonById(user.uid, comparisonId);
        if (record) {
          setActiveComparison(record);
        } else {
          setError('Comparison record not found or access denied.');
        }
        return record;
      } catch (err: any) {
        setError(err?.message || 'Failed to load comparison record.');
        return null;
      }
    },
    [user]
  );

  // Delete comparison
  const deleteComparisonRecord = useCallback(
    async (comparisonId: string) => {
      if (!user) return;
      try {
        await comparisonService.deleteComparison(user.uid, comparisonId);
        setComparisonsList((prev) => prev.filter((c) => c.id !== comparisonId));
        if (activeComparison?.id === comparisonId) {
          setActiveComparison(null);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to delete comparison.');
      }
    },
    [user, activeComparison?.id]
  );

  return {
    documentA,
    documentB,
    setDocumentA,
    setDocumentB,
    swapDocuments,
    activeComparison,
    setActiveComparison,
    comparisonsList,
    isComparing,
    progressStage,
    isLoadingHistory,
    error,
    runComparison,
    loadComparisonById,
    deleteComparisonRecord,
    clearComparison: () => {
      setActiveComparison(null);
      setError(null);
    },
    clearError: () => setError(null),
  };
}
