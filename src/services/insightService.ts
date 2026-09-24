import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  InsightRecord,
  ChecklistTaskItem,
  ChecklistTaskStatus,
} from '../types/insight';
import { LegalAnalysisOutput } from '../types/analysis';
import { localDb } from './localDb';

export class InsightServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'InsightServiceError';
  }
}

export const insightService = {
  /**
   * Calls the backend API to trigger real Gemini legal insights for a document.
   */
  async requestDocumentInsights(params: {
    documentId: string;
    userId: string;
    fileName: string;
    fileType: string;
    extractedText: string;
    processingStatus?: string;
    existingAnalysis?: LegalAnalysisOutput | null;
    versionId?: string;
  }): Promise<InsightRecord> {
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
    const endpoint = `${backendUrl}/api/documents/${params.documentId}/insights`;

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
          existingAnalysis: params.existingAnalysis || null,
          versionId: params.versionId,
        }),
      });
    } catch {
      throw new InsightServiceError(
        'Could not connect to the LegalLens backend. Please check your network connection.',
        0
      );
    }

    if (!response.ok) {
      let errorMessage = 'Failed to generate legal insights.';
      try {
        const errorBody = await response.json();
        if (errorBody?.error) errorMessage = errorBody.error;
      } catch {
        // use fallback message
      }
      throw new InsightServiceError(errorMessage, response.status);
    }

    const data = await response.json();
    const record: InsightRecord = data.insights;

    // 1. Save to local store
    try {
      await localDb.saveInsight(record);
    } catch (localErr) {
      console.warn('Local insight save notice:', localErr);
    }

    // 2. Best-effort Firestore sync
    if (db) {
      try {
        const insightDocRef = doc(
          db,
          'users',
          params.userId,
          'documents',
          params.documentId,
          'insights',
          record.id
        );
        await setDoc(insightDocRef, record);
      } catch (firestoreErr) {
        console.warn('Firestore insights save notice:', firestoreErr);
      }
    }

    return record;
  },

  /**
   * Retrieves the latest stored legal insights record for a document.
   */
  async getLatestInsights(userId: string, documentId: string): Promise<InsightRecord | null> {
    try {
      const local = await localDb.getLatestInsight(documentId);
      if (local) return local;
    } catch (e) {
      console.warn('Local insight fetch notice:', e);
    }

    if (!db) return null;

    try {
      const insightsRef = collection(db, 'users', userId, 'documents', documentId, 'insights');
      const q = query(insightsRef, orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;
      const rec = querySnapshot.docs[0].data() as InsightRecord;
      localDb.saveInsight(rec).catch(() => {});
      return rec;
    } catch (err) {
      console.warn('Firestore insights retrieval notice:', err);
      return null;
    }
  },

  /**
   * Real-time subscription to the latest legal insights for a document.
   */
  subscribeDocumentInsights(
    userId: string,
    documentId: string,
    onUpdate: (record: InsightRecord | null) => void,
    _onError?: (err: Error) => void
  ): Unsubscribe {
    let isCleanedUp = false;

    // 1. Immediate local lookup
    localDb.getLatestInsight(documentId).then((rec) => {
      if (!isCleanedUp) {
        onUpdate(rec);
      }
    }).catch(() => {});

    // 2. Listen to local updates
    const unsubscribeLocal = localDb.subscribe(`insights_${documentId}`, (record) => {
      if (!isCleanedUp) {
        onUpdate(record);
      }
    });

    // 3. Listen to Firestore
    let unsubscribeFirestore: Unsubscribe = () => {};
    if (db) {
      try {
        const insightsRef = collection(db, 'users', userId, 'documents', documentId, 'insights');
        const q = query(insightsRef, orderBy('createdAt', 'desc'), limit(1));

        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            if (isCleanedUp) return;
            if (snapshot.empty) {
              // keep local if exists
            } else {
              const rec = snapshot.docs[0].data() as InsightRecord;
              onUpdate(rec);
              localDb.saveInsight(rec).catch(() => {});
            }
          },
          (err) => {
            console.warn('Firestore insights listener notice:', err?.message);
          }
        );
      } catch (err: any) {
        console.warn('Firestore insights subscribe notice:', err?.message);
      }
    }

    return () => {
      isCleanedUp = true;
      unsubscribeLocal();
      unsubscribeFirestore();
    };
  },

  /**
   * Real-time subscription to checklist items for a document.
   */
  subscribeChecklistItems(
    userId: string,
    documentId: string,
    onUpdate: (items: ChecklistTaskItem[]) => void,
    _onError?: (err: Error) => void
  ): Unsubscribe {
    // Initial emission from latest insight checklist
    localDb.getLatestInsight(documentId).then((insight) => {
      if (insight?.result?.checklist) {
        onUpdate(insight.result.checklist);
      } else {
        onUpdate([]);
      }
    }).catch(() => onUpdate([]));

    if (!db) {
      return () => {};
    }

    try {
      const checklistRef = collection(db, 'users', userId, 'documents', documentId, 'checklistItems');
      return onSnapshot(
        checklistRef,
        (snapshot) => {
          const items = snapshot.docs.map((d) => d.data() as ChecklistTaskItem);
          if (items.length > 0) onUpdate(items);
        },
        () => {}
      );
    } catch {
      return () => {};
    }
  },

  /**
   * Updates the status of an existing checklist task item.
   */
  async updateChecklistItemStatus(
    userId: string,
    documentId: string,
    itemId: string,
    status: ChecklistTaskStatus
  ): Promise<void> {
    if (!db) return;

    try {
      const itemRef = doc(db, 'users', userId, 'documents', documentId, 'checklistItems', itemId);
      await updateDoc(itemRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  },

  /**
   * Adds a custom user action task to the document checklist.
   */
  async addChecklistItem(
    userId: string,
    documentId: string,
    itemData: Omit<ChecklistTaskItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ChecklistTaskItem> {
    const itemId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newItem: ChecklistTaskItem = {
      ...itemData,
      id: itemId,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        const itemRef = doc(db, 'users', userId, 'documents', documentId, 'checklistItems', itemId);
        await setDoc(itemRef, {
          ...newItem,
          userId,
          documentId,
        });
      } catch {
        // ignore
      }
    }

    return newItem;
  },

  /**
   * Deletes a checklist task item.
   */
  async deleteChecklistItem(userId: string, documentId: string, itemId: string): Promise<void> {
    if (!db) return;
    try {
      const itemRef = doc(db, 'users', userId, 'documents', documentId, 'checklistItems', itemId);
      await deleteDoc(itemRef);
    } catch {
      // ignore
    }
  },
};
