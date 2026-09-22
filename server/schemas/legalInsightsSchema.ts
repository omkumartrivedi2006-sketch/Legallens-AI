export type ObligationPartyRole =
  | 'user_or_party_a'
  | 'other_party_b'
  | 'both_parties'
  | 'third_party'
  | 'unclear';

export type DeadlineType =
  | 'effective_date'
  | 'expiry_date'
  | 'payment_deadline'
  | 'notice_period'
  | 'renewal_date'
  | 'termination_deadline'
  | 'response_deadline'
  | 'other';

export type DeadlineStatus = 'Upcoming' | 'Today' | 'Passed' | 'Trigger-dependent';

export type ChecklistTaskStatus = 'not_started' | 'in_progress' | 'completed';

export type ClauseCategory =
  | 'Termination'
  | 'Payment'
  | 'Confidentiality'
  | 'Liability'
  | 'Indemnification'
  | 'Intellectual Property'
  | 'Renewal'
  | 'Notice'
  | 'Dispute Resolution'
  | 'Governing Law'
  | 'Data/Privacy'
  | 'Non-compete'
  | 'Non-solicitation'
  | 'Representations'
  | 'Warranties'
  | 'Other';

export type AreaToReviewSeverity = 'informational' | 'potentially_significant';

export interface InsightSource {
  pageNumber?: number;
  sectionHeading?: string;
  textSnippet?: string;
}

export interface ObligationItem {
  id: string;
  responsibleParty: string;
  partyRole: ObligationPartyRole;
  action: string;
  condition: string;
  deadline: string;
  source?: InsightSource;
  confidence: 'high' | 'medium' | 'low';
}

export interface DeadlineItem {
  id: string;
  title: string;
  dateType: DeadlineType;
  dateValue: string | null;
  relativePeriod: string;
  trigger: string;
  responsibleParty: string;
  description: string;
  calculatedStatus: DeadlineStatus;
  daysRemaining: number | null;
  source?: InsightSource;
}

export interface ChecklistTaskItem {
  id: string;
  task: string;
  responsibleParty: string;
  deadline: string;
  category: string;
  status: ChecklistTaskStatus;
  source?: InsightSource;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImportantClauseItem {
  id: string;
  category: ClauseCategory;
  title: string;
  verbatimSnippet: string;
  plainLanguageExplanation: string;
  requirement: string;
  affectedParty: string;
  source?: InsightSource;
}

export interface AreaToReviewItem {
  id: string;
  title: string;
  reason: string;
  severity: AreaToReviewSeverity;
  suggestedAction: string;
  source?: InsightSource;
}

export interface PotentialInconsistencyItem {
  id: string;
  title: string;
  description: string;
  clauseA: {
    sectionHeading: string;
    textSnippet: string;
  };
  clauseB: {
    sectionHeading: string;
    textSnippet: string;
  };
}

export interface LegalInsightsOutput {
  documentId: string;
  generatedAt: string;
  summary: string;
  obligations: ObligationItem[];
  deadlines: DeadlineItem[];
  checklist: ChecklistTaskItem[];
  importantClauses: ImportantClauseItem[];
  areasToReview: AreaToReviewItem[];
  potentialInconsistencies: PotentialInconsistencyItem[];
  missingOrUnclearInformation: string[];
  lawyerQuestions: string[];
}

export const LEGAL_INSIGHTS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description:
        'A comprehensive, plain-language executive summary highlighting key practical takeaways, main duties, and action points.',
    },
    obligations: {
      type: 'array',
      description: 'Affirmative contractual duties and commitments explicitly stated in the document.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          responsibleParty: { type: 'string', description: 'Name or role of responsible party.' },
          partyRole: {
            type: 'string',
            enum: ['user_or_party_a', 'other_party_b', 'both_parties', 'third_party', 'unclear'],
          },
          action: { type: 'string', description: 'What must be performed or delivered.' },
          condition: { type: 'string', description: 'Conditions or circumstances under which it applies.' },
          deadline: { type: 'string', description: 'Timing or deadline as specified in the document.' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          source: {
            type: 'object',
            properties: {
              pageNumber: { type: 'number' },
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
          },
        },
        required: ['id', 'responsibleParty', 'partyRole', 'action', 'condition', 'deadline', 'confidence'],
      },
    },
    deadlines: {
      type: 'array',
      description: 'Explicit dates and relative time-based requirements extracted from the document.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          dateType: {
            type: 'string',
            enum: [
              'effective_date',
              'expiry_date',
              'payment_deadline',
              'notice_period',
              'renewal_date',
              'termination_deadline',
              'response_deadline',
              'other',
            ],
          },
          dateValue: {
            type: ['string', 'null'],
            description: 'ISO date string if explicitly provided in document; otherwise null.',
          },
          relativePeriod: {
            type: 'string',
            description: 'The relative timeframe stated in the contract, e.g. "within 30 days of receiving notice".',
          },
          trigger: {
            type: 'string',
            description: 'The triggering condition or event, or "None specified".',
          },
          responsibleParty: { type: 'string' },
          description: { type: 'string' },
          source: {
            type: 'object',
            properties: {
              pageNumber: { type: 'number' },
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
          },
        },
        required: ['id', 'title', 'dateType', 'relativePeriod', 'trigger', 'responsibleParty', 'description'],
      },
    },
    checklist: {
      type: 'array',
      description: 'Practical, actionable action tasks derived strictly from the explicit obligations.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          task: { type: 'string', description: 'Action item in clear, direct language.' },
          responsibleParty: { type: 'string' },
          deadline: { type: 'string' },
          category: { type: 'string' },
          status: {
            type: 'string',
            enum: ['not_started', 'in_progress', 'completed'],
          },
          source: {
            type: 'object',
            properties: {
              pageNumber: { type: 'number' },
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
          },
        },
        required: ['id', 'task', 'responsibleParty', 'deadline', 'category', 'status'],
      },
    },
    importantClauses: {
      type: 'array',
      description: 'Important legal clauses found in the document.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: {
            type: 'string',
            enum: [
              'Termination',
              'Payment',
              'Confidentiality',
              'Liability',
              'Indemnification',
              'Intellectual Property',
              'Renewal',
              'Notice',
              'Dispute Resolution',
              'Governing Law',
              'Data/Privacy',
              'Non-compete',
              'Non-solicitation',
              'Representations',
              'Warranties',
              'Other',
            ],
          },
          title: { type: 'string' },
          verbatimSnippet: { type: 'string' },
          plainLanguageExplanation: { type: 'string' },
          requirement: { type: 'string' },
          affectedParty: { type: 'string' },
          source: {
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
          'category',
          'title',
          'verbatimSnippet',
          'plainLanguageExplanation',
          'requirement',
          'affectedParty',
        ],
      },
    },
    areasToReview: {
      type: 'array',
      description: 'Provisions that may warrant closer inspection without making definitive legal verdicts.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          reason: { type: 'string' },
          severity: {
            type: 'string',
            enum: ['informational', 'potentially_significant'],
          },
          suggestedAction: { type: 'string' },
          source: {
            type: 'object',
            properties: {
              pageNumber: { type: 'number' },
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
          },
        },
        required: ['id', 'title', 'reason', 'severity', 'suggestedAction'],
      },
    },
    potentialInconsistencies: {
      type: 'array',
      description:
        'Contradictions or discrepancies between different provisions in the agreement (e.g. conflicting notice periods or amounts). Only report if both provisions actually exist.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          clauseA: {
            type: 'object',
            properties: {
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
            required: ['sectionHeading', 'textSnippet'],
          },
          clauseB: {
            type: 'object',
            properties: {
              sectionHeading: { type: 'string' },
              textSnippet: { type: 'string' },
            },
            required: ['sectionHeading', 'textSnippet'],
          },
        },
        required: ['id', 'title', 'description', 'clauseA', 'clauseB'],
      },
    },
    missingOrUnclearInformation: {
      type: 'array',
      description:
        'Genuine ambiguities, missing dates, or unstated terms explicitly mentioned but not provided in the document.',
      items: { type: 'string' },
    },
    lawyerQuestions: {
      type: 'array',
      description: 'Constructive questions the user should consider asking a qualified legal attorney.',
      items: { type: 'string' },
    },
  },
  required: [
    'summary',
    'obligations',
    'deadlines',
    'checklist',
    'importantClauses',
    'areasToReview',
    'potentialInconsistencies',
    'missingOrUnclearInformation',
    'lawyerQuestions',
  ],
};

export function validateLegalInsightsOutput(data: unknown): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Legal insights output is not an object.'] };
  }

  const obj = data as Record<string, any>;

  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) {
    errors.push('Missing or invalid "summary" string.');
  }

  if (!Array.isArray(obj.obligations)) {
    errors.push('"obligations" must be an array.');
  }

  if (!Array.isArray(obj.deadlines)) {
    errors.push('"deadlines" must be an array.');
  }

  if (!Array.isArray(obj.checklist)) {
    errors.push('"checklist" must be an array.');
  }

  if (!Array.isArray(obj.importantClauses)) {
    errors.push('"importantClauses" must be an array.');
  }

  if (!Array.isArray(obj.areasToReview)) {
    errors.push('"areasToReview" must be an array.');
  }

  if (!Array.isArray(obj.potentialInconsistencies)) {
    errors.push('"potentialInconsistencies" must be an array.');
  }

  if (!Array.isArray(obj.missingOrUnclearInformation)) {
    errors.push('"missingOrUnclearInformation" must be an array.');
  }

  if (!Array.isArray(obj.lawyerQuestions)) {
    errors.push('"lawyerQuestions" must be an array.');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
