// Initialize trial timer FIRST
if (!localStorage.getItem('sb_user_logged_in')) {
  if (!localStorage.getItem('sb_trial_start_v2')) {
    localStorage.setItem('sb_trial_start_v2', Date.now());
  }
}

console.log('[sbauth] Loading...');

// Global user
window.sbUser = null;
window.sbAuthReady = () => true;

// Wait for Firebase
setTimeout(() => {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    console.log('[sbauth] Firebase ready');
    
    firebase.auth().onAuthStateChanged(user => {
      window.sbUser = user;
      localStorage.setItem('sb_user_logged_in', user ? 'true' : 'false');
      if (typeof renderActiveTabModule === 'function') {
        renderActiveTabModule();
      }
    });
  }
}, 100);

// Auth functions
window.sbSignInGoogle = () => {
  if (firebase && firebase.auth) {
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e => console.log(e.code));
  }
};

window.sbSignInEmail = (email, pass) => {
  if (firebase && firebase.auth) {
    firebase.auth().signInWithEmailAndPassword(email, pass).catch(e => console.log(e.code));
  }
};

window.sbSignUpEmail = (email, pass) => {
  if (firebase && firebase.auth) {
    firebase.auth().createUserWithEmailAndPassword(email, pass).catch(e => console.log(e.code));
  }
};

window.sbSignOut = () => {
  if (firebase && firebase.auth) {
    firebase.auth().signOut().then(() => {
      localStorage.setItem('sb_trial_start_v2', Date.now());
      if (typeof renderActiveTabModule === 'function') {
        renderActiveTabModule();
      }
    });
  }
};

window.sbResetPassword = (email) => {
  if (email && firebase && firebase.auth) {
    firebase.auth().sendPasswordResetEmail(email);
  }
};

window.sbForceSync = () => {
  console.log('[sbauth] Sync');
};

console.log('[sbauth] Ready');
