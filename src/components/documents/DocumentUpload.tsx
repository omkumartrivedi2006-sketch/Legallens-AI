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
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/15 backdrop-blur-md shadow-[0_0_25px_rgba(37,99,235,0.2)]'
            : 'border-slate-300/80 dark:border-white/15 hover:border-blue-500/80 dark:hover:border-blue-400/80 bg-white/60 dark:bg-white/[0.035] hover:bg-white/80 dark:hover:bg-white/[0.06] backdrop-blur-md hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]'
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
            className={`p-3.5 rounded-2xl transition-transform duration-200 group-hover:scale-105 ${
              isDragging
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25'
            }`}
          >
            <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-400 underline decoration-1 underline-offset-2">
                Click to browse
              </span>{' '}
              or drag & drop your legal document
            </p>
            <p className="text-xs text-neutral-500 dark:text-[#858585] mt-1">
              Supports <strong>PDF</strong>, <strong>DOCX</strong>, and <strong>TXT</strong> up to{' '}
              {MAX_DOCUMENT_SIZE_MB}MB
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/70 dark:bg-white/[0.06] text-neutral-700 dark:text-[#B8B8B8] border border-slate-200/80 dark:border-white/10">
              <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" /> PDF
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/70 dark:bg-white/[0.06] text-neutral-700 dark:text-[#B8B8B8] border border-slate-200/80 dark:border-white/10">
              <FileCheck2 className="h-3 w-3 text-blue-600 dark:text-blue-400" /> DOCX
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/70 dark:bg-white/[0.06] text-neutral-700 dark:text-[#B8B8B8] border border-slate-200/80 dark:border-white/10">
              <FileCode className="h-3 w-3 text-blue-600 dark:text-blue-400" /> TXT
            </span>
          </div>
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="flex items-start justify-between gap-3 p-3.5 rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 text-xs animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">Upload Validation Notice</p>
              <p className="mt-0.5 text-neutral-600 dark:text-[#B8B8B8]">{validationError}</p>
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
              className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.045] backdrop-blur-md shadow-xs"
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
                  <span className="font-medium text-neutral-800 dark:text-white truncate">
                    {upload.fileName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 dark:text-[#858585]">
                    {upload.error || (upload.stage === 'uploading' ? 'Uploading...' : upload.stage === 'extracting' ? 'Extracting text...' : upload.stage === 'finalizing' ? 'Finalizing...' : upload.stage === 'completed' ? 'Completed' : 'Failed')}
                  </span>
                  {onClearUpload && (
                    <button
                      onClick={() => onClearUpload(upload.documentId)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                      title="Dismiss"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    upload.stage === 'failed'
                      ? 'bg-rose-600'
                      : upload.stage === 'completed'
                      ? 'bg-emerald-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${upload.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
