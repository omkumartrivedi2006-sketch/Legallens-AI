import { FileCode, ArrowLeftRight, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const ComparePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Comparison"
        description="Compare two agreements, version revisions, or standard templates to highlight discrepancies."
        badge="Module 6 Ready"
      />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-slate-600 dark:text-slate-300">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Comparison Engine Notice:
          </span>{' '}
          Side-by-side text diffing, clause alignment, and semantic difference scoring will
          be added in <strong>Module 6</strong>.
        </div>
      </div>

      {/* Dual Shell Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-dashed">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileCode className="h-4 w-4 text-slate-500" />
              <span>Base Document (Version A)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <EmptyState
              icon={FileCode}
              title="No base document selected"
              description="Slot for original contract or baseline terms."
              className="border-0 bg-transparent p-4"
            />
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileCode className="h-4 w-4 text-slate-500" />
              <span>Target Document (Version B)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <EmptyState
              icon={FileCode}
              title="No comparison document selected"
              description="Slot for counterparty counter-proposal or amended version."
              className="border-0 bg-transparent p-4"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={ArrowLeftRight}
            title="Comparison Engine Inactive"
            description="Upload or choose two documents once document ingestion is wired up to run semantic clause diffing."
            badgeText="Dual Document Processing"
          />
        </CardContent>
      </Card>
    </div>
  );
};
