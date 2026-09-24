import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService, ChatServiceError } from '../services/chatService';
import { ChatConversation, ChatMessage } from '../types/chat';
import { DocumentMetadata } from '../types/document';

export function useDocumentChat(document: DocumentMetadata | null) {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track the last failed question for retry
  const lastFailedQuestionRef = useRef<string | null>(null);

  // 1. Fetch conversations whenever document or user changes
  const fetchConversations = useCallback(async () => {
    if (!user || !document?.id) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    try {
      const convList = await chatService.getConversations(user.uid, document.id);
      setConversations(convList);

      // Default to first conversation or create fresh draft id if none exist
      if (convList.length > 0) {
        setActiveConversationId(convList[0].id);
      } else {
        setActiveConversationId(crypto.randomUUID());
      }
    } catch (err: any) {
      console.warn('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user, document?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Subscribe to messages of the active conversation
  useEffect(() => {
    if (!user || !document?.id || !activeConversationId) {
      setMessages([]);
      return;
    }

    // Check if this conversation actually exists in saved list
    const exists = conversations.some((c) => c.id === activeConversationId);
    if (!exists) {
      // It's a fresh draft conversation, no messages yet
      setMessages([]);
      return;
    }

    const unsubscribe = chatService.subscribeMessages(
      user.uid,
      document.id,
      activeConversationId,
      (msgs) => {
        setMessages(msgs);
      },
      (err) => {
        console.warn('Messages subscription error:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, document?.id, activeConversationId, conversations]);

  // 3. Start a new conversation
  const startNewConversation = useCallback(() => {
    const newId = crypto.randomUUID();
    setActiveConversationId(newId);
    setMessages([]);
    setError(null);
    lastFailedQuestionRef.current = null;
  }, []);

  // 4. Select an existing conversation
  const selectConversation = useCallback((convId: string) => {
    setActiveConversationId(convId);
    setError(null);
    lastFailedQuestionRef.current = null;
  }, []);

  // 5. Delete a conversation
  const deleteConversation = useCallback(
    async (convId: string) => {
      if (!user || !document?.id) return;
      try {
        await chatService.deleteConversation(user.uid, document.id, convId);
        setConversations((prev) => prev.filter((c) => c.id !== convId));

        if (activeConversationId === convId) {
          // Switch to another conversation or start new draft
          const remaining = conversations.filter((c) => c.id !== convId);
          if (remaining.length > 0) {
            setActiveConversationId(remaining[0].id);
          } else {
            startNewConversation();
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to delete conversation.');
      }
    },
    [user, document?.id, activeConversationId, conversations, startNewConversation]
  );

  // 6. Send a message
  const sendMessage = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || isSending) return;

      if (!user) {
        setError('Please sign in to chat with this document.');
        return;
      }

      if (!document) {
        setError('No document selected.');
        return;
      }

      if (document.processingStatus !== 'ready') {
        setError('This document is still processing. Please wait until text extraction is complete.');
        return;
      }

      if (!document.extractedText) {
        setError('No extracted text available for this document.');
        return;
      }

      setError(null);
      setIsSending(true);
      lastFailedQuestionRef.current = question;

      const conversationId = activeConversationId || crypto.randomUUID();
      const userMessageId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      const userMessage: ChatMessage = {
        id: userMessageId,
        conversationId,
        userId: user.uid,
        versionId: document.currentVersionId,
        role: 'user',
        content: question,
        createdAt: nowIso,
        status: 'sent',
      };

      // Optimistically add user message if drafting
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Save user message in Firestore
        await chatService.saveMessage(user.uid, document.id, conversationId, userMessage);

        // Ensure conversation metadata doc exists
        const convExists = conversations.some((c) => c.id === conversationId);
        if (!convExists) {
          const initialTitle = question.slice(0, 45) + (question.length > 45 ? '...' : '');
          const newConv = await chatService.createConversation(
            user.uid,
            document.id,
            conversationId,
            initialTitle,
            document.currentVersionId
          );
          setConversations((prev) => [newConv, ...prev]);
        }

        // Prepare context history (prior turns)
        const history = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Send to backend
        const { message: assistantMessage, conversationTitle } = await chatService.sendChatMessage({
          documentId: document.id,
          userId: user.uid,
          conversationId,
          message: question,
          fileName: document.originalFileName || document.fileName,
          fileType: document.fileType,
          extractedText: document.extractedText,
          processingStatus: document.processingStatus,
          history,
          versionId: document.currentVersionId,
        });

        // Save assistant message in Firestore
        await chatService.saveMessage(user.uid, document.id, conversationId, assistantMessage);

        // Update conversation title if provided
        if (conversationTitle) {
          await chatService.updateConversationTitle(
            user.uid,
            document.id,
            conversationId,
            conversationTitle
          );
          setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, title: conversationTitle } : c))
          );
        }

        // Clear failed question ref on success
        lastFailedQuestionRef.current = null;
      } catch (err: any) {
        const errorMsg =
          err instanceof ChatServiceError
            ? err.message
            : err?.message || 'Failed to generate answer. Please try again.';
        setError(errorMsg);
      } finally {
        setIsSending(false);
      }
    },
    [user, document, isSending, activeConversationId, conversations, messages]
  );

  // 7. Retry the last failed message
  const retryLastMessage = useCallback(async () => {
    if (lastFailedQuestionRef.current) {
      // Remove the last optimistic user message if error occurred before assistant responded
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'user') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      await sendMessage(lastFailedQuestionRef.current);
    }
  }, [sendMessage]);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isSending,
    error,
    canRetry: Boolean(lastFailedQuestionRef.current && error),
    selectConversation,
    startNewConversation,
    deleteConversation,
    sendMessage,
    retryLastMessage,
    clearError: () => setError(null),
  };
}
