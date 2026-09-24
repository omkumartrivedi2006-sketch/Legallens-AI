import { geminiService, GeminiServiceError } from './geminiService';
import { retrievalService } from './retrievalService';
import { ChatSource } from '../schemas/legalChatSchema';

export interface DocumentChatRequest {
  documentId: string;
  versionId?: string;
  userId: string;
  conversationId?: string;
  message: string;
  fileName: string;
  fileType: string;
  extractedText: string;
  processingStatus?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AssistantChatResponseData {
  id: string;
  conversationId: string;
  userId: string;
  versionId?: string;
  role: 'assistant';
  content: string;
  createdAt: string;
  sources: ChatSource[];
  isDocumentGrounded: boolean;
  model: string;
  suggestedTitle?: string;
}

// In-memory mutex tracking ongoing chat requests per conversation / document
const activeChats = new Set<string>();

export const documentChatService = {
  /**
   * Generates a concise title from the user's initial question.
   */
  generateConversationTitle(question: string): string {
    const cleaned = question
      .replace(/^(what|who|where|when|why|how|can|is|does|do|could|should|tell me about|explain)\s+/i, '')
      .replace(/[?.,!]+$/, '')
      .trim();
    if (!cleaned) return 'Legal Document Discussion';
    const words = cleaned.split(/\s+/).slice(0, 5).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  },

  /**
   * Coordinates grounded document chat: verifies ownership, retrieves relevant chunks,
   * calls Gemini, and validates output.
   */
  async processChatMessage(
    authenticatedUserId: string,
    params: DocumentChatRequest
  ): Promise<AssistantChatResponseData> {
    const {
      documentId,
      userId,
      conversationId: existingConversationId,
      message,
      fileName,
      fileType,
      extractedText,
      processingStatus,
      history = [],
    } = params;

    // 1. Strict Ownership Verification
    if (!userId || userId !== authenticatedUserId) {
      throw new GeminiServiceError(
        'Access denied: You do not have permission to chat with this document.',
        403
      );
    }

    // 2. Readiness Check
    if (processingStatus && processingStatus !== 'ready') {
      throw new GeminiServiceError(
        `Document is not ready for chat. Current processing status: ${processingStatus}.`,
        400
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new GeminiServiceError(
        'The document contains no extracted text for Q&A.',
        400
      );
    }

    const trimmedQuestion = message?.trim();
    if (!trimmedQuestion) {
      throw new GeminiServiceError('Please enter a question to ask the document.', 400);
    }

    const conversationId = existingConversationId || crypto.randomUUID();
    const lockKey = `${authenticatedUserId}:${documentId}:${params.versionId || 'current'}:${conversationId}`;

    if (activeChats.has(lockKey)) {
      throw new GeminiServiceError(
        'A response is already in progress for this conversation. Please wait a moment.',
        429
      );
    }

    activeChats.add(lockKey);

    try {
      // 3. Chunk Document Text
      const chunks = retrievalService.chunkDocument(extractedText, documentId);

      // 4. Retrieve Relevant Chunks
      const relevantChunks = retrievalService.retrieveRelevantChunks(
        chunks,
        trimmedQuestion,
        5
      );

      // 5. Invoke Gemini with Grounded Prompt & Context
      const { result, model } = await geminiService.chatWithDocument({
        fileName: fileName || 'Document',
        fileType: fileType || 'txt',
        chunks: relevantChunks,
        conversationHistory: history,
        userQuestion: trimmedQuestion,
      });

      const messageId = crypto.randomUUID();
      const nowIso = new Date().toISOString();

      const suggestedTitle =
        history.length === 0 ? this.generateConversationTitle(trimmedQuestion) : undefined;

      const responseMessage: AssistantChatResponseData = {
        id: messageId,
        conversationId,
        userId: authenticatedUserId,
        versionId: params.versionId,
        role: 'assistant',
        content: result.answer,
        createdAt: nowIso,
        sources: result.sources || [],
        isDocumentGrounded: result.isDocumentGrounded,
        model,
        suggestedTitle,
      };

      return responseMessage;
    } finally {
      activeChats.delete(lockKey);
    }
  },
};
