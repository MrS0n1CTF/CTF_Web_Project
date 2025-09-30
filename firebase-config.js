// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBe3X1GPP9c005r1eV-bfQBpv8gqrXO3M0",
  authDomain: "mr-s0n1-ctf-labs-project.firebaseapp.com",
  projectId: "mr-s0n1-ctf-labs-project",
  storageBucket: "mr-s0n1-ctf-labs-project.firebasestorage.app",
  messagingSenderId: "27472640509",
  appId: "1:27472640509:web:f9cfb6c1d0655d21ce8194",
  measurementId: "G-5WW7FP6WRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
