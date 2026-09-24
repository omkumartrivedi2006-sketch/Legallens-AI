import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DocumentRecord } from '../../types/document';
import { insightService } from '../../services/insightService';
import { LegalInsightsRecord, ObligationItem, DeadlineItem } from '../../types/insight';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export interface CrossDocumentMatrixPaneProps {
  selectedDocuments: DocumentRecord[];
}

export const CrossDocumentMatrixPane: React.FC<CrossDocumentMatrixPaneProps> = ({
  selectedDocuments,
}) => {
  const { user } = useAuth();
  const [activeMatrixTab, setActiveMatrixTab] = useState<'obligations' | 'deadlines'>('obligations');
  const [insightsMap, setInsightsMap] = useState<Record<string, LegalInsightsRecord | null>>({});
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    if (!user || selectedDocuments.length === 0) {
      setInsightsMap({});
      return;
    }

    let isMounted = true;
    setIsLoadingInsights(true);

    const fetchAllInsights = async () => {
      const results: Record<string, LegalInsightsRecord | null> = {};
      await Promise.all(
        selectedDocuments.map(async (doc) => {
          try {
            const insight = await insightService.getLatestInsights(user.uid, doc.id);
            results[doc.id] = insight;
          } catch {
            results[doc.id] = null;
          }
        })
      );

      if (isMounted) {
        setInsightsMap(results);
        setIsLoadingInsights(false);
      }
    };

    fetchAllInsights();

    return () => {
      isMounted = false;
    };
  }, [user, selectedDocuments]);

  // Aggregate obligations
  const aggregatedObligations: { doc: DocumentRecord; item: ObligationItem }[] = [];
  selectedDocuments.forEach((doc) => {
    const insight = insightsMap[doc.id];
    if (insight && insight.result?.obligations) {
      insight.result.obligations.forEach((item: ObligationItem) => {
        aggregatedObligations.push({ doc, item });
      });
    }
  });

  // Aggregate deadlines
  const aggregatedDeadlines: { doc: DocumentRecord; item: DeadlineItem }[] = [];
  selectedDocuments.forEach((doc) => {
    const insight = insightsMap[doc.id];
    if (insight && insight.result?.deadlines) {
      insight.result.deadlines.forEach((item: DeadlineItem) => {
        aggregatedDeadlines.push({ doc, item });
      });
    }
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Matrix Sub-Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Cross-Document Legal Matrix
          </h3>
          <span className="text-xs text-slate-400">
            ({selectedDocuments.length} document{selectedDocuments.length === 1 ? '' : 's'})
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMatrixTab('obligations')}
            className={cn(
              'px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5',
              activeMatrixTab === 'obligations'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
            <span>Obligations Matrix ({aggregatedObligations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMatrixTab('deadlines')}
            className={cn(
              'px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5',
              activeMatrixTab === 'deadlines'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            <span>Deadlines Matrix ({aggregatedDeadlines.length})</span>
          </button>
        </div>
      </div>

      {/* Matrix Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {isLoadingInsights ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Clock className="h-6 w-6 mx-auto animate-spin text-blue-600" />
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Aggregating cross-document matrix...
            </p>
          </div>
        ) : selectedDocuments.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <AlertCircle className="h-6 w-6 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No documents selected</p>
            <p>Select documents in the left panel to compare duties and deadlines.</p>
          </div>
        ) : activeMatrixTab === 'obligations' ? (
          <div className="space-y-4">
            {aggregatedObligations.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2 max-w-sm mx-auto">
                <CheckCircle2 className="h-6 w-6 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No structured obligations generated yet
                </p>
                <p>
                  Generate Legal Insights on your documents first or ask the Cross-Document Assistant to synthesize obligations.
                </p>
                {selectedDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/insights/${doc.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs mr-2 mb-1"
                  >
                    <span>Analyze {doc.fileName}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {aggregatedObligations.map(({ doc, item }, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {doc.fileName}
                        </span>
                        {item.source?.sectionHeading && (
                          <span className="text-[10px] text-slate-400">
                            {item.source.sectionHeading}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {item.partyRole.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.responsibleParty}: {item.action}
                    </p>

                    {item.condition && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-600 dark:text-slate-300">Condition:</strong>{' '}
                        {item.condition}
                      </p>
                    )}

                    {item.deadline && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-600 dark:text-slate-300">Deadline:</strong>{' '}
                        {item.deadline}
                      </p>
                    )}

                    {item.source?.textSnippet && (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 italic">
                        "{item.source.textSnippet}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {aggregatedDeadlines.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2 max-w-sm mx-auto">
                <Calendar className="h-6 w-6 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No structured deadlines found
                </p>
                <p>
                  Generate Legal Insights on your documents or ask the Cross-Document Assistant to list all deadlines.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {aggregatedDeadlines.map(({ doc, item }, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {doc.fileName}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 capitalize">
                        {item.dateType}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </p>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        {item.dateValue || 'Trigger-dependent'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>

                    {item.trigger && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">
                        <strong>Trigger:</strong> {item.trigger}
                      </p>
                    )}

                    {item.source?.textSnippet && (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 italic">
                        "{item.source.textSnippet}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
