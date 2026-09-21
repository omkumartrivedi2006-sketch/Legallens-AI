import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  FileCode,
  FileCheck2,
  Calendar,
  FileSpreadsheet,
  Copy,
  Check,
  Search,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Database,
} from 'lucide-react';

import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DocumentStatusBadge } from '../components/documents/DocumentStatus';
import { DeleteConfirmModal } from '../components/documents/DeleteConfirmModal';
import { useDocument } from '../hooks/useDocument';
import { formatFileSize } from '../types/document';

export const DocumentDetailsPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { document, loading, error, downloading, getDownloadUrl, deleteThisDocument } =
    useDocument(documentId);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleDownload = async () => {
    try {
      const url = await getDownloadUrl();
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document?.originalFileName || document?.fileName || 'document';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err: any) {
      alert(err?.message || 'Failed to download file.');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteThisDocument();
      navigate('/documents');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete document.');
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCopyText = async () => {
    if (!document?.extractedText) return;
    try {
      await navigator.clipboard.writeText(document.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Failed to copy text to clipboard.');
    }
  };

  const filteredText = useMemo(() => {
    if (!document?.extractedText) return '';
    return document.extractedText;
  }, [document?.extractedText]);

  const searchStats = useMemo(() => {
    if (!searchTerm.trim() || !document?.extractedText) return null;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = document.extractedText.match(regex);
    return matches ? matches.length : 0;
  }, [searchTerm, document?.extractedText]);

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'docx':
        return <FileCheck2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'txt':
        return <FileCode className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileSpreadsheet className="h-6 w-6 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Loading document details...
        </p>
        <p className="text-xs text-slate-400 mt-1">Verifying access permissions</p>
      </div>
    );
  }

  // Not found or unauthorized
  if (error || !document) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit mx-auto text-slate-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Document not found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            The requested document could not be found or you do not have permission to view it.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/documents')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Documents
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(document.uploadedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Documents</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            isLoading={downloading}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Download Original
          </Button>


          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900/60"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Header Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getFileIcon(document.fileType)}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white break-all">
                    {document.originalFileName || document.fileName}
                  </h1>
                  <DocumentStatusBadge
                    status={document.processingStatus}
                    errorMessage={document.errorMessage}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span className="font-mono uppercase font-semibold text-slate-700 dark:text-slate-300">
                    {document.fileType}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata Summary Pill */}
            <div className="flex items-center gap-3 self-start md:self-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
              {document.pageCount && document.pageCount > 0 && (
                <div className="text-center px-2">
                  <p className="font-bold text-slate-900 dark:text-white">{document.pageCount}</p>
                  <p className="text-[11px] text-slate-400">Pages</p>
                </div>
              )}
              {document.wordCount !== undefined && (
                <div className="text-center px-2 border-l border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {document.wordCount.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">Words</p>
                </div>
              )}
              <div className="text-center px-2 border-l border-slate-200 dark:border-slate-700">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Isolated
                </p>
                <p className="text-[11px] text-slate-400">User Scoped</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Text Viewer Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Extracted Document Text
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verbatim machine-readable text extracted from the uploaded file for analysis.
            </p>
          </div>

          {document.extractedText && (
            <div className="flex items-center gap-2">
              {/* In-text search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find in document..."
                  className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {searchStats !== null && (
                <span className="text-[11px] font-medium px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900">
                  {searchStats} {searchStats === 1 ? 'match' : 'matches'}
                </span>
              )}

              {/* Copy Button */}
              <Button variant="outline" size="sm" onClick={handleCopyText}>
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy Text
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Text Container */}
        {document.processingStatus === 'uploading' || document.processingStatus === 'processing' ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400 mb-3" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Processing document text...
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Parsing document structure, extracting clauses and text strings.
              </p>
            </CardContent>
          </Card>
        ) : document.processingStatus === 'failed' ? (
          <Card className="border-rose-200 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/10">
            <CardContent className="py-8 text-center text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-rose-600" />
              <p className="font-semibold text-sm">Text extraction encountered an issue</p>
              <p className="mt-1 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {document.errorMessage ||
                  'The document could not be read. Please ensure the file is not corrupted or password-protected.'}
              </p>
            </CardContent>
          </Card>
        ) : document.extractedText ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto p-6 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed whitespace-pre-wrap select-text">
              {filteredText}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-xs text-slate-500">
              <p>No extracted text available for this document.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        documentTitle={document.originalFileName || document.fileName}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
