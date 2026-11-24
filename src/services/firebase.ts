import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseClientConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'tu_firebase_api_key' &&
    firebaseConfig.apiKey.trim().length > 5
);

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

function ensureFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseClientConfigured) {
    return null;
  }
  if (!appInstance) {
    appInstance =
      getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return appInstance;
}

export function getFirebaseClientAuth(): Auth | null {
  try {
    const app = ensureFirebaseApp();
    if (!app) return null;
    if (!authInstance) {
      authInstance = getAuth(app);
      authInstance.languageCode = 'es';
    }
    return authInstance;
  } catch {
    return null;
  }
}

export const googleProvider = new GoogleAuthProvider();
// Fuerza a que siempre se abra el selector de cuentas de Google con todas las cuentas abiertas en el navegador
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
};
export type { User };
