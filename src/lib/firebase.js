import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC7Sj_nU86ih9V2J7R04d8qMKKiIAwz2mg",
  authDomain: "chat-app-8d8f9.firebaseapp.com",
  projectId: "chat-app-8d8f9",
  storageBucket: "chat-app-8d8f9.appspot.com",
  messagingSenderId: "897693476504",
  appId: "1:897693476504:web:47c516291a99c68e9c52ed",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
