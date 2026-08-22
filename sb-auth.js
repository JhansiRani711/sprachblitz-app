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
// ========== AUDIO INITIALIZATION ==========
function initializeWebAudio() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('✅ Web Audio API initialized');
            });
        } else {
            console.log('✅ Web Audio API ready');
        }
    } catch (e) {
        console.log('Audio init (non-critical):', e);
    }
}

// Initialize audio on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebAudio);
} else {
    initializeWebAudio();
}

// Also initialize on first user interaction
document.addEventListener('click', initializeWebAudio, { once: true });
document.addEventListener('touchstart', initializeWebAudio, { once: true });

// ========== AUTH STATE HANDLER ==========
let authInitialized = false;

onAuthStateChanged(auth, (user) => {
    authInitialized = true;
    console.log('[Firebase] Auth ready. User:', user ? user.email : 'Anonymous');
    
    // UPDATE KONTO SECTION DISPLAY
    if (user) {
        console.log('✅ User logged in:', user.email);
        
        // Find KONTO section and update it
        const kontoSections = document.querySelectorAll('[data-tab="konto"], #konto, .konto-section');
        kontoSections.forEach(section => {
            if (section) {
                section.innerHTML = `
                    <div style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                        <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 20px;">✅ Logged In</h3>
                        <p style="color: #888; margin: 0 0 15px 0; font-size: 14px;">Email: <strong style="color: #fff;">${user.email}</strong></p>
                        <button onclick="sbLogout();" style="background: #6366f1; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: background 0.3s;">
                            Logout
                        </button>
                    </div>
                `;
            }
        });
        
        // Stop trial timer when user logs in
        if (window.trialInterval) {
            clearInterval(window.trialInterval);
            console.log('Trial timer stopped (user logged in)');
        }
        
        // Hide trial banner
        const trialBanner = document.getElementById('trial-banner');
        if (trialBanner) {
            trialBanner.style.display = 'none';
        }
        
    } else {
        console.log('User not logged in - show login form');
        // Login form will be shown by default
    }
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
