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
};
