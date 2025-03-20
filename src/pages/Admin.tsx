
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
    <DashboardLayout>
      <div className="container mx-auto p-4 max-w-full">
        <h1 className="text-2xl font-bold mb-6 text-right">ניהול משתמשים</h1>
        <UserManager />
      </div>
    </DashboardLayout>
  );
};

export default Admin;
