import { GoogleGenAI } from '@google/genai';
import {
  LEGAL_ANALYSIS_SYSTEM_PROMPT,
  buildUserAnalysisPrompt,
} from '../prompts/legalAnalysisPrompt';
import {
  LegalAnalysisOutput,
  validateLegalAnalysisOutput,
  LEGAL_ANALYSIS_JSON_SCHEMA,
} from '../schemas/legalAnalysisSchema';
import {
  LEGAL_CHAT_SYSTEM_PROMPT,
  buildDocumentChatPrompt,
  ChatHistoryItem,
} from '../prompts/legalChatPrompt';
import {
  LegalChatOutput,
  validateLegalChatOutput,
  LEGAL_CHAT_JSON_SCHEMA,
} from '../schemas/legalChatSchema';
import { DocumentChunk } from './retrievalService';
import {
  LEGAL_COMPARISON_SYSTEM_PROMPT,
  buildComparisonUserPrompt,
} from '../prompts/legalComparisonPrompt';
import {
  LegalComparisonOutput,
  validateLegalComparisonOutput,
  LEGAL_COMPARISON_JSON_SCHEMA,
} from '../schemas/legalComparisonSchema';
import { AlignedSectionDiff } from './diffService';
import {
  LEGAL_INSIGHTS_SYSTEM_PROMPT,
  buildUserInsightsPrompt,
} from '../prompts/legalInsightsPrompt';
import {
  LegalInsightsOutput,
  validateLegalInsightsOutput,
  LEGAL_INSIGHTS_JSON_SCHEMA,
} from '../schemas/legalInsightsSchema';

export class GeminiServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

export const geminiService = {
  /**
   * Retrieves the configured Gemini model name.
   */
  getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  },

  /**
   * Analyzes legal document text using Google Gemini and returns structured output.
   */
  async analyzeLegalDocument(params: {
    fileName: string;
    fileType: string;
    extractedText: string;
  }): Promise<{ result: LegalAnalysisOutput; model: string }> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new GeminiServiceError(
        'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to .env.local to enable real AI document analysis.',
        503
      );
    }

    const { fileName, fileType, extractedText } = params;

    if (!extractedText || extractedText.trim().length === 0) {
      throw new GeminiServiceError(
        'The document contains no readable text. Please re-upload or ensure the document is not an image-only scan without OCR.',
        400
      );
    }

    const model = this.getModelName();
    const ai = new GoogleGenAI({ apiKey });

    const userPrompt = buildUserAnalysisPrompt(fileName, fileType, extractedText);

    let rawText = '';
    try {
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction: LEGAL_ANALYSIS_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_ANALYSIS_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high factual grounding
        },
      });

      rawText = response.text || '';
    } catch (apiError: any) {
      const message = apiError?.message || 'Gemini API request failed.';
      if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
        throw new GeminiServiceError(
          'Invalid Gemini API key provided. Please verify your GEMINI_API_KEY configuration.',
          401,
          apiError
        );
      }
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
        throw new GeminiServiceError(
          'Gemini rate limit or quota exceeded. Please wait a moment and try again.',
          429,
          apiError
        );
      }
      throw new GeminiServiceError(
        `Gemini analysis failed: ${message}`,
        502,
        apiError
      );
    }

    if (!rawText.trim()) {
      throw new GeminiServiceError('Gemini returned an empty response.', 502);
    }

    // Parse JSON
    let parsedData: unknown;
    try {
      // Clean potential code fences if returned despite responseMimeType
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new GeminiServiceError(
        'Failed to parse structured JSON response from Gemini.',
        502,
        parseErr
      );
    }

    // Validate structured response
    const validation = validateLegalAnalysisOutput(parsedData);
    if (!validation.valid) {
      throw new GeminiServiceError(
        `AI output validation failed: ${validation.errors?.join(', ')}`,
        502
      );
    }

    return {
      result: parsedData as LegalAnalysisOutput,
      model,
    };
  },

  /**
   * Conducts a grounded legal Q&A session grounded strictly in retrieved document chunks.
   */
  async chatWithDocument(params: {
    fileName: string;
    fileType: string;
    chunks: DocumentChunk[];
    conversationHistory: ChatHistoryItem[];
    userQuestion: string;
  }): Promise<{ result: LegalChatOutput; model: string }> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new GeminiServiceError(
        'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to .env.local to enable real AI document chat.',
        503
      );
    }

    const { fileName, fileType, chunks, conversationHistory, userQuestion } = params;

    if (!userQuestion || userQuestion.trim().length === 0) {
      throw new GeminiServiceError('User question cannot be empty.', 400);
    }

    if (!chunks || chunks.length === 0) {
      throw new GeminiServiceError(
        'No readable document content available for grounding.',
        400
      );
    }

    const model = this.getModelName();
    const ai = new GoogleGenAI({ apiKey });

    const contents = buildDocumentChatPrompt({
      fileName,
      fileType,
      chunks,
      conversationHistory,
      userQuestion: userQuestion.trim(),
    });

    let rawText = '';
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: LEGAL_CHAT_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_CHAT_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high factual grounding
        },
      });

      rawText = response.text || '';
    } catch (apiError: any) {
      const message = apiError?.message || 'Gemini API request failed.';
      if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
        throw new GeminiServiceError(
          'Invalid Gemini API key provided. Please verify your GEMINI_API_KEY configuration.',
          401,
          apiError
        );
      }
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
        throw new GeminiServiceError(
          'Gemini rate limit or quota exceeded. Please wait a moment and try again.',
          429,
          apiError
        );
      }
      throw new GeminiServiceError(`Gemini chat failed: ${message}`, 502, apiError);
    }

    if (!rawText.trim()) {
      throw new GeminiServiceError('Gemini returned an empty response.', 502);
    }

    // Parse JSON
    let parsedData: unknown;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new GeminiServiceError(
        'Failed to parse structured JSON response from Gemini.',
        502,
        parseErr
      );
    }

    // Validate structured response
    const validation = validateLegalChatOutput(parsedData);
    if (!validation.valid) {
      throw new GeminiServiceError(
        `AI chat validation failed: ${validation.errors?.join(', ')}`,
        502
      );
    }

    return {
      result: parsedData as LegalChatOutput,
      model,
    };
  },

  /**
   * Compares two legal documents semantically using Google Gemini.
   */
  async compareLegalDocuments(params: {
    docAName: string;
    docBName: string;
    alignedDifferences: AlignedSectionDiff[];
    unchangedSectionHeadings: string[];
  }): Promise<{ result: LegalComparisonOutput; model: string }> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new GeminiServiceError(
        'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to .env.local to enable real AI document comparison.',
        503
      );
    }

    const { docAName, docBName, alignedDifferences, unchangedSectionHeadings } = params;

    // Fast path: if deterministic diff found 0 differences, return identical summary
    if (alignedDifferences.length === 0) {
      return {
        result: {
          summary: {
            overview:
              'No meaningful textual or contractual differences were identified between these two documents. All provisions and clauses appear identical.',
            totalChanges: 0,
            additionsCount: 0,
            removalsCount: 0,
            modificationsCount: 0,
            significantChangesCount: 0,
            isIdentical: true,
          },
          changes: [],
          unchangedSections: unchangedSectionHeadings,
        },
        model: this.getModelName(),
      };
    }

    const model = this.getModelName();
    const ai = new GoogleGenAI({ apiKey });

    const contents = buildComparisonUserPrompt({
      docAName,
      docBName,
      alignedDifferences,
      unchangedSectionHeadings,
    });

    let rawText = '';
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: LEGAL_COMPARISON_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_COMPARISON_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high factual grounding
        },
      });

      rawText = response.text || '';
    } catch (apiError: any) {
      const message = apiError?.message || 'Gemini API comparison request failed.';
      if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
        throw new GeminiServiceError(
          'Invalid Gemini API key provided. Please verify your GEMINI_API_KEY configuration.',
          401,
          apiError
        );
      }
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
        throw new GeminiServiceError(
          'Gemini rate limit or quota exceeded. Please wait a moment and try again.',
          429,
          apiError
        );
      }
      throw new GeminiServiceError(`Gemini comparison failed: ${message}`, 502, apiError);
    }

    if (!rawText.trim()) {
      throw new GeminiServiceError('Gemini returned an empty response.', 502);
    }

    // Parse JSON
    let parsedData: unknown;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new GeminiServiceError(
        'Failed to parse structured JSON response from Gemini.',
        502,
        parseErr
      );
    }

    // Validate structured response
    const validation = validateLegalComparisonOutput(parsedData);
    if (!validation.valid) {
      throw new GeminiServiceError(
        `AI comparison validation failed: ${validation.errors?.join(', ')}`,
        502
      );
    }

    return {
      result: parsedData as LegalComparisonOutput,
      model,
    };
  },

  /**
   * Generates grounded legal insights, obligations, deadlines, and an action checklist.
   */
  async generateLegalInsights(params: {
    fileName: string;
    fileType: string;
    extractedText: string;
    existingAnalysis?: LegalAnalysisOutput | null;
  }): Promise<{ result: LegalInsightsOutput; model: string }> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new GeminiServiceError(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in your environment variables.',
        500
      );
    }

    const { fileName, fileType, extractedText, existingAnalysis } = params;
    const model = this.getModelName();
    const ai = new GoogleGenAI({ apiKey });

    const contents = buildUserInsightsPrompt({
      fileName,
      fileType,
      extractedText,
      existingAnalysis,
    });

    let rawText = '';
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: LEGAL_INSIGHTS_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_INSIGHTS_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high precision & factual grounding
        },
      });

      rawText = response.text || '';
    } catch (apiError: any) {
      const message = apiError?.message || 'Gemini API insights generation failed.';
      if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
        throw new GeminiServiceError(
          'Invalid Gemini API key provided. Please verify your GEMINI_API_KEY configuration.',
          401,
          apiError
        );
      }
      if (message.includes('RESOURCE_EXHAUSTED') || message.includes('quota')) {
        throw new GeminiServiceError(
          'Gemini rate limit or quota exceeded. Please wait a moment and try again.',
          429,
          apiError
        );
      }
      throw new GeminiServiceError(`Gemini insights generation failed: ${message}`, 502, apiError);
    }

    if (!rawText.trim()) {
      throw new GeminiServiceError('Gemini returned an empty response for legal insights.', 502);
    }

    // Parse JSON
    let parsedData: unknown;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new GeminiServiceError(
        'Failed to parse structured JSON insights response from Gemini.',
        502,
        parseErr
      );
    }

    // Validate structured response
    const validation = validateLegalInsightsOutput(parsedData);
    if (!validation.valid) {
      throw new GeminiServiceError(
        `AI insights validation failed: ${validation.errors?.join(', ')}`,
        502
      );
    }

    return {
      result: parsedData as LegalInsightsOutput,
      model,
    };
  },
};
