
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserData } from './types';

interface UsersListProps {
  users: UserData[];
  selectedUser: UserData | null;
  onSelectUser: (user: UserData) => void;
  loading: boolean;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  selectedUser,
  onSelectUser,
  loading
}) => {
  if (loading) {
    return null; // Loading state is handled by parent
  }

  return (
    <Card className="md:col-span-1">
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
              <Button
                key={user.id}
                variant={selectedUser?.id === user.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => onSelectUser(user)}
              >
                <div className="flex justify-between w-full">
                  <span>{user.username}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {user.links.length} קישורים
                  </span>
                </div>
              </Button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
