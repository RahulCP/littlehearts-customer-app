// src/auth/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD0hl7eHxAZdSfAZAzvKT2w6FMh5rm8GDM",
  authDomain: "illolam-auth-3965e.firebaseapp.com",
  projectId: "illolam-auth-3965e",
  storageBucket: "illolam-auth-3965e.firebasestorage.app",
  messagingSenderId: "489786662666",
  appId: "1:489786662666:web:4d4f0208fd66808ed9e4f3",
  measurementId: "G-Q6NQVT0GFJ"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
