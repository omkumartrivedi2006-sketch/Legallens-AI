import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnalysisRecord } from '../types/analysis';
import { aiService } from '../services/aiService';

export function useDocumentAnalysis(documentId: string | undefined) {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for document analyses
  useEffect(() => {
    if (!user || !documentId) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = aiService.subscribeDocumentAnalyses(
      user.uid,
      documentId,
      (records) => {
        setAnalyses(records);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, documentId]);

  const latestAnalysis = useMemo(() => {
    return analyses.length > 0 ? analyses[0] : null;
  }, [analyses]);

  const triggerAnalysis = useCallback(
    async (params: {
      fileName: string;
      fileType: string;
      extractedText: string;
      processingStatus?: string;
      versionId?: string;
    }): Promise<AnalysisRecord> => {
      if (!user) {
        throw new Error('You must be signed in to analyze documents.');
      }
      if (!documentId) {
        throw new Error('Document ID is required.');
      }
      if (isAnalyzing) {
        throw new Error('An analysis is already actively in progress.');
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const record = await aiService.requestDocumentAnalysis({
          documentId,
          userId: user.uid,
          fileName: params.fileName,
          fileType: params.fileType,
          extractedText: params.extractedText,
          processingStatus: params.processingStatus,
          versionId: params.versionId,
        });

        // Update local list optimistically if subscription has any latency
        setAnalyses((prev) => [record, ...prev.filter((a) => a.id !== record.id)]);
        return record;
      } catch (err: any) {
        const message = err?.message || 'Failed to complete AI document analysis.';
        setError(message);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [user, documentId, isAnalyzing]
  );

  return {
    analyses,
    latestAnalysis,
    loading,
    isAnalyzing,
    error,
    setError,
    triggerAnalysis,
  };
}
