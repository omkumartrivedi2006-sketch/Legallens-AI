import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { SupportedDocumentType } from '../types/document';

// Configure PDF.js worker in browser environment
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback CDN if module resolution fails in specific bundler setups
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  wordCount: number;
}

export class DocumentExtractionError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'DocumentExtractionError';
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  const tokens = text.trim().split(/\s+/);
  return tokens.filter(Boolean).length;
}

/**
 * Extracts plain text from a UTF-8 text file (.txt).
 */
export async function extractTextFromTxt(file: File): Promise<ExtractionResult> {
  try {
    const rawText = await file.text();
    const text = rawText.trim();
    return {
      text,
      pageCount: 1,
      wordCount: countWords(text),
    };
  } catch (error) {
    throw new DocumentExtractionError(
      'Failed to read text file. The file may be corrupt or encoded in an unsupported charset.',
      error
    );
  }
}

/**
 * Extracts plain text from a Word document (.docx) using mammoth.
 */
export async function extractTextFromDocx(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value.trim();

    return {
      text,
      wordCount: countWords(text),
    };
  } catch (error) {
    throw new DocumentExtractionError(
      'Failed to extract text from DOCX file. Ensure the file is a valid Word (.docx) document and is not password-protected.',
      error
    );
  }
}

/**
 * Extracts plain text and page count from a PDF document using PDF.js.
 */
export async function extractTextFromPdf(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pageSections: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageTokens: string[] = [];
      for (const item of textContent.items) {
        if ('str' in item && typeof item.str === 'string') {
          pageTokens.push(item.str);
        }
      }

      const pageText = pageTokens.join(' ').replace(/\s+/g, ' ').trim();
      if (pageText) {
        pageSections.push(`[Page ${pageNum}]\n${pageText}`);
      }
    }

    const fullText = pageSections.join('\n\n').trim();

    return {
      text: fullText,
      pageCount: numPages,
      wordCount: countWords(fullText),
    };
  } catch (error: any) {
    if (error?.name === 'PasswordException') {
      throw new DocumentExtractionError('The PDF is password protected and cannot be processed.', error);
    }
    if (error?.name === 'InvalidPDFException') {
      throw new DocumentExtractionError('The uploaded file is not a valid PDF or is corrupted.', error);
    }
    throw new DocumentExtractionError(
      'Failed to extract text from PDF document.',
      error
    );
  }
}

/**
 * Main extraction dispatcher based on supported file type.
 */
export async function extractDocumentText(
  file: File,
  fileType: SupportedDocumentType
): Promise<ExtractionResult> {
  switch (fileType) {
    case 'txt':
      return await extractTextFromTxt(file);
    case 'docx':
      return await extractTextFromDocx(file);
    case 'pdf':
      return await extractTextFromPdf(file);
    default:
      throw new DocumentExtractionError(`Unsupported document type: ${fileType}`);
  }
}
