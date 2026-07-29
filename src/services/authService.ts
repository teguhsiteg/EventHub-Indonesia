import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile, UserRole } from '../types';
import { logAuditEvent } from './auditService';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function syncUserProfile(
  fbUser: FirebaseUser, 
  role: UserRole = 'PARTICIPANT',
  extraData?: { displayName?: string; phoneNumber?: string }
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(userDocRef);
  const now = new Date().toISOString();

  if (!snap.exists()) {
    // Check if this is the designated super admin email or first account
    const isFirstAccount = fbUser.email === 'teercard@gmail.com' || fbUser.email?.includes('admin');
    const assignedRole: UserRole = isFirstAccount ? 'SUPER_ADMIN' : role;

    const newProfile: UserProfile = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: extraData?.displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Peserta',
      role: assignedRole,
      photoURL: fbUser.photoURL || null,
      phoneNumber: extraData?.phoneNumber || fbUser.phoneNumber || null,
      isEmailVerified: fbUser.emailVerified,
      createdAt: now,
      updatedAt: now,
    };
    
    // Clean up undefined values that Firestore rejects
    Object.keys(newProfile).forEach(key => {
      if ((newProfile as any)[key] === undefined) {
        delete (newProfile as any)[key];
      }
    });

    await setDoc(userDocRef, newProfile);
    
    // Also add to admins collection if super_admin / admin
    if (assignedRole === 'SUPER_ADMIN' || assignedRole === 'ADMIN') {
      await setDoc(doc(db, 'admins', fbUser.uid), {
        uid: fbUser.uid,
        email: fbUser.email,
        role: assignedRole,
        createdAt: now
      });
    }

    await logAuditEvent(fbUser.uid, fbUser.email || '', assignedRole, 'REGISTER_USER', 'users', fbUser.uid);
    return newProfile;
  } else {
    const existing = snap.data() as UserProfile;
    const updatedProfile: UserProfile = {
      ...existing,
      displayName: extraData?.displayName || existing.displayName || fbUser.displayName || 'Peserta',
      phoneNumber: extraData?.phoneNumber || existing.phoneNumber,
      isEmailVerified: fbUser.emailVerified,
      updatedAt: now,
    };
    await updateDoc(userDocRef, {
      displayName: updatedProfile.displayName,
      phoneNumber: updatedProfile.phoneNumber || null,
      isEmailVerified: updatedProfile.isEmailVerified,
      updatedAt: now,
    });
    return updatedProfile;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<{ profile: UserProfile; token: string }> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const profile = await syncUserProfile(cred.user);
  const token = await cred.user.getIdToken();
  
  await logAuditEvent(profile.uid, profile.email, profile.role, 'LOGIN_EMAIL', 'users', profile.uid);
  return { profile, token };
}

export async function registerWithEmail(
  email: string, 
  pass: string, 
  fullName: string, 
  phone: string
): Promise<{ profile: UserProfile; token: string }> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const profile = await syncUserProfile(cred.user, 'PARTICIPANT', {
    displayName: fullName,
    phoneNumber: phone
  });

  // Send email verification
  try {
    await sendEmailVerification(cred.user);
  } catch (err) {
    console.warn('Could not send verification email:', err);
  }

  const token = await cred.user.getIdToken();
  return { profile, token };
}

export async function loginWithGoogle(): Promise<{ profile: UserProfile; token: string }> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const profile = await syncUserProfile(cred.user);
  const token = await cred.user.getIdToken();

  await logAuditEvent(profile.uid, profile.email, profile.role, 'LOGIN_OAUTH_GOOGLE', 'users', profile.uid);
  return { profile, token };
}

export async function logoutUser(): Promise<void> {
  const current = auth.currentUser;
  if (current) {
    const prof = await getUserProfile(current.uid);
    if (prof) {
      await logAuditEvent(prof.uid, prof.email, prof.role, 'LOGOUT', 'users', prof.uid);
    }
  }
  await signOut(auth);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function sendUserEmailVerification(): Promise<void> {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error('Tidak ada pengguna yang terautentikasi.');
  }
}

export async function updateUserRoleBySuperAdmin(
  adminUid: string,
  adminEmail: string,
  targetUid: string,
  newRole: UserRole
): Promise<void> {
  const userRef = doc(db, 'users', targetUid);
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: new Date().toISOString()
  });

  if (newRole === 'SUPER_ADMIN' || newRole === 'ADMIN') {
    await setDoc(doc(db, 'admins', targetUid), {
      uid: targetUid,
      role: newRole,
      updatedAt: new Date().toISOString()
    });
  } else if (newRole === 'ORGANIZER') {
    await setDoc(doc(db, 'organizers', targetUid), {
      uid: targetUid,
      role: newRole,
      updatedAt: new Date().toISOString()
    });
  }

  await logAuditEvent(adminUid, adminEmail, 'SUPER_ADMIN', 'CHANGE_USER_ROLE', 'users', targetUid, { newRole });
}
