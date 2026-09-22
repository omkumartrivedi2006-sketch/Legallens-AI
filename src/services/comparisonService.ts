import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ComparisonRecord } from '../types/comparison';
import { DocumentMetadata } from '../types/document';

export class ComparisonServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'ComparisonServiceError';
  }
}

export const comparisonService = {
  /**
   * Triggers the backend comparison between Document A and Document B.
   */
  async requestDocumentComparison(params: {
    documentA: DocumentMetadata;
    documentB: DocumentMetadata;
  }): Promise<ComparisonRecord> {
    if (!auth?.currentUser) {
      throw new ComparisonServiceError('You must be signed in to compare documents.', 401);
    }

    const { documentA, documentB } = params;

    if (documentA.id === documentB.id) {
      throw new ComparisonServiceError(
        'Please select two different documents to compare.',
        400
      );
    }

    if (documentA.processingStatus !== 'ready' || !documentA.extractedText) {
      throw new ComparisonServiceError(
        `Document A ("${documentA.originalFileName || documentA.fileName}") is not ready for comparison.`,
        400
      );
    }

    if (documentB.processingStatus !== 'ready' || !documentB.extractedText) {
      throw new ComparisonServiceError(
        `Document B ("${documentB.originalFileName || documentB.fileName}") is not ready for comparison.`,
        400
      );
    }

    let idToken = '';
    try {
      idToken = await auth.currentUser.getIdToken(true);
    } catch {
      throw new ComparisonServiceError(
        'Failed to retrieve authentication token. Please sign in again.',
        401
      );
    }

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || '';
    const endpoint = `${backendUrl}/api/comparisons`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          documentA: {
            id: documentA.id,
            userId: documentA.userId,
            fileName: documentA.originalFileName || documentA.fileName,
            fileType: documentA.fileType,
            extractedText: documentA.extractedText,
            processingStatus: documentA.processingStatus,
            wordCount: documentA.wordCount,
            pageCount: documentA.pageCount,
          },
          documentB: {
            id: documentB.id,
            userId: documentB.userId,
            fileName: documentB.originalFileName || documentB.fileName,
            fileType: documentB.fileType,
            extractedText: documentB.extractedText,
            processingStatus: documentB.processingStatus,
            wordCount: documentB.wordCount,
            pageCount: documentB.pageCount,
          },
        }),
      });
    } catch (networkErr: any) {
      throw new ComparisonServiceError(
        'Unable to reach LegalLens AI backend service. Please ensure the server is running.',
        503
      );
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      throw new ComparisonServiceError('Invalid response received from AI backend service.', 502);
    }

    if (!response.ok) {
      const errorMsg = responseData?.error || 'Document comparison failed.';
      throw new ComparisonServiceError(errorMsg, response.status);
    }

    const comparisonRecord = responseData.comparison as ComparisonRecord;

    // Persist comparison record in Firestore: users/{userId}/comparisons/{comparisonId}
    if (auth.currentUser?.uid) {
      try {
        await this.saveComparisonRecord(auth.currentUser.uid, comparisonRecord);
      } catch (saveErr) {
        console.warn('Failed to persist comparison record in Firestore:', saveErr);
      }
    }

    return comparisonRecord;
  },

  /**
   * Persists a comparison record in Firestore under users/{userId}/comparisons/{id}.
   */
  async saveComparisonRecord(userId: string, record: ComparisonRecord): Promise<void> {
    if (!db) return;

    try {
      const compRef = doc(db, 'users', userId, 'comparisons', record.id);
      await setDoc(compRef, record);
    } catch (err: any) {
      console.warn('Firestore comparison save warning:', err);
    }
  },

  /**
   * Retrieves all previous comparisons for the authenticated user.
   */
  async getComparisons(userId: string): Promise<ComparisonRecord[]> {
    if (!db) return [];

    try {
      const compCol = collection(db, 'users', userId, 'comparisons');
      const q = query(compCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const records: ComparisonRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as ComparisonRecord);
      });

      return records;
    } catch (error) {
      console.warn('Failed to load comparisons from Firestore:', error);
      return [];
    }
  },

  /**
   * Retrieves a single comparison by ID for the user.
   */
  async getComparisonById(
    userId: string,
    comparisonId: string
  ): Promise<ComparisonRecord | null> {
    if (!db) return null;

    try {
      const compRef = doc(db, 'users', userId, 'comparisons', comparisonId);
      const snapshot = await getDoc(compRef);

      if (!snapshot.exists()) return null;
      return snapshot.data() as ComparisonRecord;
    } catch (error) {
      console.warn('Failed to retrieve comparison:', error);
      return null;
    }
  },

  /**
   * Deletes a comparison record without touching original documents.
   */
  async deleteComparison(userId: string, comparisonId: string): Promise<void> {
    if (!db) return;

    try {
      const compRef = doc(db, 'users', userId, 'comparisons', comparisonId);
      await deleteDoc(compRef);
    } catch (err: any) {
      throw new ComparisonServiceError(`Failed to delete comparison: ${err.message}`);
    }
  },
};
