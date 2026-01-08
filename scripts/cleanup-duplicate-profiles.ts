/**
 * One-time cleanup script to remove email-based teamProfile documents
 * and keep only UID-based documents to prevent duplicate cards on team page
 * 
 * Run this with: npx ts-node scripts/cleanup-duplicate-profiles.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

// Your Firebase config (copy from lib/firebase/config.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicateProfiles() {
  // Searching for duplicate teamProfiles...
  
  try {
    const teamProfilesRef = collection(db, 'teamProfiles');
    const snapshot = await getDocs(teamProfilesRef);
    
    const emailBasedDocs: string[] = [];
    const uidBasedDocs: string[] = [];
    
    snapshot.forEach((doc) => {
      const id = doc.id;
      
      // Email-based IDs contain @ symbol
      if (id.includes('@')) {
        emailBasedDocs.push(id);
      } else {
        uidBasedDocs.push(id);
      }
    });
    
    if (emailBasedDocs.length === 0) {
      return;
    }
    
    // Deleting email-based profiles...
    for (const emailId of emailBasedDocs) {
      await deleteDoc(doc(db, 'teamProfiles', emailId));
    }
    
  } catch (error) {
    throw error;
  }
}

// Run the cleanup
cleanupDuplicateProfiles()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
