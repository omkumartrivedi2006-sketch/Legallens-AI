import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  MessageSquare,
  GitCompare,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { formatFileSize } from '../types/document';
import { DocumentStatusBadge } from '../components/documents/DocumentStatus';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, allDocumentsCount, loading } = useDocuments();

  const userGreetingName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const recentDocuments = documents.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workspace Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {userGreetingName}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Ready to understand your legal documents?
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => navigate('/documents')}
            >
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer group"
            onClick={() => navigate('/documents')}
          >
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-base font-semibold mt-3">Upload Document</CardTitle>
              <CardDescription className="text-xs">
                Import contracts, agreements, or terms to parse and explore in the documents module.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer group"
            onClick={() => navigate('/chat')}
          >
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-base font-semibold mt-3">Ask AI</CardTitle>
              <CardDescription className="text-xs">
                Inquire about legal clauses, terminology, or obligations through natural language queries.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover:border-blue-300 dark:hover:border-blue-800 transition-all cursor-pointer group"
            onClick={() => navigate('/compare')}
          >
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GitCompare className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-base font-semibold mt-3">Compare Documents</CardTitle>
              <CardDescription className="text-xs">
                Diff two versions of an agreement side-by-side to highlight added or modified conditions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents Shell */}
        <Card>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Recent Documents</span>
              </CardTitle>
              <span className="text-xs text-slate-400">
                {allDocumentsCount} {allDocumentsCount === 1 ? 'file' : 'files'}
              </span>
            </div>
            <CardDescription className="text-xs">
              Real legal documents stored securely in your private workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading documents...
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {doc.originalFileName || doc.fileName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <DocumentStatusBadge status={doc.processingStatus} />
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}

                <div className="pt-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-blue-600 dark:text-blue-400"
                    onClick={() => navigate('/documents')}
                  >
                    View All Documents in Library ({allDocumentsCount})
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Upload your first legal document to start parsing and inspecting it with LegalLens AI."
                actionLabel="Go to Documents"
                onAction={() => navigate('/documents')}
                actionIcon={<Upload className="h-4 w-4" />}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses Shell */}
        <Card>
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Recent Analyses</span>
              </CardTitle>
              <span className="text-xs text-slate-400">0 runs</span>
            </div>
            <CardDescription className="text-xs">
              Past document summaries and risk scans will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EmptyState
              icon={Clock}
              title="No analyses recorded"
              description="Analysis reports, clause extractions, and summaries will appear here once Gemini processing is connected in Module 4."
              actionLabel="Explore Capabilities"
              onAction={() => navigate('/#features')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

