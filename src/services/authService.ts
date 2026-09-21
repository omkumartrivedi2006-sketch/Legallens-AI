import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, isFirebaseConfigured } from '../lib/firebase';

export class UnconfiguredFirebaseError extends Error {
  constructor(message = 'Firebase is not configured. Please add your credentials to .env.local') {
    super(message);
    this.name = 'UnconfiguredFirebaseError';
  }
}

export function mapFirebaseError(error: unknown): string {
  if (error instanceof UnconfiguredFirebaseError) {
    return 'Firebase is not configured. Please provide your Firebase API key in .env.local to enable real authentication.';
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/invalid-email':
        return 'The email address format is invalid. Please check and try again.';
      case 'auth/weak-password':
        return 'The password is too weak. Please choose a password with at least 6 characters.';
      case 'auth/user-not-found':
        return 'No account was found with this email. Please check your email or create an account.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or use the forgot password link.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your information and try again.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful attempts. Access has been temporarily restricted. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network connection failure. Please check your internet connection and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window was closed before completing authentication.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in request was cancelled.';
      case 'auth/operation-not-allowed':
        return 'This authentication provider is not enabled in the Firebase console.';
      default:
        return error.message || 'Unable to authenticate. Please check your details and try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

export const authService = {
  async registerWithEmail(name: string, email: string, password: string): Promise<User> {
    if (!auth) {
      throw new UnconfiguredFirebaseError();
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    if (name.trim()) {
      await updateProfile(user, {
        displayName: name.trim(),
      });
    }

    return user;
  },

  async loginWithEmail(email: string, password: string): Promise<User> {
    if (!auth) {
      throw new UnconfiguredFirebaseError();
    }

    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  },

  async loginWithGoogle(): Promise<User> {
    if (!auth) {
      throw new UnconfiguredFirebaseError();
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  },

  async sendPasswordReset(email: string): Promise<void> {
    if (!auth) {
      throw new UnconfiguredFirebaseError();
    }

    await sendPasswordResetEmail(auth, email.trim());
  },

  async logout(): Promise<void> {
    if (!auth) {
      return;
    }

    await signOut(auth);
  },

  isConfigured(): boolean {
    return isFirebaseConfigured();
  },
};
