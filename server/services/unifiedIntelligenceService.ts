import { geminiService, GeminiServiceError } from './geminiService';
import { retrievalService, DocumentChunk } from './retrievalService';
import {
  LegalUnifiedOutput,
  UnifiedSource,
  UnifiedConflict,
} from '../schemas/unifiedIntelligenceSchema';
import { ScopedDocumentContext, UnifiedChatHistoryItem } from '../prompts/unifiedIntelligencePrompt';

export interface UnifiedDocumentInput {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  extractedText: string;
  processingStatus?: string;
}

export interface UnifiedQueryRequest {
  documentIds: string[];
  question: string;
  conversationId?: string;
  history?: UnifiedChatHistoryItem[];
  documents: UnifiedDocumentInput[];
}

export interface UnifiedAssistantMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'assistant';
  content: string;
  createdAt: string;
  sources: UnifiedSource[];
  potentialConflicts: UnifiedConflict[];
  keyTakeaways: string[];
  isDocumentGrounded: boolean;
  classification: 'from_documents' | 'general_legal' | 'not_found';
  model: string;
  suggestedTitle?: string;
}

export interface UnifiedSearchMatch {
  documentId: string;
  documentName: string;
  fileType: string;
  sectionHeading: string;
  pageNumber: number | null;
  snippet: string;
  highlightedSnippet: string;
  matchScore: number;
}

export interface UnifiedSearchResponse {
  query: string;
  clauseCategory?: string;
  totalMatches: number;
  results: UnifiedSearchMatch[];
}

// In-memory mutex for concurrent multi-document query processing
const activeUnifiedQueries = new Set<string>();

const CLAUSE_CATEGORY_PATTERNS: Record<string, RegExp> = {
  termination: /\b(terminat|cancell|expir|severance|breach of agreement)\b/i,
  payment: /\b(payment|fee|invoic|remunerat|compensat|salary|due date|installments|net \d+)\b/i,
  confidentiality: /\b(confidenti|proprietary|non-disclos|trade secret|nda)\b/i,
  liability: /\b(liabilit|damages|limitation of liability|consequential|indirect damages)\b/i,
  indemnification: /\b(indemnif|hold harmless|defend against)\b/i,
  renewal: /\b(renew|extension|term of agreement|evergreen|automatic renewal)\b/i,
  notice: /\b(notice|written notice|days'? notice|certified mail)\b/i,
  governing_law: /\b(governing law|jurisdiction|venue|arbitrat|courts of)\b/i,
};

export const unifiedIntelligenceService = {
  /**
   * Generates a concise title from the user's initial multi-document question.
   */
  generateConversationTitle(question: string): string {
    const cleaned = question
      .replace(/^(what|who|where|when|why|how|can|is|does|do|could|should|tell me about|explain|compare)\s+/i, '')
      .replace(/[?.,!]+$/, '')
      .trim();
    if (!cleaned) return 'Multi-Document Intelligence';
    const words = cleaned.split(/\s+/).slice(0, 5).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  },

  /**
   * Core multi-document conversational Q&A processor.
   */
  async processUnifiedQuery(
    authenticatedUserId: string,
    params: UnifiedQueryRequest
  ): Promise<UnifiedAssistantMessage> {
    const { documentIds, question, conversationId: existingConversationId, history = [], documents } = params;

    // 1. Validate Input
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      throw new GeminiServiceError(
        'Please select at least one document for unified intelligence.',
        400
      );
    }

    const trimmedQuestion = question?.trim();
    if (!trimmedQuestion) {
      throw new GeminiServiceError('Question cannot be empty.', 400);
    }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new GeminiServiceError('No document payloads provided for analysis.', 400);
    }

    // 2. Strict Ownership & Readiness Verification across ALL requested documents
    const docMap = new Map<string, UnifiedDocumentInput>();
    for (const doc of documents) {
      if (!doc.userId || doc.userId !== authenticatedUserId) {
        throw new GeminiServiceError(
          'Access denied: You do not have permission to access one or more requested documents.',
          403
        );
      }
      docMap.set(doc.id, doc);
    }

    // Ensure every requested document ID exists and is ready
    const targetDocs: UnifiedDocumentInput[] = [];
    for (const docId of documentIds) {
      const doc = docMap.get(docId);
      if (!doc) {
        throw new GeminiServiceError(
          'One or more selected documents could not be found or verified.',
          404
        );
      }
      if (doc.processingStatus && doc.processingStatus !== 'ready') {
        throw new GeminiServiceError(
          `Document "${doc.fileName}" is still processing (${doc.processingStatus}). Please wait until text extraction is complete.`,
          400
        );
      }
      if (!doc.extractedText || doc.extractedText.trim().length === 0) {
        throw new GeminiServiceError(
          `Document "${doc.fileName}" contains no extracted text for Q&A.`,
          400
        );
      }
      targetDocs.push(doc);
    }

    const conversationId = existingConversationId || crypto.randomUUID();
    const lockKey = `${authenticatedUserId}:unified:${conversationId}`;

    if (activeUnifiedQueries.has(lockKey)) {
      throw new GeminiServiceError(
        'A multi-document response is already in progress. Please wait a moment.',
        429
      );
    }

    activeUnifiedQueries.add(lockKey);

    try {
      // 3. Scoped Multi-Document Retrieval
      // Determine chunk budget per document: for 1-2 docs, top 5 each; for 3+ docs, top 3-4 each (max 12 total chunks)
      const perDocLimit = targetDocs.length <= 2 ? 5 : 3;

      const scopedDocs: ScopedDocumentContext[] = targetDocs.map((doc) => {
        const allChunks = retrievalService.chunkDocument(doc.extractedText, doc.id);
        const topChunks = retrievalService.retrieveRelevantChunks(
          allChunks,
          trimmedQuestion,
          perDocLimit
        );
        return {
          documentId: doc.id,
          documentName: doc.fileName,
          fileType: doc.fileType,
          chunks: topChunks,
        };
      });

      // 4. Invoke Gemini with Grounded Prompt & JSON Schema
      const { result, model } = await geminiService.queryUnifiedIntelligence({
        documents: scopedDocs,
        conversationHistory: history,
        userQuestion: trimmedQuestion,
      });

      // 5. Anti-Hallucination & Scope Filtering on Sources
      const validDocIdSet = new Set(documentIds);
      const sanitizedSources = (result.sources || []).filter((src) => {
        if (!src.documentId || !validDocIdSet.has(src.documentId)) {
          // Reject source pointing to an unselected or non-existent document
          return false;
        }
        return true;
      });

      const messageId = crypto.randomUUID();
      const nowIso = new Date().toISOString();
      const suggestedTitle =
        history.length === 0 ? this.generateConversationTitle(trimmedQuestion) : undefined;

      const assistantMessage: UnifiedAssistantMessage = {
        id: messageId,
        conversationId,
        userId: authenticatedUserId,
        role: 'assistant',
        content: result.answer,
        createdAt: nowIso,
        sources: sanitizedSources,
        potentialConflicts: result.potentialConflicts || [],
        keyTakeaways: result.keyTakeaways || [],
        isDocumentGrounded: result.isDocumentGrounded,
        classification: result.classification,
        model,
        suggestedTitle,
      };

      return assistantMessage;
    } finally {
      activeUnifiedQueries.delete(lockKey);
    }
  },

  /**
   * Fast library-wide lexical search and clause finder across user's authorized documents.
   */
  async searchLibrary(
    authenticatedUserId: string,
    params: {
      documentIds?: string[];
      query: string;
      clauseCategory?: string;
      documents: UnifiedDocumentInput[];
    }
  ): Promise<UnifiedSearchResponse> {
    const { documentIds, query: rawQuery, clauseCategory, documents } = params;

    // Validate ownership
    for (const doc of documents) {
      if (!doc.userId || doc.userId !== authenticatedUserId) {
        throw new GeminiServiceError(
          'Access denied: You do not have permission to search these documents.',
          403
        );
      }
    }

    const targetDocIds =
      documentIds && documentIds.length > 0
        ? new Set(documentIds)
        : new Set(documents.map((d) => d.id));

    const targetDocs = documents.filter(
      (d) => targetDocIds.has(d.id) && d.processingStatus === 'ready' && d.extractedText
    );

    const queryClean = rawQuery ? rawQuery.trim().toLowerCase() : '';
    const categoryPattern = clauseCategory
      ? CLAUSE_CATEGORY_PATTERNS[clauseCategory.toLowerCase()]
      : null;

    if (!queryClean && !categoryPattern) {
      return {
        query: rawQuery || '',
        clauseCategory,
        totalMatches: 0,
        results: [],
      };
    }

    const matches: UnifiedSearchMatch[] = [];

    for (const doc of targetDocs) {
      const chunks = retrievalService.chunkDocument(doc.extractedText, doc.id);

      for (const chunk of chunks) {
        let score = 0;
        let matched = false;
        const lowerText = chunk.text.toLowerCase();
        const lowerHeading = (chunk.sectionHeading || '').toLowerCase();

        // 1. Clause category pattern matching
        if (categoryPattern) {
          if (categoryPattern.test(lowerHeading)) {
            score += 15;
            matched = true;
          } else if (categoryPattern.test(lowerText)) {
            score += 8;
            matched = true;
          }
        }

        // 2. Query string matching
        if (queryClean) {
          if (lowerHeading.includes(queryClean)) {
            score += 10;
            matched = true;
          }
          if (lowerText.includes(queryClean)) {
            score += 5;
            matched = true;
          }
          // Word tokens
          const tokens = queryClean.split(/\s+/).filter((t) => t.length > 2);
          for (const token of tokens) {
            if (lowerText.includes(token)) {
              score += 2;
              matched = true;
            }
          }
        }

        if (matched && score > 0) {
          // Highlight snippet
          const snippet = chunk.text.slice(0, 320) + (chunk.text.length > 320 ? '...' : '');
          let highlightedSnippet = snippet;

          if (queryClean) {
            const regex = new RegExp(`(${queryClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            highlightedSnippet = highlightedSnippet.replace(regex, '<mark class="bg-amber-200 dark:bg-amber-900/60 dark:text-amber-100 px-0.5 rounded">$1</mark>');
          }

          matches.push({
            documentId: doc.id,
            documentName: doc.fileName,
            fileType: doc.fileType,
            sectionHeading: chunk.sectionHeading || 'Provisions',
            pageNumber: chunk.pageNumber || null,
            snippet,
            highlightedSnippet,
            matchScore: score,
          });
        }
      }
    }

    // Rank descending by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      query: rawQuery || '',
      clauseCategory,
      totalMatches: matches.length,
      results: matches.slice(0, 30), // Top 30 matches
    };
  },
};
