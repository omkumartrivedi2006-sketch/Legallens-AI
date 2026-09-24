import React from 'react';
import { AlertCircle, HelpCircle, FileQuestion, ArrowRight } from 'lucide-react';
import { PotentialConcern } from '../../types/analysis';

interface ConcernsAndQuestionsProps {
  concerns: PotentialConcern[];
  missingInfo: string[];
  lawyerQuestions: string[];
}

export const ConcernsAndQuestions: React.FC<ConcernsAndQuestionsProps> = ({
  concerns,
  missingInfo,
  lawyerQuestions,
}) => {
  return (
    <div className="space-y-4">
      {/* Potential Concerns Section */}
      <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/[0.045] backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600/90 dark:text-amber-400 uppercase tracking-wider">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span>Provisions Deserving Closer Review ({concerns.length})</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Provisions identified below are noted neutrally for discussion with legal counsel and do not constitute legal conclusions.
        </p>

        {concerns.length > 0 ? (
          <div className="space-y-3 pt-1">
            {concerns.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-amber-500/20 dark:border-amber-400/20 bg-amber-500/[0.04] dark:bg-amber-400/[0.04] space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {item.issueTitle}
                  </span>
                  {item.sourceReference && (
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-white/10 px-2 py-0.5 rounded border border-slate-200/80 dark:border-white/10">
                      {item.sourceReference}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>

                <div className="pt-1.5 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1 font-medium">
                  <ArrowRight className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>Discussion Angle: {item.suggestedActionOrQuestion}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">No unusual or heightened concerns detected.</p>
        )}
      </div>

      {/* Grid: Missing Information + Lawyer Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Missing / Unclear Information */}
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/[0.045] backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileQuestion className="h-4 w-4" />
            </div>
            <span>Missing or Unclear Information ({missingInfo.length})</span>
          </div>

          {missingInfo.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
              {missingInfo.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No critical omitted sections identified.</p>
          )}
        </div>

        {/* Questions for a Lawyer */}
        <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/[0.045] backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HelpCircle className="h-4 w-4" />
            </div>
            <span>Recommended Questions for Your Attorney ({lawyerQuestions.length})</span>
          </div>

          {lawyerQuestions.length > 0 ? (
            <div className="space-y-2">
              {lawyerQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                >
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    Q{idx + 1}:
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No tailored legal questions generated.</p>
          )}
        </div>
      </div>
    </div>
  );
};
