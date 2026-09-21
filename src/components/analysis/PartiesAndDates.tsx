import React from 'react';
import { Users, Calendar, MapPin } from 'lucide-react';
import { Party, ImportantDate } from '../../types/analysis';


interface PartiesAndDatesProps {
  parties: Party[];
  importantDates: ImportantDate[];
}

export const PartiesAndDates: React.FC<PartiesAndDatesProps> = ({
  parties,
  importantDates,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Parties Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Identified Parties ({parties.length})</span>
        </div>

        {parties.length > 0 ? (
          <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/80">
            {parties.map((party, index) => (
              <div key={index} className="pt-2 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {party.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900">
                    {party.role}
                  </span>
                </div>
                {party.details && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {party.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No specific named parties identified.</p>
        )}
      </div>

      {/* Dates Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Key Dates & Milestones ({importantDates.length})</span>
        </div>

        {importantDates.length > 0 ? (
          <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/80">
            {importantDates.map((item, index) => (
              <div key={index} className="pt-2 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </span>
                  <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900 whitespace-nowrap">
                    {item.dateString}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.significance}
                </p>
                {item.sourceReference && (
                  <span className="inline-block mt-1 text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    Ref: {item.sourceReference}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No specific dates or deadlines mentioned.</p>
        )}
      </div>
    </div>
  );
};
