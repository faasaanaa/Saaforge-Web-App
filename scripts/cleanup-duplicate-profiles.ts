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
  console.log('🔍 Searching for duplicate teamProfiles...\n');
  
  try {
    const teamProfilesRef = collection(db, 'teamProfiles');
    const snapshot = await getDocs(teamProfilesRef);
    
    const emailBasedDocs: string[] = [];
    const uidBasedDocs: string[] = [];
    
    snapshot.forEach((doc) => {
      const id = doc.id;
      const data = doc.data();
      
      // Email-based IDs contain @ symbol
      if (id.includes('@')) {
        emailBasedDocs.push(id);
        console.log(`📧 Email-based profile: ${id}`);
        console.log(`   Name: ${data.name}, Approved: ${data.isApproved}`);
      } else {
        uidBasedDocs.push(id);
        console.log(`✅ UID-based profile: ${id}`);
        console.log(`   Name: ${data.name}, Approved: ${data.isApproved}`);
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Email-based profiles: ${emailBasedDocs.length}`);
    console.log(`   UID-based profiles: ${uidBasedDocs.length}`);
    
    if (emailBasedDocs.length === 0) {
      console.log('\n✨ No duplicate profiles found! All clean.');
      return;
    }
    
    console.log(`\n🗑️  Deleting ${emailBasedDocs.length} email-based profiles...`);
    
    for (const emailId of emailBasedDocs) {
      await deleteDoc(doc(db, 'teamProfiles', emailId));
      console.log(`   ✓ Deleted: ${emailId}`);
    }
    
    console.log('\n✅ Cleanup complete! Only UID-based profiles remain.');
    console.log('💡 Users will be migrated to UID-based profiles automatically on next login.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupDuplicateProfiles()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });
