import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApAl1av_DwYgBGCH5kt6LtxMAJDheUBUg",
  authDomain: "smartposyandu-nexus.firebaseapp.com",
  projectId: "smartposyandu-nexus",
  storageBucket: "smartposyandu-nexus.firebasestorage.app",
  messagingSenderId: "859716487340",
  appId: "1:859716487340:web:3c1a6fcc7547ce1c31f709",
  measurementId: "G-C89QM8EJ2P"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);