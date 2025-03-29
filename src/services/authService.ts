
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';
import { CONTEXT_USERS, UserProfile } from '@/types/auth';
import { auth, db } from '@/integrations/firebase/client';

/**
 * Fetches user profile from Firebase
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'profiles', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const profileData = userDoc.data();
      return {
        id: userId,
        username: profileData.username || '',
        email: profileData.email || '',
        full_name: profileData.full_name || '',
        department: profileData.department || '',
        isAdmin: profileData.isAdmin || false
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Creates a minimal user profile from auth data
 */
export const createMinimalUserProfile = (userId: string, email?: string): UserProfile => {
  return {
    id: userId,
    username: email?.split('@')[0] || '',
    email: email || '',
    isAdmin: false
  };
};

/**
 * Signs in with Firebase
 */
export const signInWithFirebase = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
};

/**
 * Attempts to log in the user with context data (fallback)
 */
export const contextLogin = (email: string, password: string) => {
  const contextUser = CONTEXT_USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (contextUser) {
    const { password: _, ...userWithoutPassword } = contextUser;
    localStorage.setItem('hrbrew-user', JSON.stringify(userWithoutPassword));
    
    toast({
      title: "התחברת בהצלחה (מצב מקומי)",
      description: `ברוך הבא, ${contextUser.full_name || email}!`,
    });
    
    return userWithoutPassword;
  }
  
  return null;
};

/**
 * Signs out the user from Firebase
 */
export const signOut = async () => {
  await firebaseSignOut(auth);
  localStorage.removeItem('hrbrew-user');
  
  toast({
    title: "התנתקת",
    description: "להתראות!",
  });
};
