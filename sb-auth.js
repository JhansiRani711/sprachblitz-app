// =====================================================================
// Sprachblitz — accounts and cloud sync (Firebase)
// =====================================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDFm77rEYnSP7Fpvy99iYDXMWCXP0UAQAU",
  authDomain: "sprachblitz.firebaseapp.com",
  projectId: "sprachblitz",
  storageBucket: "sprachblitz.firebasestorage.app",
  messagingSenderId: "1088979468853",
  appId: "1:1088979468853:web:ead7d1a35062caf074277c",
  measurementId: "G-HKD2Y8X0P2"
};
const ENABLE_APPLE = false;

const NO_SYNC_KEYS = ['sb_installed'];

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence, getRedirectResult,
  GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithRedirect,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendPasswordResetEmail, updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, doc, getDoc, setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let app, auth, db;
let sbUser = null;
let saveTimer = null;
let syncing = false;

const configured = !FIREBASE_CONFIG.apiKey.startsWith('PASTE_');

if (configured) {
  app  = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db   = getFirestore(app);

  setPersistence(auth, browserLocalPersistence)
    .catch(e => console.warn('[auth] persistence', e));

  getRedirectResult(auth)
    .then(res => { if (res && res.user) console.log('[auth] redirect completed', res.user.email); })
    .catch(e => { console.error('[auth] redirect failed', e); if (window.sbAuthError) window.sbAuthError(e); });
}

function collectLocal() {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('sb_') && !NO_SYNC_KEYS.includes(k)) out[k] = localStorage.getItem(k);
  }
  return out;
}

function applyLocal(data) {
  const mine = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('sb_') && !NO_SYNC_KEYS.includes(k)) mine.push(k);
  }
  mine.forEach(k => localStorage.removeItem(k));
  Object.entries(data || {}).forEach(([k, v]) => localStorage.setItem(k, v));
}

function localHasProgress() {
  const xp = parseInt(localStorage.getItem('sb_total_xp'), 10) || 0;
  const lessons = Object.keys(JSON.parse(localStorage.getItem('sb_lesson_progress') || '{}')).length;
  return xp > 0 || lessons > 0;
}
function cloudHasProgress(data) {
  if (!data) return false;
  const xp = parseInt(data.sb_total_xp, 10) || 0;
  const lessons = Object.keys(JSON.parse(data.sb_lesson_progress || '{}')).length;
  return xp > 0 || lessons > 0;
}
function summarise(data) {
  const xp = parseInt((data || {}).sb_total_xp, 10) || 0;
  const lessons = Object.keys(JSON.parse((data || {}).sb_lesson_progress || '{}')).length;
  return `${xp} XP · ${lessons} Lektionen`;
}

async function loadCloud(uid) {
  const snap = await getDoc(doc(db, 'progress', uid));
  return snap.exists() ? (snap.data().data || {}) : null;
}

async function saveCloud() {
  if (!sbUser || syncing) return;
  try {
    await setDoc(doc(db, 'progress', sbUser.uid), {
      data: collectLocal(),
      updatedAt: Date.now(),
      email: sbUser.email || null
    });
  } catch (e) {
    console.warn('[sync] save failed', e);
  }
}

const nativeSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
  nativeSetItem.call(this, k, v);
  if (sbUser && typeof k === 'string' && k.startsWith('sb_') && !NO_SYNC_KEYS.includes(k)) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCloud, 2500);
  }
};
window.addEventListener('pagehide', () => { if (sbUser) saveCloud(); });

function askWhichProgress(localData, cloudData) {
  return new Promise(resolve => {
    const host = document.getElementById('sb-auth') || document.body;
    host.innerHTML = `
      <div style="position:fixed;inset:0;z-index:9999;background:rgba(2,6,23,.92);display:flex;
                  align-items:center;justify-content:center;padding:24px">
        <div style="background:#111827;border-radius:22px;padding:22px;max-width:420px;width:100%;
                    color:#e2e8f0;font-family:'Plus Jakarta Sans',sans-serif">
          <p style="font-size:17px;font-weight:800;color:#fff;margin:0 0 6px">Welcher Fortschritt gilt?</p>
          <p style="font-size:12px;color:#94a3b8;margin:0 0 16px;line-height:1.5">
            Auf diesem Gerät und in deinem Konto steht unterschiedlicher Fortschritt.
            Was du hier nicht auswählst, geht verloren.</p>
          <button id="sb-keep-device" style="width:100%;padding:14px;border:none;border-radius:14px;
                  background:#4f46e5;color:#fff;font-weight:800;font-size:13px;margin-bottom:8px;text-align:left">
            Dieses Gerät behalten<br><span style="font-weight:600;font-size:11px;opacity:.85">${summarise(localData)}</span>
          </button>
          <button id="sb-keep-cloud" style="width:100%;padding:14px;border:none;border-radius:14px;
                  background:#334155;color:#fff;font-weight:800;font-size:13px;text-align:left">
            Konto verwenden<br><span style="font-weight:600;font-size:11px;opacity:.85">${summarise(cloudData)}</span>
          </button>
        </div>
      </div>`;
    document.getElementById('sb-keep-device').onclick = () => { host.innerHTML = ''; resolve('device'); };
    document.getElementById('sb-keep-cloud').onclick  = () => { host.innerHTML = ''; resolve('cloud'); };
  });
}

if (configured) {
  onAuthStateChanged(auth, async user => {
    console.log('[auth] state:', user ? user.email || user.uid : 'signed out');
    sbUser = user;
    window.sbUser = user;

    if (user) {
      // NEW: trial is over now that they're signed in — stop the countdown for good
      localStorage.removeItem('sb_trial_start');
      localStorage.removeItem('sb_trial_warned');
      localStorage.removeItem('sb_trial_bypass');

      syncing = true;
      try {
        const cloud = await loadCloud(user.uid);
        const local = collectLocal();

        if (!cloudHasProgress(cloud) && localHasProgress()) {
          await saveCloud();
        } else if (cloudHasProgress(cloud) && !localHasProgress()) {
          applyLocal(cloud);
        } else if (cloudHasProgress(cloud) && localHasProgress()
                   && JSON.stringify(cloud) !== JSON.stringify(local)) {
          const choice = await askWhichProgress(local, cloud);
          if (choice === 'cloud') applyLocal(cloud);
          else await saveCloud();
        }
      } catch (e) {
        console.error('[sync] load failed \u2014 check the Firestore rules', e);
        if (e && e.code === 'permission-denied' && window.sbAuthNotice) {
          window.sbAuthNotice('Angemeldet, aber Speichern ist blockiert. Firestore-Regeln pr\u00fcfen.');
        }
      }
      syncing = false;
      if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
    }

    if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
  });
}

async function withProvider(provider) {
  try {
    return await signInWithPopup(auth, provider);
  } catch (e) {
    const fallback = ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment',
                      'auth/cancelled-popup-request'];
    if (fallback.includes(e && e.code)) {
      console.warn('[auth] popup unavailable, redirecting');
      return signInWithRedirect(auth, provider);
    }
    throw e;
  }
}

window.sbAuthReady = () => configured;
window.sbAppleEnabled = () => ENABLE_APPLE;

window.sbSignInGoogle = async () => {
  try { await withProvider(new GoogleAuthProvider()); }
  catch (e) { console.error('[auth] google', e); window.sbAuthError(e); }
};

window.sbSignInApple = async () => {
  try {
    const p = new OAuthProvider('apple.com');
    p.addScope('email'); p.addScope('name');
    await withProvider(p);
  } catch (e) { window.sbAuthError(e); }
};

window.sbSignUpEmail = async (email, password, name) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    console.log('[auth] account created', cred.user.email);
  } catch (e) { console.error('[auth] signup', e); window.sbAuthError(e); }
};

window.sbSignInEmail = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('[auth] signed in', cred.user.email);
  } catch (e) { console.error('[auth] signin', e); window.sbAuthError(e); }
};

window.sbResetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    window.sbAuthNotice('E-Mail zum Zurücksetzen wurde gesendet.');
  } catch (e) { window.sbAuthError(e); }
};

window.sbSignOut = async () => {
  await saveCloud();
  await signOut(auth);
  sbUser = null; window.sbUser = null;
  if (typeof renderActiveTabModule === 'function') renderActiveTabModule();
};

window.sbForceSync = saveCloud;
