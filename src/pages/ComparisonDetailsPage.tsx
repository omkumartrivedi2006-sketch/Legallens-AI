import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Columns,
  LayoutList,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { comparisonService } from '../services/comparisonService';
import { ComparisonRecord, ComparisonChangeType, ComparisonSignificance } from '../types/comparison';
import { Button } from '../components/ui/Button';
import { ComparisonSummaryCard } from '../components/comparison/ComparisonSummaryCard';
import { ComparisonFilters } from '../components/comparison/ComparisonFilters';
import { SideBySideDiffView } from '../components/comparison/SideBySideDiffView';
import { KeyDifferencesList } from '../components/comparison/KeyDifferencesList';
import { UnchangedSectionsAccordion } from '../components/comparison/UnchangedSectionsAccordion';

export const ComparisonDetailsPage: React.FC = () => {
  const { comparisonId } = useParams<{ comparisonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [comparison, setComparison] = useState<ComparisonRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Filters state
  const [selectedType, setSelectedType] = useState<'all' | ComparisonChangeType>('all');
  const [selectedSignificance, setSelectedSignificance] = useState<'all' | ComparisonSignificance>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'breakdown'>('side-by-side');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user || !comparisonId) return;
      setIsLoading(true);
      setError(null);

      try {
        const record = await comparisonService.getComparisonById(user.uid, comparisonId);
        if (isMounted) {
          if (record) {
            setComparison(record);
          } else {
            setError('Comparison report not found or you do not have permission to view it.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load comparison record.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user, comparisonId]);

  // Extract unique categories
  const allCategories = useMemo(() => {
    if (!comparison) return [];
    const set = new Set<string>();
    comparison.result.changes.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [comparison]);

  // Filtered changes
  const filteredChanges = useMemo(() => {
    if (!comparison) return [];
    return comparison.result.changes.filter((c) => {
      if (selectedType !== 'all' && c.type !== selectedType) return false;
      if (selectedSignificance !== 'all' && c.significance !== selectedSignificance) return false;
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inTitle = (c.section || '').toLowerCase().includes(query);
        const inExplanation = (c.explanation || '').toLowerCase().includes(query);
        const inOld = (c.documentAText || '').toLowerCase().includes(query);
        const inNew = (c.documentBText || '').toLowerCase().includes(query);
        const inCategory = (c.category || '').toLowerCase().includes(query);
        if (!inTitle && !inExplanation && !inOld && !inNew && !inCategory) return false;
      }
      return true;
    });
  }, [comparison, selectedType, selectedSignificance, selectedCategory, searchTerm]);

  const handleDelete = async () => {
    if (!user || !comparisonId) return;
    setIsDeleting(true);
    try {
      await comparisonService.deleteComparison(user.uid, comparisonId);
      navigate('/compare?tab=history');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete comparison record.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs font-medium">Loading saved comparison report...</p>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="p-8 rounded-2xl bg-white/70 dark:bg-white/[0.045] backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-center space-y-4 max-w-lg mx-auto mt-12 shadow-sm">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Comparison Report Unavailable
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || 'This comparison record does not exist or may have been deleted.'}
          </p>
        </div>
        <Link to="/compare">
          <Button size="sm" variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Document Comparison</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/compare?tab=history')}
            className="text-xs h-8 px-2 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to History</span>
          </Button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <span className="text-xs font-mono text-slate-400">
            Report ID: {comparison.id.slice(0, 10)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-200/50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 rounded-xl backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-white/10'
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
                  ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-white/10'
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
            onClick={() => setShowDeleteModal(true)}
            className="text-xs h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <ComparisonSummaryCard comparison={comparison} />

      {/* Filter Toolbar */}
      {comparison.result.changes.length > 0 && (
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
          totalCount={comparison.result.changes.length}
        />
      )}

      {/* Active Diff Presentation */}
      {viewMode === 'side-by-side' ? (
        <SideBySideDiffView
          changes={filteredChanges}
          docAName={comparison.result.documentA.name}
          docBName={comparison.result.documentB.name}
        />
      ) : (
        <KeyDifferencesList changes={filteredChanges} />
      )}

      {/* Unchanged Provisions Accordion */}
      <UnchangedSectionsAccordion
        unchangedSections={comparison.result.unchangedSections}
      />

      {/* Delete Confirmation Modal (Glass Modal) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white/85 dark:bg-[#0D0D0D]/90 backdrop-blur-xl p-6 shadow-2xl border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Delete Comparison Record?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will delete only this saved comparison report. Your original uploaded legal
                documents will remain safe and completely untouched.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                <span>Delete Report</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
