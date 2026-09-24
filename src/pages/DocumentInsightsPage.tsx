import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileCheck2,
  Calendar,
  CheckSquare,
  MessageSquareCode,
  Printer,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useDocument } from '../hooks/useDocument';
import { useDocumentAnalysis } from '../hooks/useDocumentAnalysis';
import { useDocumentInsights } from '../hooks/useDocumentInsights';
import { InsightSource } from '../types/insight';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { InsightsSummaryCard } from '../components/insights/InsightsSummaryCard';
import { ObligationsSection } from '../components/insights/ObligationsSection';
import { DeadlinesTimeline } from '../components/insights/DeadlinesTimeline';
import { ActionChecklist } from '../components/insights/ActionChecklist';
import { ImportantClausesGrid } from '../components/insights/ImportantClausesGrid';
import { AreasToReviewCard } from '../components/insights/AreasToReviewCard';
import { InconsistenciesCard } from '../components/insights/InconsistenciesCard';
import { MissingInfoCard } from '../components/insights/MissingInfoCard';
import { LawyerPrepCard } from '../components/insights/LawyerPrepCard';
import { SourceSnippetModal } from '../components/insights/SourceSnippetModal';

type ActiveTab =
  | 'all'
  | 'obligations'
  | 'deadlines'
  | 'checklist'
  | 'clauses'
  | 'review'
  | 'lawyer';

export const DocumentInsightsPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  const { document, loading: isLoadingDoc, error: docError } = useDocument(documentId);
  const { latestAnalysis } = useDocumentAnalysis(document?.id || documentId);
  const {
    insightRecord,
    checklistItems,
    isLoading: isLoadingInsights,
    isGenerating,
    isStale,
    error: insightError,
    generateInsights,
    updateTaskStatus,
    addTask,
    deleteTask,
    clearError,
  } = useDocumentInsights(document);

  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [activeSource, setActiveSource] = useState<InsightSource | null>(null);

  const handleGenerate = () => {
    generateInsights(latestAnalysis?.result || null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingDoc) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Loading document information...
        </p>
      </div>
    );
  }

  if (docError || !document) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto mt-12">
        <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Document Not Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {docError || 'You do not have permission to view insights for this document.'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/insights')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Return to Insights</span>
        </Button>
      </div>
    );
  }

  const documentTitle = document.originalFileName || document.fileName;
  const result = insightRecord?.result;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/documents/${document.id}`)}
            className="text-xs h-8 px-2 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Document Details</span>
          </Button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {documentTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span>Print / Export</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || document.processingStatus !== 'ready'}
            className="text-xs h-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                <span>Analyzing with Gemini...</span>
              </>
            ) : result ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                <span>Regenerate Insights</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                <span>Generate Legal Insights</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {insightError && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start justify-between gap-3 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error:</span> {insightError}
            </div>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-rose-600 dark:text-rose-400 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Empty / Not Generated State */}
      {!isLoadingInsights && !result && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Legal Insights & Action Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Extract affirmative party obligations, time-sensitive notice requirements, important clauses, potential inconsistencies, and an interactive checklist strictly based on "{documentTitle}".
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs text-slate-600 dark:text-slate-300 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Affirmative Duties</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Milestone Deadlines</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Action Checklist</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <MessageSquareCode className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Lawyer Prep Questions</span>
              </div>
            </div>

            <Button
              size="md"
              onClick={handleGenerate}
              disabled={isGenerating || document.processingStatus !== 'ready'}
              className="w-full sm:w-auto px-6"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Analyzing Contract with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Generate Insights Now</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Insights Workspace */}
      {result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary & Metrics Card */}
          <InsightsSummaryCard
            insight={insightRecord}
            isStale={isStale}
            onRegenerate={handleGenerate}
            isRegenerating={isGenerating}
          />

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-850 rounded-xl overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('obligations')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'obligations'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Obligations</span>
              <span className="font-mono text-[10px] px-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                {result.obligations.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('deadlines')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'deadlines'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Deadlines</span>
              <span className="font-mono text-[10px] px-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                {result.deadlines.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'checklist'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Action Checklist</span>
              <span className="font-mono text-[10px] px-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {checklistItems.length || result.checklist.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clauses')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'clauses'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Important Clauses ({result.importantClauses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'review'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Areas to Review</span>
              {result.areasToReview.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {result.areasToReview.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lawyer')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'lawyer'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lawyer Prep ({result.lawyerQuestions.length})
            </button>
          </div>

          {/* Active Tab View Rendering */}
          <div className="space-y-6">
            {(activeTab === 'all' || activeTab === 'obligations') && (
              <section className="space-y-3">
                <ObligationsSection
                  obligations={result.obligations}
                  onOpenSource={setActiveSource}
                />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'deadlines') && (
              <section className="space-y-3">
                <DeadlinesTimeline
                  deadlines={result.deadlines}
                  onOpenSource={setActiveSource}
                />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'checklist') && (
              <section className="space-y-3">
                <ActionChecklist
                  checklist={checklistItems.length > 0 ? checklistItems : result.checklist}
                  onUpdateStatus={updateTaskStatus}
                  onAddTask={addTask}
                  onDeleteTask={deleteTask}
                  onOpenSource={setActiveSource}
                />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'clauses') && (
              <section className="space-y-3">
                <ImportantClausesGrid
                  clauses={result.importantClauses}
                  onOpenSource={setActiveSource}
                />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'review') && (
              <section className="space-y-6">
                <AreasToReviewCard
                  areas={result.areasToReview}
                  onOpenSource={setActiveSource}
                />
                <InconsistenciesCard
                  inconsistencies={result.potentialInconsistencies}
                />
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'lawyer') && (
              <section className="space-y-6">
                <LawyerPrepCard questions={result.lawyerQuestions} />
                <MissingInfoCard missingInfo={result.missingOrUnclearInformation} />
              </section>
            )}
          </div>
        </div>
      )}

      {/* Source Citation Modal */}
      <SourceSnippetModal
        source={activeSource}
        onClose={() => setActiveSource(null)}
        documentTitle={documentTitle}
      />
    </div>
  );
};
