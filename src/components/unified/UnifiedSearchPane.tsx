import React, { useState } from 'react';
import {
  Search,
  FileText,
  ExternalLink,
  Tag,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  UnifiedSearchResponse,
  COMMON_CLAUSE_CATEGORIES,
} from '../../types/unified';
import { cn } from '../../lib/utils';

export interface UnifiedSearchPaneProps {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  selectedClauseCategory?: string;
  onSelectClauseCategory: (catId?: string) => void;
  isSearching: boolean;
  searchResults: UnifiedSearchResponse | null;
  searchError: string | null;
  onExecuteSearch: (query: string, clauseCategory?: string) => void;
  selectedDocumentCount: number;
}

export const UnifiedSearchPane: React.FC<UnifiedSearchPaneProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedClauseCategory,
  onSelectClauseCategory,
  isSearching,
  searchResults,
  searchError,
  onExecuteSearch,
  selectedDocumentCount,
}) => {
  const [localInput, setLocalInput] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchQueryChange(localInput);
    onExecuteSearch(localInput, selectedClauseCategory);
  };

  const handleCategoryClick = (categoryId: string) => {
    const isAlreadySelected = selectedClauseCategory === categoryId;
    const newCategory = isAlreadySelected ? undefined : categoryId;
    onSelectClauseCategory(newCategory);
    onExecuteSearch(localInput, newCategory);
  };

  const handleClear = () => {
    setLocalInput('');
    onSearchQueryChange('');
    onSelectClauseCategory(undefined);
    onExecuteSearch('', undefined);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Search Bar Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="Search legal terms, exact phrases, or numbers across documents (e.g. '30 days', 'indemnify')..."
              className="w-full pl-10 pr-20 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {localInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Clause Filter Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Tag className="h-3 w-3 text-blue-500" />
              Quick Legal Clause Presets:
            </span>
            {selectedClauseCategory && (
              <button
                type="button"
                onClick={() => handleCategoryClick(selectedClauseCategory)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset preset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {COMMON_CLAUSE_CATEGORIES.map((cat) => {
              const isSelected = selectedClauseCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                  title={cat.description}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Results Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {isSearching ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <Clock className="h-6 w-6 mx-auto animate-spin text-blue-600" />
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Scanning legal library...
            </p>
            <p className="text-slate-400">Searching provisions across selected documents.</p>
          </div>
        ) : searchError ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {searchError}
          </div>
        ) : searchResults ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <span>
                Found <strong className="text-slate-800 dark:text-slate-200">{searchResults.totalMatches}</strong> match{searchResults.totalMatches === 1 ? '' : 'es'} across {selectedDocumentCount} document{selectedDocumentCount === 1 ? '' : 's'}
              </span>
              {searchResults.clauseCategory && (
                <span className="capitalize px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-medium text-[11px]">
                  Preset: {searchResults.clauseCategory}
                </span>
              )}
            </div>

            {searchResults.results.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                <Search className="h-6 w-6 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No matching provisions found
                </p>
                <p className="text-slate-400">
                  Try broader keywords or click one of the legal clause presets above.
                </p>
              </div>
            ) : (
              searchResults.results.map((match, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {match.documentName}
                        </h4>
                        <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {match.fileType}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                        {match.sectionHeading}
                        {match.pageNumber && ` • Page ${match.pageNumber}`}
                      </p>
                    </div>

                    <Link
                      to={`/documents/${match.documentId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 shrink-0"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Highlighted snippet */}
                  <div
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{ __html: match.highlightedSnippet }}
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2 max-w-md mx-auto">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              Universal Legal Search
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Search any term or click a preset clause category above to find and compare exact contractual language across your documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
