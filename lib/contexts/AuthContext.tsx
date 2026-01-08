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
import { collection, doc, getDoc, getDocs, query, setDoc, deleteDoc, Timestamp, onSnapshot, where } from 'firebase/firestore';
import { getAuthInstance, getDb } from '@/lib/firebase/config';
import { User, UserRole } from '@/lib/types';

const OWNER_EMAILS = ['test@saaforge.com']; // Add owner emails here

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isTeamApproved: boolean;
  teamApprovalChecked: boolean;
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
  const [teamApprovalChecked, setTeamApprovalChecked] = useState(false);

  // Check approval and cache it, also migrate email profile to UID
  const checkAndCacheApproval = async (fbUser: FirebaseUser) => {
    try {
      const db = getDb();
      if (fbUser.uid) {
        let isApproved = false;

        // Check if approved by userId
        const byUserQuery = query(
          collection(db, 'teamProfiles'),
          where('userId', '==', fbUser.uid)
        );
        const byUserSnapshot = await getDocs(byUserQuery);

        if (!byUserSnapshot.empty) {
          const profileData = byUserSnapshot.docs[0].data();
          isApproved = profileData.isApproved === true;
        } else if (fbUser.email) {
          // Fallback to legacy email/UID doc IDs
          const emailProfileRef = doc(db, 'teamProfiles', fbUser.email);
          const emailProfileDoc = await getDoc(emailProfileRef);

          const uidProfileRef = doc(db, 'teamProfiles', fbUser.uid);
          const uidProfileDoc = await getDoc(uidProfileRef);

          if (emailProfileDoc.exists() && emailProfileDoc.data().isApproved === true) {
            isApproved = true;
          } else if (uidProfileDoc.exists() && uidProfileDoc.data().isApproved === true) {
            isApproved = true;
          }

          // Migrate email profile to UID if needed
          if (emailProfileDoc.exists() && !uidProfileDoc.exists()) {
            try {
              const profileData = emailProfileDoc.data();
              await setDoc(uidProfileRef, {
                ...profileData,
                userId: fbUser.uid,
                updatedAt: Timestamp.now(),
              });
              console.log('Migrated email-based profile to UID');
              // Delete email profile after migration
              await deleteDoc(emailProfileRef);
              console.log('Deleted email-based profile');
            } catch (error) {
              console.error('Error migrating profile:', error);
            }
          } else if (emailProfileDoc.exists() && uidProfileDoc.exists()) {
            // Both exist, delete email profile
            try {
              await deleteDoc(emailProfileRef);
              console.log('Deleted duplicate email-based profile');
            } catch (error) {
              console.error('Error deleting email profile:', error);
            }
          }
        }

        // Cache approval in localStorage
        localStorage.setItem(`approval_${fbUser.uid}`, isApproved ? 'true' : 'false');
        setIsTeamApproved(isApproved);
      }
    } catch (error) {
      console.error('Error checking and caching approval:', error);
      setIsTeamApproved(false);
    }
  };

  useEffect(() => {
    try {
      const auth = getAuthInstance();
      const db = getDb();

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Check and cache approval immediately when auth state changes (user logs in)
            await checkAndCacheApproval(firebaseUser);
            
            // Set up real-time listener for user document to catch role changes
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const unsubscribeUserDoc = onSnapshot(userDocRef, (userDocSnapshot) => {
              try {
                // Check if user email is in owner list
                const isOwnerEmail = firebaseUser.email && OWNER_EMAILS.includes(firebaseUser.email);
                
                if (userDocSnapshot.exists()) {
                  let userData = userDocSnapshot.data() as User;
                  
                  // Override role if email is in owner list
                  if (isOwnerEmail) {
                    userData = { ...userData, role: 'owner' };
                    setIsTeamApproved(false); // Owners don't need approval
                  } else if (userData.role === 'team') {
                    // For team members, approval is already cached by checkAndCacheApproval
                    // Read the cached value to update UI state
                    const cachedApproval = localStorage.getItem(`approval_${firebaseUser.uid}`);
                    setIsTeamApproved(cachedApproval === 'true');
                  } else {
                    // Not a team member, no approval needed
                    setIsTeamApproved(false);
                  }
                  
                  setUser(userData);
                  setFirebaseUser(firebaseUser);
                  setLoading(false);
                  setTeamApprovalChecked(true);
            } else if (isOwnerEmail) {
              // Create owner document if it doesn't exist
              const ownerUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                role: 'owner',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
              };
              // Owners don't need approval check
              setIsTeamApproved(false);
              setUser(ownerUser);
              setFirebaseUser(firebaseUser);
              setLoading(false);
              setTeamApprovalChecked(true);
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
                  setUser(newUser);
                  setFirebaseUser(firebaseUser);
                  setLoading(false);
                  setTeamApprovalChecked(true);
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
            setTeamApprovalChecked(false);
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check and cache approval after successful login
    if (userCredential.user) {
      await checkAndCacheApproval(userCredential.user);
    }
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
        profilePicture: result.user.photoURL || undefined,
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
        isApproved: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // Check and cache approval after successful login
    await checkAndCacheApproval(result.user);
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    // Clear approval cache on logout
    if (auth.currentUser?.uid) {
      localStorage.removeItem(`approval_${auth.currentUser.uid}`);
    }
    localStorage.removeItem('loginTime');
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
    <AuthContext.Provider value={{ user, firebaseUser, loading, isTeamApproved, teamApprovalChecked, signIn, signInWithGoogle, signOut, registerWithInviteCode }}>
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
