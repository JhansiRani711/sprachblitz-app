// Initialize trial timer
if (!localStorage.getItem('sb_trial_start_v2')) {
  localStorage.setItem('sb_trial_start_v2', Date.now());
  localStorage.setItem('sb_user_logged_in', 'false');
}

// Global user object
window.sbUser = null;

// Stub functions - do nothing but don't error
window.sbSignInGoogle = () => console.log('Google login clicked');
window.sbSignInEmail = (e, p) => console.log('Email login clicked');
window.sbSignUpEmail = (e, p) => console.log('Email signup clicked');
window.sbSignOut = () => {
  localStorage.setItem('sb_trial_start_v2', Date.now());
  if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
};
window.sbResetPassword = (e) => console.log('Password reset clicked');
window.sbForceSync = () => console.log('Sync clicked');
window.sbAuthReady = () => true;

console.log('[sbauth] Auth module ready (stub mode)');
