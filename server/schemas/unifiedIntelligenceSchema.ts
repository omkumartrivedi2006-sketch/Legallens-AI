export interface UnifiedSource {
  documentId: string;
  documentName: string;
  section: string;
  pageNumber: number | null;
  chunkId: string;
  snippet: string;
}

export interface UnifiedConflictParty {
  documentId: string;
  documentName: string;
  provision: string;
}

export interface UnifiedConflict {
  topic: string;
  documentA: UnifiedConflictParty;
  documentB: UnifiedConflictParty;
  explanation: string;
}

export interface LegalUnifiedOutput {
  answer: string;
  isDocumentGrounded: boolean;
  classification: 'from_documents' | 'general_legal' | 'not_found';
  sources: UnifiedSource[];
  potentialConflicts: UnifiedConflict[];
  keyTakeaways: string[];
}

export const LEGAL_UNIFIED_JSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    answer: {
      type: 'STRING',
      description: 'The clear, structured, plain-language answer synthesizing information strictly from the selected documents or answering as general legal concepts if no document applies.',
    },
    isDocumentGrounded: {
      type: 'BOOLEAN',
      description: 'True if the answer is grounded in the provided document texts; false if answering general legal principles or not found.',
    },
    classification: {
      type: 'STRING',
      enum: ['from_documents', 'general_legal', 'not_found'],
      description: 'Classification of the response origin: from_documents, general_legal, or not_found.',
    },
    sources: {
      type: 'ARRAY',
      description: 'List of source provisions citing specific document chunks that support the claims made.',
      items: {
        type: 'OBJECT',
        properties: {
          documentId: {
            type: 'STRING',
            description: 'The exact documentId matching one of the provided documents.',
          },
          documentName: {
            type: 'STRING',
            description: 'The document file name.',
          },
          section: {
            type: 'STRING',
            description: 'The section heading or clause identifier.',
          },
          pageNumber: {
            type: 'INTEGER',
            nullable: true,
            description: 'The page number if known, or null if unstated.',
          },
          chunkId: {
            type: 'STRING',
            description: 'The chunk identifier.',
          },
          snippet: {
            type: 'STRING',
            description: 'Verbatim text snippet from the document supporting the statement.',
          },
        },
        required: ['documentId', 'documentName', 'section', 'chunkId', 'snippet'],
      },
    },
    potentialConflicts: {
      type: 'ARRAY',
      description: 'Discrepancies, varying notice periods, conflicting payment terms, or differing obligations found between documents.',
      items: {
        type: 'OBJECT',
        properties: {
          topic: {
            type: 'STRING',
            description: 'The topic of conflict (e.g. Notice Period, Payment Schedule, Termination Cause).',
          },
          documentA: {
            type: 'OBJECT',
            properties: {
              documentId: { type: 'STRING' },
              documentName: { type: 'STRING' },
              provision: { type: 'STRING', description: 'What Document A states on this topic.' },
            },
            required: ['documentId', 'documentName', 'provision'],
          },
          documentB: {
            type: 'OBJECT',
            properties: {
              documentId: { type: 'STRING' },
              documentName: { type: 'STRING' },
              provision: { type: 'STRING', description: 'What Document B states on this topic.' },
            },
            required: ['documentId', 'documentName', 'provision'],
          },
          explanation: {
            type: 'STRING',
            description: 'Neutral explanation of the apparent difference without legal conclusions on which controls.',
          },
        },
        required: ['topic', 'documentA', 'documentB', 'explanation'],
      },
    },
    keyTakeaways: {
      type: 'ARRAY',
      description: 'High-level bullet takeaways for quick executive review.',
      items: { type: 'STRING' },
    },
  },
  required: ['answer', 'isDocumentGrounded', 'classification', 'sources', 'potentialConflicts', 'keyTakeaways'],
};

export function validateLegalUnifiedOutput(data: unknown): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Output must be a non-null object.'] };
  }

  const obj = data as Record<string, any>;

  if (typeof obj.answer !== 'string' || obj.answer.trim().length === 0) {
    errors.push('answer must be a non-empty string.');
  }

  if (typeof obj.isDocumentGrounded !== 'boolean') {
    errors.push('isDocumentGrounded must be a boolean.');
  }

  const validClasses = ['from_documents', 'general_legal', 'not_found'];
  if (!validClasses.includes(obj.classification)) {
    errors.push(`classification must be one of: ${validClasses.join(', ')}.`);
  }

  if (!Array.isArray(obj.sources)) {
    errors.push('sources must be an array.');
  } else {
    obj.sources.forEach((src: any, index: number) => {
      if (!src || typeof src !== 'object') {
        errors.push(`sources[${index}] must be an object.`);
        return;
      }
      if (typeof src.documentId !== 'string' || !src.documentId) {
        errors.push(`sources[${index}].documentId must be a non-empty string.`);
      }
      if (typeof src.documentName !== 'string') {
        errors.push(`sources[${index}].documentName must be a string.`);
      }
      if (typeof src.snippet !== 'string') {
        errors.push(`sources[${index}].snippet must be a string.`);
      }
    });
  }

  if (!Array.isArray(obj.potentialConflicts)) {
    errors.push('potentialConflicts must be an array.');
  } else {
    obj.potentialConflicts.forEach((conflict: any, index: number) => {
      if (!conflict || typeof conflict !== 'object') {
        errors.push(`potentialConflicts[${index}] must be an object.`);
        return;
      }
      if (typeof conflict.topic !== 'string' || !conflict.topic) {
        errors.push(`potentialConflicts[${index}].topic must be a non-empty string.`);
      }
      if (!conflict.documentA || typeof conflict.documentA !== 'object') {
        errors.push(`potentialConflicts[${index}].documentA must be an object.`);
      }
      if (!conflict.documentB || typeof conflict.documentB !== 'object') {
        errors.push(`potentialConflicts[${index}].documentB must be an object.`);
      }
      if (typeof conflict.explanation !== 'string') {
        errors.push(`potentialConflicts[${index}].explanation must be a string.`);
      }
    });
  }

  if (!Array.isArray(obj.keyTakeaways)) {
    errors.push('keyTakeaways must be an array.');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
