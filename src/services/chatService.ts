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
import { localDb } from './localDb';

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
    versionId?: string;
  }): Promise<{ message: ChatMessage; conversationTitle?: string }> {
    let idToken = '';
    if (auth?.currentUser) {
      try {
        idToken = await auth.currentUser.getIdToken(true);
      } catch {
        // Continue with local token if available
      }
    }

    if (!idToken) {
      // Local fallback token for development / offline use
      idToken = 'local-auth-token';
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
          versionId: params.versionId,
        }),
      });
    } catch {
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

    const assistantMessage = responseData.message as ChatMessage;

    // Persist assistant message in local store
    try {
      await localDb.saveMessage(params.documentId, assistantMessage);
    } catch (saveErr) {
      console.warn('Local message save notice:', saveErr);
    }

    // Best-effort Firestore sync
    if (db && params.userId) {
      this.saveMessage(params.userId, params.documentId, params.conversationId, assistantMessage).catch(() => {});
    }

    return {
      message: assistantMessage,
      conversationTitle: responseData.conversationTitle,
    };
  },

  /**
   * Fetches all saved conversations for a document from local storage and Firestore.
   */
  async getConversations(userId: string, documentId: string): Promise<ChatConversation[]> {
    let localConvs: ChatConversation[] = [];
    try {
      localConvs = await localDb.getConversations(documentId, userId);
    } catch (e) {
      console.warn('Local conversations read notice:', e);
    }

    if (localConvs.length > 0) {
      return localConvs;
    }

    if (db) {
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
          const conv = docSnap.data() as ChatConversation;
          conversations.push(conv);
          localDb.saveConversation(conv).catch(() => {});
        });

        return conversations;
      } catch (error) {
        console.warn('Firestore conversations fetch notice:', error);
      }
    }

    return localConvs;
  },

  /**
   * Creates or ensures a conversation document exists.
   */
  async createConversation(
    userId: string,
    documentId: string,
    conversationId: string,
    title: string,
    versionId?: string
  ): Promise<ChatConversation> {
    const nowIso = new Date().toISOString();
    const conv: ChatConversation = {
      id: conversationId,
      documentId,
      versionId,
      userId,
      title,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await localDb.saveConversation(conv);
    } catch (e) {
      console.warn('Local conversation save notice:', e);
    }

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
        console.warn('Firestore conversation save notice:', err);
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
    const nowIso = new Date().toISOString();
    try {
      const conv = await localDb.getConversations(documentId, userId);
      const found = conv.find((c) => c.id === conversationId);
      if (found) {
        await localDb.saveConversation({ ...found, title, updatedAt: nowIso });
      }
    } catch (e) {
      console.warn('Local title update notice:', e);
    }

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
        await updateDoc(convRef, {
          title,
          updatedAt: nowIso,
        });
      } catch (err) {
        console.warn('Firestore title update notice:', err);
      }
    }
  },

  /**
   * Persists a chat message in local store and best-effort Firestore.
   */
  async saveMessage(
    userId: string,
    documentId: string,
    conversationId: string,
    message: ChatMessage
  ): Promise<void> {
    try {
      await localDb.saveMessage(documentId, message);
    } catch (e) {
      console.warn('Local message save notice:', e);
    }

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
      console.warn('Firestore message save notice:', err);
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
    _onError: (err: Error) => void
  ): Unsubscribe {
    let isCleanedUp = false;

    const pushMessages = async () => {
      if (isCleanedUp) return;
      try {
        const msgs = await localDb.getMessages(conversationId);
        if (!isCleanedUp) {
          onUpdate(msgs);
        }
      } catch (e) {
        console.warn('Local messages read error:', e);
      }
    };

    pushMessages();

    const unsubscribeLocal = localDb.subscribe(`messages_${conversationId}`, () => {
      pushMessages();
    });

    let unsubscribeFirestore: Unsubscribe = () => {};
    if (db) {
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

        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            if (isCleanedUp) return;
            const messages: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
              const msg = docSnap.data() as ChatMessage;
              messages.push(msg);
              localDb.saveMessage(documentId, msg).catch(() => {});
            });
            pushMessages();
          },
          (err) => {
            console.warn('Firestore message live listener notice:', err?.message);
          }
        );
      } catch (err: any) {
        console.warn('Firestore live listener subscribe notice:', err?.message);
      }
    }

    return () => {
      isCleanedUp = true;
      unsubscribeLocal();
      unsubscribeFirestore();
    };
  },

  /**
   * Deletes a conversation and its messages.
   */
  async deleteConversation(
    userId: string,
    documentId: string,
    conversationId: string
  ): Promise<void> {
    try {
      await localDb.deleteConversation(conversationId, documentId);
    } catch (e) {
      console.warn('Local conversation delete notice:', e);
    }

    if (!db) return;

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
      const msgSnap = await getDocs(messagesCol);
      const deletePromises = msgSnap.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

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
      console.warn('Firestore conversation delete notice:', err);
    }
  },
};
