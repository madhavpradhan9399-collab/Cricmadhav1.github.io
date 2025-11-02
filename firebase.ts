import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration.
// IMPORTANT: Your Firebase API key is public on the web. To protect your data,
// you MUST set up Firestore Security Rules in the Firebase console.
// Go to Firestore Database > Rules and set up rules to only allow authorized access.
// ---
// FIXME: Replace with your actual Firebase project configuration.
// The current configuration uses placeholder values and will not work.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export db for use in other parts of the app
export { db };