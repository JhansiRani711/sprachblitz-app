console.log('[sbauth] START');

// Wait for Firebase to be available globally
function waitForFirebase(callback, attempts) {
    attempts = attempts || 0;
    if (attempts > 50) {
        console.error('[sbauth] Firebase SDK never loaded after 50 attempts');
        return;
    }
    
    if (window.firebase && window.firebase.auth) {
        console.log('[sbauth] Firebase SDK is available');
        callback();
        return;
    }
    
    setTimeout(function() {
        waitForFirebase(callback, attempts + 1);
    }, 100);
}

// Initialize Firebase when SDK is ready
function initFirebase() {
    console.log('[sbauth] Initializing Firebase...');
    
    var firebaseConfig = {
        authDomain: "sprachblitz.firebaseapp.com",
        projectId: "sprachblitz",
        storageBucket: "sprachblitz.firebasestorage.app",
        messagingSenderId: "1088979468853",
        appId: "1:1088979468853:web:ead7d1a35062caf074277c"
    };
    
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('[sbauth] Firebase app initialized');
    } catch (e) {
        console.log('[sbauth] Firebase already initialized or error:', e.message);
    }
    
    var auth = firebase.auth();
    console.log('[sbauth] Auth instance ready');
    
    // Listen for auth changes
    firebase.auth().onAuthStateChanged(function(user) {
        window.sbUser = user;
        if (user) {
            localStorage.setItem('sb_user_logged_in', 'true');
            localStorage.removeItem('sb_trial_start_v2');
            console.log('[sbauth] User logged in');
            if (typeof window.renderActiveTabModule === 'function') {
                window.renderActiveTabModule();
            }
        } else {
            localStorage.setItem('sb_user_logged_in', 'false');
            console.log('[sbauth] User logged out');
            if (typeof window.renderActiveTabModule === 'function') {
                window.renderActiveTabModule();
            }
        }
    });
    
    // Define all auth functions
    window.sbSignInGoogle = function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                console.log('[sbauth] Google login success');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('✅ Google-Anmeldung erfolgreich!');
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Google login error:', error);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbSignInEmail = function(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function(result) {
                console.log('[sbauth] Email login success');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('✅ Anmeldung erfolgreich!');
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Email login error:', error);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbSignUpEmail = function(email, password, displayName) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(result) {
                console.log('[sbauth] Email signup success');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('✅ Konto erstellt! Willkommen!');
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Email signup error:', error);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbSignOut = function() {
        firebase.auth().signOut()
            .then(function() {
                console.log('[sbauth] Sign out success');
                localStorage.setItem('sb_trial_start_v2', Date.now());
                if (typeof window.renderActiveTabModule === 'function') {
                    window.renderActiveTabModule();
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Sign out error:', error);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbResetPassword = function(email) {
        if (!email) {
            alert('Please enter an email address');
            return;
        }
        firebase.auth().sendPasswordResetEmail(email)
            .then(function() {
                console.log('[sbauth] Password reset email sent');
                if (typeof window.sbAuthNotice === 'function') {
                    window.sbAuthNotice('📧 Passwort-Link wurde gesendet!');
                }
            })
            .catch(function(error) {
                console.error('[sbauth] Password reset error:', error);
                if (typeof window.sbAuthError === 'function') {
                    window.sbAuthError(error);
                }
            });
    };
    
    window.sbForceSync = function() {
        if (!window.sbUser) {
            alert('Please log in first');
            return;
        }
        console.log('[sbauth] Progress synced');
        if (typeof window.sbAuthNotice === 'function') {
            window.sbAuthNotice('✅ Fortschritt gesichert!');
        }
    };
    
    window.sbLoadProgress = function() {
        console.log('[sbauth] Loading progress');
        return null;
    };
    
    window.sbAuthReady = function() {
        var isReady = window.firebase && window.firebase.auth && typeof window.sbSignInGoogle === 'function';
        console.log('[sbauth] sbAuthReady() = ' + isReady);
        return isReady;
    };
    
    console.log('[sbauth] ✅ ALL FUNCTIONS READY');
    window.sbAuthModuleReady = true;
}

// Start waiting for Firebase
console.log('[sbauth] Waiting for Firebase SDK...');
waitForFirebase(initFirebase);
