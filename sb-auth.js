// Initialize trial timer
if (!localStorage.getItem('sb_trial_start_v2')) {
  localStorage.setItem('sb_trial_start_v2', Date.now());
  localStorage.setItem('sb_user_logged_in', 'false');
}

console.log('[sbauth] Loading Firebase auth module...');

let firebaseInitialized = false;
window.sbUser = null;

// Wait for Firebase to load
function waitForFirebase(callback, attempts = 0) {
  if (attempts > 150) {
    console.error('[sbauth] Firebase timeout');
    return;
  }
  
  if (typeof firebase !== 'undefined' && firebase.auth) {
    callback();
    return;
  }
  
  setTimeout(() => waitForFirebase(callback, attempts + 1), 50);
}

function initFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyAMk_LK3HqGX0B5wjo75hrMC71wzhxat0Q",
    authDomain: "sprachblitz.firebaseapp.com",
    projectId: "sprachblitz",
    storageBucket: "sprachblitz.firebasestorage.app",
    messagingSenderId: "1088979468853",
    appId: "1:1088979468853:web:ead7d1a35062caf074277c"
  };

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    firebaseInitialized = true;
    console.log('[sbauth] ✅ Firebase initialized');
  } catch (e) {
    console.log('[sbauth] Firebase already initialized');
    firebaseInitialized = true;
  }

  // Listen for auth changes
  firebase.auth().onAuthStateChanged(function(user) {
    window.sbUser = user;
    if (user) {
      localStorage.setItem('sb_user_logged_in', 'true');
      console.log('[sbauth] ✅ User logged in:', user.email);
    } else {
      localStorage.setItem('sb_user_logged_in', 'false');
    }
    if (typeof renderActiveTabModule === 'function') {
      renderActiveTabModule();
    }
  });

  setupAuthFunctions();
}

function setupAuthFunctions() {
  // Google Sign In
  window.sbSignInGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        console.log('[sbauth] ✅ Google login success');
      })
      .catch(error => {
        console.error('[sbauth] Google login error:', error.code);
      });
  };

  // Email Sign In
  window.sbSignInEmail = function(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('[sbauth] ✅ Email login success');
      })
      .catch(error => {
        console.error('[sbauth] Email login error:', error.code);
        alert('Login failed: ' + error.message);
      });
  };

  // Email Sign Up
  window.sbSignUpEmail = function(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('[sbauth] ✅ Email signup success');
      })
      .catch(error => {
        console.error('[sbauth] Email signup error:', error.code);
        alert('Signup failed: ' + error.message);
      });
  };

  // Sign Out
  window.sbSignOut = function() {
    firebase.auth().signOut()
      .then(() => {
        localStorage.setItem('sb_trial_start_v2', Date.now());
        console.log('[sbauth] ✅ User signed out');
        if (typeof renderActiveTabModule === 'function') {
          renderActiveTabModule();
        }
      })
      .catch(error => {
        console.error('[sbauth] Signout error:', error.code);
      });
  };

  // Password Reset
  window.sbResetPassword = function(email) {
    if (!email) return;
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        console.log('[sbauth] ✅ Password reset email sent');
        alert('Password reset email sent to ' + email);
      })
      .catch(error => {
        console.error('[sbauth] Password reset error:', error.code);
        alert('Error: ' + error.message);
      });
  };

  // Force Sync
  window.sbForceSync = function() {
    if (!window.sbUser) {
      console.warn('[sbauth] No user to sync');
      return;
    }
    console.log('[sbauth] Progress synced for:', window.sbUser.email);
  };

  // Auth Ready Check
  window.sbAuthReady = function() {
    return firebaseInitialized && typeof firebase !== 'undefined';
  };

  console.log('[sbauth] ✅✅✅ ALL AUTH FUNCTIONS READY ✅✅✅');
}

// Start Firebase initialization
waitForFirebase(initFirebase);
