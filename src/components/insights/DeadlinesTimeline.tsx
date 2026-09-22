import React from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Zap,
} from 'lucide-react';
import { DeadlineItem, DeadlineStatus, InsightSource } from '../../types/insight';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface DeadlinesTimelineProps {
  deadlines: DeadlineItem[];
  onOpenSource: (source: InsightSource) => void;
}

export const DeadlinesTimeline: React.FC<DeadlinesTimelineProps> = ({
  deadlines,
  onOpenSource,
}) => {
  const getStatusBadge = (status: DeadlineStatus, daysRemaining: number | null) => {
    switch (status) {
      case 'Upcoming':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <Clock className="h-3 w-3" />
            Upcoming {daysRemaining !== null ? `(${daysRemaining}d)` : ''}
          </span>
        );
      case 'Today':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 animate-pulse">
            <AlertCircle className="h-3 w-3" />
            Due Today
          </span>
        );
      case 'Passed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
            <CheckCircle2 className="h-3 w-3" />
            Passed {daysRemaining !== null ? `(${Math.abs(daysRemaining)}d ago)` : ''}
          </span>
        );
      case 'Trigger-dependent':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            <Zap className="h-3 w-3" />
            Trigger-dependent
          </span>
        );
    }
  };

  const formatDeadlineType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (deadlines.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-xs text-slate-400 space-y-1">
          <Calendar className="h-6 w-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            No explicit or relative deadlines found in this document
          </p>
          <p>The contract does not appear to state time-bound requirements or milestone dates.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Important Dates & Timeframes
          </span>
          <span className="text-xs text-slate-400">({deadlines.length} detected)</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Dates are strictly extracted from contract text
        </span>
      </div>

      <div className="space-y-3">
        {deadlines.map((dl, idx) => {
          const hasExplicitDate = Boolean(dl.dateValue);

          return (
            <Card
              key={dl.id || idx}
              className="border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <CardContent className="p-5 space-y-3">
                {/* Title & Status row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {dl.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {formatDeadlineType(dl.dateType)}
                    </span>
                  </div>

                  {getStatusBadge(dl.calculatedStatus, dl.daysRemaining)}
                </div>

                {/* Date or Relative Period display (Requirement 11, 12) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  {hasExplicitDate ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Specified Calendar Date: {dl.dateValue}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Relative Timeframe: {dl.relativePeriod}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                        Trigger Condition: <span className="font-medium">{dl.trigger || 'Not specified'}</span>
                        {' • '}
                        <span>Trigger date: Not provided</span>
                      </div>
                    </div>
                  )}

                  {dl.responsibleParty && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      Responsible Party: <span className="font-medium text-slate-700 dark:text-slate-300">{dl.responsibleParty}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {dl.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {dl.description}
                  </p>
                )}

                {/* Source link */}
                {dl.source && (
                  <div className="pt-1 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenSource(dl.source!)}
                      className="text-xs h-7 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      <span>
                        View Source {dl.source.sectionHeading ? `(${dl.source.sectionHeading})` : ''}
                      </span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
