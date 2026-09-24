import { geminiService, GeminiServiceError } from './geminiService';
import { LegalAnalysisOutput } from '../schemas/legalAnalysisSchema';

export interface DocumentAnalysisRequest {
  documentId: string;
  userId: string;
  fileName: string;
  fileType: string;
  extractedText: string;
  processingStatus?: string;
  versionId?: string;
}

export interface AnalysisRecordData {
  id: string;
  analysisId: string;
  documentId: string;
  versionId?: string;
  userId: string;
  createdAt: string;
  model: string;
  analysisVersion: string;
  promptVersion: string;
  status: 'completed' | 'failed';
  result: LegalAnalysisOutput;
}

// In-memory mutex tracking ongoing analysis requests to prevent duplicates
const activeAnalyses = new Set<string>();

export const documentAnalysisService = {
  /**
   * Coordinates the document analysis pipeline with ownership verification and duplicate protection.
   */
  async analyzeDocument(
    authenticatedUserId: string,
    params: DocumentAnalysisRequest
  ): Promise<AnalysisRecordData> {
    const { documentId, userId, fileName, fileType, extractedText, processingStatus, versionId } = params;

    // 1. Strict Document Ownership Verification
    if (!userId || userId !== authenticatedUserId) {
      throw new GeminiServiceError(
        'Access denied: You do not have permission to analyze this document.',
        403
      );
    }

    // 2. Readiness Check
    if (processingStatus && processingStatus !== 'ready') {
      throw new GeminiServiceError(
        `Document is not ready for analysis. Current processing status: ${processingStatus}.`,
        400
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new GeminiServiceError(
        'No extracted text found for this document. Please ensure text extraction was completed.',
        400
      );
    }

    // 3. Duplicate In-Flight Protection
    const lockKey = `${authenticatedUserId}:${documentId}:${versionId || 'current'}`;
    if (activeAnalyses.has(lockKey)) {
      throw new GeminiServiceError(
        'An analysis is already actively in progress for this document version. Please wait for it to complete.',
        429
      );
    }

    activeAnalyses.add(lockKey);

    try {
      // 4. Invoke Gemini Service
      const { result, model } = await geminiService.analyzeLegalDocument({
        fileName: fileName || 'Legal Document',
        fileType: fileType || 'txt',
        extractedText,
      });

      const analysisId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      const analysisRecord: AnalysisRecordData = {
        id: analysisId,
        analysisId,
        documentId,
        versionId,
        userId: authenticatedUserId,
        createdAt: nowIso,
        model,
        analysisVersion: '1.0',
        promptVersion: 'v1.0',
        status: 'completed',
        result,
      };

      return analysisRecord;
    } finally {
      activeAnalyses.delete(lockKey);
    }
  },
};
