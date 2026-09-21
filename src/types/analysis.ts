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

export interface LegalAnalysisResult {
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

export interface AnalysisRecord {
  id: string;
  analysisId: string;
  documentId: string;
  userId: string;
  createdAt: string; // ISO 8601
  model: string;
  analysisVersion: string; // "1.0"
  status: 'processing' | 'completed' | 'failed';
  result?: LegalAnalysisResult;
  errorMessage?: string;
}
