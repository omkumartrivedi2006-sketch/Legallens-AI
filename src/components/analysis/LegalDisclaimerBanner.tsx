import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface LegalDisclaimerBannerProps {
  className?: string;
}

export const LegalDisclaimerBanner: React.FC<LegalDisclaimerBannerProps> = ({ className = '' }) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 ${className}`}
    >
      <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-semibold text-amber-950 dark:text-amber-100">
          Informational Document Understanding — Not Legal Advice
        </p>
        <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed text-[11px]">
          LegalLens AI provides automated plain-language analysis to help you understand your documents.
          This tool does not constitute legal representation, does not establish an attorney-client relationship,
          and should not be relied upon as a substitute for counsel from a licensed attorney.
        </p>
      </div>
    </div>
  );
};
