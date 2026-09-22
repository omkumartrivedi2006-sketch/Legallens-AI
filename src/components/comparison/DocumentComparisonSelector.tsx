import React from 'react';
import {
  FileText,
  FileCheck2,
  FileCode,
  FileSpreadsheet,
  ArrowLeftRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { DocumentMetadata } from '../../types/document';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { DocumentStatusBadge } from '../documents/DocumentStatus';

interface DocumentComparisonSelectorProps {
  documents: DocumentMetadata[];
  documentA: DocumentMetadata | null;
  documentB: DocumentMetadata | null;
  onSelectDocumentA: (doc: DocumentMetadata) => void;
  onSelectDocumentB: (doc: DocumentMetadata) => void;
  onSwapDocuments: () => void;
  onCompare: () => void;
  isComparing: boolean;
  progressStage: string | null;
}

export const DocumentComparisonSelector: React.FC<DocumentComparisonSelectorProps> = ({
  documents,
  documentA,
  documentB,
  onSelectDocumentA,
  onSelectDocumentB,
  onSwapDocuments,
  onCompare,
  isComparing,
  progressStage,
}) => {
  const readyDocuments = documents.filter((d) => d.processingStatus === 'ready');

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'docx':
        return <FileCheck2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'txt':
        return <FileCode className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-slate-500" />;
    }
  };

  const isSameDoc = Boolean(documentA && documentB && documentA.id === documentB.id);

  return (
    <div className="space-y-4">
      {/* Dual Document Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* Slot A: Base Document */}
        <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Document A (Baseline / Original)
              </span>
              {documentA && <DocumentStatusBadge status={documentA.processingStatus} />}
            </div>

            <div className="relative">
              <select
                aria-label="Select Document A (Baseline)"
                value={documentA?.id || ''}
                onChange={(e) => {
                  const found = documents.find((d) => d.id === e.target.value);
                  if (found) onSelectDocumentA(found);
                }}
                disabled={isComparing}
                className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>
                  -- Select Base Document --
                </option>
                {readyDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.originalFileName || doc.fileName} ({doc.fileType.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {documentA ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shrink-0 shadow-xs">
                  {getFileIcon(documentA.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {documentA.originalFileName || documentA.fileName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono uppercase mt-0.5">
                    {documentA.fileType} {documentA.wordCount !== undefined ? `• ${documentA.wordCount.toLocaleString()} words` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Choose the original or baseline version.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Swap Button (Center Column) */}
        <div className="lg:col-span-1 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onSwapDocuments}
            disabled={!documentA || !documentB || isComparing}
            className="h-10 w-10 rounded-full p-0 flex items-center justify-center shadow-xs border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
            title="Swap Document A and Document B"
          >
            <ArrowLeftRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </Button>
        </div>

        {/* Slot B: Target / Revision Document */}
        <Card className="lg:col-span-5 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Document B (Target / Counter-Proposal)
              </span>
              {documentB && <DocumentStatusBadge status={documentB.processingStatus} />}
            </div>

            <div className="relative">
              <select
                aria-label="Select Document B (Target / Revision)"
                value={documentB?.id || ''}
                onChange={(e) => {
                  const found = documents.find((d) => d.id === e.target.value);
                  if (found) onSelectDocumentB(found);
                }}
                disabled={isComparing}
                className="w-full appearance-none rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>
                  -- Select Target Document --
                </option>
                {readyDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.originalFileName || doc.fileName} ({doc.fileType.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {documentB ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shrink-0 shadow-xs">
                  {getFileIcon(documentB.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {documentB.originalFileName || documentB.fileName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono uppercase mt-0.5">
                    {documentB.fileType} {documentB.wordCount !== undefined ? `• ${documentB.wordCount.toLocaleString()} words` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                Choose the amended or target version to compare.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Same Document Warning */}
      {isSameDoc && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Please select two different documents to compare.</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          {progressStage ? (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{progressStage}</span>
            </div>
          ) : (
            <span>
              Deterministic alignment compares sections; Gemini interprets practical semantic changes.
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onCompare}
          disabled={!documentA || !documentB || isSameDoc || isComparing}
          isLoading={isComparing}
          className="w-full sm:w-auto px-6"
        >
          {isComparing ? (
            'Comparing Documents...'
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2 text-blue-200" />
              Compare Documents
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
