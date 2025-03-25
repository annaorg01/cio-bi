
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfile, createMinimalUserProfile } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isUsingSupabase, setIsUsingSupabase] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state...');
    
    // Check if we have stored auth type preference
    const storedAuthType = localStorage.getItem('hrbrew-auth-type');
    if (storedAuthType === 'context') {
      console.log('Using context auth from localStorage preference');
      setIsUsingSupabase(false);
    }
    
    // Set up auth state listener FIRST (for Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            // Try to get profile data from Supabase
            const profileData = await fetchUserProfile(session.user.id);
            
            if (profileData) {
              console.log('Setting user from Supabase profile:', profileData);
              setUser(profileData);
              setIsUsingSupabase(true);
              localStorage.setItem('hrbrew-auth-type', 'supabase');
            } else {
              // If no profile found, create a minimal user object from auth data
              const minimalProfile = createMinimalUserProfile(session.user.id, session.user.email);
              console.log('Setting minimal user profile:', minimalProfile);
              setUser(minimalProfile);
              setIsUsingSupabase(true);
              localStorage.setItem('hrbrew-auth-type', 'supabase');
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setIsUsingSupabase(false); // Fall back to context auth
          }
        } else if (isUsingSupabase) {
          console.log('Supabase session ended, clearing user');
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Retrieved session:', session?.user?.email);
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile data for existing session
        fetchUserProfile(session.user.id)
          .then(profileData => {
            if (profileData) {
              console.log('Setting user from existing Supabase session:', profileData);
              setUser(profileData);
              setIsUsingSupabase(true);
              localStorage.setItem('hrbrew-auth-type', 'supabase');
            } else {
              // If no profile found, create a minimal user object from auth data
              const minimalProfile = createMinimalUserProfile(session.user.id, session.user.email);
              console.log('Setting minimal user profile from session:', minimalProfile);
              setUser(minimalProfile);
              setIsUsingSupabase(true);
              localStorage.setItem('hrbrew-auth-type', 'supabase');
            }
          })
          .catch(error => {
            console.error('Error fetching user profile:', error);
            setIsUsingSupabase(false); // Fall back to context auth
          });
      } else if (!isUsingSupabase || storedAuthType === 'context') {
        // Check for locally stored user if not using Supabase
        console.log('No Supabase session, checking localStorage');
        const storedUser = localStorage.getItem('hrbrew-user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Found stored user in localStorage:', parsedUser);
            setUser(parsedUser);
            setIsUsingSupabase(false);
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('hrbrew-user');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    supabaseUser,
    session,
    isUsingSupabase,
    setUser,
    setIsUsingSupabase
  };
};
