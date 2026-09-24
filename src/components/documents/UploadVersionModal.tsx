import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  AlertTriangle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  DocumentVersion,
  validateDocumentFile,
  formatFileSize,
  computeFileSha256,
} from '../../types/document';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../hooks/useAuth';

interface UploadVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  existingVersions: DocumentVersion[];
  onVersionUploaded: (version: DocumentVersion) => void;
}

export const UploadVersionModal: React.FC<UploadVersionModalProps> = ({
  isOpen,
  onClose,
  documentId,
  existingVersions,
  onVersionUploaded,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [duplicateVersion, setDuplicateVersion] = useState<DocumentVersion | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setDuplicateVersion(null);
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid document file.');
      return;
    }

    setSelectedFile(file);
    setIsHashing(true);
    setStatusMessage('Checking file integrity & cryptographic hash...');

    try {
      const hash = await computeFileSha256(file);
      setFileHash(hash);

      // Check if hash matches any existing version
      const duplicate = existingVersions.find((v) => v.contentHash === hash);
      if (duplicate) {
        setDuplicateVersion(duplicate);
      }
    } catch {
      // Non-fatal hash error; proceed anyway
      setFileHash(null);
    } finally {
      setIsHashing(false);
      setStatusMessage('');
    }
  };

  const handleStartUpload = async () => {
    if (!user || !selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(10);
    setStatusMessage('Uploading new version to secure Cloud Storage...');

    try {
      const newVersion = await documentService.uploadNewVersion(
        user.uid,
        documentId,
        selectedFile,
        (pct) => {
          setUploadProgress(pct);
          if (pct < 50) {
            setStatusMessage(`Uploading version file (${pct}%)...`);
          } else if (pct < 90) {
            setStatusMessage('Extracting document text & verifying structure...');
          } else {
            setStatusMessage('Finalizing and setting as current version...');
          }
        }
      );

      onVersionUploaded(newVersion);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process new version.');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setFileHash(null);
    setDuplicateVersion(null);
    setIsHashing(false);
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Upload New Document Version
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Previous versions are preserved and can be viewed or compared at any time.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">Version upload failed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Duplicate detection warning */}
        {duplicateVersion && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Identical Content Detected</span>
            </div>
            <p>
              This file appears cryptographically identical (SHA-256 match) to{' '}
              <strong>Version {duplicateVersion.versionNumber}</strong> ({duplicateVersion.fileName}).
            </p>
            <p className="text-amber-700 dark:text-amber-400">
              You can keep your existing version or upload anyway if you intend to track it as a revision.
            </p>
          </div>
        )}

        {/* Dropzone */}
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to choose or drag & drop updated document
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported formats: PDF (.pdf), Word (.docx), Plain Text (.txt) up to 20MB
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[280px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setDuplicateVersion(null);
                    setFileHash(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Change
                </button>
              )}
            </div>

            {/* SHA-256 fingerprint badge */}
            {fileHash && (
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 truncate">
                SHA-256: {fileHash}
              </div>
            )}

            {/* Upload progress indicator */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    {statusMessage}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
          >
            {duplicateVersion ? 'Keep Existing Version' : 'Cancel'}
          </Button>

          <Button
            size="sm"
            onClick={handleStartUpload}
            disabled={!selectedFile || isHashing || isUploading}
            isLoading={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {duplicateVersion ? 'Upload Anyway' : 'Upload & Process Version'}
          </Button>
        </div>
      </div>
    </div>
  );
};
