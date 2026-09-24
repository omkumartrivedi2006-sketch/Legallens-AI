export type SupportedDocumentType = 'pdf' | 'docx' | 'txt';

export type ProcessingStatus = 'uploading' | 'uploaded' | 'processing' | 'ready' | 'failed';

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DocumentVersion {
  id: string; // versionId (e.g. 'v1', 'v2', etc.)
  versionId: string;
  documentId: string;
  userId: string;
  versionNumber: number;
  fileName: string;
  originalFileName: string;
  fileType: SupportedDocumentType;
  mimeType: string;
  fileSize: number; // in bytes
  storagePath: string; // users/{userId}/documents/{documentId}/versions/{versionId}/{fileName}
  uploadedAt: string; // ISO 8601
  createdAt: string; // ISO 8601
  processingStatus: ProcessingStatus;
  extractionStatus: ExtractionStatus;
  extractedText?: string;
  extractedTextStoragePath?: string;
  pageCount?: number;
  wordCount?: number;
  contentHash?: string; // SHA-256
  isCurrent: boolean;
  errorMessage?: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  fileName: string;
  originalFileName: string;
  fileType: SupportedDocumentType;
  mimeType: string;
  fileSize: number; // in bytes
  storagePath: string;
  uploadedAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  processingStatus: ProcessingStatus;
  extractionStatus: ExtractionStatus;
  extractedText?: string;
  extractedTextStoragePath?: string;
  pageCount?: number;
  wordCount?: number;
  errorMessage?: string;
  currentVersionId?: string;
  versionCount?: number;
  contentHash?: string;
}

export type DocumentMetadata = DocumentRecord;

export type DocumentSortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export interface DocumentFilterOptions {
  searchQuery: string;
  fileType: 'all' | SupportedDocumentType;
  status: 'all' | ProcessingStatus;
  sortBy: DocumentSortOption;
}

export const MAX_DOCUMENT_SIZE_MB = 20;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

export const SUPPORTED_FILE_EXTENSIONS: Record<string, SupportedDocumentType> = {
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.txt': 'txt',
};

export const SUPPORTED_MIME_TYPES: Record<string, SupportedDocumentType> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileType?: SupportedDocumentType;
}

export function validateDocumentFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // File size validation
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_DOCUMENT_SIZE_MB} MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty (0 bytes).',
    };
  }

  // Type & Extension validation
  const lowerName = file.name.toLowerCase();
  let detectedType: SupportedDocumentType | undefined;

  for (const [ext, type] of Object.entries(SUPPORTED_FILE_EXTENSIONS)) {
    if (lowerName.endsWith(ext)) {
      detectedType = type;
      break;
    }
  }

  // Cross-reference with MIME type if available
  if (file.type && SUPPORTED_MIME_TYPES[file.type]) {
    detectedType = SUPPORTED_MIME_TYPES[file.type];
  }

  if (!detectedType) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a PDF (.pdf), Word (.docx), or Text (.txt) document.',
    };
  }

  return { valid: true, fileType: detectedType };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeStorageFileName(originalName: string): string {
  // Replace spaces, special characters with underscores, keeping alphanumeric, dots, and hyphens
  const cleaned = originalName
    .replace(/[^\w.-]/gi, '_')
    .replace(/_{2,}/g, '_');
  return cleaned || 'document';
}

/**
 * Computes the cryptographic SHA-256 hash of a file for data integrity & deduplication.
 */
export async function computeFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

