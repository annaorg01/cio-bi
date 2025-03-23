
import React, { createContext, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { contextLogin, signInWithSupabase, signOut } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, supabaseUser, session, isUsingSupabase, setUser, setIsUsingSupabase } = useAuthState();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (isUsingSupabase) {
        // Try Supabase auth first
        try {
          const data = await signInWithSupabase(email, password);
          
          if (data.session) {
            toast({
              title: "התחברת בהצלחה",
              description: `ברוך הבא, ${email}!`,
            });
            return true;
          }
        } catch (error) {
          console.error('Supabase login error:', error);
          
          // If Supabase auth fails, try context auth as fallback
          const contextUser = contextLogin(email, password);
          
          if (contextUser) {
            setIsUsingSupabase(false);
            setUser(contextUser);
            return true;
          }
          
          toast({
            variant: "destructive",
            title: "התחברות נכשלה",
            description: error instanceof Error ? error.message : "שם משתמש או סיסמה שגויים",
          });
          return false;
        }
      } else {
        // Use context auth directly if not using Supabase
        const contextUser = contextLogin(email, password);
        
        if (contextUser) {
          setUser(contextUser);
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
    await signOut();
    setUser(null);
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
