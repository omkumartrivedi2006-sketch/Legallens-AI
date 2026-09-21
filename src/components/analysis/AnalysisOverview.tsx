import React from 'react';
import { Sparkles, FileCheck, CheckCircle2, AlertCircle, Clock, Cpu } from 'lucide-react';
import { AnalysisRecord } from '../../types/analysis';

interface AnalysisOverviewProps {
  analysis: AnalysisRecord;
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({ analysis }) => {
  const result = analysis.result;
  if (!result) return null;

  const formattedDate = new Date(analysis.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> High Confidence
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-3 w-3" /> Moderate Confidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="h-3 w-3" /> Preliminary
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Badges & Model Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <FileCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Detected Document Type</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {result.documentType}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {getConfidenceBadge(result.confidence)}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Cpu className="h-3 w-3 text-blue-500" /> {analysis.model}
          </span>

          <span className="text-slate-400 text-[11px]">
            Analyzed {formattedDate}
          </span>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Executive Plain-Language Summary</span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {result.summary}
        </p>
      </div>
    </div>
  );
};
