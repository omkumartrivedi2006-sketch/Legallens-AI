import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileCode,
  FileCheck2,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { DocumentRecord, formatFileSize } from '../../types/document';
import { DocumentStatusBadge } from './DocumentStatus';
import { storageService } from '../../services/storageService';

interface DocumentListProps {
  documents: DocumentRecord[];
  onDeleteRequest: (doc: DocumentRecord) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDeleteRequest }) => {
  const navigate = useNavigate();

  const handleDownload = async (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = await storageService.getDocumentDownloadUrl(doc.storagePath);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.originalFileName || doc.fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download document. Please check connection.');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'docx':
        return <FileCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'txt':
        return <FileCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <FileSpreadsheet className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.045] backdrop-blur-md shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] text-slate-500 dark:text-[#858585]">
          <tr>
            <th className="py-3.5 px-4 font-medium">Document Name</th>
            <th className="py-3.5 px-3 font-medium">Type</th>
            <th className="py-3.5 px-3 font-medium">Size</th>
            <th className="py-3.5 px-3 font-medium">Length</th>
            <th className="py-3.5 px-3 font-medium">Uploaded</th>
            <th className="py-3.5 px-3 font-medium">Status</th>
            <th className="py-3.5 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {documents.map((doc) => {
            const formattedDate = new Date(doc.uploadedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <tr
                key={doc.id}
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="hover:bg-blue-500/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                {/* File Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5 max-w-xs md:max-w-md">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <span
                      title={doc.originalFileName || doc.fileName}
                      className="font-medium text-slate-900 dark:text-white truncate"
                    >
                      {doc.originalFileName || doc.fileName}
                    </span>
                  </div>
                </td>

                {/* Type */}
                <td className="py-3 px-3">
                  <span className="font-mono uppercase text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {doc.fileType}
                  </span>
                </td>

                {/* Size */}
                <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                  {formatFileSize(doc.fileSize)}
                </td>

                {/* Pages / Words */}
                <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                  {doc.pageCount && doc.pageCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {doc.pageCount} pgs
                    </span>
                  ) : doc.wordCount ? (
                    `${doc.wordCount.toLocaleString()} words`
                  ) : (
                    '—'
                  )}
                </td>

                {/* Date */}
                <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formattedDate}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <DocumentStatusBadge
                    status={doc.processingStatus}
                    errorMessage={doc.errorMessage}
                  />
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => handleDownload(doc, e)}
                      title="Download"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(doc)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      title="Details"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
