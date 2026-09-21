import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileCode,
  FileCheck2,
  Download,
  Trash2,
  ExternalLink,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { DocumentRecord, formatFileSize } from '../../types/document';
import { DocumentStatusBadge } from './DocumentStatus';
import { storageService } from '../../services/storageService';

interface DocumentCardProps {
  document: DocumentRecord;
  onDeleteRequest: (doc: DocumentRecord) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDeleteRequest }) => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState<boolean>(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloading(true);
      const url = await storageService.getDocumentDownloadUrl(document.storagePath);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalFileName || document.fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document. Please verify network connectivity.');
    } finally {
      setDownloading(false);
    }
  };

  const getFileIcon = () => {
    switch (document.fileType) {
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

  const formattedDate = new Date(document.uploadedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => navigate(`/documents/${document.id}`)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-200">
            {getFileIcon()}
          </div>
          <DocumentStatusBadge
            status={document.processingStatus}
            errorMessage={document.errorMessage}
          />
        </div>

        {/* Title */}
        <h3
          title={document.originalFileName || document.fileName}
          className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-1"
        >
          {document.originalFileName || document.fileName}
        </h3>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <span className="font-mono uppercase text-[11px] font-semibold tracking-wider text-slate-600 dark:text-slate-300">
            {document.fileType}
          </span>
          <span>•</span>
          <span>{formatFileSize(document.fileSize)}</span>
          {document.pageCount && document.pageCount > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {document.pageCount} {document.pageCount === 1 ? 'pg' : 'pgs'}
              </span>
            </>
          )}
          {document.wordCount !== undefined && document.wordCount > 0 && (
            <>
              <span>•</span>
              <span>{document.wordCount.toLocaleString()} words</span>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </span>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download Document"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDeleteRequest(document)}
            title="Delete Document"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => navigate(`/documents/${document.id}`)}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
