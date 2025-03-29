
import React, { createContext, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { contextLogin, signInWithFirebase, signOut } from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, firebaseUser, isUsingFirebase, setUser, setIsUsingFirebase } = useAuthState();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', email);
      
      if (isUsingFirebase) {
        // Try Firebase auth first
        try {
          console.log('Trying Firebase auth...');
          const userCredential = await signInWithFirebase(email, password);
          
          if (userCredential) {
            console.log('Firebase login successful');
            toast({
              title: "התחברת בהצלחה",
              description: `ברוך הבא, ${email}!`,
            });
            return true;
          }
        } catch (error) {
          console.error('Firebase login error:', error);
          
          // If Firebase auth fails, try context auth as fallback
          console.log('Trying context auth fallback...');
          const contextUser = contextLogin(email, password);
          
          if (contextUser) {
            console.log('Context auth successful:', contextUser);
            setIsUsingFirebase(false);
            setUser(contextUser);
            
            // Store in localStorage for persistence
            localStorage.setItem('hrbrew-user', JSON.stringify(contextUser));
            localStorage.setItem('hrbrew-auth-type', 'context');
            
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
        // Use context auth directly if not using Firebase
        console.log('Using context auth directly...');
        const contextUser = contextLogin(email, password);
        
        if (contextUser) {
          console.log('Context login successful:', contextUser);
          setUser(contextUser);
          
          // Store in localStorage for persistence
          localStorage.setItem('hrbrew-user', JSON.stringify(contextUser));
          localStorage.setItem('hrbrew-auth-type', 'context');
          
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
    console.log('Logging out user:', user);
    await signOut();
    setUser(null);
    localStorage.removeItem('hrbrew-user');
    localStorage.removeItem('hrbrew-auth-type');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
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
