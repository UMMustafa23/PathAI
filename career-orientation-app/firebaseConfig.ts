import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAniYxYv0eyr2P1jfBjLtB9qy6TPEZyPwM",
  authDomain: "career-orientation-app-3c078.firebaseapp.com",
  projectId: "career-orientation-app-3c078",
  storageBucket: "career-orientation-app-3c078.appspot.com",
  messagingSenderId: "707382974085",
  appId: "1:707382974085:web:f157dd8777bd93af04fbec",
  measurementId: "G-F0KK9LTWLN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
