
import { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  department?: string;
  full_name?: string;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Context backup data for development/fallback
export const CONTEXT_USERS = [
  { 
    id: '1', 
    username: 'advaz', 
    password: 'AdvaZ913530',
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
