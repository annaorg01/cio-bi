
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile } from '@/types/auth';
import { auth } from '@/integrations/firebase/client';
import { fetchUserProfile, createMinimalUserProfile } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isUsingFirebase, setIsUsingFirebase] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state...');
    
    // Check if we have stored auth type preference
    const storedAuthType = localStorage.getItem('hrbrew-auth-type');
    if (storedAuthType === 'context') {
      console.log('Using context auth from localStorage preference');
      setIsUsingFirebase(false);
    }
    
    // Set up auth state listener for Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.email);
      setFirebaseUser(currentUser);
      
      if (currentUser) {
        try {
          // Try to get profile data from Firebase
          const profileData = await fetchUserProfile(currentUser.uid);
          
          if (profileData) {
            console.log('Setting user from Firebase profile:', profileData);
            setUser(profileData);
            setIsUsingFirebase(true);
            localStorage.setItem('hrbrew-auth-type', 'firebase');
          } else {
            // If no profile found, create a minimal user object from auth data
            const minimalProfile = createMinimalUserProfile(currentUser.uid, currentUser.email || undefined);
            console.log('Setting minimal user profile:', minimalProfile);
            setUser(minimalProfile);
            setIsUsingFirebase(true);
            localStorage.setItem('hrbrew-auth-type', 'firebase');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setIsUsingFirebase(false); // Fall back to context auth
        }
      } else if (isUsingFirebase) {
        console.log('Firebase session ended, clearing user');
        setUser(null);
      }
    });

    // Check for locally stored user if not using Firebase
    if (!isUsingFirebase || storedAuthType === 'context') {
      console.log('Not using Firebase, checking localStorage');
      const storedUser = localStorage.getItem('hrbrew-user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Found stored user in localStorage:', parsedUser);
          setUser(parsedUser);
          setIsUsingFirebase(false);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('hrbrew-user');
        }
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    user,
    firebaseUser,
    isUsingFirebase,
    setUser,
    setIsUsingFirebase
  };
};
