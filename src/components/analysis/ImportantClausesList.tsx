import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Quote, HelpCircle, FileText } from 'lucide-react';
import { ImportantClause } from '../../types/analysis';

interface ImportantClausesListProps {
  clauses: ImportantClause[];
}

export const ImportantClausesList: React.FC<ImportantClausesListProps> = ({ clauses }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Core Contract Clauses ({clauses.length})</span>
        </div>
        <span className="text-[11px] text-slate-400">Plain-English breakdowns</span>
      </div>

      {clauses.length > 0 ? (
        <div className="space-y-2.5">
          {clauses.map((clause, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full p-3.5 flex items-center justify-between gap-3 text-left bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {clause.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {clause.sourceReference && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {clause.sourceReference}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {/* Verbatim Snippet */}
                    {clause.verbatimSnippet && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 italic">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase not-italic mb-1">
                          <Quote className="h-3 w-3" />
                          <span>Excerpt From Document</span>
                        </div>
                        &quot;{clause.verbatimSnippet}&quot;
                      </div>
                    )}

                    {/* Plain English Explanation */}
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                        What It Means (Plain English):
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {clause.simpleExplanation}
                      </p>
                    </div>

                    {/* Practical Significance */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-start gap-2">
                      <HelpCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Why this matters:{' '}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {clause.whyItMatters}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No standard clauses classified in document.</p>
      )}
    </div>
  );
};
