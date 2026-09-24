import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentChat } from '../hooks/useDocumentChat';
import { DocumentMetadata } from '../types/document';
import { DocumentSelector } from '../components/chat/DocumentSelector';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ConversationSidebar } from '../components/chat/ConversationSidebar';
import { ChatMessageBubble } from '../components/chat/ChatMessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { SuggestedQuestions } from '../components/chat/SuggestedQuestions';
import { LegalChatDisclaimer } from '../components/chat/LegalChatDisclaimer';
import { Button } from '../components/ui/Button';

export const ChatPage: React.FC = () => {
  const { documentId } = useParams<{ documentId?: string }>();
  const navigate = useNavigate();

  const { documents, loading: loadingDocuments } = useDocuments();
  const [activeDocument, setActiveDocument] = useState<DocumentMetadata | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Match active document from route param
  useEffect(() => {
    if (!documentId) {
      setActiveDocument(null);
      return;
    }
    const found = documents.find((d) => d.id === documentId);
    if (found) {
      setActiveDocument(found);
    }
  }, [documentId, documents]);

  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isSending,
    error,
    canRetry,
    selectConversation,
    startNewConversation,
    deleteConversation,
    sendMessage,
    retryLastMessage,
    clearError,
  } = useDocumentChat(activeDocument);

  // Scroll to bottom on new messages or when AI starts thinking
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Handle document selection from selector
  const handleSelectDocument = (doc: DocumentMetadata) => {
    navigate(`/chat/${doc.id}`);
  };

  // If no documentId in URL, show DocumentSelector
  if (!documentId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <DocumentSelector
          documents={documents}
          isLoading={loadingDocuments}
          onSelectDocument={handleSelectDocument}
        />
      </div>
    );
  }

  // Still loading documents
  if (loadingDocuments) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Loading document context...
        </p>
        <p className="text-xs text-slate-400 mt-1">Verifying ownership and access permissions</p>
      </div>
    );
  }

  // Document not found in user's documents
  if (!activeDocument) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit mx-auto text-slate-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Document Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            The requested document could not be found in your account or you do not have permission to access it.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Choose Another Document
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6.5rem)] flex rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.045] backdrop-blur-md overflow-hidden shadow-sm">
      {/* Left: Conversation History Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isLoading={isLoadingConversations}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectConversation={selectConversation}
        onNewConversation={startNewConversation}
        onDeleteConversation={deleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50/20 dark:bg-transparent">
        {/* Header */}
        <ChatHeader
          document={activeDocument}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onSwitchDocument={() => navigate('/chat')}
        />

        {/* Disclaimer Strip */}
        <div className="px-4 py-2 bg-white/40 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5 backdrop-blur-xs">
          <LegalChatDisclaimer />
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <SuggestedQuestions
              onSelectQuestion={sendMessage}
              disabled={isSending}
            />
          ) : (
            messages.map((msg, index) => (
              <ChatMessageBubble
                key={msg.id || index}
                message={msg}
                isLatestAssistant={
                  msg.role === 'assistant' && index === messages.length - 1
                }
                onRetry={retryLastMessage}
                canRetry={canRetry}
              />
            ))
          )}

          {/* Real-time Thinking Indicator */}
          {isSending && (
            <div className="flex items-center gap-3 my-4 animate-in fade-in">
              <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 backdrop-blur-md shadow-xs text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Reading document chunks and grounding response...</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLastMessage}
                    className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300"
                  >
                    Retry
                  </Button>
                )}
                <button
                  type="button"
                  onClick={clearError}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 font-bold px-1"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={activeDocument.processingStatus !== 'ready' || !activeDocument.extractedText}
          isLoading={isSending}
        />
      </div>
    </div>
  );
};
