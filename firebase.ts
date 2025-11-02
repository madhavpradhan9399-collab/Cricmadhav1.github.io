// FIX: Changed firebase import to use modular syntax (v9+) instead of a namespace import to resolve module resolution errors.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration.
// IMPORTANT: Your Firebase API key is public on the web. To protect your data,
// you MUST set up Firestore Security Rules in the Firebase console.
// Go to Firestore Database > Rules and set up rules to only allow authorized access.
// ---
// FIXME: Replace with your actual Firebase project configuration.
// The current configuration uses placeholder values and will not work.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA31AWf6DTtcLFXO_Z8GcQozzr5i5ereIc",
  authDomain: "madhcric-scoreb.firebaseapp.com",
  // FIX: Removed databaseURL. This property is for the Realtime Database, but this app uses Firestore.
  // The SDK will automatically find the correct Firestore instance using the projectId.
  projectId: "madhcric-scoreb",
  // FIX: Corrected the storage bucket URL to the standard Firebase format.
  storageBucket: "madhcric-scoreb.appspot.com",
  messagingSenderId: "15203621917",
  appId: "1:15203621917:web:2686eeb932baef06397af4",
  measurementId: "G-TR4P7229DW"
};


// FIX: Use the FirebaseApp type from the named import.
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isFirebaseConfigured = false;

// Check if the config has been changed from the placeholder values to prevent app crash.
if (firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID") {
  try {
    // FIX: Call initializeApp directly from the named import.
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseConfigured = true;
  } catch (error) {
    console.error("Firebase initialization failed. Please check your config in firebase.ts.", error);
    // App remains unconfigured if initialization fails.
  }
} else {
  console.warn("Firebase is not configured. The app will run in a temporary, non-persistent mode. Please update firebase.ts.");
}

// Export db for use in other parts of the app
export { db, isFirebaseConfigured };