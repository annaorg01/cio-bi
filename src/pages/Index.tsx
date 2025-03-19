
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Login } from '@/components/auth/Login';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

export default Index;
