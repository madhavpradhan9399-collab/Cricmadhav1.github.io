import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration.
// IMPORTANT: Your Firebase API key is public on the web. To protect your data,
// you MUST set up Firestore Security Rules in the Firebase console.
// Go to Firestore Database > Rules and set up rules to only allow authorized access.
const firebaseConfig = {
  apiKey: "AIzaSyA31AWf6DTtcLFXO_Z8GcQozzr5i5ereIc",
  authDomain: "madhcric-scoreb.firebaseapp.com",
  projectId: "madhcric-scoreb",
  storageBucket: "madhcric-scoreb.firebasestorage.app",
  messagingSenderId: "15203621917",
  appId: "1:15203621917:web:2686eeb932baef06397af4",
  measurementId: "G-TR4P7229DW"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export db for use in other parts of the app
export { db };