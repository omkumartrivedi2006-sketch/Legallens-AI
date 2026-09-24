/**
 * LegalLens AI — Legal Document Comparison & Difference Analysis Types
 */

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

export interface ComparisonDocumentMeta {
  id: string;
  name: string;
  fileType: string;
  wordCount?: number;
  pageCount?: number;
  versionId?: string;
  versionNumber?: number;
}

export interface ComparisonResult {
  documentA: ComparisonDocumentMeta;
  documentB: ComparisonDocumentMeta;
  summary: ComparisonSummary;
  changes: ComparisonChange[];
  unchangedSections: string[];
}

export interface ComparisonRecord {
  id: string;
  comparisonId: string;
  userId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: 'completed' | 'failed';
  model: string;
  comparisonVersion: string;
  result: ComparisonResult;
}

export interface AlignedSectionDiff {
  sectionKey: string;
  headingA?: string;
  headingB?: string;
  textA?: string;
  textB?: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
}
