import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAMk_LK3HqGX0B5wjo75hrMC71wzhxat0Q",
    authDomain: "sprachblitz.firebaseapp.com",
    projectId: "sprachblitz",
    storageBucket: "sprachblitz.firebasestorage.app",
    messagingSenderId: "1088979468853",
    appId: "1:1088979468853:web:ead7d1a35062caf074277c",
    measurementId: "G-HKD2Y8X0P2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services and functions
export { 
    auth, 
    db, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
};

// Export sbAuthReady function - tells the app that Firebase is initialized
export function sbAuthReady() {
    return true;
}

console.log('[Firebase] Initialized successfully');
