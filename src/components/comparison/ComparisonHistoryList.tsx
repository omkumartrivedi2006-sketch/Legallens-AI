import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileDiff,
  Calendar,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { ComparisonRecord } from '../../types/comparison';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface ComparisonHistoryListProps {
  comparisons: ComparisonRecord[];
  isLoading: boolean;
  onDeleteComparison: (id: string) => Promise<void>;
}

export const ComparisonHistoryList: React.FC<ComparisonHistoryListProps> = ({
  comparisons,
  isLoading,
  onDeleteComparison,
}) => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await onDeleteComparison(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="h-7 w-7 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-2" />
        <p className="text-xs text-slate-400">Loading comparison history...</p>
      </div>
    );
  }

  if (comparisons.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center space-y-3">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 w-fit mx-auto border border-blue-100 dark:border-blue-900/40">
            <FileDiff className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No comparison history yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              When you compare two documents, the results are saved here so you can review side-by-side differences anytime without re-running the AI.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {comparisons.map((comp) => {
        const docA = comp.result?.documentA?.name || 'Document A';
        const docB = comp.result?.documentB?.name || 'Document B';
        const total = comp.result?.summary?.totalChanges ?? 0;
        const isIdentical = comp.result?.summary?.isIdentical;

        return (
          <div
            key={comp.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Left: Document names & date */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs">
                  {docA}
                </span>
                <span className="text-xs text-slate-400 font-medium">vs</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs">
                  {docB}
                </span>
                {isIdentical && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Identical
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="h-3 w-3" />
                  {formatDate(comp.createdAt)}
                </span>
                <span>•</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {total} {total === 1 ? 'difference' : 'differences'}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/comparisons/${comp.id}`)}
                className="text-xs h-8 px-3"
              >
                <span>View</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>

              <button
                type="button"
                onClick={() => setDeleteId(comp.id)}
                aria-label="Delete comparison record"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xs w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Comparison?
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This will remove this comparison report. Your original uploaded documents will remain safe and unaffected.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={confirmDelete}
                isLoading={isDeleting}
                className="text-xs bg-rose-600 text-white hover:bg-rose-700 hover:text-white border-transparent"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
