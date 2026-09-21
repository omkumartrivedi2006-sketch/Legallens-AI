import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  UploadCloud,
  FileUp,
  X,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { DocumentUpload } from '../components/documents/DocumentUpload';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentList } from '../components/documents/DocumentList';
import { DeleteConfirmModal } from '../components/documents/DeleteConfirmModal';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentRecord, SupportedDocumentType, ProcessingStatus, DocumentSortOption } from '../types/document';

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    allDocumentsCount,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    activeUploads,
    uploadDocument,
    deleteDocument,
    clearUploadProgress,
  } = useDocuments();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadZone, setShowUploadZone] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await deleteDocument(deleteTarget.id, deleteTarget.storagePath);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadComplete = async (file: File) => {
    const docId = await uploadDocument(file);
    return docId;
  };

  const activeUploadsCount = Object.keys(activeUploads).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Documents"
        description="Upload, manage, and inspect your legal contracts, agreements, and briefs."
        badge={`${allDocumentsCount} ${allDocumentsCount === 1 ? 'Document' : 'Documents'}`}
        action={
          <Button
            variant={showUploadZone ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setShowUploadZone((prev) => !prev)}
          >
            {showUploadZone ? (
              <>
                <X className="h-4 w-4 mr-1.5" />
                Close Upload
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Upload Document
              </>
            )}
          </Button>
        }
      />


      {/* Upload Zone (Expandable or Default when empty) */}
      {(showUploadZone || allDocumentsCount === 0 || activeUploadsCount > 0) && (
        <Card className="border-blue-200/70 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/20 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Upload Legal Document
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Files are validated, securely stored in your isolated cloud vault, and parsed into machine-readable text.
                </p>
              </div>
              {allDocumentsCount > 0 && (
                <button
                  onClick={() => setShowUploadZone(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <DocumentUpload
              onUpload={handleUploadComplete}
              activeUploads={activeUploads}
              onClearUpload={clearUploadProgress}
            />
          </CardContent>
        </Card>
      )}

      {/* Controls Bar: Search, Filters, Sorting, and View Switcher */}
      {allDocumentsCount > 0 && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by file name..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | SupportedDocumentType)}
                className="py-1.5 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All Formats</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">TXT</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ProcessingStatus)}
              className="py-1.5 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as DocumentSortOption)}
                className="py-1.5 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="List view"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Document Content Area */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Loading your legal documents...
            </p>
            <p className="text-xs text-slate-500 mt-1">Connecting to Firestore secure store</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-rose-200 bg-rose-50/30 dark:border-rose-900/50 dark:bg-rose-950/10">
          <CardContent className="py-12 text-center text-xs text-rose-600 dark:text-rose-400">
            <p className="font-semibold text-sm mb-1">Failed to load documents</p>
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : allDocumentsCount === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={FileUp}
              title="No documents yet"
              description="Upload your first legal document to start understanding it with LegalLens AI."
              badgeText="Awaiting Documents"
              actionLabel="Upload Document"
              onAction={() => setShowUploadZone(true)}
              secondaryActionLabel="View Privacy Standards"
              onSecondaryAction={() => window.open('/privacy', '_self')}
            />
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No matching documents
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No documents matched your query: &quot;{searchQuery}&quot;. Try adjusting your search term
              or clearing filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDeleteRequest={(target) => setDeleteTarget(target)}
            />
          ))}
        </div>
      ) : (
        <DocumentList
          documents={documents}
          onDeleteRequest={(target) => setDeleteTarget(target)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        documentTitle={deleteTarget?.originalFileName || deleteTarget?.fileName || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
