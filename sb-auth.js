// ===== FIREBASE SETUP =====
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAVkPB4-OhcVN5nJ8qR2mX9pL1zY3vW5aB",
    authDomain: "sprachblitz-app.firebaseapp.com",
    projectId: "sprachblitz-app",
    storageBucket: "sprachblitz-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ===== AUDIO INITIALIZATION (works on iOS) =====
function initializeAudio() {
    console.log('🔊 Initializing audio context...');
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
                console.log('✅ Audio context resumed');
            });
        }
        
        // Unlock audio with user interaction
        const unlock = () => {
            const emptyBuffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = emptyBuffer;
            source.connect(ctx.destination);
            try {
                source.start(0);
            } catch (e) {}
            console.log('✅ Audio unlocked via user interaction');
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        };
        
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
        
    } catch (error) {
        console.log('⚠️ Audio init error (non-critical):', error);
    }
}

// Initialize audio immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAudio);
} else {
    initializeAudio();
}

// ===== AUTH STATE HANDLER =====
let authInitialized = false;

onAuthStateChanged(auth, (user) => {
    authInitialized = true;
    console.log('[Firebase] Auth state changed. User:', user ? user.email : 'Anonymous');
    
    if (user) {
        console.log('✅ USER LOGGED IN:', user.email);
        updateLoginDisplay(user);
        
        // Hide trial banner when logged in
        const trialBanner = document.getElementById('trial-banner');
        if (trialBanner) {
            trialBanner.style.display = 'none';
        }
        
        // Stop trial timer
        if (window.trialInterval) {
            clearInterval(window.trialInterval);
            console.log('⏸️ Trial timer stopped');
        }
        
    } else {
        console.log('User not logged in');
        hideLoginDisplay();
    }
});

function updateLoginDisplay(user) {
    console.log('🔄 Updating login display for:', user.email);
    
    // Find all possible KONTO sections
    const kontoSelectors = [
        '#konto',
        '[data-tab="konto"]',
        '.konto-section',
        '[data-section="konto"]',
        document.getElementById('konto-content'),
        document.querySelector('[data-konto]'),
        // Try to find by text content
        ...Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent.includes('KONTO') || el.textContent.includes('Konto')
        )
    ];
    
    let found = false;
    
    // Try each selector
    for (let selector of kontoSelectors) {
        let element = null;
        
        if (typeof selector === 'string') {
            element =
