import { geminiService, GeminiServiceError } from './geminiService';
import { LegalInsightsOutput, DeadlineItem } from '../schemas/legalInsightsSchema';
import { LegalAnalysisOutput } from '../schemas/legalAnalysisSchema';

export interface DocumentInsightsRequest {
  documentId: string;
  userId: string;
  fileName: string;
  fileType: string;
  extractedText: string;
  processingStatus?: string;
  existingAnalysis?: LegalAnalysisOutput | null;
}

export interface InsightRecordData {
  id: string;
  insightId: string;
  documentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  analysisVersion: string;
  status: 'completed' | 'failed';
  result: LegalInsightsOutput;
}

// In-memory mutex tracking ongoing insight generation requests per document
const activeInsights = new Set<string>();

/**
 * Calculates current deadline status and days remaining relative to current date.
 */
function calculateDeadlineStatus(deadline: DeadlineItem): {
  calculatedStatus: 'Upcoming' | 'Today' | 'Passed' | 'Trigger-dependent';
  daysRemaining: number | null;
} {
  if (!deadline.dateValue) {
    return {
      calculatedStatus: 'Trigger-dependent',
      daysRemaining: null,
    };
  }

  const parsedDate = new Date(deadline.dateValue);
  if (isNaN(parsedDate.getTime())) {
    return {
      calculatedStatus: 'Trigger-dependent',
      daysRemaining: null,
    };
  }

  const now = new Date();
  // Normalize both dates to midnight UTC for day-level comparison
  const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const targetMidnight = new Date(
    Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate())
  );

  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { calculatedStatus: 'Today', daysRemaining: 0 };
  } else if (diffDays > 0) {
    return { calculatedStatus: 'Upcoming', daysRemaining: diffDays };
  } else {
    return { calculatedStatus: 'Passed', daysRemaining: diffDays };
  }
}

export const documentInsightService = {
  /**
   * Generates grounded legal insights, obligations, deadlines, and action checklists.
   */
  async generateInsights(
    authenticatedUserId: string,
    params: DocumentInsightsRequest
  ): Promise<InsightRecordData> {
    const {
      documentId,
      userId,
      fileName,
      fileType,
      extractedText,
      processingStatus,
      existingAnalysis,
    } = params;

    // 1. Strict Document Ownership Verification
    if (!userId || userId !== authenticatedUserId) {
      throw new GeminiServiceError(
        'Access denied: You do not have permission to generate insights for this document.',
        403
      );
    }

    // 2. Readiness Check
    if (processingStatus && processingStatus !== 'ready') {
      throw new GeminiServiceError(
        `Document is not ready for insights generation. Current status: ${processingStatus}.`,
        400
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new GeminiServiceError(
        'No extracted text found for this document. Please ensure text extraction was completed.',
        400
      );
    }

    // 3. Mutex Concurrency Lock
    if (activeInsights.has(documentId)) {
      throw new GeminiServiceError(
        'An insights generation task is already in progress for this document. Please wait a moment.',
        409
      );
    }

    activeInsights.add(documentId);

    try {
      // 4. Generate structured insights with Gemini
      const { result, model } = await geminiService.generateLegalInsights({
        fileName,
        fileType,
        extractedText,
        existingAnalysis,
      });

      // 5. Post-process deadlines with calculated relative status
      const processedDeadlines = result.deadlines.map((dl) => {
        const { calculatedStatus, daysRemaining } = calculateDeadlineStatus(dl);
        return {
          ...dl,
          calculatedStatus,
          daysRemaining,
        };
      });

      const insightId = `insight_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const timestamp = new Date().toISOString();

      const finalResult: LegalInsightsOutput = {
        ...result,
        documentId,
        generatedAt: timestamp,
        deadlines: processedDeadlines,
      };

      const record: InsightRecordData = {
        id: insightId,
        insightId,
        documentId,
        userId: authenticatedUserId,
        createdAt: timestamp,
        updatedAt: timestamp,
        model,
        analysisVersion: '1.0',
        status: 'completed',
        result: finalResult,
      };

      return record;
    } finally {
      activeInsights.delete(documentId);
    }
  },
};
