/**
 * LegalLens AI — Document-Grounded Chat & Legal Q&A Types
 */

export interface ChatSource {
  chunkId: string;
  sectionHeading?: string;
  pageNumber?: number;
  textSnippet?: string;
}

export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  versionId?: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string; // ISO string
  sources?: ChatSource[];
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatConversation {
  id: string;
  documentId: string;
  versionId?: string;
  userId: string;
  title: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  messageCount?: number;
}

export interface DocumentChunk {
  chunkId: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  sectionHeading?: string;
  pageNumber?: number;
  startPosition: number;
  endPosition: number;
}

export interface SendChatMessagePayload {
  documentId: string;
  versionId?: string;
  conversationId: string;
  message: string;
  fileName: string;
  fileType: string;
  extractedText: string;
  processingStatus?: string;
}

export interface SendChatMessageResponse {
  success: boolean;
  message: ChatMessage;
  conversationTitle?: string;
}
