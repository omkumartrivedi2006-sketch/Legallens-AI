import React, { useState } from 'react';
import { Copy, Check, MessageSquareCode } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface LawyerPrepCardProps {
  questions: string[];
}

export const LawyerPrepCard: React.FC<LawyerPrepCardProps> = ({ questions }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyOne = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const formatted = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (questions.length === 0) return null;

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="bg-slate-50/80 dark:bg-slate-850 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <MessageSquareCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Questions to Ask a Lawyer</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAll}
          className="text-xs h-7 px-2.5"
        >
          {copiedAll ? <Check className="h-3 w-3 mr-1 text-emerald-600" /> : <Copy className="h-3 w-3 mr-1" />}
          <span>{copiedAll ? 'Copied All' : 'Copy All Questions'}</span>
        </Button>
      </div>

      <CardContent className="p-5 space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          These questions are practical inquiry prompts derived from your specific document to help you focus your discussions with a qualified legal attorney.
        </p>

        <div className="space-y-2">
          {questions.map((question, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 group hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-colors"
            >
              <div className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-w-0">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0 font-mono">
                  {idx + 1}.
                </span>
                <span>{question}</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyOne(question, idx)}
                aria-label={`Copy question ${idx + 1}`}
                className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
              >
                {copiedIndex === idx ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
