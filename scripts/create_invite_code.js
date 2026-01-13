/*
  Usage:
    - Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON with Firestore access.
    - Run: node scripts/create_invite_code.js

  This script will create/update the inviteCodes/join@sasforge_02 document.
*/

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.');
  process.exit(1);
}

admin.initializeApp();
const db = admin.firestore();

async function upsertInvite() {
  const codeId = 'join@sasforge_02';
  const docRef = db.collection('inviteCodes').doc(codeId);

  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)); // 1 year

  const payload = {
    code: codeId,
    email: '',
    requestId: null,
    isUsed: false,
    usedBy: null,
    usedAt: null,
    ignoreEmail: true,
    createdBy: 'script',
    createdAt: now,
    expiresAt,
  };

  await docRef.set(payload, { merge: true });
  console.log(`Upserted invite code '${codeId}' (ignoreEmail: true, expiresAt: ${expiresAt.toDate().toISOString()})`);
}

upsertInvite().catch(err => {
  console.error('Failed to upsert invite code:', err);
  process.exit(1);
});
