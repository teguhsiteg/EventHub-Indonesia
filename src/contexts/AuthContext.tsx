import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserProfile } from '../types';
import { 
  getUserProfile, 
  syncUserProfile, 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser,
  requestPasswordReset,
  sendUserEmailVerification
} from '../services/authService';
import { ensureInitialSeed } from '../services/seedService';

interface AuthContextType {
  user: UserProfile | null;
  fbUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  login: typeof loginWithEmail;
  register: typeof registerWithEmail;
  loginGoogle: typeof loginWithGoogle;
  logout: typeof logoutUser;
  resetPassword: typeof requestPasswordReset;
  resendVerificationEmail: typeof sendUserEmailVerification;
  refreshProfile: () => Promise<void>;
  getToken: () => Promise<string | null>;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isParticipant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const prof = await getUserProfile(auth.currentUser.uid);
      if (prof) setUser(prof);
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    ensureInitialSeed().catch(err => console.warn('Seed check error:', err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setFbUser(firebaseUser);
        try {
          let prof = await getUserProfile(firebaseUser.uid);
          if (!prof) {
            prof = await syncUserProfile(firebaseUser);
          }
          setUser(prof);
        } catch (e: any) {
          console.error('Error fetching user profile:', e);
          setError(e.message || 'Gagal memuat profil pengguna');
        }
      } else {
        setFbUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const role = user?.role || 'PARTICIPANT';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isOrganizer = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'ORGANIZER';
  const isParticipant = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      fbUser,
      loading,
      error,
      login: loginWithEmail,
      register: registerWithEmail,
      loginGoogle: loginWithGoogle,
      logout: logoutUser,
      resetPassword: requestPasswordReset,
      resendVerificationEmail: sendUserEmailVerification,
      refreshProfile,
      getToken,
      isSuperAdmin,
      isAdmin,
      isOrganizer,
      isParticipant
    }}>
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
