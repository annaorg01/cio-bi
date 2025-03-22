
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserData } from './types';
import { Key, UserCog } from 'lucide-react';

interface UsersListProps {
  users: UserData[];
  selectedUser: UserData | null;
  onSelectUser: (user: UserData) => void;
  onChangePassword: (user: UserData) => void;
  loading: boolean;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  onChangePassword,
  loading
}) => {
  if (loading) {
    return null; // Loading state is handled by parent
  }

  return (
    <Card className="md:col-span-1 md:min-w-[400px] max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle>משתמשים</CardTitle>
        <CardDescription>בחר משתמש לניהול הקישורים שלו</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">אין משתמשים להצגה</p>
          ) : (
            users.map(user => (
              <div key={user.id} className="flex flex-col space-y-2">
                <Button
                  variant={selectedUser?.id === user.id ? "default" : "outline"}
                  className="w-full justify-start text-right"
                  onClick={() => onSelectUser(user)}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold max-w-[200px] truncate">{user.full_name || user.username}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0 mr-2">
                        {user.links.length} קישורים
                      </span>
                    </div>
                    {user.department && (
                      <span className="block text-xs text-gray-600 max-w-full truncate mt-1">{user.department}</span>
                    )}
                    {user.email && (
                      <span className="block text-xs text-gray-500 max-w-full truncate">{user.email}</span>
                    )}
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={() => onChangePassword(user)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  שינוי סיסמה
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
