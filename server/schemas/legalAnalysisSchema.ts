export interface Party {
  name: string;
  role: string;
  details?: string;
}

export interface ImportantDate {
  title: string;
  dateString: string;
  significance: string;
  sourceReference?: string;
}

export interface KeyObligation {
  party: string;
  obligation: string;
  frequencyOrCondition?: string;
  sourceReference?: string;
}

export interface ImportantClause {
  title: string;
  verbatimSnippet?: string;
  simpleExplanation: string;
  whyItMatters: string;
  sourceReference?: string;
}

export interface PotentialConcern {
  issueTitle: string;
  explanation: string;
  suggestedActionOrQuestion: string;
  sourceReference?: string;
}

export interface LegalAnalysisOutput {
  summary: string;
  documentType: string;
  confidence: 'high' | 'medium' | 'low';
  parties: Party[];
  importantDates: ImportantDate[];
  keyObligations: KeyObligation[];
  importantClauses: ImportantClause[];
  potentialConcerns: PotentialConcern[];
  missingOrUnclearInformation: string[];
  lawyerQuestions: string[];
}

export const LEGAL_ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A plain-language executive summary of the document, explaining its primary purpose and context in clear terms.',
    },
    documentType: {
      type: 'string',
      description: 'The likely classification of the legal agreement (e.g. Non-Disclosure Agreement, Employment Agreement, Commercial Lease, Terms of Service). If uncertain, indicate uncertainty.',
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'Confidence in the classification and parsing completeness.',
    },
    parties: {
      type: 'array',
      description: 'Identified parties explicitly named in the document.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Legal name or entity title.' },
          role: { type: 'string', description: 'Defined role in agreement (e.g., Employer, Disclosing Party, Tenant).' },
          details: { type: 'string', description: 'Entity type, state of incorporation, or address if explicitly mentioned.' },
        },
        required: ['name', 'role'],
      },
    },
    importantDates: {
      type: 'array',
      description: 'Key dates such as effective date, termination deadline, renewal date, or notice periods.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Label of the date or deadline.' },
          dateString: { type: 'string', description: 'The date or time period as stated in the document.' },
          significance: { type: 'string', description: 'Why this milestone or date matters practically.' },
          sourceReference: { type: 'string', description: 'Section or page reference if available.' },
        },
        required: ['title', 'dateString', 'significance'],
      },
    },
    keyObligations: {
      type: 'array',
      description: 'Meaningful contractual commitments and affirmative duties for each party.',
      items: {
        type: 'object',
        properties: {
          party: { type: 'string', description: 'Which party bears this obligation.' },
          obligation: { type: 'string', description: 'Description of what must be performed or delivered.' },
          frequencyOrCondition: { type: 'string', description: 'Condition, timing, or schedule under which it applies.' },
          sourceReference: { type: 'string', description: 'Section or page citation.' },
        },
        required: ['party', 'obligation'],
      },
    },
    importantClauses: {
      type: 'array',
      description: 'Critical standard clauses found in the document (e.g. Termination, Liability, Confidentiality, Indemnification, Governing Law, IP).',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Clause topic title.' },
          verbatimSnippet: { type: 'string', description: 'Short relevant excerpt from the text if applicable.' },
          simpleExplanation: { type: 'string', description: 'Plain English explanation of what this clause means.' },
          whyItMatters: { type: 'string', description: 'Practical importance or business impact.' },
          sourceReference: { type: 'string', description: 'Section heading or page number.' },
        },
        required: ['title', 'simpleExplanation', 'whyItMatters'],
      },
    },
    potentialConcerns: {
      type: 'array',
      description: 'Provisions that may warrant closer inspection by a legal professional. Phrased neutrally without legal conclusions.',
      items: {
        type: 'object',
        properties: {
          issueTitle: { type: 'string', description: 'Short summary of the potential point of attention.' },
          explanation: { type: 'string', description: 'Neutral explanation of why this provision may deserve closer review.' },
          suggestedActionOrQuestion: { type: 'string', description: 'Constructive question or topic to discuss with counsel.' },
          sourceReference: { type: 'string', description: 'Section or page reference.' },
        },
        required: ['issueTitle', 'explanation', 'suggestedActionOrQuestion'],
      },
    },
    missingOrUnclearInformation: {
      type: 'array',
      description: 'Ambiguities, missing schedules, blank dates, or unspecified terms found in the document.',
      items: { type: 'string' },
    },
    lawyerQuestions: {
      type: 'array',
      description: 'Grounded, high-value questions the user can ask an attorney about this specific agreement.',
      items: { type: 'string' },
    },
  },
  required: [
    'summary',
    'documentType',
    'confidence',
    'parties',
    'importantDates',
    'keyObligations',
    'importantClauses',
    'potentialConcerns',
    'missingOrUnclearInformation',
    'lawyerQuestions',
  ],
};

export function validateLegalAnalysisOutput(data: unknown): { valid: boolean; errors?: string[] } {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Response is not a valid JSON object.'] };
  }

  const obj = data as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    errors.push('Missing or empty summary.');
  }

  if (typeof obj.documentType !== 'string' || !obj.documentType.trim()) {
    errors.push('Missing or empty documentType.');
  }

  if (!Array.isArray(obj.parties)) {
    errors.push('Parties must be an array.');
  }

  if (!Array.isArray(obj.importantDates)) {
    errors.push('Important dates must be an array.');
  }

  if (!Array.isArray(obj.keyObligations)) {
    errors.push('Key obligations must be an array.');
  }

  if (!Array.isArray(obj.importantClauses)) {
    errors.push('Important clauses must be an array.');
  }

  if (!Array.isArray(obj.potentialConcerns)) {
    errors.push('Potential concerns must be an array.');
  }

  if (!Array.isArray(obj.missingOrUnclearInformation)) {
    errors.push('Missing or unclear information must be an array.');
  }

  if (!Array.isArray(obj.lawyerQuestions)) {
    errors.push('Lawyer questions must be an array.');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
