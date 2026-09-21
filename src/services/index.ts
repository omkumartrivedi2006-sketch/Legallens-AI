export * from './authService';

export const SERVICE_REGISTRY = {
  auth: 'firebase-auth-active',
  storage: 'cloud-storage-module-3',
  gemini: 'gemini-llm-module-4-5',
  comparison: 'diff-engine-module-6',
} as const;
