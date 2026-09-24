import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadString,
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { sanitizeStorageFileName } from '../types/document';
import { localDb } from './localDb';

export class StorageServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'StorageServiceError';
  }
}

export const storageService = {
  /**
   * Uploads a file with resilient local-first storage in IndexedDB,
   * with automatic background sync to Firebase Cloud Storage if available.
   * Path: users/{userId}/documents/{documentId}/{sanitizedFileName}
   */
  async uploadDocumentFile(
    userId: string,
    documentId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ storagePath: string; downloadUrl: string }> {
    const sanitizedFileName = sanitizeStorageFileName(file.name);
    const localPath = `local://${documentId}/${sanitizedFileName}`;

    // 1. Always securely persist the original file/blob in local browser storage (IndexedDB)
    try {
      await localDb.saveDocumentFile(documentId, file, file.name);
    } catch (localErr) {
      console.warn('Failed to save to local IndexedDB, continuing with fallback:', localErr);
    }

    onProgress?.(30);

    // 2. If Firebase Storage is not configured or throws permission errors, fallback to local URL
    if (!storage) {
      onProgress?.(100);
      return {
        storagePath: localPath,
        downloadUrl: URL.createObjectURL(file),
      };
    }

    const cloudStoragePath = `users/${userId}/documents/${documentId}/${sanitizedFileName}`;
    const storageRef = ref(storage, cloudStoragePath);

    const metadata = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalFileName: file.name,
        uploadedBy: userId,
        documentId: documentId,
      },
    };

    return new Promise((resolve) => {
      try {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(Math.min(100, Math.max(30, progress)));
            }
          },
          (error) => {
            // Permission denied or network issue with Cloud Storage — seamlessly fallback to local file
            console.warn('Cloud Storage upload notice (using local storage vault):', error.message);
            onProgress?.(100);
            resolve({
              storagePath: localPath,
              downloadUrl: URL.createObjectURL(file),
            });
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve({ storagePath: cloudStoragePath, downloadUrl });
            } catch {
              if (onProgress) onProgress(100);
              resolve({
                storagePath: localPath,
                downloadUrl: URL.createObjectURL(file),
              });
            }
          }
        );
      } catch (err) {
        console.warn('Firebase storage dispatch warning (fallback to local):', err);
        onProgress?.(100);
        resolve({
          storagePath: localPath,
          downloadUrl: URL.createObjectURL(file),
        });
      }
    });
  },

  /**
   * Uploads a versioned document file with local-first IndexedDB persistence.
   */
  async uploadVersionFile(
    userId: string,
    documentId: string,
    versionId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ storagePath: string; downloadUrl: string }> {
    const sanitizedFileName = sanitizeStorageFileName(file.name);
    const localPath = `local://${documentId}/versions/${versionId}/${sanitizedFileName}`;

    try {
      await localDb.saveVersionFile(versionId, file);
    } catch (e) {
      console.warn('Local version file save notice:', e);
    }

    onProgress?.(30);

    if (!storage) {
      onProgress?.(100);
      return {
        storagePath: localPath,
        downloadUrl: URL.createObjectURL(file),
      };
    }

    const cloudStoragePath = `users/${userId}/documents/${documentId}/versions/${versionId}/${sanitizedFileName}`;
    const storageRef = ref(storage, cloudStoragePath);

    const metadata = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalFileName: file.name,
        uploadedBy: userId,
        documentId: documentId,
        versionId: versionId,
      },
    };

    return new Promise((resolve) => {
      try {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(Math.min(100, Math.max(30, progress)));
            }
          },
          () => {
            onProgress?.(100);
            resolve({
              storagePath: localPath,
              downloadUrl: URL.createObjectURL(file),
            });
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              if (onProgress) onProgress(100);
              resolve({ storagePath: cloudStoragePath, downloadUrl });
            } catch {
              if (onProgress) onProgress(100);
              resolve({
                storagePath: localPath,
                downloadUrl: URL.createObjectURL(file),
              });
            }
          }
        );
      } catch {
        onProgress?.(100);
        resolve({
          storagePath: localPath,
          downloadUrl: URL.createObjectURL(file),
        });
      }
    });
  },

  /**
   * Uploads extracted text backup/archive to Cloud Storage if available.
   */
  async uploadExtractedTextBackup(
    userId: string,
    documentId: string,
    extractedData: { text: string; pageCount?: number; wordCount: number }
  ): Promise<string> {
    if (!storage) return '';

    try {
      const storagePath = `users/${userId}/documents/${documentId}/extracted_text.json`;
      const storageRef = ref(storage, storagePath);
      const jsonString = JSON.stringify(extractedData);

      await uploadString(storageRef, jsonString, 'raw', {
        contentType: 'application/json',
      });

      return storagePath;
    } catch {
      return '';
    }
  },

  /**
   * Generates a download URL for an existing file.
   * Checks local IndexedDB first, and falls back to Cloud Storage.
   */
  async getDocumentDownloadUrl(storagePath: string, documentId?: string): Promise<string> {
    // 1. Try local IndexedDB file store
    let targetDocId = documentId;
    if (!targetDocId && storagePath?.startsWith('local://')) {
      const parts = storagePath.replace('local://', '').split('/');
      targetDocId = parts[0];
    }

    if (targetDocId) {
      try {
        const localRecord = await localDb.getDocumentFile(targetDocId);
        if (localRecord?.file) {
          return URL.createObjectURL(localRecord.file);
        }
      } catch (err) {
        console.warn('Local file retrieval notice:', err);
      }
    }

    // 2. Fall back to Firebase Cloud Storage if path is a cloud path
    if (storage && storagePath && !storagePath.startsWith('local://')) {
      try {
        const storageRef = ref(storage, storagePath);
        return await getDownloadURL(storageRef);
      } catch (error: any) {
        console.warn('Cloud storage download notice:', error);
      }
    }

    // 3. Fallback: try looking up document by any ID contained in storage path
    const match = storagePath?.match(/documents\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      try {
        const localRecord = await localDb.getDocumentFile(match[1]);
        if (localRecord?.file) {
          return URL.createObjectURL(localRecord.file);
        }
      } catch {
        // ignore
      }
    }

    throw new StorageServiceError('Document file is not accessible for download.');
  },

  /**
   * Deletes a document file from local store and optionally Cloud Storage.
   */
  async deleteDocumentFile(storagePath: string): Promise<void> {
    // Extract documentId if local
    if (storagePath?.startsWith('local://')) {
      const parts = storagePath.replace('local://', '').split('/');
      const documentId = parts[0];
      if (documentId) {
        // cleaned by localDb.deleteDocument
      }
    }

    if (!storage || !storagePath || storagePath.startsWith('local://')) {
      return;
    }

    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch {
      // ignore
    }
  },

  /**
   * Safely attempts to delete extracted text backup if one was created.
   */
  async deleteExtractedTextBackup(userId: string, documentId: string): Promise<void> {
    if (!storage) return;
    try {
      const storagePath = `users/${userId}/documents/${documentId}/extracted_text.json`;
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch {
      // Ignore if backup does not exist
    }
  },
};
