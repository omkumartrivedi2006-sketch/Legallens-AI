import { diffService } from './diffService';
import { geminiService, GeminiServiceError } from './geminiService';
import { LegalComparisonOutput } from '../schemas/legalComparisonSchema';

export interface DocumentInputPayload {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  extractedText: string;
  processingStatus?: string;
  wordCount?: number;
  pageCount?: number;
}

export interface ComparisonRecordData {
  id: string;
  comparisonId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: 'completed' | 'failed';
  model: string;
  comparisonVersion: string;
  result: LegalComparisonOutput & {
    documentA: {
      id: string;
      name: string;
      fileType: string;
      wordCount?: number;
      pageCount?: number;
    };
    documentB: {
      id: string;
      name: string;
      fileType: string;
      wordCount?: number;
      pageCount?: number;
    };
  };
}

// In-memory mutex tracking ongoing comparisons per document pair
const activeComparisons = new Set<string>();

export const documentComparisonService = {
  /**
   * Coordinates the document comparison pipeline:
   * verifies ownership, checks readiness, executes deterministic diffing,
   * invokes Gemini for semantic explanations, and structures the result.
   */
  async compareDocuments(
    authenticatedUserId: string,
    params: {
      documentA: DocumentInputPayload;
      documentB: DocumentInputPayload;
    }
  ): Promise<ComparisonRecordData> {
    const { documentA, documentB } = params;

    // 1. Strict Ownership Verification (Must own both documents)
    if (!documentA?.userId || documentA.userId !== authenticatedUserId) {
      throw new GeminiServiceError(
        'Access denied: You do not have permission to access Document A.',
        403
      );
    }

    if (!documentB?.userId || documentB.userId !== authenticatedUserId) {
      throw new GeminiServiceError(
        'Access denied: You do not have permission to access Document B.',
        403
      );
    }

    // 2. Same Document Protection
    if (documentA.id === documentB.id) {
      throw new GeminiServiceError(
        'Please select two different documents to compare.',
        400
      );
    }

    // 3. Readiness Checks
    if (documentA.processingStatus && documentA.processingStatus !== 'ready') {
      throw new GeminiServiceError(
        `Document A is not ready for comparison. Current status: ${documentA.processingStatus}.`,
        400
      );
    }

    if (documentB.processingStatus && documentB.processingStatus !== 'ready') {
      throw new GeminiServiceError(
        `Document B is not ready for comparison. Current status: ${documentB.processingStatus}.`,
        400
      );
    }

    if (!documentA.extractedText || documentA.extractedText.trim().length === 0) {
      throw new GeminiServiceError(
        'Document A contains no extracted text for comparison.',
        400
      );
    }

    if (!documentB.extractedText || documentB.extractedText.trim().length === 0) {
      throw new GeminiServiceError(
        'Document B contains no extracted text for comparison.',
        400
      );
    }

    // 4. Duplicate in-flight comparison protection
    const lockKey = `${authenticatedUserId}:${documentA.id}:${documentB.id}`;
    if (activeComparisons.has(lockKey)) {
      throw new GeminiServiceError(
        'A comparison is already in progress for these two documents. Please wait.',
        429
      );
    }

    activeComparisons.add(lockKey);

    try {
      // 5. Deterministic Text Alignment & Section Diffs
      const diffResult = diffService.alignAndDiffSections(
        documentA.extractedText,
        documentB.extractedText,
        documentA.id,
        documentB.id
      );

      const alignedDifferences = diffResult.alignedSections.filter(
        (s) => s.status !== 'unchanged'
      );

      const unchangedHeadings = diffResult.alignedSections
        .filter((s) => s.status === 'unchanged')
        .map((s) => s.headingA || s.headingB || 'General Section');

      // 6. Gemini Semantic Comparison
      const docAName = documentA.fileName || 'Document A';
      const docBName = documentB.fileName || 'Document B';

      const { result, model } = await geminiService.compareLegalDocuments({
        docAName,
        docBName,
        alignedDifferences,
        unchangedSectionHeadings: unchangedHeadings,
      });

      const comparisonId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      const comparisonRecord: ComparisonRecordData = {
        id: comparisonId,
        comparisonId,
        userId: authenticatedUserId,
        createdAt: nowIso,
        updatedAt: nowIso,
        status: 'completed',
        model,
        comparisonVersion: '1.0',
        result: {
          ...result,
          documentA: {
            id: documentA.id,
            name: docAName,
            fileType: documentA.fileType || 'txt',
            wordCount: documentA.wordCount,
            pageCount: documentA.pageCount,
          },
          documentB: {
            id: documentB.id,
            name: docBName,
            fileType: documentB.fileType || 'txt',
            wordCount: documentB.wordCount,
            pageCount: documentB.pageCount,
          },
        },
      };

      return comparisonRecord;
    } finally {
      activeComparisons.delete(lockKey);
    }
  },
};
