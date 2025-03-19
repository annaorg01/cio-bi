
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Dummy users for demo purposes
const USERS = [
  { id: '1', username: 'admin', password: 'admin123', isAdmin: true },
  { id: '2', username: 'user1', password: 'user123', isAdmin: false },
  { id: '3', username: 'user2', password: 'user123', isAdmin: false }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('hrbrew-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('hrbrew-user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    const foundUser = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('hrbrew-user', JSON.stringify(userWithoutPassword));
      toast({
        title: "התחברת בהצלחה",
        description: `ברוך הבא, ${username}!`,
      });
      return true;
    }

    toast({
      variant: "destructive",
      title: "התחברות נכשלה",
      description: "שם משתמש או סיסמה שגויים",
    });
    return false;
  };

  const logout = () => {
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
