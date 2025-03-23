
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
              setUser(profileData);
            } else {
              // If no profile found, create a minimal user object from auth data
              setUser(createMinimalUserProfile(session.user.id, session.user.email));
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            setIsUsingSupabase(false); // Fall back to context auth
          }
        } else {
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
              setUser(profileData);
            } else {
              // If no profile found, create a minimal user object from auth data
              setUser(createMinimalUserProfile(session.user.id, session.user.email));
            }
          })
          .catch(error => {
            console.error('Error fetching user profile:', error);
            setIsUsingSupabase(false); // Fall back to context auth
          });
      } else if (!isUsingSupabase) {
        // Check for locally stored user if not using Supabase
        const storedUser = localStorage.getItem('hrbrew-user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('hrbrew-user');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isUsingSupabase]);

  return {
    user,
    supabaseUser,
    session,
    isUsingSupabase,
    setUser,
    setIsUsingSupabase
  };
};
