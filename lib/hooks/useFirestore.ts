import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
  onSnapshot,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase/config';

export function useDocument<T>(collectionName: string, documentId: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    const setupListener = async () => {
      try {
        const db = getDb();
        if (!mounted) return;
        
        setLoading(true);
        
        unsubscribe = onSnapshot(
          doc(db, collectionName, documentId),
          (snapshot) => {
            if (!mounted) return;
            if (snapshot.exists()) {
              setData({ id: snapshot.id, ...snapshot.data() } as T);
            } else {
              setData(null);
            }
            setLoading(false);
            setError(null);
          },
          (err) => {
            if (!mounted) return;
            setError(err as Error);
            setLoading(false);
          }
        );
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
        setLoading(false);
      }
    };

    // Delay slightly to allow Firebase to initialize
    const timer = setTimeout(() => {
      setupListener();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [collectionName, documentId]);

  return { data, loading, error };
}

export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    const setupListener = async () => {
      try {
        const db = getDb();
        if (!mounted) return;
        
        setLoading(true);
        const q = query(collection(db, collectionName), ...constraints);

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!mounted) return;
            const items = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as T[];
            setData(items);
            setLoading(false);
            setError(null);
          },
          (err) => {
            if (!mounted) return;
            setError(err as Error);
            setLoading(false);
          }
        );
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
        setLoading(false);
      }
    };

    // Delay slightly to allow Firebase to initialize
    const timer = setTimeout(() => {
      setupListener();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

export async function createDocument<T>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  docId?: string
) {
  const db = getDb();
  
  const docRef = docId 
    ? doc(db, collectionName, docId)
    : doc(collection(db, collectionName));
  const now = Timestamp.now();
  
  const documentData = {
    ...data,
    id: docRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, documentData);
  return documentData as T;
}

export async function updateDocument<T>(
  collectionName: string,
  documentId: string,
  data: Partial<Omit<T, 'id' | 'createdAt'>>
) {
  const db = getDb();
  
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteDocument(collectionName: string, documentId: string) {
  const db = getDb();
  
  await deleteDoc(doc(db, collectionName, documentId));
}

export async function getDocument<T>(collectionName: string, documentId: string) {
  const db = getDb();
  
  const docRef = doc(db, collectionName, documentId);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as T;
  }
  return null;
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const db = getDb();
  
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
}
