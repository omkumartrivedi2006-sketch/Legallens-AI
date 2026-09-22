import React, { useState, useMemo } from 'react';
import {
  FileText,
  Bookmark,
  ShieldAlert,
  Users,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { ImportantClauseItem, ClauseCategory, InsightSource } from '../../types/insight';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface ImportantClausesGridProps {
  clauses: ImportantClauseItem[];
  onOpenSource: (source: InsightSource) => void;
}

export const ImportantClausesGrid: React.FC<ImportantClausesGridProps> = ({
  clauses,
  onOpenSource,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    clauses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [clauses]);

  const filteredClauses = useMemo(() => {
    if (selectedCategory === 'all') return clauses;
    return clauses.filter((c) => c.category === selectedCategory);
  }, [clauses, selectedCategory]);

  if (clauses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-xs text-slate-400 space-y-1">
          <FileText className="h-6 w-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            No specific clauses extracted
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Important Clauses
          </span>
          <span className="text-xs text-slate-400">
            ({filteredClauses.length} of {clauses.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({clauses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clauses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClauses.map((clause, idx) => (
          <Card
            key={clause.id || idx}
            className="border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Title & Category */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {clause.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40">
                    {clause.category}
                  </span>
                </div>

                {/* Plain-Language Explanation */}
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  <span className="font-semibold text-slate-900 dark:text-white block text-[11px] mb-0.5 uppercase tracking-wider text-slate-400">
                    Plain-Language Meaning
                  </span>
                  {clause.plainLanguageExplanation}
                </div>

                {/* Requirement */}
                {clause.requirement && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] block mb-0.5">
                      What It Requires:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {clause.requirement}
                    </span>
                  </div>
                )}

                {/* Verbatim quote snippet */}
                {clause.verbatimSnippet && (
                  <div className="text-[11px] font-mono p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 italic line-clamp-3">
                    "{clause.verbatimSnippet}"
                  </div>
                )}
              </div>

              {/* Footer: Affected Party + Source link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Users className="h-3 w-3" />
                  <span>Affects: <span className="font-medium text-slate-600 dark:text-slate-300">{clause.affectedParty || 'Both parties'}</span></span>
                </span>

                {clause.source && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenSource(clause.source!)}
                    className="text-xs h-6 px-2 text-blue-600 dark:text-blue-400 hover:text-blue-800"
                  >
                    <Bookmark className="h-3 w-3 mr-1" />
                    <span>View Source</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
