export interface ChatSource {
  chunkId: string;
  sectionHeading?: string;
  pageNumber?: number;
  textSnippet?: string;
}

export interface LegalChatOutput {
  answer: string;
  sources: ChatSource[];
  isDocumentGrounded: boolean;
}

export const LEGAL_CHAT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description:
        'A comprehensive, clear, plain-language answer grounded strictly in the provided document content. If the requested information is absent from the document, explicitly state: "I couldn\'t find that information in this document."',
    },
    sources: {
      type: 'array',
      description:
        'List of specific document chunks or sections that support the answer. If the information was not found in the document, return an empty array.',
      items: {
        type: 'object',
        properties: {
          chunkId: {
            type: 'string',
            description: 'The exact chunk identifier (e.g. chunk-0, chunk-1) provided in the context.',
          },
          sectionHeading: {
            type: 'string',
            description: 'The section title or clause heading where this information appears (e.g. Section 4 - Termination, Clause 2.1).',
          },
          pageNumber: {
            type: 'number',
            description: 'The page number if explicitly mentioned in the document markers, otherwise omit or null.',
          },
          textSnippet: {
            type: 'string',
            description: 'A concise verbatim excerpt (1-2 sentences max) from the document supporting the stated fact.',
          },
        },
        required: ['chunkId'],
      },
    },
    isDocumentGrounded: {
      type: 'boolean',
      description:
        'True if the answer is grounded in actual document content. False if the requested information was missing or not present in the document.',
    },
  },
  required: ['answer', 'sources', 'isDocumentGrounded'],
};

export function validateLegalChatOutput(data: unknown): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Chat output is not an object.'] };
  }

  const obj = data as Record<string, any>;

  if (typeof obj.answer !== 'string' || obj.answer.trim().length === 0) {
    errors.push('Missing or empty "answer" property.');
  }

  if (!Array.isArray(obj.sources)) {
    errors.push('"sources" must be an array.');
  } else {
    for (let i = 0; i < obj.sources.length; i++) {
      const src = obj.sources[i];
      if (!src || typeof src !== 'object' || typeof src.chunkId !== 'string') {
        errors.push(`sources[${i}] must contain a valid chunkId string.`);
      }
    }
  }

  if (typeof obj.isDocumentGrounded !== 'boolean') {
    errors.push('"isDocumentGrounded" must be a boolean.');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
