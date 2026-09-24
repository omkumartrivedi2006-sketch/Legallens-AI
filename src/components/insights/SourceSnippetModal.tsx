import React from 'react';
import { X, FileText, Bookmark, Copy, Check } from 'lucide-react';
import { InsightSource } from '../../types/insight';
import { Button } from '../ui/Button';

interface SourceSnippetModalProps {
  source: InsightSource | null;
  onClose: () => void;
  documentTitle?: string;
}

export const SourceSnippetModal: React.FC<SourceSnippetModalProps> = ({
  source,
  onClose,
  documentTitle,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!source) return null;

  const handleCopy = () => {
    if (source.textSnippet) {
      navigator.clipboard.writeText(source.textSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Document Source Citation
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                {documentTitle || 'Referenced Document Content'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Source metadata badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {source.sectionHeading && (
            <span className="px-2.5 py-1 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Section: {source.sectionHeading}
            </span>
          )}
          {source.pageNumber !== undefined && source.pageNumber !== null && (
            <span className="px-2.5 py-1 rounded-md font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
              Page {source.pageNumber}
            </span>
          )}
        </div>

        {/* Verbatim extracted text snippet */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Verbatim Document Text
          </span>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-text">
            {source.textSnippet || 'No verbatim text snippet cited for this entry.'}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Strictly grounded in extracted text</span>
          </span>

          <div className="flex items-center gap-2">
            {source.textSnippet && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs h-8 px-3"
              >
                {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
