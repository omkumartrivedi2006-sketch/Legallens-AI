import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== '' &&
    firebaseConfig.projectId !== ''
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const shouldUseEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const authEmulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099';
const firestoreEmulatorHost = import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_HOST || 'localhost';
const firestoreEmulatorPort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT) || 8080;
const storageEmulatorHost = import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_HOST || 'localhost';
const storageEmulatorPort = Number(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT) || 9199;

try {
  if (isFirebaseConfigured() || shouldUseEmulator) {
    app = getApps().length > 0 ? getApp() : initializeApp(
      isFirebaseConfigured() ? firebaseConfig : {
        ...firebaseConfig,
        apiKey: 'demo-api-key',
        projectId: 'demo-legallens-ai',
        storageBucket: 'demo-legallens-ai.appspot.com',
      }
    );
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    if (shouldUseEmulator) {
      if (auth) {
        connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
      }
      if (db) {
        connectFirestoreEmulator(db, firestoreEmulatorHost, firestoreEmulatorPort);
      }
      if (storage) {
        connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
      }
    }
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export { app, auth, db, storage };

