import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  UnifiedConversation,
  UnifiedMessage,
  UnifiedSearchResponse,
} from '../types/unified';
import { DocumentRecord } from '../types/document';

export class UnifiedServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'UnifiedServiceError';
  }
}

export const unifiedService = {
  /**
   * Dispatches a multi-document legal intelligence question to the backend.
   */
  async sendUnifiedQuery(params: {
    documentIds: string[];
    question: string;
    conversationId: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
    documents: DocumentRecord[];
  }): Promise<{ message: UnifiedMessage; conversationTitle?: string }> {
    if (!auth?.currentUser) {
      throw new UnifiedServiceError('You must be signed in to query documents.', 401);
    }

    let idToken = '';
    try {
      idToken = await auth.currentUser.getIdToken(true);
    } catch {
      throw new UnifiedServiceError('Authentication expired. Please sign in again.', 401);
    }

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || '';
    const endpoint = `${backendUrl}/api/unified/query`;

    // Package documents payload
    const docsPayload = params.documents.map((d) => ({
      id: d.id,
      userId: d.userId,
      fileName: d.fileName,
      fileType: d.fileType,
      extractedText: d.extractedText || '',
      processingStatus: d.processingStatus,
    }));

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          documentIds: params.documentIds,
          question: params.question,
          conversationId: params.conversationId,
          history: params.history,
          documents: docsPayload,
        }),
      });
    } catch (networkErr: any) {
      throw new UnifiedServiceError(
        'Unable to reach LegalLens AI backend. Please verify your connection or ensure the server is running.',
        503
      );
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      throw new UnifiedServiceError('Invalid JSON response received from intelligence service.', 502);
    }

    if (!response.ok) {
      const errorMsg = responseData?.error || 'Multi-document query failed.';
      throw new UnifiedServiceError(errorMsg, response.status);
    }

    return {
      message: responseData.message as UnifiedMessage,
      conversationTitle: responseData.conversationTitle,
    };
  },

  /**
   * Executes lexical or clause search across selected or all library documents.
   */
  async searchLibrary(params: {
    documentIds?: string[];
    query: string;
    clauseCategory?: string;
    documents: DocumentRecord[];
  }): Promise<UnifiedSearchResponse> {
    if (!auth?.currentUser) {
      throw new UnifiedServiceError('You must be signed in to search documents.', 401);
    }

    let idToken = '';
    try {
      idToken = await auth.currentUser.getIdToken(true);
    } catch {
      throw new UnifiedServiceError('Authentication expired. Please sign in again.', 401);
    }

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || '';
    const endpoint = `${backendUrl}/api/unified/search`;

    const docsPayload = params.documents.map((d) => ({
      id: d.id,
      userId: d.userId,
      fileName: d.fileName,
      fileType: d.fileType,
      extractedText: d.extractedText || '',
      processingStatus: d.processingStatus,
    }));

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          documentIds: params.documentIds,
          query: params.query,
          clauseCategory: params.clauseCategory,
          documents: docsPayload,
        }),
      });
    } catch (networkErr: any) {
      throw new UnifiedServiceError('Unable to reach LegalLens AI search service.', 503);
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      throw new UnifiedServiceError('Invalid response received from search service.', 502);
    }

    if (!response.ok) {
      const errorMsg = responseData?.error || 'Search request failed.';
      throw new UnifiedServiceError(errorMsg, response.status);
    }

    return responseData as UnifiedSearchResponse;
  },

  /**
   * Fetches all saved multi-document conversations for the user.
   */
  async getUnifiedConversations(userId: string): Promise<UnifiedConversation[]> {
    if (!db) return [];
    try {
      const convCollection = collection(db, 'users', userId, 'unifiedConversations');
      const q = query(convCollection, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data() as UnifiedConversation);
    } catch (error: any) {
      console.warn('Failed to retrieve unified conversations:', error);
      return [];
    }
  },

  /**
   * Subscribes to changes in the user's unified conversations list.
   */
  subscribeUnifiedConversations(
    userId: string,
    onUpdate: (conversations: UnifiedConversation[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};
    const convCollection = collection(db, 'users', userId, 'unifiedConversations');
    const q = query(convCollection, orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const convList = snapshot.docs.map((d) => d.data() as UnifiedConversation);
        onUpdate(convList);
      },
      (err) => {
        console.warn('Unified conversations subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Subscribes to real-time messages within a specific unified conversation.
   */
  subscribeUnifiedMessages(
    userId: string,
    conversationId: string,
    onUpdate: (messages: UnifiedMessage[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};
    const messagesCollection = collection(
      db,
      'users',
      userId,
      'unifiedConversations',
      conversationId,
      'messages'
    );
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgList = snapshot.docs.map((d) => d.data() as UnifiedMessage);
        onUpdate(msgList);
      },
      (err) => {
        console.warn('Unified messages subscription error:', err);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Persists a message and updates the parent conversation metadata in Firestore.
   */
  async saveUnifiedMessage(
    userId: string,
    conversationId: string,
    message: UnifiedMessage,
    conversationTitle?: string,
    selectedDocIds?: string[]
  ): Promise<void> {
    if (!db) return;

    try {
      const convRef = doc(db, 'users', userId, 'unifiedConversations', conversationId);
      const msgRef = doc(
        db,
        'users',
        userId,
        'unifiedConversations',
        conversationId,
        'messages',
        message.id
      );

      // Save message
      await setDoc(msgRef, message);

      // Update or create parent conversation
      const convUpdates: Record<string, any> = {
        id: conversationId,
        userId,
        updatedAt: new Date().toISOString(),
        lastMessage: message.content.slice(0, 120),
      };

      if (conversationTitle) {
        convUpdates.title = conversationTitle;
      }
      if (selectedDocIds) {
        convUpdates.selectedDocumentIds = selectedDocIds;
      }

      await setDoc(convRef, convUpdates, { merge: true });
    } catch (error: any) {
      console.warn('Failed to save unified message to Firestore:', error);
    }
  },

  /**
   * Updates the selected document IDs attached to a conversation.
   */
  async updateConversationScope(
    userId: string,
    conversationId: string,
    selectedDocIds: string[]
  ): Promise<void> {
    if (!db) return;
    try {
      const convRef = doc(db, 'users', userId, 'unifiedConversations', conversationId);
      await updateDoc(convRef, {
        selectedDocumentIds: selectedDocIds,
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.warn('Failed to update conversation scope:', error);
    }
  },

  /**
   * Deletes a unified conversation and all of its messages.
   */
  async deleteUnifiedConversation(userId: string, conversationId: string): Promise<void> {
    if (!db) return;

    try {
      const messagesCollection = collection(
        db,
        'users',
        userId,
        'unifiedConversations',
        conversationId,
        'messages'
      );
      const msgSnapshot = await getDocs(messagesCollection);
      const deletePromises = msgSnapshot.docs.map((m) => deleteDoc(m.ref));
      await Promise.all(deletePromises);

      const convRef = doc(db, 'users', userId, 'unifiedConversations', conversationId);
      await deleteDoc(convRef);
    } catch (error: any) {
      throw new UnifiedServiceError(
        `Failed to delete unified conversation: ${error.message}`,
        error
      );
    }
  },
};
