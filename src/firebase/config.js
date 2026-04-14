import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "gcas-project.firebaseapp.com",
  projectId: "gcas-project",
  storageBucket: "gcas-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Restrict to gordoncollege.edu.ph
googleProvider.setCustomParameters({
  hd: "gordoncollege.edu.ph"
});

export default app;
