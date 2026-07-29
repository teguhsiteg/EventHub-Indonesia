import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">Memuat data autentikasi...</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user && allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    if (!hasRole) {
      // If participant tries to access admin route
      if (user.role === 'PARTICIPANT') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
