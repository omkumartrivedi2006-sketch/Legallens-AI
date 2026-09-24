import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileCode,
  FileCheck2,
  Download,
  Trash2,
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
        return <FileText className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />;
      case 'docx':
        return <FileCheck2 className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />;
      case 'txt':
        return <FileCode className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-neutral-500" />;
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
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.045] backdrop-blur-md shadow-xs hover:border-blue-500/40 dark:hover:border-white/20 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-150">
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
          className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate mb-1"
        >
          {document.originalFileName || document.fileName}
        </h3>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-[11px] text-neutral-500 dark:text-[#858585] mb-4">
          <span className="font-mono uppercase text-[10px] font-semibold tracking-wider text-neutral-700 dark:text-[#B8B8B8]">
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
      <div className="pt-3 border-t border-neutral-100 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-400 dark:text-[#858585]">
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
            className="p-1.5 rounded-md text-neutral-400 hover:text-blue-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDeleteRequest(document)}
            title="Delete Document"
            className="p-1.5 rounded-md text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
