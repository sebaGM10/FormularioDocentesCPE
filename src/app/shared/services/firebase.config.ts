import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCWx_g0nr-sgaIMEu_Mj2dGYQTU2NjoG70",
  authDomain: "formulariodocentes-d010b.firebaseapp.com",
  projectId: "formulariodocentes-d010b",
  storageBucket: "formulariodocentes-d010b.firebasestorage.app",
  messagingSenderId: "156062737688",
  appId: "1:156062737688:web:d97bd8010216976ff0aa6d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
