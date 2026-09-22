import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface UnchangedSectionsAccordionProps {
  unchangedSections: string[];
}

export const UnchangedSectionsAccordion: React.FC<UnchangedSectionsAccordionProps> = ({
  unchangedSections,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  if (!unchangedSections || unchangedSections.length === 0) {
    return null;
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Unchanged Provisions ({unchangedSections.length} sections identical)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{isOpen ? 'Hide' : 'View'}</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {isOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
            <p className="text-[11px] text-slate-400">
              The following clauses and sections contain identical contractual language across both Document A and Document B:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {unchangedSections.map((section, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate font-medium">{section}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
