import * as firebase from "firebase/app";
import * as firestore from "firebase/firestore";

// Your web app's Firebase configuration.
// IMPORTANT: Your Firebase API key is public on the web. To protect your data,
// you MUST set up Firestore Security Rules in the Firebase console.
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
let firebaseServices: { db: firestore.Firestore; isConfigured: true } | { db: null; isConfigured: false } | null = null;

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
      const app = firebase.initializeApp(firebaseConfig);
      const db = firestore.getFirestore(app);
      firebaseServices = { db, isConfigured: true };
    } catch (error) {
      console.error("Firebase initialization failed. Please check your config in firebase.ts.", error);
      firebaseServices = { db: null, isConfigured: false };
    }
  } else {
    console.warn("Firebase is not configured. The app will run in a temporary, non-persistent mode. Please update firebase.ts.");
    firebaseServices = { db: null, isConfigured: false };
  }
  
  return firebaseServices;
}
