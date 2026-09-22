export type ComparisonCategory =
  | 'Parties'
  | 'Payment'
  | 'Term'
  | 'Renewal'
  | 'Termination'
  | 'Notice'
  | 'Confidentiality'
  | 'Liability'
  | 'Indemnification'
  | 'Intellectual Property'
  | 'Non-compete'
  | 'Non-solicitation'
  | 'Dispute Resolution'
  | 'Governing Law'
  | 'Data/Privacy'
  | 'Obligations'
  | 'Deadlines'
  | 'Definitions'
  | 'Other';

export type ComparisonChangeType = 'added' | 'removed' | 'modified';

export type ComparisonSignificance = 'low' | 'medium' | 'high';

export interface ComparisonSource {
  pageNumber?: number;
  sectionHeading?: string;
  textSnippet?: string;
}

export interface ComparisonChange {
  id: string;
  type: ComparisonChangeType;
  category: ComparisonCategory;
  section: string;
  documentAText: string;
  documentBText: string;
  explanation: string;
  significance: ComparisonSignificance;
  sourceA?: ComparisonSource;
  sourceB?: ComparisonSource;
}

export interface ComparisonSummary {
  overview: string;
  totalChanges: number;
  additionsCount: number;
  removalsCount: number;
  modificationsCount: number;
  significantChangesCount: number;
  isIdentical: boolean;
}

export interface LegalComparisonOutput {
  summary: ComparisonSummary;
  changes: ComparisonChange[];
  unchangedSections: string[];
}

export const LEGAL_COMPARISON_JSON_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'object',
      properties: {
        overview: {
          type: 'string',
          description:
            'A comprehensive, plain-language executive summary describing the substantive differences between Document A and Document B. If the documents are effectively identical, explicitly state that no meaningful differences were found.',
        },
        totalChanges: {
          type: 'number',
          description: 'Total count of detected differences (additions, removals, and modifications).',
        },
        additionsCount: {
          type: 'number',
          description: 'Count of new clauses/sections present in Document B but absent in Document A.',
        },
        removalsCount: {
          type: 'number',
          description: 'Count of clauses/sections present in Document A but absent in Document B.',
        },
        modificationsCount: {
          type: 'number',
          description: 'Count of provisions present in both documents that have modified wording or terms.',
        },
        significantChangesCount: {
          type: 'number',
          description: 'Count of changes classified as high significance.',
        },
        isIdentical: {
          type: 'boolean',
          description: 'True if no meaningful textual or semantic differences were found between the documents.',
        },
      },
      required: [
        'overview',
        'totalChanges',
        'additionsCount',
        'removalsCount',
        'modificationsCount',
        'significantChangesCount',
        'isIdentical',
      ],
    },
    changes: {
      type: 'array',
      description: 'List of categorized, structured differences between the two documents.',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the change (e.g. change-1, change-2).',
          },
          type: {
            type: 'string',
            enum: ['added', 'removed', 'modified'],
            description: 'Whether the provision was added in B, removed from A, or modified.',
          },
          category: {
            type: 'string',
            enum: [
              'Parties',
              'Payment',
              'Term',
              'Renewal',
              'Termination',
              'Notice',
              'Confidentiality',
              'Liability',
              'Indemnification',
              'Intellectual Property',
              'Non-compete',
              'Non-solicitation',
              'Dispute Resolution',
              'Governing Law',
              'Data/Privacy',
              'Obligations',
              'Deadlines',
              'Definitions',
              'Other',
            ],
            description: 'The substantive legal category of the change.',
          },
          section: {
            type: 'string',
            description: 'The title or section heading of the clause.',
          },
          documentAText: {
            type: 'string',
            description: 'Verbatim excerpt or clause text from Document A (empty if type is added).',
          },
          documentBText: {
            type: 'string',
            description: 'Verbatim excerpt or clause text from Document B (empty if type is removed).',
          },
          explanation: {
            type: 'string',
            description:
              'A plain-English explanation of how the clause changed and its practical significance to the parties.',
          },
          significance: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description:
              'Informational classification of the change magnitude. Frame neutrally without legal outcome certainty.',
          },
          sourceA: {
            type: 'object',
            properties: {
              pageNumber: { type: 'number' },
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
          },
          sourceB: {
            type: 'object',
            properties: {
              pageNumber: { type: 'number' },
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
          },
        },
        required: [
          'id',
          'type',
          'category',
          'section',
          'documentAText',
          'documentBText',
          'explanation',
          'significance',
        ],
      },
    },
    unchangedSections: {
      type: 'array',
      description: 'List of section headings or topics that remained identical across both documents.',
      items: { type: 'string' },
    },
  },
  required: ['summary', 'changes', 'unchangedSections'],
};

export function validateLegalComparisonOutput(data: unknown): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Comparison output is not an object.'] };
  }

  const obj = data as Record<string, any>;

  if (!obj.summary || typeof obj.summary !== 'object') {
    errors.push('Missing or invalid "summary" object.');
  } else {
    if (typeof obj.summary.overview !== 'string') {
      errors.push('summary.overview must be a string.');
    }
    if (typeof obj.summary.totalChanges !== 'number') {
      errors.push('summary.totalChanges must be a number.');
    }
    if (typeof obj.summary.isIdentical !== 'boolean') {
      errors.push('summary.isIdentical must be a boolean.');
    }
  }

  if (!Array.isArray(obj.changes)) {
    errors.push('"changes" must be an array.');
  } else {
    for (let i = 0; i < obj.changes.length; i++) {
      const c = obj.changes[i];
      if (!c || typeof c !== 'object') {
        errors.push(`changes[${i}] must be an object.`);
        continue;
      }
      if (!['added', 'removed', 'modified'].includes(c.type)) {
        errors.push(`changes[${i}].type must be 'added', 'removed', or 'modified'.`);
      }
      if (typeof c.explanation !== 'string') {
        errors.push(`changes[${i}].explanation must be a string.`);
      }
      if (!['low', 'medium', 'high'].includes(c.significance)) {
        errors.push(`changes[${i}].significance must be 'low', 'medium', or 'high'.`);
      }
    }
  }

  if (!Array.isArray(obj.unchangedSections)) {
    errors.push('"unchangedSections" must be an array.');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
