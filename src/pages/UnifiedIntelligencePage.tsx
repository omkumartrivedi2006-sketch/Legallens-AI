import React, { useState } from 'react';
import {
  Layers,
  MessageSquare,
  Search,
  Calendar,
  Sparkles,
  FileText,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUnifiedIntelligence } from '../hooks/useUnifiedIntelligence';
import { DocumentScopeSelector } from '../components/unified/DocumentScopeSelector';
import { UnifiedChatPane } from '../components/unified/UnifiedChatPane';
import { UnifiedSearchPane } from '../components/unified/UnifiedSearchPane';
import { CrossDocumentMatrixPane } from '../components/unified/CrossDocumentMatrixPane';
import { UnifiedConversationList } from '../components/unified/UnifiedConversationList';
import { cn } from '../lib/utils';

export const UnifiedIntelligencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'matrix'>('chat');

  const {
    documents,
    readyDocuments,
    isLoadingDocuments,
    selectedDocumentIds,
    toggleDocument,
    selectAll,
    deselectAll,
    updateConversationScope,
    conversations,
    activeConversationId,
    messages,
    isSending,
    error,
    sendMessage,
    retryLastQuestion,
    startNewConversation,
    selectConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
    selectedClauseCategory,
    setSelectedClauseCategory,
    isSearching,
    searchResults,
    searchError,
    executeSearch,
  } = useUnifiedIntelligence();

  const selectedDocs = documents.filter((d) => selectedDocumentIds.includes(d.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Unified Legal Intelligence
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              Multi-Document
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Synthesize information, discover conflicting provisions, and search exact clauses across your document library.
          </p>
        </div>

        {/* Workspace Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors',
              activeTab === 'chat'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
            <span>AI Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors',
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Search className="h-3.5 w-3.5 text-indigo-500" />
            <span>Clause & Text Search</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors',
              activeTab === 'matrix'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            <span>Duties & Deadlines</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      {documents.length === 0 && !isLoadingDocuments ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
            <Upload className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Documents in Library
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload at least one legal agreement or contract to begin using cross-document intelligence and unified search.
            </p>
          </div>
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Document Scope Selector & Discussions */}
          <div className="lg:col-span-4 space-y-6">
            <DocumentScopeSelector
              documents={documents}
              selectedDocumentIds={selectedDocumentIds}
              onToggleDocument={toggleDocument}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              onUpdateScope={updateConversationScope}
              isLoading={isLoadingDocuments}
            />

            {activeTab === 'chat' && (
              <UnifiedConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={selectConversation}
                onNewConversation={startNewConversation}
                onDeleteConversation={deleteConversation}
              />
            )}
          </div>

          {/* Right Column: Tab View Workspace */}
          <div className="lg:col-span-8 min-h-[620px] h-[720px]">
            {activeTab === 'chat' && (
              <UnifiedChatPane
                messages={messages}
                isSending={isSending}
                error={error}
                selectedDocumentCount={selectedDocumentIds.length}
                onSendMessage={sendMessage}
                onRetry={retryLastQuestion}
              />
            )}

            {activeTab === 'search' && (
              <UnifiedSearchPane
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedClauseCategory={selectedClauseCategory}
                onSelectClauseCategory={setSelectedClauseCategory}
                isSearching={isSearching}
                searchResults={searchResults}
                searchError={searchError}
                onExecuteSearch={executeSearch}
                selectedDocumentCount={
                  selectedDocumentIds.length > 0 ? selectedDocumentIds.length : readyDocuments.length
                }
              />
            )}

            {activeTab === 'matrix' && (
              <CrossDocumentMatrixPane selectedDocuments={selectedDocs} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
