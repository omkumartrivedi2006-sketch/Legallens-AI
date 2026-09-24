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
import {
  LEGAL_UNIFIED_SYSTEM_PROMPT,
  buildUnifiedQueryPrompt,
  ScopedDocumentContext,
  UnifiedChatHistoryItem,
} from '../prompts/unifiedIntelligencePrompt';
import {
  LegalUnifiedOutput,
  validateLegalUnifiedOutput,
  LEGAL_UNIFIED_JSON_SCHEMA,
} from '../schemas/unifiedIntelligenceSchema';

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

/**
 * Resilient candidate models ordered by stability and production readiness.
 */
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
];

/**
 * Parses raw JSON error payloads from Google into human-readable messages.
 */
function extractCleanErrorMessage(raw: unknown): string {
  if (typeof raw !== 'string') {
    raw = (raw as any)?.message || String(raw);
  }
  const str = String(raw).trim();
  try {
    const parsed = JSON.parse(str);
    if (parsed.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // string is not JSON
  }
  return str;
}

/**
 * Executes a Gemini request with automatic retry and model fallback cascade.
 */
async function executeWithModelFallback(
  ai: GoogleGenAI,
  preferredModel: string,
  requestParams: {
    contents: any;
    config: any;
  },
  operationLabel: string
): Promise<{ rawText: string; usedModel: string }> {
  // Construct fallback chain starting with the preferred model
  const modelsToTry = [
    preferredModel,
    ...CANDIDATE_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];

    // Try up to 2 attempts per model for transient glitches/high demand
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: requestParams.contents,
          config: requestParams.config,
        });

        const rawText = response.text || '';
        if (rawText.trim()) {
          return { rawText, usedModel: currentModel };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);

        // Immediate fail for invalid credentials
        if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
          throw new GeminiServiceError(
            'Invalid Gemini API key provided. Please verify your GEMINI_API_KEY configuration in .env.local.',
            401,
            err
          );
        }

        const isTemporary =
          msg.includes('503') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('high demand') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('quota') ||
          msg.includes('429') ||
          msg.includes('fetch failed') ||
          msg.includes('connection');

        if (isTemporary && attempt === 1) {
          // Brief pause before retry
          await new Promise((res) => setTimeout(res, 800));
          continue;
        }

        const nextModel = modelsToTry[i + 1];
        if (nextModel) {
          console.warn(
            `[LegalLens AI] ${operationLabel} model '${currentModel}' reported: ${extractCleanErrorMessage(msg)}. Seamlessly switching to fallback model '${nextModel}'...`
          );
        }
        break; // Advance to next model
      }
    }
  }

  // If all candidate models were exhausted
  const cleaned = extractCleanErrorMessage(lastError?.message || 'Gemini API call failed.');
  throw new GeminiServiceError(
    `AI service temporarily unavailable across models: ${cleaned}`,
    503,
    lastError
  );
}

/**
 * Cleans potential markdown code fences from JSON output strings.
 */
function cleanJsonOutput(rawText: string): string {
  return rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

export const geminiService = {
  /**
   * Retrieves the configured Gemini model name.
   */
  getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.5-flash';
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

    const { rawText, usedModel } = await executeWithModelFallback(
      ai,
      model,
      {
        contents: userPrompt,
        config: {
          systemInstruction: LEGAL_ANALYSIS_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_ANALYSIS_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high factual grounding
        },
      },
      'Document Analysis'
    );

    // Parse JSON
    let parsedData: unknown;
    try {
      const cleaned = cleanJsonOutput(rawText);
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
      model: usedModel,
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

    const { rawText, usedModel } = await executeWithModelFallback(
      ai,
      model,
      {
        contents,
        config: {
          systemInstruction: LEGAL_CHAT_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_CHAT_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high factual grounding
        },
      },
      'Document Chat'
    );

    // Parse JSON
    let parsedData: unknown;
    try {
      const cleaned = cleanJsonOutput(rawText);
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
      model: usedModel,
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

    const { rawText, usedModel } = await executeWithModelFallback(
      ai,
      model,
      {
        contents,
        config: {
          systemInstruction: LEGAL_COMPARISON_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_COMPARISON_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high factual grounding
        },
      },
      'Document Comparison'
    );

    // Parse JSON
    let parsedData: unknown;
    try {
      const cleaned = cleanJsonOutput(rawText);
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new GeminiServiceError(
        'Failed to parse structured JSON comparison response from Gemini.',
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
      model: usedModel,
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

    const { rawText, usedModel } = await executeWithModelFallback(
      ai,
      model,
      {
        contents,
        config: {
          systemInstruction: LEGAL_INSIGHTS_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_INSIGHTS_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high precision & factual grounding
        },
      },
      'Legal Insights'
    );

    // Parse JSON
    let parsedData: unknown;
    try {
      const cleaned = cleanJsonOutput(rawText);
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
      model: usedModel,
    };
  },

  /**
   * Synthesizes cross-document legal intelligence grounded in multi-document chunk contexts.
   */
  async queryUnifiedIntelligence(params: {
    documents: ScopedDocumentContext[];
    conversationHistory: UnifiedChatHistoryItem[];
    userQuestion: string;
  }): Promise<{ result: LegalUnifiedOutput; model: string }> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new GeminiServiceError(
        'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to .env.local to enable multi-document AI intelligence.',
        503
      );
    }

    const { documents, conversationHistory, userQuestion } = params;

    if (!userQuestion || userQuestion.trim().length === 0) {
      throw new GeminiServiceError('User question cannot be empty.', 400);
    }

    if (!documents || documents.length === 0) {
      throw new GeminiServiceError('No documents provided for unified query.', 400);
    }

    const model = this.getModelName();
    const ai = new GoogleGenAI({ apiKey });

    const contents = buildUnifiedQueryPrompt({
      documents,
      conversationHistory,
      userQuestion: userQuestion.trim(),
    });

    const { rawText, usedModel } = await executeWithModelFallback(
      ai,
      model,
      {
        contents,
        config: {
          systemInstruction: LEGAL_UNIFIED_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: LEGAL_UNIFIED_JSON_SCHEMA,
          temperature: 0.1, // Low temperature for high factual grounding
        },
      },
      'Unified Intelligence'
    );

    let parsedData: unknown;
    try {
      const cleaned = cleanJsonOutput(rawText);
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini unified response as JSON:', rawText);
      throw new GeminiServiceError(
        'Failed to parse structured JSON unified intelligence response from Gemini.',
        502,
        parseErr
      );
    }

    // Validate structured response
    const validation = validateLegalUnifiedOutput(parsedData);
    if (!validation.valid) {
      throw new GeminiServiceError(
        `AI unified output validation failed: ${validation.errors?.join(', ')}`,
        502
      );
    }

    return {
      result: parsedData as LegalUnifiedOutput,
      model: usedModel,
    };
  },
};
