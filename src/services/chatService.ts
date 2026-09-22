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
import { ChatConversation, ChatMessage } from '../types/chat';

export class ChatServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'ChatServiceError';
  }
}

export const chatService = {
  /**
   * Calls the backend API to process a document-grounded user question via Gemini.
   */
  async sendChatMessage(params: {
    documentId: string;
    userId: string;
    conversationId: string;
    message: string;
    fileName: string;
    fileType: string;
    extractedText: string;
    processingStatus?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  }): Promise<{ message: ChatMessage; conversationTitle?: string }> {
    if (!auth?.currentUser) {
      throw new ChatServiceError('You must be signed in to chat with documents.', 401);
    }

    let idToken = '';
    try {
      idToken = await auth.currentUser.getIdToken(true);
    } catch {
      throw new ChatServiceError('Failed to retrieve authentication token. Please sign in again.', 401);
    }

    const backendUrl = import.meta.env.VITE_BACKEND_API_URL || '';
    const endpoint = `${backendUrl}/api/documents/${params.documentId}/chat`;

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
          conversationId: params.conversationId,
          message: params.message,
          fileName: params.fileName,
          fileType: params.fileType,
          extractedText: params.extractedText,
          processingStatus: params.processingStatus,
          history: params.history,
        }),
      });
    } catch (networkErr: any) {
      throw new ChatServiceError(
        'Unable to reach LegalLens AI backend service. Please ensure the server is running.',
        503
      );
    }

    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      throw new ChatServiceError('Invalid response received from AI backend service.', 502);
    }

    if (!response.ok) {
      const errorMsg = responseData?.error || 'Document chat request failed.';
      throw new ChatServiceError(errorMsg, response.status);
    }

    return {
      message: responseData.message as ChatMessage,
      conversationTitle: responseData.conversationTitle,
    };
  },

  /**
   * Fetches all saved conversations for a document.
   */
  async getConversations(userId: string, documentId: string): Promise<ChatConversation[]> {
    if (!db) return [];

    try {
      const convCol = collection(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'conversations'
      );
      const q = query(convCol, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);

      const conversations: ChatConversation[] = [];
      snapshot.forEach((docSnap) => {
        conversations.push(docSnap.data() as ChatConversation);
      });

      return conversations;
    } catch (error) {
      console.warn('Failed to load conversations from Firestore:', error);
      return [];
    }
  },

  /**
   * Creates or ensures a conversation document exists in Firestore.
   */
  async createConversation(
    userId: string,
    documentId: string,
    conversationId: string,
    title: string
  ): Promise<ChatConversation> {
    const nowIso = new Date().toISOString();
    const conv: ChatConversation = {
      id: conversationId,
      documentId,
      userId,
      title,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (db) {
      try {
        const convRef = doc(
          db,
          'users',
          userId,
          'documents',
          documentId,
          'conversations',
          conversationId
        );
        await setDoc(convRef, conv, { merge: true });
      } catch (err) {
        console.warn('Failed to save conversation metadata in Firestore:', err);
      }
    }

    return conv;
  },

  /**
   * Updates conversation title and updatedAt timestamp.
   */
  async updateConversationTitle(
    userId: string,
    documentId: string,
    conversationId: string,
    title: string
  ): Promise<void> {
    if (!db) return;

    try {
      const convRef = doc(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'conversations',
        conversationId
      );
      await updateDoc(convRef, {
        title,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to update conversation title in Firestore:', err);
    }
  },

  /**
   * Persists a chat message in Firestore under the conversation's subcollection.
   */
  async saveMessage(
    userId: string,
    documentId: string,
    conversationId: string,
    message: ChatMessage
  ): Promise<void> {
    if (!db) return;

    try {
      const msgRef = doc(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'conversations',
        conversationId,
        'messages',
        message.id
      );
      await setDoc(msgRef, message);

      // Touch the conversation's updatedAt timestamp
      const convRef = doc(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'conversations',
        conversationId
      );
      await updateDoc(convRef, {
        updatedAt: message.createdAt || new Date().toISOString(),
      }).catch(() => {});
    } catch (err) {
      console.warn('Failed to save message in Firestore:', err);
    }
  },

  /**
   * Subscribes to real-time chat messages for a specific conversation.
   */
  subscribeMessages(
    userId: string,
    documentId: string,
    conversationId: string,
    onUpdate: (messages: ChatMessage[]) => void,
    onError: (err: Error) => void
  ): Unsubscribe {
    if (!db) {
      onError(new ChatServiceError('Firestore is not configured.'));
      return () => {};
    }

    try {
      const messagesCol = collection(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'conversations',
        conversationId,
        'messages'
      );
      const q = query(messagesCol, orderBy('createdAt', 'asc'));

      return onSnapshot(
        q,
        (snapshot) => {
          const messages: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            messages.push(docSnap.data() as ChatMessage);
          });
          onUpdate(messages);
        },
        (err) => {
          onError(new ChatServiceError(`Failed to subscribe to messages: ${err.message}`));
        }
      );
    } catch (err: any) {
      onError(new ChatServiceError(`Failed to subscribe to messages: ${err.message}`));
      return () => {};
    }
  },

  /**
   * Deletes a conversation and its messages.
   */
  async deleteConversation(
    userId: string,
    documentId: string,
    conversationId: string
  ): Promise<void> {
    if (!db) return;

    try {
      // 1. Delete all messages inside conversation
      const messagesCol = collection(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'conversations',
        conversationId,
        'messages'
      );
      const msgSnap = await getDocs(messagesCol);
      const deletePromises = msgSnap.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      // 2. Delete conversation metadata doc
      const convRef = doc(
        db,
        'users',
        userId,
        'documents',
        documentId,
        'conversations',
        conversationId
      );
      await deleteDoc(convRef);
    } catch (err: any) {
      throw new ChatServiceError(`Failed to delete conversation: ${err.message}`);
    }
  },
};
