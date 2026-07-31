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
      <div className="min-h-screen  flex flex-col items-center justify-center p-4">
        {/* Subtle background glow */}
        <div className="absolute w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        
        {/* Spinner */}
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-full border-2 border-slate-200 dark:border-white/[0.06]" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-yellow-500/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-yellow-400 animate-pulse" />
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">
          Memuat data autentikasi...
        </p>
        <p className="text-slate-600 text-xs mt-1">
          Mohon tunggu sebentar
        </p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user && allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    if (!hasRole) {
      if (user.role === 'PARTICIPANT') {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
