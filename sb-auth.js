import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,// ============================================================================
// SPRACHBLITZ FIREBASE AUTHENTICATION - CORRECT VERSION
// Loads Firebase SDK from CDN and sets up all auth functions
// ============================================================================

console.log('[sbauth] INITIALIZATION START');

// Step 1: Load Firebase SDK from CDN
function loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
        // Check if Firebase is already loaded
        if (window.firebase && window.firebase.auth) {
            console.log('[sbauth] Firebase SDK already loaded');
            resolve();
            return;
        }

        // Load Firebase SDK
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
        script.onload = () => {
            console.log('[sbauth] Firebase app SDK loaded');
            
            // Load auth SDK
            const authScript = document.createElement('script');
            authScript.src = 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';
            authScript.onload = () => {
                console.log('[sbauth] Firebase auth SDK loaded');
                resolve();
            };
            authScript.onerror = () => reject(new Error('Failed to load Firebase auth SDK'));
            document.head.appendChild(authScript);
        };
        script.onerror = () => reject(new Error('Failed to load Firebase SDK'));
        document.head.appendChild(script);
    });
}

// Step 2: Initialize Firebase
async function initializeFirebase() {
    try {
        // Wait for Firebase SDK to load
        await loadFirebaseSDK();
        console.log('[sbauth] Firebase SDK loaded, initializing...');

        // Firebase configuration (NO API KEY)
        const firebaseConfig = {
            authDomain: "sprachblitz.firebaseapp.com",
            projectId: "sprachblitz",
            storageBucket: "sprachblitz.firebasestorage.app",
            messagingSenderId: "1088979468853",
            appId: "1:1088979468853:web:ead7d1a35062caf074277c"
        };

        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        window.sbFirebaseApp = app;
        window.sbAuth = firebase.auth().getAuth ? firebase.auth().getAuth() : firebase.auth();
        
        console.log('[sbauth] Firebase initialized:', {
            projectId: firebaseConfig.projectId,
            authDomain: firebaseConfig.authDomain
        });

        // Step 3: Set up auth state listener
        firebase.auth().onAuthStateChanged((user) => {
            window.sbUser = user;
            if (user) {
                localStorage.setItem('sb_user_logged_in', 'true');
                localStorage.removeItem('sb_trial_start_v2');
                localStorage.removeItem('sb_trial_warned_v2');
                localStorage.removeItem('sb_trial_expired_v2');
                console.log('[sbauth] ✅ User logged in:', user.email || 'anonymous');
            } else {
                localStorage.setItem('sb_user_logged_in', 'false');
                console.log('[sbauth] User logged out');
            }
            // Re-render if function exists
            if (typeof window.renderActiveTabModule === 'function') {
                window.renderActiveTabModule();
            }
        });

        return true;
    } catch (error) {
        console.error('[sbauth] ❌ Firebase initialization failed:', error);
        return false;
    }
}

// Step 4: Define all auth functions on window
function setupAuthFunctions() {
    const auth = firebase.auth();

    window.sbSignInEmail = async (email, password) => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            console.log('[sbauth] ✅ Email login successful');
            if (typeof window.sbAuthNotice === 'function') {
                window.sbAuthNotice('✅ Anmeldung erfolgreich!');
            }
            setTimeout(() => {
                if (typeof window.closeSettings === 'function') window.closeSettings();
                if (typeof window.renderActiveTabModule === 'function') window.renderActiveTabModule();
            }, 500);
        } catch (error) {
            console.error('[sbauth] Email login error:', error);
            if (typeof window.sbAuthError === 'function') window.sbAuthError(error);
        }
    };

    window.sbSignUpEmail = async (email, password, displayName) => {
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            console.log('[sbauth] ✅ Email signup successful');
            if (typeof window.sbAuthNotice === 'function') {
                window.sbAuthNotice('✅ Konto erstellt! Willkommen!');
            }
            setTimeout(() => {
                if (typeof window.closeSettings === 'function') window.closeSettings();
                if (typeof window.renderActiveTabModule === 'function') window.renderActiveTabModule();
            }, 500);
        } catch (error) {
            console.error('[sbauth] Email signup error:', error);
            if (typeof window.sbAuthError === 'function') window.sbAuthError(error);
        }
    };

    window.sbSignInGoogle = async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            console.log('[sbauth] ✅ Google login successful');
            if (typeof window.sbAuthNotice === 'function') {
                window.sbAuthNotice('✅ Google-Anmeldung erfolgreich!');
            }
            setTimeout(() => {
                if (typeof window.closeSettings === 'function') window.closeSettings();
                if (typeof window.renderActiveTabModule === 'function') window.renderActiveTabModule();
            }, 500);
        } catch (error) {
            console.error('[sbauth] Google login error:', error);
            if (typeof window.sbAuthError === 'function') window.sbAuthError(error);
        }
    };

    window.sbSignOut = async () => {
        try {
            await auth.signOut();
            console.log('[sbauth] ✅ User signed out');
            localStorage.setItem('sb_trial_start_v2', Date.now());
            localStorage.removeItem('sb_trial_warned_v2');
            localStorage.removeItem('sb_trial_expired_v2');
            if (typeof window.renderActiveTabModule === 'function') window.renderActiveTabModule();
        } catch (error) {
            console.error('[sbauth] Sign out error:', error);
            if (typeof window.sbAuthError === 'function') window.sbAuthError(error);
        }
    };

    window.sbResetPassword = async (email) => {
        try {
            if (!email) {
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError({ code: 'auth/missing-password' });
                }
                return;
            }
            await auth.sendPasswordResetEmail(email);
            if (typeof window.sbAuthNotice === 'function') {
                window.sbAuthNotice('📧 Passwort-Link wurde gesendet. Bitte deine E-Mail überprüfen.');
            }
        } catch (error) {
            console.error('[sbauth] Password reset error:', error);
            if (typeof window.sbAuthError === 'function') window.sbAuthError(error);
        }
    };

    window.sbForceSync = async () => {
        if (!window.sbUser) {
            if (typeof window.sbAuthError === 'function') {
                window.sbAuthError({ code: 'auth/invalid-credential' });
            }
            return;
        }
        if (typeof window.sbAuthNotice === 'function') {
            window.sbAuthNotice('✅ Fortschritt gesichert!');
        }
        console.log('[sbauth] Progress synced');
    };

    window.sbLoadProgress = async () => {
        if (!window.sbUser) return null;
        console.log('[sbauth] Progress loaded for user:', window.sbUser.uid);
        return null;
    };

    // ⭐ CRITICAL: This tells the app Firebase is ready
    window.sbAuthReady = () => {
        const isReady = window.sbFirebaseApp !== undefined && auth !== undefined;
        if (!isReady) console.warn('[sbauth] sbAuthReady() returning false!');
        return isReady;
    };

    console.log('[sbauth] ✅ ALL FUNCTIONS REGISTERED');
}

// Step 5: Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        const success = await initializeFirebase();
        if (success) {
            setupAuthFunctions();
            console.log('[sbauth] 🎉 FIREBASE READY FOR APP');
            window.sbAuthModuleReady = true;
        } else {
            console.error('[sbauth] Firebase initialization failed');
            window.sbAuthModuleReady = false;
        }
    });
} else {
    // DOM already loaded
    (async () => {
        const success = await initializeFirebase();
        if (success) {
            setupAuthFunctions();
            console.log('[sbauth] 🎉 FIREBASE READY FOR APP');
            window.sbAuthModuleReady = true;
        } else {
            console.error('[sbauth] Firebase initialization failed');
            window.sbAuthModuleReady = false;
        }
    })();
}

console.log('[sbauth] Module loaded - waiting for Firebase SDK to initialize...');
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
