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
    apiKey: "AIzaSyBkPYfPGWXkbu-x2opF3TVrt3ADXZYimak",
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

// Create Google Provider
const googleProvider = new GoogleAuthProvider();

// Base URL for redirects (GitHub Pages)
const BASE_URL = 'https://sprachblitz-app.github.io/sprachblitz-app/';

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

// Auth ready flag
let authInitialized = false;
onAuthStateChanged(auth, (user) => {
    authInitialized = true;
    console.log('[Firebase] Auth ready. User:', user ? user.email : 'Anonymous');
});

export function sbAuthReady() {
    return authInitialized;
}

// ========== SIGN IN WITH GOOGLE ==========
export function sbSignInGoogle() {
    console.log('[Auth] Starting Google sign-in...');
    return signInWithPopup(auth, googleProvider)
        .then((result) => {
            console.log('[Auth] Google sign-in successful:', result.user.email);
            // Redirect to main app
            window.location.href = 'https://sprachblitz-app.github.io/sprachblitz-app/index.html';
            return result.user;
        })
        .catch((error) => {
            console.error('[Auth] Google sign-in error:', error.message);
            alert(`Google sign-in failed: ${error.message}`);
            throw error;
        });
}

// ========== SIGN IN ANONYMOUSLY ==========
export function sbSignInAnonymously() {
    console.log('[Auth] Starting anonymous sign-in...');
    return signInAnonymously(auth)
        .then((result) => {
            console.log('[Auth] Anonymous sign-in successful');
            // Redirect to main app
            window.location.href = 'https://sprachblitz-app.github.io/sprachblitz-app/index.html';
            return result.user;
        })
        .catch((error) => {
            console.error('[Auth] Anonymous sign-in error:', error.message);
            alert(`Anonymous sign-in failed: ${error.message}`);
            throw error;
        });
}

// ========== SIGN IN WITH EMAIL & PASSWORD ==========
export function sbSignInEmail(email, password) {
    console.log('[Auth] Starting email sign-in...');
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return Promise.reject('Missing credentials');
    }

    return signInWithEmailAndPassword(auth, email, password)
        .then((result) => {
            console.log('[Auth] Email sign-in successful:', result.user.email);
            // Redirect to main app
           window.location.href = 'https://sprachblitz-app.github.io/sprachblitz-app/index.html';
            return result.user;
        })
        .catch((error) => {
            console.error('[Auth] Email sign-in error:', error.message);
            alert(`Sign-in failed: ${error.message}`);
            throw error;
        });
}

// ========== CREATE ACCOUNT WITH EMAIL & PASSWORD ==========
export function sbCreateAccount(email, password, confirmPassword) {
    console.log('[Auth] Starting account creation...');
    
    if (!email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return Promise.reject('Missing fields');
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return Promise.reject('Passwords do not match');
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return Promise.reject('Password too short');
    }

    return createUserWithEmailAndPassword(auth, email, password)
        .then((result) => {
            console.log('[Auth] Account created successfully:', result.user.email);
            // Redirect to main app
           window.location.href = 'https://sprachblitz-app.github.io/sprachblitz-app/index.html';
            return result.user;
        })
        .catch((error) => {
            console.error('[Auth] Account creation error:', error.message);
            alert(`Account creation failed: ${error.message}`);
            throw error;
        });
}

// ========== SIGN OUT ==========
export function sbLogout() {
    console.log('[Auth] Signing out...');
    return signOut(auth)
        .then(() => {
            console.log('[Auth] Sign-out successful');
            // Redirect to login page
           window.location.href = 'https://sprachblitz-app.github.io/sprachblitz-app/index.html';
        })
        .catch((error) => {
            console.error('[Auth] Sign-out error:', error.message);
            alert(`Sign-out failed: ${error.message}`);
        });
}

// ========== GET CURRENT USER ==========
export function sbGetCurrentUser() {
    return auth.currentUser;
}

console.log('[Firebase] Initialization complete');
