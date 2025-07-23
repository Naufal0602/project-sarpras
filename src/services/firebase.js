

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDOq-nBavxsLFZjFT-XpfkTpQSnBEIlJ58",
  authDomain: "project-sarpras.firebaseapp.com",
  databaseURL: "https://project-sarpras-default-rtdb.firebaseio.com",
  projectId: "project-sarpras",
  storageBucket: "project-sarpras.firebasestorage.app",
  messagingSenderId: "928743688715",
  appId: "1:928743688715:web:9ea006092f5bb7b2f5950e",
  measurementId: "G-T7QVNV7N5V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
