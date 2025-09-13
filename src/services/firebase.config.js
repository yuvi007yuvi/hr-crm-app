// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhR8j6E2UEEtEnQmutuyBhjYUasJ3nf2g",
  authDomain: "hr-crm-d23d9.firebaseapp.com",
  projectId: "hr-crm-d23d9",
  storageBucket: "hr-crm-d23d9.firebasestorage.app",
  messagingSenderId: "183269353989",
  appId: "1:183269353989:web:d74fb5f9373e34c31fca6c",
  measurementId: "G-B939R1CZ3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;