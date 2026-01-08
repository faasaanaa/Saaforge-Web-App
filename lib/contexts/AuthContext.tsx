'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { getAuthInstance, getDb } from '@/lib/firebase/config';
import { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isTeamApproved: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  registerWithInviteCode: (email: string, password: string, inviteCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTeamApproved, setIsTeamApproved] = useState(false);

  // Define owner emails
  const OWNER_EMAILS = ['saaforge@gmail.com', 'emsaadsaad580@gmail.com'];

  useEffect(() => {
    try {
      const auth = getAuthInstance();
      const db = getDb();

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Set up real-time listener for user document to catch role changes
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const unsubscribeUserDoc = onSnapshot(userDocRef, async (userDocSnapshot) => {
              try {
                // Check if user email is in owner list
                const isOwnerEmail = firebaseUser.email && OWNER_EMAILS.includes(firebaseUser.email);
                
                if (userDocSnapshot.exists()) {
                  let userData = userDocSnapshot.data() as User;
                  
                  // Override role if email is in owner list
                  if (isOwnerEmail) {
                    userData = { ...userData, role: 'owner' };
                    setIsTeamApproved(false); // Owners don't need approval
                  } else if (userData.role === 'team' && firebaseUser.email) {
                    // Check if user has an approved teamProfile (join request approved)
                    // Check both UID and email locations
                    const uidProfileRef = doc(db, 'teamProfiles', firebaseUser.uid);
                    const uidProfileDoc = await getDoc(uidProfileRef);
                    
                    const emailProfileRef = doc(db, 'teamProfiles', firebaseUser.email);
                    const emailProfileDoc = await getDoc(emailProfileRef);
                    
                    // Prefer email-based profile if it exists and is approved (from join request)
                    // Otherwise check UID-based profile
                    let isApproved = false;
                    if (emailProfileDoc.exists() && emailProfileDoc.data().isApproved === true) {
                      isApproved = true;
                    } else if (uidProfileDoc.exists() && uidProfileDoc.data().isApproved === true) {
                      isApproved = true;
                    }
                    
                    // Set approval state
                    setIsTeamApproved(isApproved);
                    
                    // If any approved teamProfile exists, upgrade to team role
                    if (isApproved) {
                      userData = { ...userData, role: 'team' };
                      // Update user document with new role
                      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
                    }
                  } else {
                    // Not a team member, no approval needed
                    setIsTeamApproved(false);
                  }
                  
                  setUser(userData);
                  setFirebaseUser(firebaseUser);
                  setLoading(false);
              
              // Legacy migration: Clean up old email-based teamProfiles (from before UID-based fix)
              // This runs once for existing users, then can be removed in future
              if (firebaseUser.email && userData.role === 'team') {
                try {
                  const emailProfileRef = doc(db, 'teamProfiles', firebaseUser.email);
                  const emailProfileDoc = await getDoc(emailProfileRef);
                  
                  if (emailProfileDoc.exists()) {
                    const uidProfileRef = doc(db, 'teamProfiles', firebaseUser.uid);
                    const uidProfileDoc = await getDoc(uidProfileRef);
                    
                    if (!uidProfileDoc.exists()) {
                      // Migrate if UID profile doesn't exist
                      console.log('Migrating old email-based profile to UID:', firebaseUser.email);
                      const profileData = emailProfileDoc.data();
                      await setDoc(uidProfileRef, {
                        ...profileData,
                        userId: firebaseUser.uid,
                        profilePicture: profileData.profilePicture || firebaseUser.photoURL || '',
                        updatedAt: Timestamp.now(),
                      });
                    }
                    // Delete email-based profile in both cases
                    await deleteDoc(emailProfileRef);
                    console.log('Deleted old email-based profile');
                  }
                } catch (error: any) {
                  // Ignore permission errors - profile will be cleaned up later
                  if (!error?.code?.includes('permission')) {
                    console.error('Error during migration:', error);
                  }
                }
                
                // Update Google profile picture if not set
                if (firebaseUser.photoURL) {
                  try {
                    const uidProfileRef = doc(db, 'teamProfiles', firebaseUser.uid);
                    const uidProfileDoc = await getDoc(uidProfileRef);
                    if (uidProfileDoc.exists() && !uidProfileDoc.data().profilePicture) {
                      await setDoc(uidProfileRef, {
                        profilePicture: firebaseUser.photoURL,
                        updatedAt: Timestamp.now(),
                      }, { merge: true });
                    }
                  } catch (error: any) {
                    // Ignore permission errors
                    if (!error?.code?.includes('permission')) {
                      console.error('Error updating profile picture:', error);
                    }
                  }
                }
              }
            } else if (isOwnerEmail) {
              // Create owner document if it doesn't exist
              const ownerUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: 'owner',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), ownerUser);
              setUser(ownerUser);
              setFirebaseUser(firebaseUser);
              setLoading(false);
                } else {
                  // User exists in Firebase but no user document in Firestore
                  // Create a default user with team role (requires approval to access dashboard)
                  const newUser: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email!,
                    role: 'team', // Default role for new users (requires approval)
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                  };
                  await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
                  setUser(newUser);
                  setFirebaseUser(firebaseUser);
                  setLoading(false);
                }
              } catch (error) {
                console.error('Error in user document listener:', error);
                setLoading(false);
              }
            });
            
            // Store the unsubscribe function to clean up later
            return () => unsubscribeUserDoc();
          } else {
            setUser(null);
            setFirebaseUser(null);
            setIsTeamApproved(false);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setLoading(false);
        }
      });

    return () => unsubscribe();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = getAuthInstance();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const auth = getAuthInstance();
    const db = getDb();
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for Google sign-in users
      const newUser: User = {
        uid: result.user.uid,
        email: result.user.email!,
        role: 'team', // Default role for new users - requires approval to access dashboard
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      
      // Create initial team profile
      await setDoc(doc(db, 'teamProfiles', result.user.uid), {
        id: result.user.uid,
        userId: result.user.uid,
        name: result.user.displayName || '',
        email: result.user.email!,
        profilePicture: result.user.photoURL || undefined, // Google profile picture
        role: '',
        bio: '',
        skills: [],
        interests: [],
        achievements: [],
        portfolioLinks: [],
        socialLinks: {},
        visibility: {
          name: true,
          role: true,
          bio: true,
          skills: true,
          interests: false,
          achievements: false,
          portfolioLinks: false,
          socialLinks: false,
        },
        isPubliclyVisible: false,
        isApproved: false, // Requires approval for Google sign-ins
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
  };

  const registerWithInviteCode = async (
    email: string,
    password: string,
    inviteCode: string
  ) => {
    const auth = getAuthInstance();
    const db = getDb();
    
    // Verify invite code
    const inviteDoc = await getDoc(doc(db, 'inviteCodes', inviteCode));
    
    if (!inviteDoc.exists()) {
      throw new Error('Invalid invite code');
    }

    const invite = inviteDoc.data();
    
    if (invite.isUsed) {
      throw new Error('Invite code has already been used');
    }

    if (invite.email !== email) {
      throw new Error('Invite code does not match email');
    }

    if (invite.expiresAt.toDate() < new Date()) {
      throw new Error('Invite code has expired');
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document
    const newUser: User = {
      uid: userCredential.user.uid,
      email,
      role: 'team',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

    // Mark invite code as used
    await setDoc(
      doc(db, 'inviteCodes', inviteCode),
      {
        isUsed: true,
        usedBy: userCredential.user.uid,
        usedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Create initial team profile
    await setDoc(doc(db, 'teamProfiles', userCredential.user.uid), {
      id: userCredential.user.uid,
      userId: userCredential.user.uid,
      name: '',
      email,
      role: '',
      bio: '',
      skills: [],
      interests: [],
      achievements: [],
      portfolioLinks: [],
      socialLinks: {},
      visibility: {
        name: true,
        role: true,
        bio: true,
        skills: true,
        interests: false,
        achievements: false,
        portfolioLinks: false,
        socialLinks: false,
      },
      isPubliclyVisible: false,
      isApproved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isTeamApproved, signIn, signInWithGoogle, signOut, registerWithInviteCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
