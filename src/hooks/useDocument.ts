import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { DocumentRecord } from '../types/document';
import { documentService } from '../services/documentService';
import { storageService } from '../services/storageService';

export function useDocument(documentId: string | undefined) {
  const { user } = useAuth();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (!user || !documentId) {
      setDocument(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = documentService.subscribeSingleDocument(
      user.uid,
      documentId,
      (doc) => {
        setDocument(doc);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load document.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, documentId]);

  // Download handler
  const getDownloadUrl = useCallback(async (): Promise<string> => {
    if (!document) {
      throw new Error('Document details not available.');
    }

    setDownloading(true);
    try {
      const url = await storageService.getDocumentDownloadUrl(document.storagePath);
      setDownloadUrl(url);
      return url;
    } finally {
      setDownloading(false);
    }
  }, [document]);

  // Delete handler
  const deleteThisDocument = useCallback(async (): Promise<void> => {
    if (!user || !document) {
      throw new Error('Cannot delete document: Not found or unauthorized.');
    }

    await documentService.deleteDocument(user.uid, document.id, document.storagePath);
  }, [user, document]);

  return {
    document,
    loading,
    error,
    downloadUrl,
    downloading,
    getDownloadUrl,
    deleteThisDocument,
  };
}
