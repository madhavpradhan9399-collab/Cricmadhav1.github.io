import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlotfi9rPQisxl9JSvkv5G_VEiuBkX-CM",
  authDomain: "cricket-score-board-863fc.firebaseapp.com",
  projectId: "cricket-score-board-863fc",
  storageBucket: "cricket-score-board-863fc.firebasestorage.app",
  messagingSenderId: "435873239433",
  appId: "1:435873239433:web:7b839fbc6252f09570d158",
  measurementId: "G-578DCQPMWB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export db for use in other parts of the app
export { db };