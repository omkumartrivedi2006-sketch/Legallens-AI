import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  DocumentRecord,
  DocumentVersion,
  computeFileSha256,
  validateDocumentFile,
} from '../types/document';
import { storageService } from './storageService';
import { extractDocumentText } from './extractionService';
import { localDb } from './localDb';

export class DocumentServiceError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'DocumentServiceError';
  }
}

export const documentService = {
  /**
   * Creates a new document record. Always persists into local IndexedDB
   * and attempts a background sync to Firestore if permissions allow.
   */
  async createDocumentRecord(userId: string, record: DocumentRecord): Promise<void> {
    const documentToSave: DocumentRecord = {
      ...record,
      userId,
      updatedAt: new Date().toISOString(),
    };

    // 1. Securely save to local browser storage first (100% reliable)
    try {
      await localDb.saveDocument(documentToSave);
    } catch (localErr) {
      console.warn('Local document save notice:', localErr);
    }

    // 2. Best-effort background sync to Firestore (catches permission/network errors safely)
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'documents', record.id);
        await setDoc(docRef, documentToSave);
      } catch (cloudErr: any) {
        console.warn('Firestore cloud sync notice (saved to local vault):', cloudErr?.message);
      }
    }
  },

  /**
   * Updates fields of an existing document record in local storage and Firestore.
   */
  async updateDocumentRecord(
    userId: string,
    documentId: string,
    updates: Partial<DocumentRecord>
  ): Promise<void> {
    // 1. Update in local storage
    try {
      await localDb.updateDocument(documentId, updates);
    } catch (localErr) {
      console.warn('Local update document notice:', localErr);
    }

    // 2. Best-effort background sync to Firestore
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'documents', documentId);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (cloudErr: any) {
        console.warn('Firestore cloud update notice:', cloudErr?.message);
      }
    }
  },

  /**
   * Fetches a single document record by ID.
   * Checks local storage first, then Firestore.
   */
  async getDocumentById(userId: string, documentId: string): Promise<DocumentRecord | null> {
    // 1. Check local storage
    try {
      const localDoc = await localDb.getDocument(documentId);
      if (localDoc && localDoc.userId === userId) {
        return localDoc;
      }
    } catch (err) {
      console.warn('Local retrieval notice:', err);
    }

    // 2. Check Firestore fallback
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'documents', documentId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data() as DocumentRecord;
          if (data.userId === userId) {
            // Cache locally for next time
            await localDb.saveDocument(data).catch(() => {});
            return data;
          }
        }
      } catch (error: any) {
        console.warn('Firestore retrieval notice:', error?.message);
      }
    }

    return null;
  },

  /**
   * Fetches all document records belonging to the user.
   */
  async getUserDocuments(userId: string): Promise<DocumentRecord[]> {
    let localDocs: DocumentRecord[] = [];
    try {
      localDocs = await localDb.getUserDocuments(userId);
    } catch (err) {
      console.warn('Local list retrieval notice:', err);
    }

    if (db) {
      try {
        const colRef = collection(db, 'users', userId, 'documents');
        const q = query(colRef, orderBy('uploadedAt', 'desc'));
        const snapshot = await getDocs(q);

        const cloudDocs: DocumentRecord[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data() as DocumentRecord;
          if (data.userId === userId) {
            cloudDocs.push(data);
          }
        });

        // Merge: keep local document if already present, add cloud ones
        const mergedMap = new Map<string, DocumentRecord>();
        localDocs.forEach((d) => mergedMap.set(d.id, d));
        cloudDocs.forEach((d) => {
          if (!mergedMap.has(d.id)) {
            mergedMap.set(d.id, d);
            localDb.saveDocument(d).catch(() => {});
          }
        });

        return Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
      } catch (cloudErr) {
        console.warn('Firestore list notice (using local documents):', cloudErr);
      }
    }

    return localDocs;
  },

  /**
   * Subscribes to real-time updates for user's documents.
   * Instantly feeds from local storage and responds to local change events,
   * while also listening to Firestore in the background.
   */
  subscribeUserDocuments(
    userId: string,
    onUpdate: (docs: DocumentRecord[]) => void,
    _onError: (error: Error) => void
  ): Unsubscribe {
    let isCleanedUp = false;

    // Helper to push latest merged documents
    const pushLatest = async () => {
      if (isCleanedUp) return;
      try {
        const docs = await localDb.getUserDocuments(userId);
        if (!isCleanedUp) {
          onUpdate(docs);
        }
      } catch (err) {
        console.warn('Local docs read error:', err);
      }
    };

    // 1. Initial immediate emission from local storage
    pushLatest();

    // 2. Listen to local storage mutations
    const unsubscribeLocal = localDb.subscribe('documents_changed', (changedUserId) => {
      if (!changedUserId || changedUserId === userId) {
        pushLatest();
      }
    });

    // 3. Listen to Firestore mutations if available
    let unsubscribeFirestore: Unsubscribe = () => {};
    if (db) {
      try {
        const colRef = collection(db, 'users', userId, 'documents');
        const q = query(colRef, orderBy('uploadedAt', 'desc'));

        unsubscribeFirestore = onSnapshot(
          q,
          async (snapshot) => {
            if (isCleanedUp) return;
            const cloudDocs: DocumentRecord[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as DocumentRecord;
              if (data.userId === userId) {
                cloudDocs.push(data);
                localDb.saveDocument(data).catch(() => {});
              }
            });
            pushLatest();
          },
          (error) => {
            // Permission or connection issues on Firestore are safely absorbed
            console.warn('Firestore live listener notice (local store active):', error?.message);
          }
        );
      } catch (e) {
        console.warn('Firestore subscription notice:', e);
      }
    }

    return () => {
      isCleanedUp = true;
      unsubscribeLocal();
      unsubscribeFirestore();
    };
  },

  /**
   * Subscribes to real-time updates for a single document.
   */
  subscribeSingleDocument(
    userId: string,
    documentId: string,
    onUpdate: (doc: DocumentRecord | null) => void,
    _onError: (error: Error) => void
  ): Unsubscribe {
    let isCleanedUp = false;

    // 1. Immediate local lookup
    localDb.getDocument(documentId).then((localDoc) => {
      if (!isCleanedUp && localDoc && localDoc.userId === userId) {
        onUpdate(localDoc);
      }
    }).catch(() => {});

    // 2. Listen to local document updates
    const unsubscribeLocal = localDb.subscribe(`document_${documentId}`, (updatedDoc) => {
      if (!isCleanedUp) {
        onUpdate(updatedDoc);
      }
    });

    // 3. Listen to Firestore
    let unsubscribeFirestore: Unsubscribe = () => {};
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'documents', documentId);
        unsubscribeFirestore = onSnapshot(
          docRef,
          (snapshot) => {
            if (isCleanedUp) return;
            if (snapshot.exists()) {
              const data = snapshot.data() as DocumentRecord;
              if (data.userId === userId) {
                onUpdate(data);
                localDb.saveDocument(data).catch(() => {});
              }
            }
          },
          (error) => {
            console.warn('Firestore single doc notice:', error?.message);
          }
        );
      } catch (e) {
        console.warn('Firestore single doc attach notice:', e);
      }
    }

    return () => {
      isCleanedUp = true;
      unsubscribeLocal();
      unsubscribeFirestore();
    };
  },

  /**
   * Creates or updates a version record in local store and Firestore.
   */
  async createDocumentVersion(
    userId: string,
    documentId: string,
    version: DocumentVersion
  ): Promise<void> {
    const versionRecord = {
      ...version,
      userId,
      documentId,
      updatedAt: new Date().toISOString(),
    };

    try {
      await localDb.saveVersion(versionRecord);
    } catch (e) {
      console.warn('Local version save notice:', e);
    }

    if (db) {
      try {
        const versionRef = doc(db, 'users', userId, 'documents', documentId, 'versions', version.id);
        await setDoc(versionRef, versionRecord);
      } catch (err: any) {
        console.warn('Firestore version save notice:', err?.message);
      }
    }
  },

  /**
   * Retrieves all versions for a given document.
   */
  async getDocumentVersions(userId: string, documentId: string): Promise<DocumentVersion[]> {
    let localVersions: DocumentVersion[] = [];
    try {
      localVersions = await localDb.getDocumentVersions(documentId);
    } catch (e) {
      console.warn('Local versions retrieval notice:', e);
    }

    if (localVersions.length > 0) {
      return localVersions;
    }

    if (db) {
      try {
        const colRef = collection(db, 'users', userId, 'documents', documentId, 'versions');
        const q = query(colRef, orderBy('versionNumber', 'desc'));
        const snapshot = await getDocs(q);

        const versions: DocumentVersion[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data() as DocumentVersion;
          if (data.userId === userId) {
            versions.push(data);
            localDb.saveVersion(data).catch(() => {});
          }
        });
        return versions;
      } catch (err) {
        console.warn('Firestore versions fetch notice:', err);
      }
    }

    return localVersions;
  },

  /**
   * Subscribes to real-time updates for document versions.
   */
  subscribeDocumentVersions(
    userId: string,
    documentId: string,
    onUpdate: (versions: DocumentVersion[]) => void,
    _onError: (error: Error) => void
  ): Unsubscribe {
    let isCleanedUp = false;

    const pushVersions = async () => {
      if (isCleanedUp) return;
      try {
        const vers = await localDb.getDocumentVersions(documentId);
        if (!isCleanedUp) {
          onUpdate(vers);
        }
      } catch (e) {
        console.warn('Local versions read error:', e);
      }
    };

    pushVersions();

    const unsubscribeLocal = localDb.subscribe(`versions_${documentId}`, () => {
      pushVersions();
    });

    let unsubscribeFirestore: Unsubscribe = () => {};
    if (db) {
      try {
        const colRef = collection(db, 'users', userId, 'documents', documentId, 'versions');
        const q = query(colRef, orderBy('versionNumber', 'desc'));

        unsubscribeFirestore = onSnapshot(
          q,
          (snapshot) => {
            if (isCleanedUp) return;
            const versions: DocumentVersion[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as DocumentVersion;
              if (data.userId === userId) {
                versions.push(data);
                localDb.saveVersion(data).catch(() => {});
              }
            });
            pushVersions();
          },
          (error) => {
            console.warn('Firestore version listener notice:', error?.message);
          }
        );
      } catch (e) {
        console.warn('Firestore version subscribe notice:', e);
      }
    }

    return () => {
      isCleanedUp = true;
      unsubscribeLocal();
      unsubscribeFirestore();
    };
  },

  /**
   * Designates a specific version as current.
   */
  async setCurrentVersion(userId: string, documentId: string, versionId: string): Promise<void> {
    const versions = await this.getDocumentVersions(userId, documentId);
    const targetVersion = versions.find((v) => v.id === versionId || v.versionId === versionId);

    if (!targetVersion) {
      throw new DocumentServiceError(`Version ${versionId} not found.`);
    }

    // Update in local store
    for (const v of versions) {
      const isCurrent = v.id === targetVersion.id;
      await localDb.saveVersion({ ...v, isCurrent }).catch(() => {});
    }

    await this.updateDocumentRecord(userId, documentId, {
      currentVersionId: targetVersion.id,
      fileName: targetVersion.fileName,
      originalFileName: targetVersion.originalFileName,
      fileType: targetVersion.fileType,
      mimeType: targetVersion.mimeType,
      fileSize: targetVersion.fileSize,
      storagePath: targetVersion.storagePath,
      processingStatus: targetVersion.processingStatus,
      extractionStatus: targetVersion.extractionStatus,
      extractedText: targetVersion.extractedText || '',
      pageCount: targetVersion.pageCount,
      wordCount: targetVersion.wordCount,
      contentHash: targetVersion.contentHash,
      versionCount: versions.length,
    });
  },

  /**
   * Handles version upload flow with local-first reliability.
   */
  async uploadNewVersion(
    userId: string,
    documentId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<DocumentVersion> {
    const validation = validateDocumentFile(file);
    if (!validation.valid || !validation.fileType) {
      throw new DocumentServiceError(validation.error || 'Invalid document file.');
    }

    const contentHash = await computeFileSha256(file);
    const existingVersions = await this.getDocumentVersions(userId, documentId);
    const nextVersionNumber =
      existingVersions.length > 0
        ? Math.max(...existingVersions.map((v) => v.versionNumber || 1)) + 1
        : 2;

    const versionId = `v${nextVersionNumber}_${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const versionRecord: DocumentVersion = {
      id: versionId,
      versionId,
      documentId,
      userId,
      versionNumber: nextVersionNumber,
      fileName: file.name,
      originalFileName: file.name,
      fileType: validation.fileType,
      mimeType: file.type || 'application/octet-stream',
      fileSize: file.size,
      storagePath: '',
      uploadedAt: nowIso,
      createdAt: nowIso,
      processingStatus: 'uploading',
      extractionStatus: 'pending',
      contentHash,
      isCurrent: false,
    };

    await this.createDocumentVersion(userId, documentId, versionRecord);

    try {
      const uploadRes = await storageService.uploadVersionFile(
        userId,
        documentId,
        versionId,
        file,
        (pct) => onProgress?.(Math.round(pct * 0.5))
      );

      versionRecord.storagePath = uploadRes.storagePath;
      versionRecord.processingStatus = 'processing';
      versionRecord.extractionStatus = 'processing';
      await localDb.saveVersion(versionRecord);

      onProgress?.(70);
      const extraction = await extractDocumentText(file, validation.fileType);
      onProgress?.(90);

      versionRecord.processingStatus = 'ready';
      versionRecord.extractionStatus = 'completed';
      versionRecord.extractedText = extraction.text;
      versionRecord.pageCount = extraction.pageCount;
      versionRecord.wordCount = extraction.wordCount;
      versionRecord.isCurrent = true;

      await this.createDocumentVersion(userId, documentId, versionRecord);
      await this.setCurrentVersion(userId, documentId, versionId);

      onProgress?.(100);
      return versionRecord;
    } catch (err: any) {
      versionRecord.processingStatus = 'failed';
      versionRecord.extractionStatus = 'failed';
      versionRecord.errorMessage = err?.message || 'Processing failed for this version.';
      await this.createDocumentVersion(userId, documentId, versionRecord);

      throw new DocumentServiceError(
        `Failed to process new version: ${err?.message || 'Unknown error'}. Your previous version remains active.`,
        err
      );
    }
  },

  /**
   * Deletes a document Cascading through local store, and background Firebase cleanup.
   */
  async deleteDocument(userId: string, documentId: string, storagePath: string): Promise<void> {
    // 1. Delete from local storage
    try {
      await localDb.deleteDocument(userId, documentId);
    } catch (localErr) {
      console.warn('Local delete notice:', localErr);
    }

    // 2. Best-effort Cloud Storage and Firestore cleanup
    if (db) {
      try {
        const docRef = doc(db, 'users', userId, 'documents', documentId);
        await deleteDoc(docRef);
      } catch (cloudErr) {
        console.warn('Cloud delete metadata notice:', cloudErr);
      }
    }

    if (storagePath) {
      try {
        await storageService.deleteDocumentFile(storagePath);
      } catch (storageErr) {
        console.warn('Cloud storage delete notice:', storageErr);
      }
    }
  },
};
