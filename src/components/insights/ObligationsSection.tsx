import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  User,
  Users,
  HelpCircle,
  Clock,
  Bookmark,
  Filter,
} from 'lucide-react';
import { ObligationItem, ObligationPartyRole, InsightSource } from '../../types/insight';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface ObligationsSectionProps {
  obligations: ObligationItem[];
  onOpenSource: (source: InsightSource) => void;
}

export const ObligationsSection: React.FC<ObligationsSectionProps> = ({
  obligations,
  onOpenSource,
}) => {
  const [roleFilter, setRoleFilter] = useState<'all' | ObligationPartyRole>('all');

  const filteredObligations = useMemo(() => {
    if (roleFilter === 'all') return obligations;
    return obligations.filter((o) => o.partyRole === roleFilter);
  }, [obligations, roleFilter]);

  const getRoleBadge = (role: ObligationPartyRole) => {
    switch (role) {
      case 'user_or_party_a':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            <User className="h-3 w-3" />
            User / Party A
          </span>
        );
      case 'other_party_b':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            <User className="h-3 w-3" />
            Other Party / Party B
          </span>
        );
      case 'both_parties':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
            <Users className="h-3 w-3" />
            Both Parties
          </span>
        );
      case 'third_party':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
            <Users className="h-3 w-3" />
            Third Party
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <HelpCircle className="h-3 w-3" />
            Party Role: Unclear
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Filter Obligations
          </span>
          <span className="text-xs text-slate-400">
            ({filteredObligations.length} of {obligations.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({obligations.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('user_or_party_a')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === 'user_or_party_a'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Party A
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('other_party_b')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === 'other_party_b'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Party B
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('both_parties')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === 'both_parties'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Both
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('unclear')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === 'unclear'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unclear
          </button>
        </div>
      </div>

      {/* Obligations List */}
      {filteredObligations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-xs text-slate-400 space-y-1">
            <FileCheck2 className="h-6 w-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No obligations match the selected party filter
            </p>
            <p>Try switching to "All" to view all contractual duties.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredObligations.map((obl, idx) => (
            <Card
              key={obl.id || idx}
              className="border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <CardContent className="p-5 space-y-3">
                {/* Header row: Party & Role + Confidence */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {obl.responsibleParty}
                    </span>
                    {getRoleBadge(obl.partyRole)}
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                    Confidence: {obl.confidence}
                  </span>
                </div>

                {/* Affirmative Action */}
                <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {obl.action}
                </div>

                {/* Conditions & Deadline details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {obl.condition && obl.condition !== 'None specified' && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800/80">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] block">
                        Condition / Scope:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs">
                        {obl.condition}
                      </span>
                    </div>
                  )}

                  {obl.deadline && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800/80">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Deadline / Timing:</span>
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs">
                        {obl.deadline}
                      </span>
                    </div>
                  )}
                </div>

                {/* Source link */}
                {obl.source && (
                  <div className="pt-1 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenSource(obl.source!)}
                      className="text-xs h-7 text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Bookmark className="h-3 w-3 mr-1" />
                      <span>
                        View Source {obl.source.sectionHeading ? `(${obl.source.sectionHeading})` : ''}
                      </span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
