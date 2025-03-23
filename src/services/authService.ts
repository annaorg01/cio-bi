
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CONTEXT_USERS, UserProfile } from '@/types/auth';

/**
 * Fetches user profile from Supabase
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    if (profileData) {
      return {
        id: profileData.id,
        username: profileData.username || '',
        email: profileData.email || '',
        full_name: profileData.full_name || '',
        department: profileData.department || '',
        isAdmin: profileData.is_admin || false
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
 * Signs in with Supabase
 */
export const signInWithSupabase = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  
  return data;
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
 * Signs out the user from Supabase
 */
export const signOut = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('hrbrew-user');
  
  toast({
    title: "התנתקת",
    description: "להתראות!",
  });
};
