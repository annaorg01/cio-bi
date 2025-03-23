
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { UserData } from '@/components/admin/types';
import { fetchUsers, addUserLink, removeUserLink } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userForPasswordChange, setUserForPasswordChange] = useState<UserData | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Check if we're using the context auth (for demonstration)
  const isUsingContextAuth = !!currentUser?.username;

  // Fetch users and their links
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

  const handleSelectUser = (user: UserData) => {
    setSelectedUser(user);
  };

  const handleAddLink = async (name: string, url: string) => {
    if (!selectedUser) return;
    
    try {
      console.log('Adding link for user:', selectedUser.id, name, url);
      const newLink = await addUserLink(selectedUser.id, name, url, isUsingContextAuth);
      console.log('New link returned:', newLink);
      
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

      console.log('Updated users state:', updatedUsers);
      setUsers(updatedUsers);
      
      // Update the selected user state
      const updatedSelectedUser = updatedUsers.find(u => u.id === selectedUser.id) || null;
      console.log('Updated selected user:', updatedSelectedUser);
      setSelectedUser(updatedSelectedUser);

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
      console.log('Removing link:', linkId);
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

      console.log('Updated users after removal:', updatedUsers);
      setUsers(updatedUsers);
      
      // Update the selected user state
      const updatedSelectedUser = updatedUsers.find(u => u.id === selectedUser.id) || null;
      console.log('Updated selected user after removal:', updatedSelectedUser);
      setSelectedUser(updatedSelectedUser);

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

  const handleChangePassword = (user: UserData) => {
    setUserForPasswordChange(user);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setUserForPasswordChange(null);
  };

  return {
    users,
    selectedUser,
    loading,
    error,
    isPasswordModalOpen,
    userForPasswordChange,
    loadUsers,
    handleSelectUser,
    handleAddLink,
    handleRemoveLink,
    handleChangePassword,
    handleClosePasswordModal
  };
};
