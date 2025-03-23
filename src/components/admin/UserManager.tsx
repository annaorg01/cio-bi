
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UsersList } from './UsersList';
import { UserLinksManager } from './UserLinksManager';
import { PasswordChangeModal } from './PasswordChangeModal';
import { LoadingState } from './LoadingState';
import { useUserManagement } from '@/hooks/useUserManagement';

export const UserManager: React.FC = () => {
  const {
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
  } = useUserManagement();

  // Fetch users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

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
        onChangePassword={handleChangePassword}
        loading={loading}
      />
      <UserLinksManager
        selectedUser={selectedUser}
        onAddLink={handleAddLink}
        onRemoveLink={handleRemoveLink}
      />
      <PasswordChangeModal 
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        user={userForPasswordChange}
      />
    </div>
  );
};
