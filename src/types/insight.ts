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

export interface InsightRecord {
  id: string;
  insightId: string;
  documentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  analysisVersion: string;
  status: 'completed' | 'failed';
  result: LegalInsightsOutput;
}
