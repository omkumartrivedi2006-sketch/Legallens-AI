import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  FileText,
  ArrowRight,
  Sparkles,
  Upload,
  Calendar,
  CheckSquare,
  FileCheck2,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useDocuments } from '../hooks/useDocuments';
import { formatFileSize } from '../types/document';
import { DocumentStatusBadge } from '../components/documents/DocumentStatus';

export const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, loading } = useDocuments();

  const readyDocuments = documents.filter((d) => d.processingStatus === 'ready');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Legal Insights & Action Center"
          description="Transform extracted legal text into grounded obligations, deadline tracking, and an interactive action checklist."
          badge="Action Center"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/documents')}
          className="text-xs h-9 self-start sm:self-auto"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          <span>Upload New Document</span>
        </Button>
      </div>

      {/* Feature Value Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Affirmative Obligations
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Identify exact contractual commitments for both parties, conditions, and deadlines.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Grounded Deadlines
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track explicit milestones and relative notice periods without fabricated calendar dates.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckSquare className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Interactive Checklist
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maintain your own action list with task progress tracking directly in your workspace.
          </p>
        </div>
      </div>

      {/* Select a Document to Explore Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Select a Document to View Insights
          </h3>
          <span className="text-xs text-slate-400">
            {readyDocuments.length} ready {readyDocuments.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading your document library...
          </div>
        ) : readyDocuments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <EmptyState
                icon={FileText}
                title="No ready documents available"
                description="Upload a contract, lease, or agreement to generate legal insights and track affirmative obligations."
                actionLabel="Upload Document"
                onAction={() => navigate('/documents')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {readyDocuments.map((doc) => (
              <Card
                key={doc.id}
                onClick={() => navigate(`/insights/${doc.id}`)}
                className="border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group shadow-xs"
              >
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {doc.originalFileName || doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="uppercase font-mono">{doc.fileType}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <DocumentStatusBadge status={doc.processingStatus} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    <span>Open Insights</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
