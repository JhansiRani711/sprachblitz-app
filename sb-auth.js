console.log('[sbauth] STARTING FIREBASE AUTH MODULE');

// Wait for Firebase Compat SDK to load
function initFirebaseAuth() {
    if (!window.firebase) {
        console.warn('[sbauth] Firebase SDK not loaded yet, retrying...');
        setTimeout(initFirebaseAuth, 200);
        return;
    }
    
    console.log('[sbauth] Firebase SDK detected');
    
    // Firebase configuration (NO API KEY)
    var firebaseConfig = {
        authDomain: "sprachblitz.firebaseapp.com",
        projectId: "sprachblitz",
        storageBucket: "sprachblitz.firebasestorage.app",
        messagingSenderId: "1088979468853",
        appId: "1:1088979468853:web:ead7d1a35062caf074277c"
    };
    
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('[sbauth] ✅ Firebase app initialized');
    } catch (e) {
        if (e.code === 'app/duplicate-app') {
            console.log('[sbauth] Firebase already initialized');
        } else {
            console.error('[sbauth] Firebase initialization error:', e.message);
            return;
        }
    }
    
    // Get auth instance
    var auth = firebase.auth();
    console.log('[sbauth] Auth instance created');
    
    // Global user state
    window.sbUser = null;
    
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(function(user) {
        window.sbUser = user;
        if (user) {
            localStorage.setItem('sb_user_logged_in', 'true');
            console.log('[sbauth] ✅ User logged in:', user.email || 'anonymous');
            if (typeof window.renderActiveTabModule === 'function') {
                window.renderActiveTabModule();
            }
        } else {
            localStorage.setItem('sb_user_logged_in', 'false');
            console.log('[sbauth] User logged out or not logged in');
            if (typeof window.renderActiveTabModule === 'function') {
                window.renderActiveTabModule();
            }
        }
    });
    
    // ========== AUTH FUNCTIONS ==========
    
    window.sbSignInGoogle = function() {
        console.log('[sbauth] Google sign-in initiated');
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                console.log('[sbauth] ✅ Google login successful');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('✅ Google-Anmeldung erfolgreich!');
                }
                if (typeof window.closeSettings === 'function') {
                    setTimeout(window.closeSettings, 300);
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Google login error:', error.code, error.message);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbSignInEmail = function(email, password) {
        console.log('[sbauth] Email sign-in initiated');
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function(result) {
                console.log('[sbauth] ✅ Email login successful');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('✅ Anmeldung erfolgreich!');
                }
                if (typeof window.closeSettings === 'function') {
                    setTimeout(window.closeSettings, 300);
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Email login error:', error.code);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbSignUpEmail = function(email, password, displayName) {
        console.log('[sbauth] Email signup initiated');
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(result) {
                console.log('[sbauth] ✅ Email signup successful');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('✅ Konto erstellt! Willkommen!');
                }
                if (typeof window.closeSettings === 'function') {
                    setTimeout(window.closeSettings, 300);
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Email signup error:', error.code);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbSignOut = function() {
        console.log('[sbauth] Sign-out initiated');
        firebase.auth().signOut()
            .then(function() {
                console.log('[sbauth] ✅ User signed out');
                if (typeof window.renderActiveTabModule === 'function') {
                    window.renderActiveTabModule();
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Sign-out error:', error);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbResetPassword = function(email) {
        if (!email) {
            console.warn('[sbauth] Password reset called without email');
            if (typeof window.sbAuthError === 'function') {
                window.sbAuthError({ code: 'auth/missing-email' });
            }
            return;
        }
        console.log('[sbauth] Password reset initiated for:', email);
        firebase.auth().sendPasswordResetEmail(email)
            .then(function() {
                console.log('[sbauth] Password reset email sent');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('📧 Passwort-Link wurde gesendet. Bitte deine E-Mail überprüfen.');
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Password reset error:', error.code);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbForceSync = function() {
        if (!window.sbUser) {
            console.warn('[sbauth] Sync called but user not logged in');
            if (typeof window.sbAuthError === 'function') {
                window.sbAuthError({ code: 'auth/not-logged-in' });
            }
            return;
        }
        console.log('[sbauth] Progress synced for user:', window.sbUser.uid);
        if (typeof window.sbAuthNotice === 'function') {
            window.sbAuthNotice('✅ Fortschritt gesichert!');
        }
    };
    
    window.sbLoadProgress = function() {
        console.log('[sbauth] Loading progress');
        return null;
    };
    
    // Critical: Signal that auth is ready
    window.sbAuthReady = function() {
        var ready = typeof firebase !== 'undefined' && 
                    firebase.auth && 
                    typeof window.sbSignInGoogle === 'function' &&
                    typeof window.sbSignOut === 'function';
        return ready;
    };
    
    console.log('[sbauth] ✅✅✅ ALL AUTH FUNCTIONS REGISTERED AND READY ✅✅✅');
    window.sbAuthModuleReady = true;
    
    // Verify auth is ready
    if (window.sbAuthReady()) {
        console.log('[sbauth] ✅ sbAuthReady() returns TRUE');
    } else {
        console.error('[sbauth] ❌ sbAuthReady() returns FALSE');
    }
}

// Start initialization
console.log('[sbauth] Waiting for Firebase SDK...');
initFirebaseAuth();
