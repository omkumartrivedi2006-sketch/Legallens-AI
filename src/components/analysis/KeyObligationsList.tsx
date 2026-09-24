import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { KeyObligation } from '../../types/analysis';

interface KeyObligationsListProps {
  obligations: KeyObligation[];
}

export const KeyObligationsList: React.FC<KeyObligationsListProps> = ({ obligations }) => {
  return (
    <div className="p-5 rounded-2xl bg-white/70 dark:bg-white/[0.045] backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
        <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <CheckSquare className="h-4 w-4" />
        </div>
        <span>Key Duties & Obligations ({obligations.length})</span>
      </div>

      {obligations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {obligations.map((item, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col justify-between space-y-2 hover:border-blue-500/30 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {item.party}
                  </span>
                  {item.frequencyOrCondition && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                      {item.frequencyOrCondition}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.obligation}
                </p>
              </div>

              {item.sourceReference && (
                <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 text-[10px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                  <ArrowRight className="h-2.5 w-2.5 text-blue-500/70" />
                  <span>{item.sourceReference}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No specific obligations isolated in document.</p>
      )}
    </div>
  );
};
