import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCZRs_xLIgQpdUtfT21JLS2xXMppvKYS6I",
  authDomain: "acmobility-8307a.firebaseapp.com",
  projectId: "acmobility-8307a",
  storageBucket: "acmobility-8307a.firebasestorage.app",
  messagingSenderId: "130417585990",
  appId: "1:130417585990:web:85551c55c0374129b7bf47",
  measurementId: "G-QTHYRY1WPH"
};

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
