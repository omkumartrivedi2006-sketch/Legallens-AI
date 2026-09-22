import React, { useState } from 'react';
import {
  FileText,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { ComparisonChange } from '../../types/comparison';

interface SideBySideDiffViewProps {
  changes: ComparisonChange[];
  docAName: string;
  docBName: string;
}

export const SideBySideDiffView: React.FC<SideBySideDiffViewProps> = ({
  changes,
  docAName,
  docBName,
}) => {
  const [mobileTab, setMobileTab] = useState<'both' | 'a' | 'b'>('both');

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'added':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <PlusCircle className="h-3 w-3" />
            [ADDED]
          </span>
        );
      case 'removed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <MinusCircle className="h-3 w-3" />
            [REMOVED]
          </span>
        );
      case 'modified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <RefreshCw className="h-3 w-3" />
            [CHANGED]
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="h-3 w-3" />
            [UNCHANGED]
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile view toggle */}
      <div className="sm:hidden flex items-center justify-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMobileTab('both')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mobileTab === 'both'
              ? 'bg-white dark:bg-slate-700 font-bold text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500'
          }`}
        >
          Split View
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('a')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mobileTab === 'a'
              ? 'bg-white dark:bg-slate-700 font-bold text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500'
          }`}
        >
          Doc A Only
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('b')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mobileTab === 'b'
              ? 'bg-white dark:bg-slate-700 font-bold text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500'
          }`}
        >
          Doc B Only
        </button>
      </div>

      {/* Side by Side Panels Header */}
      <div className="hidden sm:grid grid-cols-2 gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-2 pl-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="truncate">Document A: {docAName}</span>
        </div>
        <div className="flex items-center gap-2 pl-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="truncate">Document B: {docBName}</span>
        </div>
      </div>

      {/* Changes Rows */}
      <div className="space-y-4">
        {changes.map((change, idx) => (
          <div
            key={change.id || idx}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
          >
            {/* Clause Section Header */}
            <div className="bg-slate-50/90 dark:bg-slate-850 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                {getStatusBadge(change.type)}
                <span className="font-bold text-slate-900 dark:text-white">
                  {change.section || `Clause ${idx + 1}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {change.category}
                </span>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  change.significance === 'high'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    : change.significance === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {change.significance} Impact
              </span>
            </div>

            {/* Explanation Strip */}
            <div className="px-4 py-2 bg-blue-50/40 dark:bg-blue-950/20 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">Practical Meaning: </span>
              {change.explanation}
            </div>

            {/* Side-by-Side Content Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 text-xs leading-relaxed font-mono">
              {/* Document A Column */}
              {(mobileTab === 'both' || mobileTab === 'a') && (
                <div
                  className={`p-4 ${
                    change.type === 'removed'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20'
                      : change.type === 'modified'
                      ? 'bg-slate-50/50 dark:bg-slate-850/40'
                      : 'bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 italic'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400 font-sans mb-1.5 flex items-center justify-between">
                    <span>Document A (Original)</span>
                    {change.sourceA?.pageNumber && (
                      <span>Page {change.sourceA.pageNumber}</span>
                    )}
                  </p>
                  {change.documentAText ? (
                    <div className="whitespace-pre-wrap select-text text-slate-800 dark:text-slate-200">
                      {change.documentAText}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">
                      [Clause not present in Document A]
                    </span>
                  )}
                </div>
              )}

              {/* Document B Column */}
              {(mobileTab === 'both' || mobileTab === 'b') && (
                <div
                  className={`p-4 ${
                    change.type === 'added'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                      : change.type === 'modified'
                      ? 'bg-blue-50/30 dark:bg-blue-950/20'
                      : 'bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 italic'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400 font-sans mb-1.5 flex items-center justify-between">
                    <span>Document B (Revised)</span>
                    {change.sourceB?.pageNumber && (
                      <span>Page {change.sourceB.pageNumber}</span>
                    )}
                  </p>
                  {change.documentBText ? (
                    <div className="whitespace-pre-wrap select-text text-slate-800 dark:text-slate-200">
                      {change.documentBText}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">
                      [Clause removed or not identified in Document B]
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
