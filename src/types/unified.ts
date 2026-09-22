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

export type UnifiedMessageClassification = 'from_documents' | 'general_legal' | 'not_found';

export interface UnifiedMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sources?: UnifiedSource[];
  potentialConflicts?: UnifiedConflict[];
  keyTakeaways?: string[];
  isDocumentGrounded?: boolean;
  classification?: UnifiedMessageClassification;
  model?: string;
  suggestedTitle?: string;
}

export interface UnifiedConversation {
  id: string;
  userId: string;
  title: string;
  selectedDocumentIds: string[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

export interface UnifiedSearchMatch {
  documentId: string;
  documentName: string;
  fileType: string;
  sectionHeading: string;
  pageNumber: number | null;
  snippet: string;
  highlightedSnippet: string;
  matchScore: number;
}

export interface UnifiedSearchResponse {
  query: string;
  clauseCategory?: string;
  totalMatches: number;
  results: UnifiedSearchMatch[];
}

export interface ClauseCategoryOption {
  id: string;
  label: string;
  description: string;
}

export const COMMON_CLAUSE_CATEGORIES: ClauseCategoryOption[] = [
  { id: 'termination', label: 'Termination', description: 'Cancellation, exit rights, breach, and expiration' },
  { id: 'payment', label: 'Payment & Fees', description: 'Compensation, invoices, dues, and currency' },
  { id: 'notice', label: 'Notice Periods', description: 'Written notice requirements and delivery rules' },
  { id: 'confidentiality', label: 'Confidentiality', description: 'Non-disclosure, trade secrets, and proprietary data' },
  { id: 'liability', label: 'Liability', description: 'Damages caps, consequential damages, and exclusions' },
  { id: 'indemnification', label: 'Indemnification', description: 'Hold harmless, defense, and third-party claims' },
  { id: 'renewal', label: 'Renewal & Term', description: 'Contract duration, evergreen terms, and extensions' },
  { id: 'governing_law', label: 'Governing Law', description: 'Jurisdiction, venue, and arbitration provisions' },
];
