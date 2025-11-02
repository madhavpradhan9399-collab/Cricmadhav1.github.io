

// Use standard named imports for the modular v9+ SDK, which is the most robust method.
// Fix: Use a namespace import for 'firebase/app' to address module resolution issues.
import * as firebase from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

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
// Fix: Use the FirebaseApp type from the imported namespace.
let firebaseServices: { app: firebase.FirebaseApp; db: Firestore; isConfigured: true } | { app: null; db: null; isConfigured: false } | null = null;

/**
 * Initializes Firebase services on the first call and returns the memoized instance on subsequent calls.
 * This lazy initialization prevents race conditions during the app's initial module loading.
 * @returns An object containing the Firestore instance (`db`) and a configuration status flag (`isConfigured`).
 */
export function getFirebase() {
  if (firebaseServices) {
    return firebaseServices;
  }
  
  const isProperlyConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

  if (isProperlyConfigured) {
    try {
      // Use direct function calls with named imports, the standard for v9+.
      // Fix: Use functions from the imported namespace.
      const app = firebase.getApps().length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.getApp();
      const db = getFirestore(app);
      firebaseServices = { app, db, isConfigured: true };
    } catch (error) {
      console.error("Firebase initialization failed. Please check your config in firebase.ts.", error);
      firebaseServices = { app: null, db: null, isConfigured: false };
    }
  } else {
    console.warn("Firebase is not configured. The app will run in a temporary, non-persistent mode. Please update firebase.ts.");
    firebaseServices = { app: null, db: null, isConfigured: false };
  }
  
  return firebaseServices;
}