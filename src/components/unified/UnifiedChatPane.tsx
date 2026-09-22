import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  HelpCircle,
  RotateCcw,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { UnifiedMessage, UnifiedSource, UnifiedConflict } from '../../types/unified';
import { cn } from '../../lib/utils';

export interface UnifiedChatPaneProps {
  messages: UnifiedMessage[];
  isSending: boolean;
  error: string | null;
  selectedDocumentCount: number;
  onSendMessage: (question: string) => void;
  onRetry: () => void;
  onOpenSourceSnippet?: (source: UnifiedSource) => void;
}

const STARTER_PROMPTS = [
  'What are my payment obligations across these agreements?',
  'Which agreements contain termination clauses and notice periods?',
  'Do any of these contracts have conflicting terms or definitions?',
  'What key deadlines are mentioned across these documents?',
  'What confidentiality obligations are assigned to each party?',
];

export const UnifiedChatPane: React.FC<UnifiedChatPaneProps> = ({
  messages,
  isSending,
  error,
  selectedDocumentCount,
  onSendMessage,
  onRetry,
  onOpenSourceSnippet,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [expandedSourcesMessageId, setExpandedSourcesMessageId] = useState<string | null>(null);
  const [selectedSnippetModal, setSelectedSnippetModal] = useState<UnifiedSource | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;
    onSendMessage(trimmed);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
              Cross-Document Legal Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Ask questions across {selectedDocumentCount} selected legal document{selectedDocumentCount === 1 ? '' : 's'}. LegalLens AI synthesizes answers, highlights conflicts, and cites exact provisions.
            </p>

            <div className="w-full space-y-2 text-left">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                Suggested Cross-Document Questions
              </p>
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(prompt)}
                  disabled={selectedDocumentCount === 0 || isSending}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-xs text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === 'user';
            const isSourcesExpanded = expandedSourcesMessageId === message.id;

            return (
              <div
                key={message.id}
                className={cn('flex gap-3 max-w-3xl', isUser ? 'ml-auto justify-end' : 'mr-auto')}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={cn(
                    'flex flex-col space-y-3 rounded-2xl p-4 text-xs leading-relaxed max-w-full sm:max-w-2xl shadow-sm border',
                    isUser
                      ? 'bg-blue-600 text-white border-blue-500 ml-12'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  )}
                >
                  {/* Origin Badge for Assistant message */}
                  {!isUser && message.classification && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                      {message.classification === 'from_documents' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          From your documents ({message.sources?.length || 0} source{message.sources?.length === 1 ? '' : 's'})
                        </span>
                      ) : message.classification === 'general_legal' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                          <Info className="h-3 w-3" />
                          General legal information (Not document-specific)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          <HelpCircle className="h-3 w-3" />
                          Not found in selected documents
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopy(message.id, message.content)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                        title="Copy Answer"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Potential Conflicts / Inconsistencies Card */}
                  {!isUser && message.potentialConflicts && message.potentialConflicts.length > 0 && (
                    <div className="space-y-2 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Potential Inconsistency Detected Between Documents</span>
                      </div>
                      {message.potentialConflicts.map((conflict, cIdx) => (
                        <div key={cIdx} className="space-y-1.5 pt-1 text-[11px]">
                          <p className="font-medium text-amber-800 dark:text-amber-300">
                            Topic: {conflict.topic}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40">
                            <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {conflict.documentA.documentName}
                              </p>
                              <p className="italic text-slate-600 dark:text-slate-400 mt-0.5">
                                "{conflict.documentA.provision}"
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {conflict.documentB.documentName}
                              </p>
                              <p className="italic text-slate-600 dark:text-slate-400 mt-0.5">
                                "{conflict.documentB.provision}"
                              </p>
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                            {conflict.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Answer Content */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>

                  {/* Key Takeaways */}
                  {!isUser && message.keyTakeaways && message.keyTakeaways.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                      <p className="font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                        Key Takeaways:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                        {message.keyTakeaways.map((takeaway, tIdx) => (
                          <li key={tIdx}>{takeaway}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cited Sources Accordion */}
                  {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSourcesMessageId(isSourcesExpanded ? null : message.id)
                        }
                        className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                          <span>Sources Used ({message.sources.length})</span>
                        </span>
                        {isSourcesExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {isSourcesExpanded && (
                        <div className="mt-2 space-y-2">
                          {message.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              onClick={() => {
                                if (onOpenSourceSnippet) onOpenSourceSnippet(src);
                                else setSelectedSnippetModal(src);
                              }}
                              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                <span className="truncate max-w-[200px]" title={src.documentName}>
                                  {src.documentName}
                                </span>
                                {src.pageNumber && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    Page {src.pageNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mb-1">
                                {src.section}
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2">
                                "{src.snippet}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={cn(
                      'text-[10px]',
                      isUser ? 'text-blue-200 text-right' : 'text-slate-400'
                    )}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 shadow-sm">
              <Sparkles className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Analyzing provisions across selected documents...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400 hover:underline shrink-0 ml-3"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="p-3 lg:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedDocumentCount === 0
                ? 'Select at least one document to ask questions...'
                : `Ask a question across ${selectedDocumentCount} selected document${selectedDocumentCount === 1 ? '' : 's'}... (Press Enter)`
            }
            disabled={selectedDocumentCount === 0 || isSending}
            className="flex-1 max-h-32 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || selectedDocumentCount === 0 || isSending}
            className="h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors shadow-sm"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Shift + Enter for new line</span>
          <span>LegalLens AI is an informational assistant, not a lawyer.</span>
        </div>
      </div>

      {/* Local Source Snippet Modal */}
      {selectedSnippetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedSnippetModal(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Source Citation
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedSnippetModal.documentName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnippetModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {selectedSnippetModal.section}
                </span>
                {selectedSnippetModal.pageNumber && (
                  <span className="text-slate-400">Page {selectedSnippetModal.pageNumber}</span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed max-h-60 overflow-y-auto">
                "{selectedSnippetModal.snippet}"
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSnippetModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
