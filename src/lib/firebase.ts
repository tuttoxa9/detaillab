import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiXPi2xKdwbQZ36PV0hH9iTCz0kIV01q8",
  authDomain: "detaillab-98ede.firebaseapp.com",
  projectId: "detaillab-98ede",
  storageBucket: "detaillab-98ede.firebasestorage.app",
  messagingSenderId: "16207443199",
  appId: "1:16207443199:web:3f9f396defdeb2892688ca",
  measurementId: "G-SFL4VVJ7TB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
