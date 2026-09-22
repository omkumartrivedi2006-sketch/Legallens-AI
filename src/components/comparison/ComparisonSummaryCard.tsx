import React from 'react';
import {
  FileDiff,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ComparisonRecord } from '../../types/comparison';
import { Card, CardContent } from '../ui/Card';

interface ComparisonSummaryCardProps {
  comparison: ComparisonRecord;
}

export const ComparisonSummaryCard: React.FC<ComparisonSummaryCardProps> = ({
  comparison,
}) => {
  const { summary, documentA, documentB } = comparison.result;

  const formattedDate = new Date(comparison.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Header Strip */}
      <div className="bg-slate-50/80 dark:bg-slate-850 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
          <FileDiff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Comparison Summary</span>
          <span className="text-slate-400">•</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
            {documentA.name} <span className="text-slate-400">vs</span> {documentB.name}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Sparkles className="h-3 w-3 text-blue-500" />
            {comparison.model || 'gemini-2.5-flash'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Identical Documents Banner */}
        {summary.isIdentical && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950 dark:text-emerald-100">
                Documents are Identical
              </p>
              <p className="mt-0.5 leading-relaxed">
                No meaningful contractual or textual differences were identified between Document A and Document B. All compared sections and provisions match.
              </p>
            </div>
          </div>
        )}

        {/* Executive Overview Narrative */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Executive Difference Overview
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {summary.overview}
          </p>
        </div>

        {/* 5-Metric Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {/* Total Changes */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {summary.totalChanges}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Total Changes
            </p>
          </div>

          {/* Modifications */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-0.5">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
                {summary.modificationsCount}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Modified
            </p>
          </div>

          {/* Additions */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-0.5">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {summary.additionsCount}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              Added in B
            </p>
          </div>

          {/* Removals */}
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 mb-0.5">
              <MinusCircle className="h-3.5 w-3.5" />
              <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">
                {summary.removalsCount}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Removed from A
            </p>
          </div>

          {/* Potentially Significant Changes */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 mb-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
                {summary.significantChangesCount}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              High Impact
            </p>
          </div>
        </div>

        {/* Informational Disclaimer Footer */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>
            Significance levels and category classifications are AI-generated informational assessments to assist document comprehension and do not constitute legal advice or risk guarantees.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
