import React from 'react';
import { FileUp, FileText, Shield, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Card, CardContent } from '../components/ui/Card';

export const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage, organize, and inspect uploaded legal documents and contracts."
        badge="Module 3 Ready"
      />

      {/* Architecture Readiness Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-slate-600 dark:text-slate-300">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Pipeline Architecture Notice:
          </span>{' '}
          Document ingestion, secure Cloud Storage persistence, and PDF/DOCX text parsing
          pipelines are scheduled for implementation in <strong>Module 3</strong>. No mock
          or fake documents are injected into this workspace.
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={FileUp}
            title="Document repository is empty"
            description="Your contracts, terms, and agreements will be displayed and manageable here once the document-upload module is integrated."
            badgeText="Awaiting Ingestion Pipeline"
            secondaryActionLabel="View Privacy Standards"
            onSecondaryAction={() => window.open('/privacy', '_self')}
          >
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  <span>Target Formats</span>
                </div>
                <p className="text-[11px] text-slate-500">PDF, DOCX, TXT</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                  <span>Access Control</span>
                </div>
                <p className="text-[11px] text-slate-500">User-isolated storage</p>
              </div>
            </div>
          </EmptyState>
        </CardContent>
      </Card>
    </div>
  );
};
