import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AnalysisRecord } from '../types/analysis';

export class AiServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'AiServiceError';
  }
}

export const aiService = {
  /**
   * Calls the backend API to trigger real Gemini legal analysis for a document.
   */
  async requestDocumentAnalysis(params: {
    documentId: string;
    userId: string;
    fileName: string;
    fileType: string;
    extractedText: string;
    processingStatus?: string;
  }): Promise<AnalysisRecord> {
    if (!auth?.currentUser) {
      throw new AiServiceError('You must be signed in to analyze documents.', 401);
    }

    let idToken = '';
    try {
      idToken = await auth.currentUser.getIdToken(true);
    } catch {
      throw new AiServiceError('Failed to retrieve authentication token. Please sign in again.', 401);
    }

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || '';
    const endpoint = `${backendUrl}/api/documents/${params.documentId}/analyze`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: params.userId,
          fileName: params.fileName,
          fileType: params.fileType,
          extractedText: params.extractedText,
          processingStatus: params.processingStatus,
        }),
      });
    } catch (networkErr: any) {
      throw new AiServiceError(
        'Unable to reach LegalLens AI backend service. Please ensure the server is running.',
        503
      );
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      throw new AiServiceError('Invalid response received from AI backend service.', 502);
    }

    if (!response.ok) {
      const errorMsg = responseData?.error || 'AI document analysis request failed.';
      throw new AiServiceError(errorMsg, response.status);
    }

    const analysisRecord = responseData.analysis as AnalysisRecord;

    // Persist analysis result into user-isolated Firestore subcollection
    try {
      await this.saveAnalysisRecord(params.userId, params.documentId, analysisRecord);
    } catch (firestoreErr) {
      console.warn('Firestore analysis save warning:', firestoreErr);
    }

    return analysisRecord;
  },

  /**
   * Stores the analysis result in Firestore: users/{userId}/documents/{documentId}/analyses/{analysisId}
   */
  async saveAnalysisRecord(
    userId: string,
    documentId: string,
    record: AnalysisRecord
  ): Promise<void> {
    if (!db) return;

    const recordRef = doc(db, 'users', userId, 'documents', documentId, 'analyses', record.id);
    await setDoc(recordRef, record);
  },

  /**
   * Subscribes to real-time analyses for a single document.
   */
  subscribeDocumentAnalyses(
    userId: string,
    documentId: string,
    onUpdate: (analyses: AnalysisRecord[]) => void,
    onError: (err: Error) => void
  ): Unsubscribe {
    if (!db) {
      onError(new AiServiceError('Firestore is not configured.'));
      return () => {};
    }

    try {
      const analysesCol = collection(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'analyses'
      );
      const q = query(analysesCol, orderBy('createdAt', 'desc'));

      return onSnapshot(
        q,
        (snapshot) => {
          const records: AnalysisRecord[] = [];
          snapshot.forEach((docSnap) => {
            records.push(docSnap.data() as AnalysisRecord);
          });
          onUpdate(records);
        },
        (err) => {
          onError(new AiServiceError(`Failed to load analyses: ${err.message}`));
        }
      );
    } catch (err: any) {
      onError(new AiServiceError(`Failed to subscribe to analyses: ${err.message}`));
      return () => {};
    }
  },

  /**
   * Fetches the latest analysis for a document once.
   */
  async getLatestAnalysis(
    userId: string,
    documentId: string
  ): Promise<AnalysisRecord | null> {
    if (!db) return null;

    try {
      const analysesCol = collection(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'analyses'
      );
      const q = query(analysesCol, orderBy('createdAt', 'desc'), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) return null;
      return snap.docs[0].data() as AnalysisRecord;
    } catch (error) {
      console.warn('Failed to fetch latest analysis:', error);
      return null;
    }
  },
};
