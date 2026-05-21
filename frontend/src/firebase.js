import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRfwiY8EKLzJZOHU8iAj_M4qniEhDTHWY",
  authDomain: "resumeaionline.firebaseapp.com",
  projectId: "resumeaionline",
  storageBucket: "resumeaionline.firebasestorage.app",
  messagingSenderId: "417844499212",
  appId: "1:417844499212:web:5edc59eaec23f533252f29"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
