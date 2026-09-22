import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  User,
} from 'lucide-react';
import { ChatMessage, ChatSource } from '../../types/chat';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isLatestAssistant?: boolean;
  onRetry?: () => void;
  canRetry?: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isLatestAssistant = false,
  onRetry,
  canRetry = false,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedSources, setExpandedSources] = useState<boolean>(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy to clipboard.');
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 my-3 animate-in fade-in duration-200">
        <div className="max-w-[85%] sm:max-w-xl flex flex-col items-end">
          <div className="rounded-2xl rounded-tr-xs bg-blue-600 dark:bg-blue-500 text-white px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm">
            <p className="whitespace-pre-wrap select-text">{message.content}</p>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">{formatTime(message.createdAt)}</span>
        </div>
        <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // Assistant Bubble
  return (
    <div className="flex justify-start gap-2.5 my-4 animate-in fade-in duration-200">
      <div className="h-7 w-7 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="h-3.5 w-3.5" />
      </div>

      <div className="max-w-[92%] sm:max-w-2xl w-full space-y-2">
        {/* Assistant Message Card */}
        <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-3">
          {/* Header row with badge & copy */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
              <span>LegalLens AI</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <ShieldCheck className="h-2.5 w-2.5 text-blue-500" />
                Grounded
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy answer to clipboard"
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {canRetry && isLatestAssistant && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  aria-label="Retry answer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="leading-relaxed whitespace-pre-wrap select-text font-normal space-y-2">
            {message.content}
          </div>

          {/* Sources Section */}
          {message.sources && message.sources.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setExpandedSources(!expandedSources)}
                className="w-full flex items-center justify-between text-left text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Sources Cited ({message.sources.length})</span>
                </span>
                {expandedSources ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {expandedSources && (
                <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                  {message.sources.map((source: ChatSource, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                        <span className="truncate">
                          {source.sectionHeading || `Section Reference ${idx + 1}`}
                        </span>
                        {source.pageNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Page {source.pageNumber}
                          </span>
                        )}
                      </div>
                      {source.textSnippet && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-serif italic pl-2 border-l-2 border-blue-400/80 dark:border-blue-500/80">
                          "{source.textSnippet}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
          <span>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
