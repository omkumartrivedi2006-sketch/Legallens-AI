import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  MessageSquare,
  GitCompare,
  FileText,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Calendar,
  CheckSquare,
  ListTodo,
  Layers,
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
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#101010] p-6 sm:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workspace Overview</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Welcome back, {userGreetingName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#858585]">
              Upload contracts, review affirmative obligations, and compare document revisions.
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
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          <Card
            className="hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group p-4"
            onClick={() => navigate('/documents')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Upload className="h-4 w-4" />
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 dark:text-[#666666] group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Upload Document</h3>
            <p className="text-xs text-neutral-500 dark:text-[#858585] leading-relaxed">
              Import contracts, agreements, or terms to parse and explore.
            </p>
          </Card>

          <Card
            className="hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group p-4"
            onClick={() => navigate('/chat')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <MessageSquare className="h-4 w-4" />
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 dark:text-[#666666] group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Ask AI</h3>
            <p className="text-xs text-neutral-500 dark:text-[#858585] leading-relaxed">
              Inquire about clauses, renewal notices, or duties.
            </p>
          </Card>

          <Card
            className="hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group p-4"
            onClick={() => navigate('/compare')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <GitCompare className="h-4 w-4" />
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 dark:text-[#666666] group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Compare Documents</h3>
            <p className="text-xs text-neutral-500 dark:text-[#858585] leading-relaxed">
              Diff two contract versions to highlight added or modified terms.
            </p>
          </Card>

          <Card
            className="hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group p-4"
            onClick={() => navigate('/insights')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Sparkles className="h-4 w-4" />
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 dark:text-[#666666] group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Action Center</h3>
            <p className="text-xs text-neutral-500 dark:text-[#858585] leading-relaxed">
              Track obligations, upcoming milestones, and task checklists.
            </p>
          </Card>

          <Card
            className="hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group p-4"
            onClick={() => navigate('/unified')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Layers className="h-4 w-4" />
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 dark:text-[#666666] group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Unified Search</h3>
            <p className="text-xs text-neutral-500 dark:text-[#858585] leading-relaxed">
              Cross-document queries, clause filters, and conflict detection.
            </p>
          </Card>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Recent Documents Shell */}
        <Card>
          <CardHeader className="border-b border-neutral-100 dark:border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                <span>Recent Documents</span>
              </CardTitle>
              <span className="text-xs text-neutral-400 dark:text-[#666666]">
                {allDocumentsCount} {allDocumentsCount === 1 ? 'file' : 'files'}
              </span>
            </div>
            <CardDescription className="text-xs">
              Legal documents stored securely in your private workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3">
            {loading ? (
              <div className="py-10 text-center text-xs text-neutral-400">
                Loading documents...
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="divide-y divide-neutral-100 dark:divide-white/5">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="py-2.5 flex items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-white/[0.04] px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 shrink-0">
                        <FileText className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                          {doc.originalFileName || doc.fileName}
                        </p>
                        <p className="text-[11px] text-neutral-400 dark:text-[#858585]">
                          {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <DocumentStatusBadge status={doc.processingStatus} />
                      <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
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
          <CardHeader className="border-b border-neutral-100 dark:border-white/10 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                <span>Recent Analyses</span>
              </CardTitle>
              <span className="text-xs text-neutral-400 dark:text-[#666666]">Gemini Grounded</span>
            </div>
            <CardDescription className="text-xs">
              AI-generated plain-language summaries and clause extractions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <EmptyState
              icon={Sparkles}
              title="No analyses recorded yet"
              description="Select any uploaded document in your library and click 'Analyze Document' to run grounded legal analysis."
              actionLabel="Explore Documents"
              onAction={() => navigate('/documents')}
              actionIcon={<Upload className="h-4 w-4" />}
            />
          </CardContent>
        </Card>
      </div>

      {/* Legal Insights & Action Center Dashboard Widget */}
      <Card>
        <CardHeader className="border-b border-neutral-100 dark:border-white/10 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <span>Legal Insights & Action Center</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/insights')}
              className="text-xs text-blue-600 dark:text-blue-400"
            >
              <span>Open Action Center</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Review actionable obligations, grounded milestones, and active legal tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {documents.filter((d) => d.processingStatus === 'ready').length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => navigate('/insights')}
                className="p-3.5 rounded-lg bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                  <span>Documents Ready</span>
                </div>
                <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                  {documents.filter((d) => d.processingStatus === 'ready').length}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-[#858585] mt-0.5">
                  Available for deep legal insight extraction
                </p>
              </div>

              <div
                onClick={() => navigate('/insights')}
                className="p-3.5 rounded-lg bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                  <span>Document Deadlines</span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 font-medium">
                  Review timeframes in Insights
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-[#858585] mt-0.5">
                  Grounded notice and milestone tracking
                </p>
              </div>

              <div
                onClick={() => navigate('/insights')}
                className="p-3.5 rounded-lg bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                  <span>Action Checklist</span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 font-medium">
                  Manage tasks across agreements
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-[#858585] mt-0.5">
                  Interactive checklist tracking
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={ListTodo}
              title="No pending legal actions found"
              description="Upload your legal documents to extract actionable obligations, milestone dates, and customized checklists."
              actionLabel="Upload Document"
              onAction={() => navigate('/documents')}
              actionIcon={<Upload className="h-4 w-4" />}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
