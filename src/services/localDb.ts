/**
 * LegalLens AI — Local-First Browser IndexedDB Storage Engine
 * 
 * Provides robust, zero-configuration local persistence for:
 * - Documents (metadata, extracted text, page & word counts)
 * - Raw Files & Blobs (PDF, DOCX, TXT) from internal storage
 * - Document Versions
 * - AI Chat Conversations & Messages
 * - Legal Analyses, Insights, and Document Comparisons
 * 
 * Guarantees that users can upload documents from their internal computer
 * storage without requiring Firebase Cloud Storage or Firestore permissions.
 */

import { DocumentRecord, DocumentVersion } from '../types/document';
import { ChatConversation, ChatMessage } from '../types/chat';
import { AnalysisRecord } from '../types/analysis';
import { InsightRecord } from '../types/insight';
import { ComparisonRecord } from '../types/comparison';

const DB_NAME = 'legallens_ai_local_store';
const DB_VERSION = 2;

type EventCallback = (data: any) => void;

class LocalDb {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('legallens_local_sync');
        this.broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type) {
            this.emitLocal(type, data);
          }
        };
      } catch {
        // BroadcastChannel unavailable or restricted
      }
    }
  }

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('userId', 'userId', { unique: false });
          docStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        }

        // 2. Binary files store (Blobs/Files from internal storage)
        if (!db.objectStoreNames.contains('document_files')) {
          db.createObjectStore('document_files', { keyPath: 'id' });
        }

        // 3. Document versions
        if (!db.objectStoreNames.contains('versions')) {
          const verStore = db.createObjectStore('versions', { keyPath: 'id' });
          verStore.createIndex('documentId', 'documentId', { unique: false });
          verStore.createIndex('userId', 'userId', { unique: false });
        }

        // 4. Version files
        if (!db.objectStoreNames.contains('version_files')) {
          db.createObjectStore('version_files', { keyPath: 'id' });
        }

        // 5. Chat conversations
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
          convStore.createIndex('documentId', 'documentId', { unique: false });
          convStore.createIndex('userId', 'userId', { unique: false });
        }

        // 6. Chat messages
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('conversationId', 'conversationId', { unique: false });
          msgStore.createIndex('documentId', 'documentId', { unique: false });
        }

        // 7. Legal analyses
        if (!db.objectStoreNames.contains('analyses')) {
          const anaStore = db.createObjectStore('analyses', { keyPath: 'id' });
          anaStore.createIndex('documentId', 'documentId', { unique: false });
          anaStore.createIndex('userId', 'userId', { unique: false });
        }

        // 8. Legal insights
        if (!db.objectStoreNames.contains('insights')) {
          const insStore = db.createObjectStore('insights', { keyPath: 'id' });
          insStore.createIndex('documentId', 'documentId', { unique: false });
          insStore.createIndex('userId', 'userId', { unique: false });
        }

        // 9. Checklist items
        if (!db.objectStoreNames.contains('checklist_items')) {
          const checkStore = db.createObjectStore('checklist_items', { keyPath: 'id' });
          checkStore.createIndex('documentId', 'documentId', { unique: false });
          checkStore.createIndex('userId', 'userId', { unique: false });
        }

        // 10. Comparisons
        if (!db.objectStoreNames.contains('comparisons')) {
          const compStore = db.createObjectStore('comparisons', { keyPath: 'id' });
          compStore.createIndex('userId', 'userId', { unique: false });
        }

        // 11. Unified conversations & messages
        if (!db.objectStoreNames.contains('unified_conversations')) {
          const uConvStore = db.createObjectStore('unified_conversations', { keyPath: 'id' });
          uConvStore.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('unified_messages')) {
          const uMsgStore = db.createObjectStore('unified_messages', { keyPath: 'id' });
          uMsgStore.createIndex('conversationId', 'conversationId', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // --- Pub / Sub Event System ---
  public subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  private emit(eventType: string, data?: any) {
    this.emitLocal(eventType, data);
    try {
      this.broadcastChannel?.postMessage({ type: eventType, data });
    } catch {
      // ignore channel post error
    }
  }

  private emitLocal(eventType: string, data?: any) {
    const subs = this.listeners.get(eventType);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.warn(`Error in localDb listener for ${eventType}:`, e);
        }
      });
    }
  }

  // --- Generic Store Operations ---
  private async put<T>(storeName: string, item: T): Promise<T> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  private async get<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  private async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Document Operations ---
  async saveDocument(doc: DocumentRecord): Promise<void> {
    await this.put('documents', doc);
    this.emit('documents_changed', doc.userId);
    this.emit(`document_${doc.id}`, doc);
  }

  async updateDocument(documentId: string, updates: Partial<DocumentRecord>): Promise<DocumentRecord | null> {
    const existing = await this.getDocument(documentId);
    if (!existing) return null;
    const updated: DocumentRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.put('documents', updated);
    this.emit('documents_changed', updated.userId);
    this.emit(`document_${documentId}`, updated);
    return updated;
  }

  async getDocument(documentId: string): Promise<DocumentRecord | null> {
    return this.get<DocumentRecord>('documents', documentId);
  }

  async getUserDocuments(userId: string): Promise<DocumentRecord[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const index = store.index('userId');
      const req = index.getAll(userId);
      req.onsuccess = () => {
        const results = (req.result || []) as DocumentRecord[];
        // Sort descending by uploadedAt
        results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    await this.delete('documents', documentId);
    await this.delete('document_files', documentId);
    
    // Also clean up related versions, chats, analyses, insights
    try {
      const versions = await this.getDocumentVersions(documentId);
      for (const v of versions) {
        await this.delete('versions', v.id);
        await this.delete('version_files', v.id);
      }
      const convs = await this.getConversations(documentId, userId);
      for (const c of convs) {
        await this.delete('conversations', c.id);
      }
    } catch (e) {
      console.warn('Local cleanup notice:', e);
    }

    this.emit('documents_changed', userId);
    this.emit(`document_${documentId}`, null);
  }

  // --- Document Binary File Operations ---
  async saveDocumentFile(documentId: string, file: Blob | File, fileName?: string): Promise<void> {
    await this.put('document_files', {
      id: documentId,
      file,
      fileName: fileName || (file instanceof File ? file.name : 'document'),
      mimeType: file.type || 'application/octet-stream',
      updatedAt: new Date().toISOString(),
    });
  }

  async getDocumentFile(documentId: string): Promise<{ file: Blob; fileName: string; mimeType: string } | null> {
    return this.get('document_files', documentId);
  }

  // --- Version Operations ---
  async saveVersion(version: DocumentVersion): Promise<void> {
    await this.put('versions', version);
    this.emit(`versions_${version.documentId}`, version);
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('versions', 'readonly');
      const store = tx.objectStore('versions');
      const index = store.index('documentId');
      const req = index.getAll(documentId);
      req.onsuccess = () => {
        const results = (req.result || []) as DocumentVersion[];
        results.sort((a, b) => (b.versionNumber || 1) - (a.versionNumber || 1));
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveVersionFile(versionId: string, file: Blob | File): Promise<void> {
    await this.put('version_files', {
      id: versionId,
      file,
      updatedAt: new Date().toISOString(),
    });
  }

  async getVersionFile(versionId: string): Promise<{ file: Blob } | null> {
    return this.get('version_files', versionId);
  }

  // --- Chat Operations ---
  async saveConversation(conv: ChatConversation): Promise<void> {
    await this.put('conversations', conv);
    this.emit(`conversations_${conv.documentId}`, conv);
  }

  async getConversations(documentId: string, userId: string): Promise<ChatConversation[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('conversations', 'readonly');
      const store = tx.objectStore('conversations');
      const index = store.index('documentId');
      const req = index.getAll(documentId);
      req.onsuccess = () => {
        const results = ((req.result || []) as ChatConversation[])
          .filter((c) => c.userId === userId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteConversation(conversationId: string, documentId: string): Promise<void> {
    await this.delete('conversations', conversationId);
    this.emit(`conversations_${documentId}`, null);
  }

  async saveMessage(documentId: string, message: ChatMessage): Promise<void> {
    await this.put('messages', { ...message, documentId });
    this.emit(`messages_${message.conversationId}`, message);
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const index = store.index('conversationId');
      const req = index.getAll(conversationId);
      req.onsuccess = () => {
        const results = (req.result || []) as ChatMessage[];
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // --- Legal Analysis Operations ---
  async saveAnalysis(record: AnalysisRecord): Promise<void> {
    await this.put('analyses', record);
    this.emit(`analyses_${record.documentId}`, record);
  }

  async getAnalyses(documentId: string): Promise<AnalysisRecord[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('analyses', 'readonly');
      const store = tx.objectStore('analyses');
      const index = store.index('documentId');
      const req = index.getAll(documentId);
      req.onsuccess = () => {
        const results = (req.result || []) as AnalysisRecord[];
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // --- Legal Insights Operations ---
  async saveInsight(record: InsightRecord): Promise<void> {
    await this.put('insights', record);
    this.emit(`insights_${record.documentId}`, record);
  }

  async getLatestInsight(documentId: string): Promise<InsightRecord | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('insights', 'readonly');
      const store = tx.objectStore('insights');
      const index = store.index('documentId');
      const req = index.getAll(documentId);
      req.onsuccess = () => {
        const results = (req.result || []) as InsightRecord[];
        if (results.length === 0) return resolve(null);
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(results[0]);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // --- Document Comparison Operations ---
  async saveComparison(record: ComparisonRecord): Promise<void> {
    await this.put('comparisons', record);
    this.emit(`comparisons_${record.userId}`, record);
  }

  async getComparisons(userId: string): Promise<ComparisonRecord[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('comparisons', 'readonly');
      const store = tx.objectStore('comparisons');
      const index = store.index('userId');
      const req = index.getAll(userId);
      req.onsuccess = () => {
        const results = (req.result || []) as ComparisonRecord[];
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getComparison(comparisonId: string): Promise<ComparisonRecord | null> {
    return this.get<ComparisonRecord>('comparisons', comparisonId);
  }

  async deleteComparison(comparisonId: string, userId: string): Promise<void> {
    await this.delete('comparisons', comparisonId);
    this.emit(`comparisons_${userId}`, null);
  }
}

export const localDb = new LocalDb();
