import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock, UploadCloud } from 'lucide-react';
import { ProcessingStatus } from '../../types/document';

interface DocumentStatusBadgeProps {
  status: ProcessingStatus;
  errorMessage?: string;
  showIcon?: boolean;
  className?: string;
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  errorMessage,
  showIcon = true,
  className = '',
}) => {
  switch (status) {
    case 'uploading':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${className}`}
        >
          {showIcon && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
          <span>Uploading</span>
        </span>
      );

    case 'processing':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}
        >
          {showIcon && <Loader2 className="h-3 w-3 animate-spin text-amber-600" />}
          <span>Processing</span>
        </span>
      );

    case 'ready':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
        >
          {showIcon && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          <span>Ready</span>
        </span>
      );

    case 'failed':
      return (
        <span
          title={errorMessage || 'Processing failed'}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 ${className}`}
        >
          {showIcon && <AlertCircle className="h-3 w-3 text-rose-600" />}
          <span>Failed</span>
        </span>
      );

    case 'uploaded':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
        >
          {showIcon && <UploadCloud className="h-3 w-3 text-slate-500" />}
          <span>Uploaded</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ${className}`}
        >
          {showIcon && <Clock className="h-3 w-3" />}
          <span>Pending</span>
        </span>
      );
  }
};
