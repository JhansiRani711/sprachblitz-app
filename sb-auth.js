import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';
import { 
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js';

// ⚠️ NO API KEY IN SOURCE CODE - Firebase still works with authDomain + projectId + appId
const firebaseConfig = {
    authDomain: "sprachblitz.firebaseapp.com",
    projectId: "sprachblitz",
    storageBucket: "sprachblitz.firebasestorage.app",
    messagingSenderId: "1088979468853",
    appId: "1:1088979468853:web:ead7d1a35062caf074277c",
    measurementId: "G-HKD2Y8X0P2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Make Firebase auth available globally for app to use
window.sbUser = null;

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    window.sbUser = user;
    if (user) {
        localStorage.setItem('sb_user_logged_in', 'true');
        localStorage.removeItem('sb_trial_start_v2');
        localStorage.removeItem('sb_trial_warned_v2');
        localStorage.removeItem('sb_trial_expired_v2');
        console.log('[Firebase] User logged in:', user.email || 'anonymous');
    } else {
        localStorage.setItem('sb_user_logged_in', 'false');
        console.log('[Firebase] User logged out');
    }
});

// ========== AUTHENTICATION FUNCTIONS FOR APP ==========

// Sign in with email and password
async function sbSignInEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('[Firebase] Email login successful:', result.user.email);
        window.sbAuthNotice('✅ Anmeldung erfolgreich!');
        setTimeout(() => {
            if (typeof closeSettings === 'function') closeSettings();
            if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
        }, 500);
    } catch (error) {
        console.error('[Firebase] Email login error:', error);
        if (typeof sbAuthError === 'function') sbAuthError(error);
    }
}

// Sign up with email and password
async function sbSignUpEmail(email, password, displayName) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // Save user profile to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            displayName: displayName || 'Learner',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });
        
        console.log('[Firebase] Sign up successful:', user.email);
        window.sbAuthNotice('✅ Konto erstellt! Willkommen!');
        setTimeout(() => {
            if (typeof closeSettings === 'function') closeSettings();
            if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
        }, 500);
    } catch (error) {
        console.error('[Firebase] Sign up error:', error);
        if (typeof sbAuthError === 'function') sbAuthError(error);
    }
}

// Sign in with Google
async function sbSignInGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('[Firebase] Google login successful:', result.user.email);
        window.sbAuthNotice('✅ Google-Anmeldung erfolgreich!');
        setTimeout(() => {
            if (typeof closeSettings === 'function') closeSettings();
            if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
        }, 500);
    } catch (error) {
        console.error('[Firebase] Google login error:', error);
        if (typeof sbAuthError === 'function') sbAuthError(error);
    }
}

// Sign out
async function sbSignOut() {
    try {
        await signOut(auth);
        console.log('[Firebase] User signed out');
        localStorage.setItem('sb_trial_start_v2', Date.now());
        localStorage.removeItem('sb_trial_warned_v2');
        localStorage.removeItem('sb_trial_expired_v2');
        if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
    } catch (error) {
        console.error('[Firebase] Sign out error:', error);
        if (typeof sbAuthError === 'function') sbAuthError(error);
    }
}

// Reset password
async function sbResetPassword(email) {
    try {
        if (!email) {
            if (typeof sbAuthError === 'function') sbAuthError({ code: 'auth/missing-password' });
            return;
        }
        await sendPasswordResetEmail(auth, email);
        if (typeof sbAuthNotice === 'function') {
            sbAuthNotice('📧 Passwort-Link wurde gesendet. Bitte deine E-Mail überprüfen.');
        }
    } catch (error) {
        console.error('[Firebase] Password reset error:', error);
        if (typeof sbAuthError === 'function') sbAuthError(error);
    }
}

// Sync progress to Firestore
async function sbForceSync() {
    if (!window.sbUser) {
        if (typeof sbAuthError === 'function') {
            sbAuthError({ code: 'auth/invalid-credential', message: 'Not logged in' });
        }
        return;
    }

    try {
        // Get user's progress from localStorage
        const progress = {
            totalXP: window.totalXPAmount || 0,
            lessonProgress: window.lessonProgress || {},
            learnerName: window.learnerName || 'Learner',
            learnerAvatar: window.learnerAvatar || '🐻',
            activeLevel: window.activeLevel || 'A1',
            currentThemeProfile: window.currentThemeProfile || 'midnight-slate',
            lastSync: new Date().toISOString()
        };

        // Save to Firestore
        await updateDoc(doc(db, 'users', window.sbUser.uid), progress);
        
        if (typeof sbAuthNotice === 'function') {
            sbAuthNotice('✅ Fortschritt gesichert!');
        }
        console.log('[Firebase] Progress synced to Firestore');
    } catch (error) {
        console.error('[Firebase] Sync error:', error);
        if (typeof sbAuthError === 'function') sbAuthError(error);
    }
}

// Load progress from Firestore
async function sbLoadProgress() {
    if (!window.sbUser) return;

    try {
        const userDoc = await getDoc(doc(db, 'users', window.sbUser.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('[Firebase] Progress loaded:', data);
            return data;
        }
    } catch (error) {
        console.error('[Firebase] Load progress error:', error);
    }
    return null;
}

// Export functions for use in app
export { 
    auth, 
    db,
    sbSignInEmail,
    sbSignUpEmail,
    sbSignInGoogle,
    sbSignOut,
    sbResetPassword,
    sbForceSync,
    sbLoadProgress,
    onAuthStateChanged,
    signOut
};

// Signal to app that Firebase is ready
export function sbAuthReady() {
    return true;
}

console.log('[Firebase] Authentication module loaded');
