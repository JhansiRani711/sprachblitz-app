// Initialize trial timer immediately
if (!localStorage.getItem('sb_trial_start_v2') && localStorage.getItem('sb_user_logged_in') !== 'true') {
  localStorage.setItem('sb_trial_start_v2', Date.now());
  console.log('[sbauth] Trial initialized');
}

console.log('[sbauth] Waiting for Firebase...');

// Wait for Firebase to be available
let firebaseReady = false;
let attempts = 0;
const maxAttempts = 200;

function initAuth() {
  attempts++;
  
  if (typeof firebase === 'undefined') {
    if (attempts < maxAttempts) {
      setTimeout(initAuth, 50);
    }
    return;
  }

  firebaseReady = true;
  console.log('[sbauth] Firebase found!');

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
      console.log('[sbauth] Firebase initialized');
    }
  } catch (e) {
    console.log('[sbauth] Firebase already initialized');
  }

  // Auth state listener
  firebase.auth().onAuthStateChanged(function(user) {
    window.sbUser = user;
    if (user) {
      localStorage.setItem('sb_user_logged_in', 'true');
      console.log('[sbauth] User logged in');
    } else {
      localStorage.setItem('sb_user_logged_in', 'false');
    }
    if (typeof window.renderActiveTabModule === 'function') {
      window.renderActiveTabModule();
    }
  });

  setupAuthFunctions();
}

function setupAuthFunctions() {
  // Google Sign In
  window.sbSignInGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(e => console.error('[sbauth]', e.code));
  };

  // Email Sign In
  window.sbSignInEmail = function(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(e => console.error('[sbauth]', e.code));
  };

  // Email Sign Up
  window.sbSignUpEmail = function(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(e => console.error('[sbauth]', e.code));
  };

  // Sign Out
  window.sbSignOut = function() {
    firebase.auth().signOut().then(() => {
      localStorage.setItem('sb_trial_start_v2', Date.now());
      if (typeof window.renderActiveTabModule === 'function') {
        window.renderActiveTabModule();
      }
    });
  };

  // Password Reset
  window.sbResetPassword = function(email) {
    if (email) {
      firebase.auth().sendPasswordResetEmail(email).catch(e => console.error('[sbauth]', e.code));
    }
  };

  // Force Sync
  window.sbForceSync = function() {
    console.log('[sbauth] Sync');
  };

  // Auth Ready Check
  window.sbAuthReady = function() {
    return firebaseReady && typeof firebase !== 'undefined' && firebase.auth;
  };

  console.log('[sbauth] ✅ ALL FUNCTIONS READY');
  window.sbAuthModuleReady = true;
}

// Start waiting for Firebase
initAuth();
