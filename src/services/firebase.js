import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child, update, push, set } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCf-bliVUmDXtujsXhj35qAyXuYUDli_TM",
  authDomain: "polyglot121725.firebaseapp.com",
  databaseURL: "https://polyglot121725-default-rtdb.firebaseio.com",
  projectId: "polyglot121725",
  storageBucket: "polyglot121725.firebasestorage.app",
  messagingSenderId: "847375215592",
  appId: "1:847375215592:web:294ede3e908d11509ed25d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Export all necessary functions
export { db, auth, signInAnonymously, onAuthStateChanged, ref, get, child, update, push, set };

export const ensureAuth = async () => {
    if (auth.currentUser) return auth.currentUser;
    try {
        const cred = await signInAnonymously(auth);
        return cred.user;
    } catch (error) {
        console.error("Auth Error:", error);
        throw error;
    }
};
