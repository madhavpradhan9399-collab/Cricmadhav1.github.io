
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyA31AWf6DTtcLFXO_Z8GcQozzr5i5ereIc",
  authDomain: "madhcric-scoreb.firebaseapp.com",
  projectId: "madhcric-scoreb",
  storageBucket: "madhcric-scoreb.appspot.com",
  messagingSenderId: "15203621917",
  appId: "1:15203621917:web:2686eeb932baef06397af4",
  measurementId: "G-TR4P7229DW"
};

// Singleton pattern to ensure Firebase is only initialized once.
let firebaseServices: { app: FirebaseApp; db: Firestore; auth: Auth; isConfigured: true } | { app: null; db: null; auth: null; isConfigured: false } | null = null;

/**
 * Initializes Firebase services on the first call and returns the memoized instance on subsequent calls.
 * This lazy initialization prevents race conditions during the app's initial module loading.
 * @returns An object containing the Firestore instance (`db`), Auth instance (`auth`), and a configuration status flag (`isConfigured`).
 */
export function getFirebase() {
  if (firebaseServices) {
    return firebaseServices;
  }
  
  const isProperlyConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

  if (isProperlyConfigured) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      const db = getFirestore(app);
      const auth = getAuth(app);
      firebaseServices = { app, db, auth, isConfigured: true };
    } catch (error) {
      console.error("Firebase initialization failed. Please check your config in firebase.ts.", error);
      firebaseServices = { app: null, db: null, auth: null, isConfigured: false };
    }
  } else {
    console.warn("Firebase is not configured. The app will run in a temporary, non-persistent mode. Please update firebase.ts.");
    firebaseServices = { app: null, db: null, auth: null, isConfigured: false };
  }
  
  return firebaseServices;
}