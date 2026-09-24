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
import { localDb } from './localDb';

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
    versionId?: string;
  }): Promise<AnalysisRecord> {
    let idToken = '';
    if (auth?.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken(true);
      } catch {
        // Fallback
      }
    }
    if (!idToken) {
      idToken = 'local-auth-token';
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
          versionId: params.versionId,
        }),
      });
    } catch {
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

    // 1. Persist analysis locally
    try {
      await localDb.saveAnalysis(analysisRecord);
    } catch (localErr) {
      console.warn('Local analysis save notice:', localErr);
    }

    // 2. Best-effort Firestore sync
    if (db) {
      this.saveAnalysisRecord(params.userId, params.documentId, analysisRecord).catch(() => {});
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
    try {
      await localDb.saveAnalysis(record);
    } catch (e) {
      console.warn('Local analysis save notice:', e);
    }

    if (!db) return;

    try {
      const recordRef = doc(db, 'users', userId, 'documents', documentId, 'analyses', record.id);
      await setDoc(recordRef, record);
    } catch (cloudErr) {
      console.warn('Firestore analysis save notice:', cloudErr);
    }
  },

  /**
   * Subscribes to real-time analyses for a single document.
   */
  subscribeDocumentAnalyses(
    userId: string,
    documentId: string,
    onUpdate: (analyses: AnalysisRecord[]) => void,
    _onError: (err: Error) => void
  ): Unsubscribe {
    let isCleanedUp = false;

    const pushAnalyses = async () => {
      if (isCleanedUp) return;
      try {
        const analyses = await localDb.getAnalyses(documentId);
        if (!isCleanedUp) {
          onUpdate(analyses);
        }
      } catch (e) {
        console.warn('Local analyses read error:', e);
      }
    };

    pushAnalyses();

    const unsubscribeLocal = localDb.subscribe(`analyses_${documentId}`, () => {
      pushAnalyses();
    });

    let unsubscribeFirestore: Unsubscribe = () => {};
    if (db) {
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

        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            if (isCleanedUp) return;
            const records: AnalysisRecord[] = [];
            snapshot.forEach((docSnap) => {
              const rec = docSnap.data() as AnalysisRecord;
              records.push(rec);
              localDb.saveAnalysis(rec).catch(() => {});
            });
            pushAnalyses();
          },
          (err) => {
            console.warn('Firestore live analyses notice:', err?.message);
          }
        );
      } catch (err: any) {
        console.warn('Firestore analyses subscribe notice:', err?.message);
      }
    }

    return () => {
      isCleanedUp = true;
      unsubscribeLocal();
      unsubscribeFirestore();
    };
  },

  /**
   * Fetches the latest analysis for a document once.
   */
  async getLatestAnalysis(
    userId: string,
    documentId: string
  ): Promise<AnalysisRecord | null> {
    try {
      const records = await localDb.getAnalyses(documentId);
      if (records.length > 0) return records[0];
    } catch (e) {
      console.warn('Local latest analysis read notice:', e);
    }

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
      console.warn('Firestore latest analysis notice:', error);
      return null;
    }
  },
};
