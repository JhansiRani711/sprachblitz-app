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

// Export Firebase services
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

// Auth ready function
let authInitialized = false;

onAuthStateChanged(auth, (user) => {
    authInitialized = true;
    console.log('[Firebase] Auth ready. User:', user ? user.email : 'Anonymous');
});

export function sbAuthReady() {
    return authInitialized || true;
}

console.log('[Firebase] Initialization started');
