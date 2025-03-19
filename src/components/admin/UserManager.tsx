
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { UsersList } from './UsersList';
import { UserLinksManager } from './UserLinksManager';
import { LoadingState } from './LoadingState';
import { UserData, UserLink } from './types';
import { fetchUsers, addUserLink, removeUserLink } from '@/services/userService';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Check if we're using the context auth (for demonstration)
  const isUsingContextAuth = !!currentUser?.username;

  // Fetch users and their links
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers(isUsingContextAuth);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [isUsingContextAuth]);

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
  };

  const handleAddLink = async (name: string, url: string) => {
    if (!selectedUser) return;
    
    try {
      const newLink = await addUserLink(selectedUser.id, name, url, isUsingContextAuth);
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            links: [...user.links, newLink]
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);

      toast({
        title: "הקישור נוסף בהצלחה",
        description: `הקישור "${name}" נוסף למשתמש ${selectedUser.username}`,
      });
    } catch (err) {
      console.error('Error adding link:', err);
      toast({
        variant: "destructive",
        title: "שגיאה בהוספת הקישור",
        description: "אירעה שגיאה בעת הוספת הקישור. נסה שנית מאוחר יותר.",
      });
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    if (!selectedUser) return;

    try {
      await removeUserLink(linkId, isUsingContextAuth);
      
      // Update local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            links: user.links.filter(link => link.id !== linkId)
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);

      toast({
        title: "הקישור הוסר בהצלחה",
        description: `הקישור הוסר ממשתמש ${selectedUser.username}`,
      });
    } catch (err) {
      console.error('Error removing link:', err);
      toast({
        variant: "destructive",
        title: "שגיאה בהסרת הקישור",
        description: "אירעה שגיאה בעת הסרת הקישור. נסה שנית מאוחר יותר.",
      });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full animate-on-load">
      <UsersList 
        users={users}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        loading={loading}
      />
      <UserLinksManager
        selectedUser={selectedUser}
        onAddLink={handleAddLink}
        onRemoveLink={handleRemoveLink}
      />
    </div>
  );
};
