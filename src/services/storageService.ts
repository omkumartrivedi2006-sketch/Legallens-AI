import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadString,
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { sanitizeStorageFileName } from '../types/document';

export class StorageServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'StorageServiceError';
  }
}

export const storageService = {
  /**
   * Uploads a file to Firebase Cloud Storage with real byte progress tracking.
   * Path: users/{userId}/documents/{documentId}/{sanitizedFileName}
   */
  uploadDocumentFile(
    userId: string,
    documentId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ storagePath: string; downloadUrl: string }> {
    if (!storage) {
      return Promise.reject(
        new StorageServiceError('Firebase Storage is not configured. Please verify your environment configuration.')
      );
    }

    const sanitizedFileName = sanitizeStorageFileName(file.name);
    const storagePath = `users/${userId}/documents/${documentId}/${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    const metadata = {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalFileName: file.name,
        uploadedBy: userId,
        documentId: documentId,
      },
    };

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(Math.min(100, Math.max(0, progress)));
          }
        },
        (error) => {
          reject(new StorageServiceError(`Failed to upload file to Cloud Storage: ${error.message}`, error));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({ storagePath, downloadUrl });
          } catch (error: any) {
            reject(new StorageServiceError(`Failed to retrieve download URL: ${error.message}`, error));
          }
        }
      );
    });
  },

  /**
   * Uploads extracted text backup/archive to Cloud Storage for large document handling.
   * Path: users/{userId}/documents/{documentId}/extracted_text.json
   */
  async uploadExtractedTextBackup(
    userId: string,
    documentId: string,
    extractedData: { text: string; pageCount?: number; wordCount: number }
  ): Promise<string> {
    if (!storage) {
      throw new StorageServiceError('Firebase Storage is not configured.');
    }

    const storagePath = `users/${userId}/documents/${documentId}/extracted_text.json`;
    const storageRef = ref(storage, storagePath);
    const jsonString = JSON.stringify(extractedData);

    await uploadString(storageRef, jsonString, 'raw', {
      contentType: 'application/json',
    });

    return storagePath;
  },

  /**
   * Generates an authenticated download URL for an existing file.
   */
  async getDocumentDownloadUrl(storagePath: string): Promise<string> {
    if (!storage) {
      throw new StorageServiceError('Firebase Storage is not configured.');
    }

    try {
      const storageRef = ref(storage, storagePath);
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      throw new StorageServiceError(`Failed to obtain download URL for document: ${error.message}`, error);
    }
  },

  /**
   * Deletes a document file from Cloud Storage.
   */
  async deleteDocumentFile(storagePath: string): Promise<void> {
    if (!storage) {
      return;
    }

    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error: any) {
      // If the object already doesn't exist, ignore 404 to allow clean metadata deletion
      if (error?.code !== 'storage/object-not-found') {
        throw new StorageServiceError(`Failed to delete document file from storage: ${error.message}`, error);
      }
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
