import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileCheck2,
  FileCode,
  FileSpreadsheet,
  Upload,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DocumentMetadata } from '../../types/document';
import { DocumentStatusBadge } from '../documents/DocumentStatus';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface DocumentSelectorProps {
  documents: DocumentMetadata[];
  isLoading: boolean;
  onSelectDocument: (doc: DocumentMetadata) => void;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  documents,
  isLoading,
  onSelectDocument,
}) => {
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs font-medium text-slate-500">Loading your documents...</p>
      </div>
    );
  }

  const readyDocuments = documents.filter((d) => d.processingStatus === 'ready');

  if (readyDocuments.length === 0) {
    return (
      <Card className="max-w-xl mx-auto my-12 border-dashed">
        <CardContent className="py-16 text-center space-y-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 w-fit mx-auto border border-blue-100 dark:border-blue-900/40">
            <MessageSquare className="h-8 w-8" />
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No ready documents available for chat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload a document first to start a conversation. Once uploaded and extracted, you can ask questions directly grounded in its text.
            </p>
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" onClick={() => navigate('/documents')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-5 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Select a Document to Chat
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Choose one of your uploaded legal documents to open an interactive, grounded AI Q&A session.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {readyDocuments.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className="group p-4 rounded-2xl bg-white/70 dark:bg-white/[0.045] backdrop-blur-md border border-slate-200/80 dark:border-white/10 hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                {getFileIcon(doc.fileType)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {doc.originalFileName || doc.fileName}
                  </h3>
                  <DocumentStatusBadge status={doc.processingStatus} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono uppercase">
                  <span>{doc.fileType}</span>
                  {doc.wordCount !== undefined && (
                    <>
                      <span>•</span>
                      <span>{doc.wordCount.toLocaleString()} words</span>
                    </>
                  )}
                  {doc.pageCount && doc.pageCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{doc.pageCount} pages</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform hidden sm:inline flex items-center gap-1">
                Start Chat
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 sm:hidden">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Strict user isolation: Only your own authenticated documents are accessible.
        </p>
      </div>
    </div>
  );
};
