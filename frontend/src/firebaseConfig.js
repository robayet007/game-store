// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// 🔹 তোমার Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBm_TtwkgqU-M1-Mi_NjHkpj3XGVfi2f5I",
  authDomain: "mohammad-robayet.firebaseapp.com",
  projectId: "mohammad-robayet",
  storageBucket: "mohammad-robayet.firebasestorage.app",
  messagingSenderId: "367531569539",
  appId: "1:367531569539:web:1704a0c1c20e0e55e886b6",
  measurementId: "G-NMEG0QEQE5"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize Firebase Auth
export const auth = getAuth(app);

// ✅ Export default app (optional)
export default app;
