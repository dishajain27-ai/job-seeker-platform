import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // If authorization or fetch user in progress, render screen spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow py-24">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-primary-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-500 tracking-wide">
          Verifying your credentials...
        </p>
      </div>
    );
  }

  // Redirect to login if user not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not permitted, redirect home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'seeker' && allowedRoles.includes('employer')) {
      return <Navigate to="/?error=employer-access" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
