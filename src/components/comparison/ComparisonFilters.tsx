import React from 'react';
import { Search, Filter, RefreshCw, PlusCircle, MinusCircle } from 'lucide-react';
import { ComparisonChangeType, ComparisonSignificance } from '../../types/comparison';

interface ComparisonFiltersProps {
  selectedType: 'all' | ComparisonChangeType;
  onSelectType: (type: 'all' | ComparisonChangeType) => void;
  selectedSignificance: 'all' | ComparisonSignificance;
  onSelectSignificance: (sig: 'all' | ComparisonSignificance) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredCount: number;
  totalCount: number;
}

export const ComparisonFilters: React.FC<ComparisonFiltersProps> = ({
  selectedType,
  onSelectType,
  selectedSignificance,
  onSelectSignificance,
  selectedCategory,
  onSelectCategory,
  categories,
  searchTerm,
  onSearchChange,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Filter Changes
          </span>
          <span className="text-xs text-slate-400">
            ({filteredCount} of {totalCount} shown)
          </span>
        </div>

        {/* In-Diff Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clause or keyword..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Filter Chips Row */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => onSelectType('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedType === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => onSelectType('modified')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              selectedType === 'modified'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
            }`}
          >
            <RefreshCw className="h-3 w-3" />
            Modified
          </button>
          <button
            type="button"
            onClick={() => onSelectType('added')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              selectedType === 'added'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            <PlusCircle className="h-3 w-3" />
            Added
          </button>
          <button
            type="button"
            onClick={() => onSelectType('removed')}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
              selectedType === 'removed'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
            }`}
          >
            <MinusCircle className="h-3 w-3" />
            Removed
          </button>
        </div>

        {/* Significance Dropdown */}
        <select
          aria-label="Filter by significance"
          value={selectedSignificance}
          onChange={(e) => onSelectSignificance(e.target.value as any)}
          className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Significance</option>
          <option value="high">High Significance Only</option>
          <option value="medium">Medium Significance Only</option>
          <option value="low">Low Significance Only</option>
        </select>

        {/* Category Dropdown */}
        {categories.length > 0 && (
          <select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
