import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, Storage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: Storage | undefined;

function initializeFirebase() {
  if (typeof window === 'undefined') return;
  
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
  
  return { app, auth, db, storage };
}

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Getter functions to ensure Firebase is initialized
function getDb(): Firestore {
  if (!db) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase not available on server');
    }
    initializeFirebase();
    if (!db) {
      throw new Error('Firebase initialization failed');
    }
  }
  return db;
}

function getAuthInstance(): Auth {
  if (!auth) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase not available on server');
    }
    initializeFirebase();
    if (!auth) {
      throw new Error('Firebase initialization failed');
    }
  }
  return auth;
}

function getStorageInstance(): Storage {
  if (!storage) {
    if (typeof window === 'undefined') {
      throw new Error('Firebase not available on server');
    }
    initializeFirebase();
    if (!storage) {
      throw new Error('Firebase initialization failed');
    }
  }
  return storage;
}

export { app, auth, db, storage, getDb, getAuthInstance, getStorageInstance, initializeFirebase };
