import React, { useState } from 'react';
import {
  FileText,
  CheckSquare,
  Square,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DocumentRecord } from '../../types/document';
import { cn } from '../../lib/utils';

export interface DocumentScopeSelectorProps {
  documents: DocumentRecord[];
  selectedDocumentIds: string[];
  onToggleDocument: (docId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpdateScope?: (newScope: string[]) => void;
  isLoading?: boolean;
  className?: string;
}

export const DocumentScopeSelector: React.FC<DocumentScopeSelectorProps> = ({
  documents,
  selectedDocumentIds,
  onToggleDocument,
  onSelectAll,
  onDeselectAll,
  isLoading,
  className,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const readyDocuments = documents.filter((d) => d.processingStatus === 'ready');
  const filteredDocuments = readyDocuments.filter((d) =>
    d.fileName.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  const allSelected = readyDocuments.length > 0 && selectedDocumentIds.length === readyDocuments.length;
  const someSelected = selectedDocumentIds.length > 0 && selectedDocumentIds.length < readyDocuments.length;

  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Document Scope
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            {selectedDocumentIds.length} of {readyDocuments.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          aria-label={isCollapsed ? 'Expand scope selector' : 'Collapse scope selector'}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Controls Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={allSelected ? onDeselectAll : onSelectAll}
              disabled={readyDocuments.length === 0}
              className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
            >
              {allSelected ? (
                <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Square className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{allSelected ? 'Deselect All' : 'Select All Ready'}</span>
            </button>

            {selectedDocumentIds.length > 0 && (
              <span className="text-slate-500 dark:text-slate-400">
                {selectedDocumentIds.length} active in context
              </span>
            )}
          </div>

          {/* Quick Search inside document library */}
          {readyDocuments.length > 4 && (
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter documents..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Document List */}
          <div className="p-2 space-y-1 max-h-72 lg:max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <Clock className="h-4 w-4 mx-auto mb-1 animate-spin text-blue-500" />
                Loading documents...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {documents.length === 0 ? (
                  <div className="space-y-1">
                    <AlertCircle className="h-4 w-4 mx-auto text-amber-500" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">No documents yet</p>
                    <p className="text-[11px]">Upload documents to query across them.</p>
                  </div>
                ) : (
                  <p>No matching documents found.</p>
                )}
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const isSelected = selectedDocumentIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => onToggleDocument(doc.id)}
                    className={cn(
                      'flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer select-none transition-colors border',
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-slate-900 dark:text-white'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <div className="shrink-0 text-blue-600 dark:text-blue-400">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </div>

                    <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                        <span className="uppercase">{doc.fileType}</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Unprocessed documents warning */}
            {documents.some((d) => d.processingStatus !== 'ready') && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  Some documents are still processing or failed extraction and cannot be included.
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
