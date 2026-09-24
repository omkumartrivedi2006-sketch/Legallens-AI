import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from './useDocuments';
import { unifiedService } from '../services/unifiedService';
import {
  UnifiedConversation,
  UnifiedMessage,
  UnifiedSearchResponse,
} from '../types/unified';
import { DocumentRecord } from '../types/document';

export function useUnifiedIntelligence() {
  const { user } = useAuth();
  const { documents, loading: isLoadingDocuments } = useDocuments();

  // Selected documents state
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  // Conversations & Chat State
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClauseCategory, setSelectedClauseCategory] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<UnifiedSearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const lastFailedQuestionRef = useRef<string | null>(null);

  // Only consider 'ready' documents
  const readyDocuments = documents.filter((d) => d.processingStatus === 'ready');

  // Initialize selected documents to all ready documents if none selected yet
  useEffect(() => {
    if (readyDocuments.length > 0 && selectedDocumentIds.length === 0) {
      setSelectedDocumentIds(readyDocuments.map((d) => d.id));
    }
  }, [readyDocuments.length]);

  // Document selection helpers
  const toggleDocument = useCallback((docId: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedDocumentIds(readyDocuments.map((d) => d.id));
  }, [readyDocuments]);

  const deselectAll = useCallback(() => {
    setSelectedDocumentIds([]);
  }, []);

  // 1. Subscribe to saved unified conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    const unsubscribe = unifiedService.subscribeUnifiedConversations(
      user.uid,
      (convList) => {
        setConversations(convList);
        setIsLoadingConversations(false);

        // If no active conversation, pick the first or create a new draft
        setActiveConversationId((current) => {
          if (current) return current;
          if (convList.length > 0) return convList[0].id;
          return crypto.randomUUID();
        });
      },
      (err) => {
        console.warn('Unified conversations subscription error:', err);
        setIsLoadingConversations(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Subscribe to messages of active conversation
  useEffect(() => {
    if (!user || !activeConversationId) {
      setMessages([]);
      return;
    }

    const currentConv = conversations.find((c) => c.id === activeConversationId);
    if (!currentConv) {
      // Draft conversation
      setMessages([]);
      return;
    }

    // Restore conversation document scope if present
    if (currentConv.selectedDocumentIds && currentConv.selectedDocumentIds.length > 0) {
      setSelectedDocumentIds(currentConv.selectedDocumentIds);
    }

    const unsubscribe = unifiedService.subscribeUnifiedMessages(
      user.uid,
      activeConversationId,
      (msgs) => {
        setMessages(msgs);
      },
      (err) => {
        console.warn('Messages subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [user, activeConversationId, conversations]);

  // 3. Start a new conversation
  const startNewConversation = useCallback(() => {
    const newId = crypto.randomUUID();
    setActiveConversationId(newId);
    setMessages([]);
    setError(null);
    lastFailedQuestionRef.current = null;
  }, []);

  // 4. Select existing conversation
  const selectConversation = useCallback((convId: string) => {
    setActiveConversationId(convId);
    setError(null);
    lastFailedQuestionRef.current = null;
  }, []);

  // 5. Delete conversation
  const deleteConversation = useCallback(
    async (convId: string) => {
      if (!user) return;
      try {
        await unifiedService.deleteUnifiedConversation(user.uid, convId);
        if (activeConversationId === convId) {
          const remaining = conversations.filter((c) => c.id !== convId);
          if (remaining.length > 0) {
            setActiveConversationId(remaining[0].id);
          } else {
            startNewConversation();
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete conversation.');
      }
    },
    [user, activeConversationId, conversations, startNewConversation]
  );

  // 6. Update conversation document scope
  const updateConversationScope = useCallback(
    async (newScope: string[]) => {
      setSelectedDocumentIds(newScope);
      if (!user || !activeConversationId) return;
      const exists = conversations.some((c) => c.id === activeConversationId);
      if (exists) {
        await unifiedService.updateConversationScope(user.uid, activeConversationId, newScope);
      }
    },
    [user, activeConversationId, conversations]
  );

  // 7. Send multi-document question
  const sendMessage = useCallback(
    async (questionText: string) => {
      if (!user) {
        setError('You must be signed in to ask questions.');
        return;
      }

      const trimmed = questionText.trim();
      if (!trimmed) return;

      if (selectedDocumentIds.length === 0) {
        setError('Please select at least one document from the document scope.');
        return;
      }

      setError(null);
      setIsSending(true);
      lastFailedQuestionRef.current = trimmed;

      const conversationId = activeConversationId || crypto.randomUUID();
      if (!activeConversationId) {
        setActiveConversationId(conversationId);
      }

      // Optimistic user message
      const userMessageId = crypto.randomUUID();
      const userMessage: UnifiedMessage = {
        id: userMessageId,
        conversationId,
        userId: user.uid,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Filter only selected documents
      const targetDocs: DocumentRecord[] = documents.filter((d) =>
        selectedDocumentIds.includes(d.id)
      );

      // Extract conversation history
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        // Persist optimistic user message to Firestore
        await unifiedService.saveUnifiedMessage(
          user.uid,
          conversationId,
          userMessage,
          messages.length === 0 ? undefined : undefined,
          selectedDocumentIds
        );

        // Call backend multi-document engine
        const { message: assistantMessage, conversationTitle } =
          await unifiedService.sendUnifiedQuery({
            documentIds: selectedDocumentIds,
            question: trimmed,
            conversationId,
            history: historyPayload,
            documents: targetDocs,
          });

        // Persist assistant response to Firestore
        await unifiedService.saveUnifiedMessage(
          user.uid,
          conversationId,
          assistantMessage,
          conversationTitle,
          selectedDocumentIds
        );

        lastFailedQuestionRef.current = null;
      } catch (err: any) {
        console.error('Unified chat error:', err);
        setError(err.message || 'Failed to generate cross-document intelligence answer.');
      } finally {
        setIsSending(false);
      }
    },
    [user, activeConversationId, selectedDocumentIds, documents, messages]
  );

  // 8. Retry last question
  const retryLastQuestion = useCallback(() => {
    if (lastFailedQuestionRef.current) {
      sendMessage(lastFailedQuestionRef.current);
    }
  }, [sendMessage]);

  // 9. Lexical / Clause Search
  const executeSearch = useCallback(
    async (queryText: string, clauseCategory?: string) => {
      if (!user) return;
      const clean = queryText.trim();
      if (!clean && !clauseCategory) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await unifiedService.searchLibrary({
          documentIds: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
          query: clean,
          clauseCategory,
          documents,
        });
        setSearchResults(results);
      } catch (err: any) {
        setSearchError(err.message || 'Search execution failed.');
      } finally {
        setIsSearching(false);
      }
    },
    [user, selectedDocumentIds, documents]
  );

  return {
    // Document library & selection
    documents,
    readyDocuments,
    isLoadingDocuments,
    selectedDocumentIds,
    toggleDocument,
    selectAll,
    deselectAll,
    updateConversationScope,

    // Chat & Conversations
    conversations,
    activeConversationId,
    activeConversation: conversations.find((c) => c.id === activeConversationId),
    messages,
    isLoadingConversations,
    isSending,
    error,
    sendMessage,
    retryLastQuestion,
    startNewConversation,
    selectConversation,
    deleteConversation,

    // Search
    searchQuery,
    setSearchQuery,
    selectedClauseCategory,
    setSelectedClauseCategory,
    isSearching,
    searchResults,
    searchError,
    executeSearch,
  };
}
