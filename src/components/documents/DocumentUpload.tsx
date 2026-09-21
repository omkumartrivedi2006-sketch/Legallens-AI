import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileCode,
  FileCheck2,
  AlertCircle,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { MAX_DOCUMENT_SIZE_MB, validateDocumentFile } from '../../types/document';
import { UploadProgressState } from '../../hooks/useDocuments';


interface DocumentUploadProps {
  onUpload: (file: File) => Promise<string>;
  activeUploads: Record<string, UploadProgressState>;
  onClearUpload?: (id: string) => void;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  activeUploads,
  onClearUpload,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessingLocal, setIsProcessingLocal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setValidationError(null);

    const file = files[0];
    const validation = validateDocumentFile(file);

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsProcessingLocal(true);
      await onUpload(file);
    } catch (err: any) {
      setValidationError(err?.message || 'Upload failed.');
    } finally {
      setIsProcessingLocal(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const activeUploadList = Object.values(activeUploads);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessingLocal && fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 bg-white/60 dark:bg-slate-900/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isProcessingLocal}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`p-4 rounded-2xl transition-transform duration-200 group-hover:scale-110 ${
              isDragging
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
            }`}
          >
            <UploadCloud className="h-8 w-8" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              <span className="text-blue-600 dark:text-blue-400 underline decoration-2 underline-offset-2">
                Click to browse
              </span>{' '}
              or drag & drop your legal document
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports <strong>PDF</strong>, <strong>DOCX</strong>, and <strong>TXT</strong> up to{' '}
              {MAX_DOCUMENT_SIZE_MB}MB
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/60">
              <FileText className="h-3 w-3" /> PDF
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <FileCheck2 className="h-3 w-3" /> DOCX
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <FileCode className="h-3 w-3" /> TXT
            </span>
          </div>
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">Upload Validation Notice</p>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">{validationError}</p>
            </div>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Active Uploads / Processing Progress Cards */}
      {activeUploadList.length > 0 && (
        <div className="space-y-2">
          {activeUploadList.map((upload) => (
            <div
              key={upload.documentId}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2 max-w-[70%]">
                  {upload.stage === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : upload.stage === 'failed' ? (
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {upload.fileName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {upload.stage === 'uploading' && `${upload.percent}%`}
                    {upload.stage === 'extracting' && 'Extracting text...'}
                    {upload.stage === 'completed' && 'Ready'}
                    {upload.stage === 'failed' && 'Failed'}
                  </span>

                  {onClearUpload && (upload.stage === 'completed' || upload.stage === 'failed') && (
                    <button
                      onClick={() => onClearUpload(upload.documentId)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    upload.stage === 'failed'
                      ? 'bg-rose-600'
                      : upload.stage === 'completed'
                      ? 'bg-emerald-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${upload.stage === 'extracting' ? 100 : upload.percent}%` }}
                />
              </div>

              {upload.error && (
                <p className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  {upload.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
