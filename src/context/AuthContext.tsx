import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  adminLogin: (email: string, pass: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wch_admin_session') === 'true';
    } catch {
      return false;
    }
  });

  const clearAuthError = () => setAuthError(null);

  // Sync profile document from Firestore
  const fetchOrSyncProfile = async (firebaseUser: User, extraData?: { displayName?: string; phone?: string }) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setUserProfile(data);
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: extraData?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Patient',
          phoneNumber: extraData?.phone || firebaseUser.phoneNumber || '',
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
      // Fallback local profile state if Firestore write rules need update
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: extraData?.displayName || firebaseUser.displayName || 'Patient',
        phoneNumber: extraData?.phone || ''
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchOrSyncProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please try again.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not yet enabled in your Firebase console. Please enable Email/Password or Google in Firebase Authentication -> Sign-in method.';
      default:
        return err?.message || 'Authentication error occurred. Please try again.';
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await fetchOrSyncProfile(cred.user);
    } catch (err: any) {
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone?: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        await fetchOrSyncProfile(cred.user, { displayName: name, phone });
      }
    } catch (err: any) {
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await fetchOrSyncProfile(cred.user);
    } catch (err: any) {
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error('No user is currently signed in');
    const currentUser = auth.currentUser;
    const uid = currentUser.uid;
    setAuthError(null);

    try {
      // 1. Delete user appointments from Firestore
      try {
        const q = query(collection(db, 'appointments'), where('userId', '==', uid));
        const snap = await getDocs(q);
        const batchDeletes = snap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(batchDeletes);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'appointments');
      }

      // 2. Delete user profile document from Firestore
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
      }

      // 3. Delete Firebase Auth account
      await deleteUser(currentUser);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        const msg = 'For security reasons, deleting your patient account requires a recent sign-in. Please sign in again and retry account deletion.';
        setAuthError(msg);
        throw new Error(msg);
      }
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const adminEmailTarget = 'ashabkoreshi09@gmail.com';
  const isAdmin = Boolean(
    adminSession || (user && user.email?.toLowerCase() === adminEmailTarget.toLowerCase())
  );

  const adminLogin = async (email: string, pass: string) => {
    setAuthError(null);
    const normalizedEmail = email.trim().toLowerCase();

    // The user specified admin credentials: ashabkoreshi09@gmail.com / 12345
    if (normalizedEmail !== adminEmailTarget || pass !== '12345') {
      const errorMsg = 'Access denied: Invalid administrator credentials. Only authorized hospital administrator can access this portal.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    // Set authorized admin session
    setAdminSession(true);
    try {
      localStorage.setItem('wch_admin_session', 'true');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Set admin user profile
    setUserProfile({
      uid: user?.uid || 'admin-ashabkoreshi-09',
      email: adminEmailTarget,
      displayName: 'Ashab Koreshi (Admin)',
      phoneNumber: '+880 1711-000000',
      createdAt: new Date().toISOString()
    });

    // Attempt Firebase sign in if available in the background
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    } catch {
      // If Firebase Auth rejects due to password policy (e.g. min 6 characters),
      // we still maintain the verified admin session since the user specifically requested password "12345".
    }
  };

  const adminLogout = async () => {
    setAdminSession(false);
    try {
      localStorage.removeItem('wch_admin_session');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        deleteAccount,
        adminLogin,
        adminLogout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
