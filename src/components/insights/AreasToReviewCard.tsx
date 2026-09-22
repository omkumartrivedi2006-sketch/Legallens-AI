import React from 'react';
import { AlertTriangle, Info, Bookmark, ArrowRight, ShieldCheck } from 'lucide-react';
import { AreaToReviewItem, InsightSource } from '../../types/insight';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface AreasToReviewCardProps {
  areas: AreaToReviewItem[];
  onOpenSource: (source: InsightSource) => void;
}

export const AreasToReviewCard: React.FC<AreasToReviewCardProps> = ({
  areas,
  onOpenSource,
}) => {
  if (areas.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-xs text-slate-400 space-y-1">
          <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-emerald-500 opacity-60" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            No high-significance areas flagged for review
          </p>
          <p>The analyzed provisions appear standard without unusually broad commitments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Areas to Review
          </span>
          <span className="text-xs text-slate-400">({areas.length} items flagged)</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Provisions that may warrant closer attention
        </span>
      </div>

      <div className="space-y-3">
        {areas.map((area, idx) => {
          const isSignificant = area.severity === 'potentially_significant';

          return (
            <Card
              key={area.id || idx}
              className={`border transition-all shadow-xs ${
                isSignificant
                  ? 'border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <CardContent className="p-5 space-y-3">
                {/* Title & Severity */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isSignificant ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    )}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {area.title}
                    </h4>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      isSignificant
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {isSignificant ? 'Potentially Significant' : 'Informational'}
                  </span>
                </div>

                {/* Reason */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {area.reason}
                </p>

                {/* Suggested Action */}
                {area.suggestedAction && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Suggested Action: </span>
                      <span className="text-slate-700 dark:text-slate-300">{area.suggestedAction}</span>
                    </div>
                  </div>
                )}

                {/* Source citation */}
                {area.source && (
                  <div className="pt-1 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenSource(area.source!)}
                      className="text-xs h-6 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      <span>View Source</span>
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
