import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DocumentRecord } from '../types/document';
import { storageService } from './storageService';

export class DocumentServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'DocumentServiceError';
  }
}

export const documentService = {
  /**
   * Creates a new document record under users/{userId}/documents/{documentId}
   */
  async createDocumentRecord(userId: string, record: DocumentRecord): Promise<void> {
    if (!db) {
      throw new DocumentServiceError('Firestore is not configured. Please check your Firebase setup.');
    }

    try {
      const docRef = doc(db, 'users', userId, 'documents', record.id);
      await setDoc(docRef, {
        ...record,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      throw new DocumentServiceError(`Failed to save document metadata: ${error.message}`, error);
    }
  },

  /**
   * Updates fields of an existing document record.
   */
  async updateDocumentRecord(
    userId: string,
    documentId: string,
    updates: Partial<DocumentRecord>
  ): Promise<void> {
    if (!db) {
      throw new DocumentServiceError('Firestore is not configured.');
    }

    try {
      const docRef = doc(db, 'users', userId, 'documents', documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      throw new DocumentServiceError(`Failed to update document metadata: ${error.message}`, error);
    }
  },

  /**
   * Fetches a single document record by ID, strictly ensuring user isolation.
   * Returns null if the document does not exist or does not belong to the user.
   */
  async getDocumentById(userId: string, documentId: string): Promise<DocumentRecord | null> {
    if (!db) {
      throw new DocumentServiceError('Firestore is not configured.');
    }

    try {
      const docRef = doc(db, 'users', userId, 'documents', documentId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data() as DocumentRecord;
      if (data.userId !== userId) {
        // Access violation protection
        return null;
      }

      return data;
    } catch (error: any) {
      throw new DocumentServiceError(`Failed to retrieve document: ${error.message}`, error);
    }
  },

  /**
   * Fetches all document records belonging to the authenticated user.
   */
  async getUserDocuments(userId: string): Promise<DocumentRecord[]> {
    if (!db) {
      throw new DocumentServiceError('Firestore is not configured.');
    }

    try {
      const colRef = collection(db, 'users', userId, 'documents');
      const q = query(colRef, orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);

      const docs: DocumentRecord[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data() as DocumentRecord;
        if (data.userId === userId) {
          docs.push(data);
        }
      });

      return docs;
    } catch (error: any) {
      throw new DocumentServiceError(`Failed to list documents: ${error.message}`, error);
    }
  },

  /**
   * Subscribes to real-time updates for the authenticated user's documents.
   */
  subscribeUserDocuments(
    userId: string,
    onUpdate: (docs: DocumentRecord[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    if (!db) {
      onError(new DocumentServiceError('Firestore is not configured.'));
      return () => {};
    }

    try {
      const colRef = collection(db, 'users', userId, 'documents');
      const q = query(colRef, orderBy('uploadedAt', 'desc'));

      return onSnapshot(
        q,
        (snapshot) => {
          const documents: DocumentRecord[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as DocumentRecord;
            if (data.userId === userId) {
              documents.push(data);
            }
          });
          onUpdate(documents);
        },
        (error) => {
          onError(new DocumentServiceError(`Real-time document listener error: ${error.message}`, error));
        }
      );
    } catch (error: any) {
      onError(new DocumentServiceError(`Failed to subscribe to documents: ${error.message}`, error));
      return () => {};
    }
  },

  /**
   * Subscribes to real-time updates for a single document.
   */
  subscribeSingleDocument(
    userId: string,
    documentId: string,
    onUpdate: (doc: DocumentRecord | null) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    if (!db) {
      onError(new DocumentServiceError('Firestore is not configured.'));
      return () => {};
    }

    try {
      const docRef = doc(db, 'users', userId, 'documents', documentId);
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            onUpdate(null);
            return;
          }
          const data = snapshot.data() as DocumentRecord;
          if (data.userId !== userId) {
            onUpdate(null);
            return;
          }
          onUpdate(data);
        },
        (error) => {
          onError(new DocumentServiceError(`Failed to listen to document: ${error.message}`, error));
        }
      );
    } catch (error: any) {
      onError(new DocumentServiceError(`Failed to attach document listener: ${error.message}`, error));
      return () => {};
    }
  },

  /**
   * Completely and safely deletes a document from both Cloud Storage and Firestore.
   */
  async deleteDocument(userId: string, documentId: string, storagePath: string): Promise<void> {
    if (!db) {
      throw new DocumentServiceError('Firestore is not configured.');
    }

    // 1. Delete physical file from Cloud Storage
    try {
      if (storagePath) {
        await storageService.deleteDocumentFile(storagePath);
      }
    } catch (storageErr) {
      console.warn('Storage deletion notice:', storageErr);
    }

    // 2. Delete optional extracted text backup from Cloud Storage
    try {
      await storageService.deleteExtractedTextBackup(userId, documentId);
    } catch (backupErr) {
      console.warn('Backup deletion notice:', backupErr);
    }

    // 3. Delete Firestore metadata record
    try {
      const docRef = doc(db, 'users', userId, 'documents', documentId);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new DocumentServiceError(`Failed to delete document metadata: ${error.message}`, error);
    }
  },
};
