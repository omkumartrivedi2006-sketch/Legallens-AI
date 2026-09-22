import React from 'react';
import {
  Sparkles,
  Calendar,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import { InsightRecord } from '../../types/insight';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface InsightsSummaryCardProps {
  insight: InsightRecord;
  isStale?: boolean;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export const InsightsSummaryCard: React.FC<InsightsSummaryCardProps> = ({
  insight,
  isStale = false,
  onRegenerate,
  isRegenerating = false,
}) => {
  const { summary, obligations, deadlines, checklist, areasToReview } = insight.result;

  const formattedDate = new Date(insight.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-4">
      {/* Stale Warning Banner (Requirement 40) */}
      {isStale && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Notice:</span> These insights were generated from an
              earlier version of this document. Regenerate to analyze the current document.
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-xs h-8 shrink-0 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            {isRegenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            )}
            <span>Regenerate Insights</span>
          </Button>
        </div>
      )}

      {/* Main Summary Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Top Header Strip */}
        <div className="bg-slate-50/80 dark:bg-slate-850 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold">Executive Action Summary</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
              Generated {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Model: {insight.model || 'gemini-2.5-flash'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="text-xs h-7 px-2.5"
            >
              {isRegenerating ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RotateCcw className="h-3 w-3 mr-1" />
              )}
              <span>Regenerate</span>
            </Button>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Executive Summary paragraph */}
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            {summary}
          </div>

          {/* 4 Metric counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
              <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 font-medium">
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Obligations</span>
              </div>
              <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                {obligations.length}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                <span>Deadlines</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
                {deadlines.length}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Checklist Tasks</span>
              </div>
              <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
                {checklist.length}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Areas to Review</span>
              </div>
              <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
                {areasToReview.length}
              </p>
            </div>
          </div>

          {/* Legal informational notice (Requirement 32) */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldAlert className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Informational Notice:
              </span>{' '}
              LegalLens AI provides general informational assistance based on your uploaded document. It is not a lawyer and does not provide professional legal advice. For decisions involving your legal rights or obligations, consult a qualified attorney.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
