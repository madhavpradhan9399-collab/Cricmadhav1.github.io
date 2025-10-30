import { db } from '../firebase';
import { Tournament, Team, Match } from '../types';
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export interface AppData {
    tournaments: Tournament[];
    teams: Team[];
    matches: Match[];
}

const COLLECTION_NAME = 'scorebooks';

type Unsubscribe = () => void;

const firestoreService = {
  listenToAppData: (loginId: string, callback: (data: AppData) => void): Unsubscribe => {
    const docRef = doc(db, COLLECTION_NAME, loginId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as AppData);
      } else {
        console.log(`No data found for Scorebook ID ${loginId}. It may be new or incorrect.`);
        const initialState: AppData = { tournaments: [], teams: [], matches: [] };
        // We don't auto-create here to avoid creating documents for typos.
        // Creation is handled explicitly by the AppContext.
        callback(initialState);
      }
    }, (error) => {
      console.error("Error listening to Firestore document:", error);
      const initialState: AppData = { tournaments: [], teams: [], matches: [] };
      callback(initialState);
    });

    return unsubscribe;
  },

  saveAppData: async (loginId: string, data: AppData): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, loginId);
      await setDoc(docRef, data);
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
      throw error;
    }
  },
};

export default firestoreService;