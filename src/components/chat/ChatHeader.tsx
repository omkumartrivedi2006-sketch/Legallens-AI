import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FileCheck2,
  FileCode,
  FileSpreadsheet,
  ExternalLink,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { DocumentMetadata } from '../../types/document';
import { DocumentStatusBadge } from '../documents/DocumentStatus';
import { Button } from '../ui/Button';

interface ChatHeaderProps {
  document: DocumentMetadata;
  onOpenSidebar: () => void;
  onSwitchDocument: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  document,
  onOpenSidebar,
  onSwitchDocument,
}) => {
  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'docx':
        return <FileCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'txt':
        return <FileCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileSpreadsheet className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Left: Mobile sidebar toggle + Document details */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Toggle conversations sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
          {getFileIcon(document.fileType)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Chatting with:
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {document.originalFileName || document.fileName}
            </h2>
            <DocumentStatusBadge status={document.processingStatus} />
            {document.currentVersionId && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {document.currentVersionId}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase">
            {document.fileType} {document.wordCount !== undefined ? `• ${document.wordCount.toLocaleString()} words` : ''}
          </p>
        </div>
      </div>

      {/* Right: View Document & Switch Document */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onSwitchDocument}
          className="text-xs h-8 px-2.5 sm:px-3"
        >
          <span>Switch</span>
          <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
        </Button>

        <Link to={`/documents/${document.id}`}>
          <Button variant="ghost" size="sm" className="text-xs h-8 px-2.5 sm:px-3">
            <span className="hidden sm:inline">View Document</span>
            <ExternalLink className="h-3.5 w-3.5 sm:ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
