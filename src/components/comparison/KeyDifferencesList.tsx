import React from 'react';
import {
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ComparisonChange } from '../../types/comparison';

interface KeyDifferencesListProps {
  changes: ComparisonChange[];
}

export const KeyDifferencesList: React.FC<KeyDifferencesListProps> = ({ changes }) => {
  if (changes.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Sparkles className="h-6 w-6 mx-auto mb-2 text-blue-500 opacity-60" />
        <p className="font-semibold text-slate-700 dark:text-slate-300">No differences match the current filter</p>
        <p className="mt-1">Try resetting the type or significance filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changes.map((change, index) => {
        const isHigh = change.significance === 'high';
        return (
          <div
            key={change.id || index}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs space-y-4 ${
              isHigh
                ? 'border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/20 to-transparent dark:from-amber-950/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Header: Section, Category & Significance */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {change.section}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                  {change.category}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    change.type === 'added'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : change.type === 'removed'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  [{change.type.toUpperCase()}]
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isHigh && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                )}
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isHigh
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : change.significance === 'medium'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {change.significance} Significance
                </span>
              </div>
            </div>

            {/* Plain-English Practical Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <span className="font-semibold text-blue-600 dark:text-blue-400">Explanation: </span>
              {change.explanation}
            </div>

            {/* Snippet Comparison Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Old Version */}
              <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  <span>Document A (Old Version)</span>
                  {change.sourceA?.pageNumber && (
                    <span className="font-mono">Page {change.sourceA.pageNumber}</span>
                  )}
                </div>
                {change.documentAText ? (
                  <p className="text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed select-text line-through opacity-85">
                    {change.documentAText}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">Not present in Document A</p>
                )}
              </div>

              {/* New Version */}
              <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  <span>Document B (New Version)</span>
                  {change.sourceB?.pageNumber && (
                    <span className="font-mono">Page {change.sourceB.pageNumber}</span>
                  )}
                </div>
                {change.documentBText ? (
                  <p className="text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed select-text font-medium">
                    {change.documentBText}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">Removed from Document B</p>
                )}
              </div>
            </div>

            {/* Source Reference Tag */}
            {(change.sourceA?.sectionHeading || change.sourceB?.sectionHeading) && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <BookOpen className="h-3 w-3 text-blue-500" />
                <span>
                  Source:{' '}
                  {change.sourceB?.sectionHeading || change.sourceA?.sectionHeading}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
