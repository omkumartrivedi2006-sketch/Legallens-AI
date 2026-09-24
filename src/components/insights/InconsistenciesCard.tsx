import React from 'react';
import { CheckCircle2, Split } from 'lucide-react';
import { PotentialInconsistencyItem } from '../../types/insight';
import { Card, CardContent } from '../ui/Card';

interface InconsistenciesCardProps {
  inconsistencies: PotentialInconsistencyItem[];
}

export const InconsistenciesCard: React.FC<InconsistenciesCardProps> = ({
  inconsistencies,
}) => {
  if (inconsistencies.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardContent className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            No Internal Inconsistencies Detected
          </p>
          <p className="text-[11px] text-slate-400">
            Provisions regarding notice, payments, and terms appear internally consistent across the agreement.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Split className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Potential Internal Inconsistencies
          </span>
          <span className="text-xs text-slate-400">({inconsistencies.length} flagged)</span>
        </div>
      </div>

      <div className="space-y-3">
        {inconsistencies.map((inc, idx) => (
          <Card
            key={inc.id || idx}
            className="border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs"
          >
            <CardContent className="p-5 space-y-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {inc.title}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  {inc.description}
                </p>
              </div>

              {/* Side-by-side conflicting clauses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    {inc.clauseA.sectionHeading || 'Provision A'}
                  </span>
                  <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed italic">
                    "{inc.clauseA.textSnippet}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    {inc.clauseB.sectionHeading || 'Provision B'}
                  </span>
                  <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed italic">
                    "{inc.clauseB.textSnippet}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
