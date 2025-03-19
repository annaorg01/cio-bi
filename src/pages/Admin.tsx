
import React from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserManager } from '@/components/admin/UserManager';
import { useAuth } from '@/context/AuthContext';

const Admin = () => {
  const { isAdmin } = useAuth();

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">ניהול משתמשים</h1>
      <UserManager />
    </div>
  );
};

export default Admin;
