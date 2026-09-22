import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface MissingInfoCardProps {
  missingInfo: string[];
}

export const MissingInfoCard: React.FC<MissingInfoCardProps> = ({ missingInfo }) => {
  if (missingInfo.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardContent className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            No Missing Terms or Obvious Ambiguities Flagged
          </p>
          <p className="text-[11px] text-slate-400">
            Key operational details referenced in the agreement appear to be addressed within the text.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="bg-slate-50/80 dark:bg-slate-850 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Missing or Unclear Information</span>
        </div>
        <span className="text-slate-400 font-medium">({missingInfo.length} items)</span>
      </div>

      <CardContent className="p-5">
        <ul className="space-y-2.5">
          {missingInfo.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
