import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { KeyObligation } from '../../types/analysis';

interface KeyObligationsListProps {
  obligations: KeyObligation[];
}

export const KeyObligationsList: React.FC<KeyObligationsListProps> = ({ obligations }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
        <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span>Key Duties & Obligations ({obligations.length})</span>
      </div>

      {obligations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {obligations.map((item, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {item.party}
                  </span>
                  {item.frequencyOrCondition && (
                    <span className="text-[10px] text-slate-500 italic">
                      {item.frequencyOrCondition}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.obligation}
                </p>
              </div>

              {item.sourceReference && (
                <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <ArrowRight className="h-2.5 w-2.5" />
                  <span>{item.sourceReference}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No specific obligations isolated in document.</p>
      )}
    </div>
  );
};
