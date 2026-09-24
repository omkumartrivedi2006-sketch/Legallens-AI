import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  X,
  Plus,
  RefreshCw,
  FileText,
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

      {/* Collapsible Upload Zone */}
      {showUploadZone && (
        <Card className="animate-in fade-in slide-in-from-top-3 duration-200">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Upload New Legal Document
              </h2>
              {activeUploadsCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>{activeUploadsCount} active processing</span>
                </div>
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
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#101010] p-3 rounded-xl border border-neutral-200 dark:border-white/10 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by file name..."
              className="w-full pl-9 pr-8 py-1.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-[#B8B8B8]">
              <Filter className="h-3.5 w-3.5 text-neutral-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | SupportedDocumentType)}
                className="py-1.5 px-2.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#B8B8B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="py-1.5 px-2.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#B8B8B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-[#B8B8B8]">
              <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as DocumentSortOption)}
                className="py-1.5 px-2.5 rounded-lg text-xs bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#B8B8B8] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#151515]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#242424] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:text-[#858585] dark:hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#242424] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-700 dark:text-[#858585] dark:hover:text-white'
                }`}
                title="List view"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Main Content Area: Loading, Empty, or Document Gallery */}
      {loading && documents.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-500 mx-auto" />
          <p className="text-xs text-neutral-500 dark:text-[#858585]">
            Loading your document library...
          </p>
        </div>
      ) : documents.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDeleteRequest={(d) => setDeleteTarget(d)}
              />
            ))}
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onDeleteRequest={(d) => setDeleteTarget(d)}
          />
        )
      ) : (
        <EmptyState
          icon={FileText}
          title={searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'No matching documents' : 'No documents in library'}
          description={
            searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search keywords or filters to find what you need.'
              : 'Upload your first contract, NDA, or legal document to start analyzing.'
          }
          actionLabel="Upload Document"
          onAction={() => setShowUploadZone(true)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          isOpen={Boolean(deleteTarget)}
          documentTitle={deleteTarget.originalFileName || deleteTarget.fileName}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
