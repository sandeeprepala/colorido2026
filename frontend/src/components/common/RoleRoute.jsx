import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#121217] border-t-[#E91E63] rounded-full animate-spin mb-4" />
        <p className="font-bold text-xs uppercase tracking-wider text-stone-500">
          Verifying Festival Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  const hasAccess = allowedRoles ? allowedRoles.includes(user.role) : true;

  if (!hasAccess) {
    // Redirect unauthorized users to their appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'volunteer') {
      return <Navigate to="/volunteer" replace />;
    }
    return <Navigate to="/my-festival" replace />;
  }

  return children;
}
