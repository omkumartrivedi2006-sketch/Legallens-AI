import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const LegalChatDisclaimer: React.FC = () => {
  return (
    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>
        LegalLens AI provides informational assistance based on your document and is not a substitute for professional legal advice.
      </span>
    </div>
  );
};
