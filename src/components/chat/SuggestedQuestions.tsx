import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  'What are my main obligations under this agreement?',
  'What is the required notice period for termination?',
  'What are the payment terms and schedule?',
  'What happens if either party breaches this contract?',
  'What is the governing law and jurisdiction?',
  'Are there non-disclosure or confidentiality restrictions?',
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <div className="max-w-xl mx-auto py-8 px-4 text-center space-y-4 animate-in fade-in duration-300">
      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 w-fit mx-auto border border-blue-100 dark:border-blue-900/40">
        <Sparkles className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Ask anything about this document
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          LegalLens AI answers questions using this document as the primary factual source. Select a prompt or type your question below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
        {DEFAULT_SUGGESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(q)}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-left flex items-start gap-2 shadow-xs group"
          >
            <HelpCircle className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <span className="leading-snug">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
