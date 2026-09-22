import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  History,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileCode,
  LayoutList,
  Columns,
  ArrowRight,
  UploadCloud,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentComparison } from '../hooks/useDocumentComparison';
import { DocumentComparisonSelector } from '../components/comparison/DocumentComparisonSelector';
import { ComparisonSummaryCard } from '../components/comparison/ComparisonSummaryCard';
import { ComparisonFilters } from '../components/comparison/ComparisonFilters';
import { SideBySideDiffView } from '../components/comparison/SideBySideDiffView';
import { KeyDifferencesList } from '../components/comparison/KeyDifferencesList';
import { UnchangedSectionsAccordion } from '../components/comparison/UnchangedSectionsAccordion';
import { ComparisonHistoryList } from '../components/comparison/ComparisonHistoryList';
import { ComparisonChangeType, ComparisonSignificance } from '../types/comparison';

interface ComparePageProps {
  defaultTab?: 'compare' | 'history';
}

export const ComparePage: React.FC<ComparePageProps> = ({ defaultTab = 'compare' }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'compare' | 'history'>(
    searchParams.get('tab') === 'history' || defaultTab === 'history' ? 'history' : 'compare'
  );

  const { documents, loading: isLoadingDocs } = useDocuments();
  const {
    documentA,
    documentB,
    setDocumentA,
    setDocumentB,
    swapDocuments,
    activeComparison,
    setActiveComparison,
    comparisonsList,
    isComparing,
    progressStage,
    isLoadingHistory,
    error,
    runComparison,
    deleteComparisonRecord,
    clearComparison,
    clearError,
  } = useDocumentComparison();

  // Filters state for results view
  const [selectedType, setSelectedType] = useState<'all' | ComparisonChangeType>('all');
  const [selectedSignificance, setSelectedSignificance] = useState<'all' | ComparisonSignificance>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'breakdown'>('side-by-side');

  // Pre-populate document A and B from query params if passed (e.g. ?docA=...&docB=...)
  useEffect(() => {
    if (documents.length > 0) {
      const docAId = searchParams.get('docA');
      const docBId = searchParams.get('docB');

      if (docAId && !documentA) {
        const foundA = documents.find((d) => d.id === docAId);
        if (foundA) setDocumentA(foundA);
      }
      if (docBId && !documentB) {
        const foundB = documents.find((d) => d.id === docBId);
        if (foundB) setDocumentB(foundB);
      }
    }
  }, [documents, searchParams, documentA, documentB, setDocumentA, setDocumentB]);

  // Extract unique categories from current comparison
  const allCategories = useMemo(() => {
    if (!activeComparison) return [];
    const set = new Set<string>();
    activeComparison.result.changes.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [activeComparison]);

  // Filtered changes
  const filteredChanges = useMemo(() => {
    if (!activeComparison) return [];
    return activeComparison.result.changes.filter((c) => {
      // Type filter
      if (selectedType !== 'all' && c.type !== selectedType) return false;
      // Significance filter
      if (selectedSignificance !== 'all' && c.significance !== selectedSignificance) return false;
      // Category filter
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inTitle = c.title.toLowerCase().includes(query);
        const inExplanation = c.explanation.toLowerCase().includes(query);
        const inOld = c.originalSnippet?.toLowerCase().includes(query);
        const inNew = c.modifiedSnippet?.toLowerCase().includes(query);
        const inCategory = c.category.toLowerCase().includes(query);
        if (!inTitle && !inExplanation && !inOld && !inNew && !inCategory) return false;
      }
      return true;
    });
  }, [activeComparison, selectedType, selectedSignificance, selectedCategory, searchTerm]);

  const readyDocuments = documents.filter((d) => d.processingStatus === 'ready');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Document Comparison"
          description="Compare two legal agreements side-by-side with semantic difference analysis, modified clauses, and unchanged provisions."
          badge="AI & Deterministic Engine"
        />

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>Compare</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History ({comparisonsList.length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'history' ? (
        <ComparisonHistoryList
          comparisons={comparisonsList}
          isLoading={isLoadingHistory}
          onDeleteComparison={deleteComparisonRecord}
        />
      ) : (
        <div className="space-y-6">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 flex items-start justify-between gap-3 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Comparison Error:</span> {error}
                </div>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 font-bold px-1.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Not enough documents banner */}
          {!isLoadingDocs && readyDocuments.length < 2 && !activeComparison && (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FileCode className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  At least 2 ready documents are required
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You currently have {readyDocuments.length} ready{' '}
                  {readyDocuments.length === 1 ? 'document' : 'documents'}. Upload an additional contract
                  or agreement to begin side-by-side comparison.
                </p>
              </div>
              <Link to="/documents">
                <Button size="sm" className="gap-2">
                  <UploadCloud className="h-4 w-4" />
                  <span>Go to Document Library</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Selector section (if no active comparison or when user wants to change) */}
          {(!activeComparison || readyDocuments.length >= 2) && (
            <div className="space-y-4">
              <DocumentComparisonSelector
                documents={documents}
                documentA={documentA}
                documentB={documentB}
                onSelectDocumentA={setDocumentA}
                onSelectDocumentB={setDocumentB}
                onSwapDocuments={swapDocuments}
                onCompare={runComparison}
                isComparing={isComparing}
                progressStage={progressStage}
              />
            </div>
          )}

          {/* Active Comparison Results View */}
          {activeComparison && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Comparison Results
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    ID: {activeComparison.id.slice(0, 8)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setViewMode('side-by-side')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'side-by-side'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Columns className="h-3.5 w-3.5" />
                      <span>Side-by-Side</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('breakdown')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        viewMode === 'breakdown'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <LayoutList className="h-3.5 w-3.5" />
                      <span>Difference Cards</span>
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearComparison}
                    className="text-xs h-9"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    <span>New Comparison</span>
                  </Button>
                </div>
              </div>

              {/* 1. Comparison Summary Card */}
              <ComparisonSummaryCard comparison={activeComparison} />

              {/* 2. Interactive Search & Category Filters */}
              {activeComparison.result.changes.length > 0 && (
                <ComparisonFilters
                  selectedType={selectedType}
                  onSelectType={setSelectedType}
                  selectedSignificance={selectedSignificance}
                  onSelectSignificance={setSelectedSignificance}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categories={allCategories}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filteredCount={filteredChanges.length}
                  totalCount={activeComparison.result.changes.length}
                />
              )}

              {/* 3. Render View based on viewMode */}
              {viewMode === 'side-by-side' ? (
                <SideBySideDiffView
                  changes={filteredChanges}
                  docAName={activeComparison.result.documentA.name}
                  docBName={activeComparison.result.documentB.name}
                />
              ) : (
                <KeyDifferencesList changes={filteredChanges} />
              )}

              {/* 4. Unchanged Sections Accordion */}
              <UnchangedSectionsAccordion
                unchangedSections={activeComparison.result.unchangedSections}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
