import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { documentAnalysisService } from '../services/documentAnalysisService';
import { documentChatService } from '../services/documentChatService';
import { documentComparisonService } from '../services/documentComparisonService';
import { documentInsightService } from '../services/documentInsightService';
import { unifiedIntelligenceService } from '../services/unifiedIntelligenceService';
import { geminiService, GeminiServiceError } from '../services/geminiService';

export const aiRouter = Router();

// Public health check endpoint
aiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'LegalLens AI GenAI Engine',
    model: geminiService.getModelName(),
    timestamp: new Date().toISOString(),
  });
});

// Authenticated document analysis endpoint
aiRouter.post(
  '/documents/:documentId/analyze',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { documentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User authentication required.' });
      return;
    }

    const { fileName, fileType, extractedText, processingStatus, userId: bodyUserId } = req.body;

    try {
      const record = await documentAnalysisService.analyzeDocument(userId, {
        documentId,
        userId: bodyUserId || userId,
        fileName,
        fileType,
        extractedText,
        processingStatus,
      });

      res.status(200).json({
        success: true,
        analysis: record,
      });
    } catch (error: any) {
      if (error instanceof GeminiServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
        return;
      }

      console.error('Unhandled analysis route error:', error);
      res.status(500).json({
        error: 'An unexpected error occurred while analyzing the document.',
      });
    }
  }
);

// Authenticated document chat endpoint
aiRouter.post(
  '/documents/:documentId/chat',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { documentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User authentication required.' });
      return;
    }

    const {
      conversationId,
      message,
      fileName,
      fileType,
      extractedText,
      processingStatus,
      history,
      userId: bodyUserId,
    } = req.body;

    try {
      const assistantMessage = await documentChatService.processChatMessage(userId, {
        documentId,
        userId: bodyUserId || userId,
        conversationId,
        message,
        fileName,
        fileType,
        extractedText,
        processingStatus,
        history,
      });

      res.status(200).json({
        success: true,
        message: assistantMessage,
        conversationTitle: assistantMessage.suggestedTitle,
      });
    } catch (error: any) {
      if (error instanceof GeminiServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
        return;
      }

      console.error('Unhandled chat route error:', error);
      res.status(500).json({
        error: 'An unexpected error occurred during document chat.',
      });
    }
  }
);

// Authenticated document comparison endpoint
aiRouter.post(
  '/comparisons',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User authentication required.' });
      return;
    }

    const { documentA, documentB } = req.body;

    if (!documentA || !documentB) {
      res.status(400).json({
        error: 'Missing required comparison payload. Please select both Document A and Document B.',
      });
      return;
    }

    try {
      const comparisonRecord = await documentComparisonService.compareDocuments(userId, {
        documentA,
        documentB,
      });

      res.status(200).json({
        success: true,
        comparison: comparisonRecord,
      });
    } catch (error: any) {
      if (error instanceof GeminiServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
        return;
      }

      console.error('Unhandled comparison route error:', error);
      res.status(500).json({
        error: 'An unexpected error occurred while comparing the documents.',
      });
    }
  }
);

// Authenticated document legal insights endpoint
aiRouter.post(
  '/documents/:documentId/insights',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { documentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User authentication required.' });
      return;
    }

    const {
      fileName,
      fileType,
      extractedText,
      processingStatus,
      userId: bodyUserId,
      existingAnalysis,
    } = req.body;

    try {
      const record = await documentInsightService.generateInsights(userId, {
        documentId,
        userId: bodyUserId || userId,
        fileName,
        fileType,
        extractedText,
        processingStatus,
        existingAnalysis,
      });

      res.status(200).json({
        success: true,
        insights: record,
      });
    } catch (error: any) {
      if (error instanceof GeminiServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
        return;
      }

      console.error('Unhandled insights route error:', error);
      res.status(500).json({
        error: 'An unexpected error occurred while generating document insights.',
      });
    }
  }
);

// Authenticated multi-document legal intelligence query endpoint
aiRouter.post(
  '/unified/query',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User authentication required.' });
      return;
    }

    const { documentIds, question, conversationId, history, documents } = req.body;

    try {
      const assistantMessage = await unifiedIntelligenceService.processUnifiedQuery(userId, {
        documentIds,
        question,
        conversationId,
        history,
        documents,
      });

      res.status(200).json({
        success: true,
        message: assistantMessage,
        conversationTitle: assistantMessage.suggestedTitle,
      });
    } catch (error: any) {
      if (error instanceof GeminiServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
        return;
      }

      console.error('Unhandled unified query route error:', error);
      res.status(500).json({
        error: 'An unexpected error occurred during multi-document intelligence query.',
      });
    }
  }
);

// Authenticated library-wide lexical search and clause finder endpoint
aiRouter.post(
  '/unified/search',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: User authentication required.' });
      return;
    }

    const { documentIds, query, clauseCategory, documents } = req.body;

    try {
      const searchResults = await unifiedIntelligenceService.searchLibrary(userId, {
        documentIds,
        query,
        clauseCategory,
        documents: documents || [],
      });

      res.status(200).json({
        success: true,
        ...searchResults,
      });
    } catch (error: any) {
      if (error instanceof GeminiServiceError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
        return;
      }

      console.error('Unhandled unified search route error:', error);
      res.status(500).json({
        error: 'An unexpected error occurred while searching documents.',
      });
    }
  }
);


