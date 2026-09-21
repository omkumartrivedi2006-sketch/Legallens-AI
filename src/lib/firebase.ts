import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';

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

const shouldUseEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const emulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL || 'http://localhost:9099';

try {
  if (isFirebaseConfigured() || shouldUseEmulator) {
    app = getApps().length > 0 ? getApp() : initializeApp(
      isFirebaseConfigured() ? firebaseConfig : {
        ...firebaseConfig,
        apiKey: 'demo-api-key',
        projectId: 'demo-legallens-ai',
      }
    );
    auth = getAuth(app);

    if (shouldUseEmulator && auth) {
      connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true });
    }
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export { app, auth };
