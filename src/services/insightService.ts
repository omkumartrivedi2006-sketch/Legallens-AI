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
  LegalInsightsOutput,
  ChecklistTaskItem,
  ChecklistTaskStatus,
  DeadlineItem,
} from '../types/insight';
import { LegalAnalysisOutput } from '../types/analysis';

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
  }): Promise<InsightRecord> {
    if (!auth?.currentUser) {
      throw new InsightServiceError('You must be signed in to generate document insights.', 401);
    }

    let idToken = '';
    try {
      idToken = await auth.currentUser.getIdToken(true);
    } catch {
      throw new InsightServiceError(
        'Failed to retrieve authentication token. Please sign in again.',
        401
      );
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
        }),
      });
    } catch (networkErr: any) {
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

    // Persist to user-scoped Firestore subcollection
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

        // Populate initial checklist items if available
        if (record.result.checklist && record.result.checklist.length > 0) {
          const checklistColRef = collection(
            db,
            'users',
            params.userId,
            'documents',
            params.documentId,
            'checklistItems'
          );

          // Check if items already exist
          const existingSnapshot = await getDocs(checklistColRef);
          if (existingSnapshot.empty) {
            for (const item of record.result.checklist) {
              const itemRef = doc(checklistColRef, item.id);
              await setDoc(itemRef, {
                ...item,
                userId: params.userId,
                documentId: params.documentId,
                createdAt: record.createdAt,
                updatedAt: record.createdAt,
              });
            }
          }
        }
      } catch (firestoreErr) {
        console.warn('Failed to cache insights record in Firestore:', firestoreErr);
      }
    }

    return record;
  },

  /**
   * Retrieves the latest stored legal insights record for a document.
   */
  async getLatestInsights(userId: string, documentId: string): Promise<InsightRecord | null> {
    if (!db) return null;

    try {
      const insightsRef = collection(db, 'users', userId, 'documents', documentId, 'insights');
      const q = query(insightsRef, orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return null;
      return querySnapshot.docs[0].data() as InsightRecord;
    } catch (err) {
      console.warn('Failed to retrieve insights from Firestore:', err);
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
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!db) {
      onUpdate(null);
      return () => {};
    }

    const insightsRef = collection(db, 'users', userId, 'documents', documentId, 'insights');
    const q = query(insightsRef, orderBy('createdAt', 'desc'), limit(1));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(null);
        } else {
          onUpdate(snapshot.docs[0].data() as InsightRecord);
        }
      },
      (err) => {
        console.error('Error listening to insights:', err);
        onError?.(err);
      }
    );
  },

  /**
   * Real-time subscription to checklist items for a document.
   */
  subscribeChecklistItems(
    userId: string,
    documentId: string,
    onUpdate: (items: ChecklistTaskItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!db) {
      onUpdate([]);
      return () => {};
    }

    const checklistRef = collection(db, 'users', userId, 'documents', documentId, 'checklistItems');

    return onSnapshot(
      checklistRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as ChecklistTaskItem);
        onUpdate(items);
      },
      (err) => {
        console.error('Error listening to checklist items:', err);
        onError?.(err);
      }
    );
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

    const itemRef = doc(db, 'users', userId, 'documents', documentId, 'checklistItems', itemId);
    await updateDoc(itemRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Adds a custom user action task to the document checklist.
   */
  async addChecklistItem(
    userId: string,
    documentId: string,
    itemData: Omit<ChecklistTaskItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ChecklistTaskItem> {
    if (!db) {
      throw new InsightServiceError('Database is not initialized.');
    }

    const itemId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newItem: ChecklistTaskItem = {
      ...itemData,
      id: itemId,
      createdAt: now,
      updatedAt: now,
    };

    const itemRef = doc(db, 'users', userId, 'documents', documentId, 'checklistItems', itemId);
    await setDoc(itemRef, {
      ...newItem,
      userId,
      documentId,
    });

    return newItem;
  },

  /**
   * Deletes a checklist task item.
   */
  async deleteChecklistItem(userId: string, documentId: string, itemId: string): Promise<void> {
    if (!db) return;

    const itemRef = doc(db, 'users', userId, 'documents', documentId, 'checklistItems', itemId);
    await deleteDoc(itemRef);
  },
};
