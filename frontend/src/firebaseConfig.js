// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBm_TtwkgqU-M1-Mi_NjHkpj3XGVfi2f5I",
  authDomain: "mohammad-robayet.firebaseapp.com",
  projectId: "mohammad-robayet",
  storageBucket: "mohammad-robayet.firebasestorage.app",
  messagingSenderId: "367531569539",
  appId: "1:367531569539:web:1704a0c1c20e0e55e886b6",
  measurementId: "G-NMEG0QEQE5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);