
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  department?: string;
  full_name?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Context backup data for development/fallback
const CONTEXT_USERS = [
  { 
    id: '1', 
    username: 'advaz', 
    password: 'AdvaZ913530', // Updated password
    isAdmin: true,
    email: 'AdvaZ@hod-hasharon.muni.il',
    full_name: 'אדוה צביאלי',
    department: 'טכנולוגיות ומערכות מידע'
  },
  { 
    id: '2', 
    username: 'meytalab', 
    password: 'user123', 
    isAdmin: false,
    email: 'meytalab@hod-hasharon.muni.il',
    full_name: 'מיטל אלבין- בש',
    department: 'משאבי אנוש'
  },
  { 
    id: '3', 
    username: 'michala', 
    password: 'user123', 
    isAdmin: false,
    email: 'MichalA@hod-hasharon.muni.il',
    full_name: 'מיכל אלמגור',
    department: 'פניות ציבור וחופש המידע'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;
            
            // Convert the Supabase profile to our app's user format
            if (profileData) {
              setUser({
                id: profileData.id,
                username: profileData.username || session.user.email?.split('@')[0] || '',
                email: profileData.email || session.user.email,
                full_name: profileData.full_name || '',
                department: profileData.department || '',
                isAdmin: profileData.is_admin || false
              });
            } else {
              // If no profile found, create a minimal user object from auth data
              setUser({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || '',
                email: session.user.email || '',
                isAdmin: false
              });
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
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData, error }) => {
            if (error) {
              console.error('Error fetching user profile:', error);
              setIsUsingSupabase(false); // Fall back to context auth
              return;
            }
            
            if (profileData) {
              setUser({
                id: profileData.id,
                username: profileData.username || session.user.email?.split('@')[0] || '',
                email: profileData.email || session.user.email,
                full_name: profileData.full_name || '',
                department: profileData.department || '',
                isAdmin: profileData.is_admin || false
              });
            } else {
              // If no profile found, create a minimal user object from auth data
              setUser({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || '',
                email: session.user.email || '',
                isAdmin: false
              });
            }
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (isUsingSupabase) {
        // Try Supabase auth first
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error('Supabase login error:', error);
          
          // If Supabase auth fails, try context auth as fallback
          const contextUser = CONTEXT_USERS.find(
            (u) => u.email === email && u.password === password
          );

          if (contextUser) {
            setIsUsingSupabase(false);
            const { password: _, ...userWithoutPassword } = contextUser;
            setUser(userWithoutPassword);
            localStorage.setItem('hrbrew-user', JSON.stringify(userWithoutPassword));
            toast({
              title: "התחברת בהצלחה (מצב מקומי)",
              description: `ברוך הבא, ${contextUser.full_name || email}!`,
            });
            return true;
          }
          
          toast({
            variant: "destructive",
            title: "התחברות נכשלה",
            description: error.message || "שם משתמש או סיסמה שגויים",
          });
          return false;
        }

        if (data.session) {
          toast({
            title: "התחברת בהצלחה",
            description: `ברוך הבא, ${email}!`,
          });
          return true;
        }
      } else {
        // Use context auth directly if not using Supabase
        const contextUser = CONTEXT_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (contextUser) {
          const { password: _, ...userWithoutPassword } = contextUser;
          setUser(userWithoutPassword);
          localStorage.setItem('hrbrew-user', JSON.stringify(userWithoutPassword));
          toast({
            title: "התחברת בהצלחה (מצב מקומי)",
            description: `ברוך הבא, ${contextUser.full_name || email}!`,
          });
          return true;
        }
      }

      toast({
        variant: "destructive",
        title: "התחברות נכשלה",
        description: "שם משתמש או סיסמה שגויים",
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "התחברות נכשלה",
        description: "אירעה שגיאה בתהליך ההתחברות",
      });
      return false;
    }
  };

  const logout = async () => {
    if (isUsingSupabase && session) {
      // Supabase logout
      await supabase.auth.signOut();
    }
    
    // Always clear local storage and state
    setUser(null);
    localStorage.removeItem('hrbrew-user');
    toast({
      title: "התנתקת",
      description: "להתראות!",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
