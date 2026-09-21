import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { documentAnalysisService } from '../services/documentAnalysisService';
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
