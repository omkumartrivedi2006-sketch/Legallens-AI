export * from './authService';
export * from './storageService';
export * from './documentService';
export * from './extractionService';
export * from './aiService';

export const SERVICE_REGISTRY = {
  auth: 'firebase-auth-active',
  storage: 'cloud-storage-active',
  documentProcessing: 'real-document-pipeline-active',
  gemini: 'gemini-llm-active',
  comparison: 'diff-engine-module-6',
} as const;


