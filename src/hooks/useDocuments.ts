import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DocumentRecord,
  DocumentSortOption,
  SupportedDocumentType,
  ProcessingStatus,
  validateDocumentFile,
  sanitizeStorageFileName,
} from '../types/document';

import { documentService } from '../services/documentService';
import { storageService } from '../services/storageService';
import { extractDocumentText } from '../services/extractionService';

export interface UploadProgressState {
  documentId: string;
  fileName: string;
  percent: number;
  stage: 'uploading' | 'extracting' | 'finalizing' | 'completed' | 'failed';
  error?: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | SupportedDocumentType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProcessingStatus>('all');
  const [sortBy, setSortBy] = useState<DocumentSortOption>('newest');

  // Active uploads progress tracker
  const [activeUploads, setActiveUploads] = useState<Record<string, UploadProgressState>>({});

  // Real-time Firestore sync
  useEffect(() => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = documentService.subscribeUserDocuments(
      user.uid,
      (docs) => {
        setDocuments(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load documents.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Upload pipeline
  const uploadDocument = useCallback(
    async (file: File): Promise<string> => {
      if (!user) {
        throw new Error('Authentication required to upload documents.');
      }

      // 1. Validate File
      const validation = validateDocumentFile(file);
      if (!validation.valid || !validation.fileType) {
        throw new Error(validation.error || 'Invalid file.');
      }

      const documentId = crypto.randomUUID();
      const detectedType = validation.fileType;
      const sanitizedName = sanitizeStorageFileName(file.name);
      const nowIso = new Date().toISOString();

      // Track active upload progress in UI
      setActiveUploads((prev) => ({
        ...prev,
        [documentId]: {
          documentId,
          fileName: file.name,
          percent: 25,
          stage: 'uploading',
        },
      }));

      try {
        // 2. Extract Document Text Client-Side
        setActiveUploads((prev) => ({
          ...prev,
          [documentId]: {
            documentId,
            fileName: file.name,
            percent: 50,
            stage: 'extracting',
          },
        }));

        let extraction;
        try {
          extraction = await extractDocumentText(file, detectedType);
        } catch (extractErr: any) {
          const failMsg = extractErr?.message || 'Text extraction failed.';
          setActiveUploads((prev) => ({
            ...prev,
            [documentId]: {
              documentId,
              fileName: file.name,
              percent: 100,
              stage: 'failed',
              error: failMsg,
            },
          }));
          throw extractErr;
        }

        // 3. Store file in local storage vault & optional background cloud
        setActiveUploads((prev) => ({
          ...prev,
          [documentId]: {
            documentId,
            fileName: file.name,
            percent: 80,
            stage: 'finalizing',
          },
        }));

        let storagePath = `local://${documentId}/${sanitizedName}`;
        try {
          const uploadRes = await storageService.uploadDocumentFile(
            user.uid,
            documentId,
            file
          );
          if (uploadRes?.storagePath) {
            storagePath = uploadRes.storagePath;
          }
        } catch (storageErr) {
          console.warn('Storage upload fallback notice:', storageErr);
        }

        // 4. Create and save ready DocumentRecord
        const readyRecord: DocumentRecord = {
          id: documentId,
          userId: user.uid,
          fileName: file.name,
          originalFileName: file.name,
          fileType: detectedType,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
          storagePath,
          uploadedAt: nowIso,
          updatedAt: nowIso,
          processingStatus: 'ready',
          extractionStatus: 'completed',
          extractedText: extraction.text,
          pageCount: extraction.pageCount || 1,
          wordCount: extraction.wordCount,
          versionCount: 1,
        };

        await documentService.createDocumentRecord(user.uid, readyRecord);

        setActiveUploads((prev) => ({
          ...prev,
          [documentId]: {
            documentId,
            fileName: file.name,
            percent: 100,
            stage: 'completed',
          },
        }));

        // Clean up completed upload badge after 4 seconds
        setTimeout(() => {
          setActiveUploads((prev) => {
            const next = { ...prev };
            delete next[documentId];
            return next;
          });
        }, 4000);

        return documentId;
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to complete document processing.';
        setActiveUploads((prev) => ({
          ...prev,
          [documentId]: {
            documentId,
            fileName: file.name,
            percent: 100,
            stage: 'failed',
            error: errorMsg,
          },
        }));

        throw err;
      }
    },
    [user]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (documentId: string, storagePath: string): Promise<void> => {
      if (!user) {
        throw new Error('Authentication required to delete documents.');
      }

      await documentService.deleteDocument(user.uid, documentId, storagePath);
    },
    [user]
  );

  // Filter and sort computation
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search filter (by name)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = doc.fileName.toLowerCase().includes(query);
          const matchesOriginal = doc.originalFileName.toLowerCase().includes(query);
          if (!matchesName && !matchesOriginal) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && doc.fileType !== typeFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && doc.processingStatus !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
          case 'oldest':
            return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          case 'name-asc':
            return a.fileName.localeCompare(b.fileName, undefined, { sensitivity: 'base' });
          case 'name-desc':
            return b.fileName.localeCompare(a.fileName, undefined, { sensitivity: 'base' });
          default:
            return 0;
        }
      });
  }, [documents, searchQuery, typeFilter, statusFilter, sortBy]);

  const clearUploadProgress = useCallback((docId: string) => {
    setActiveUploads((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  }, []);

  return {
    documents: filteredDocuments,
    allDocumentsCount: documents.length,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    activeUploads,
    uploadDocument,
    deleteDocument,
    clearUploadProgress,
  };
}
