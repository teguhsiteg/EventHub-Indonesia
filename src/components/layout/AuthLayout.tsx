import React from 'react';
import { ToastContainer } from '../common/ToastContainer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-100 selection:bg-red-500/30 selection:text-red-200">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-0 -left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-red-600/10 via-yellow-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 -right-10 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-red-500/8 via-transparent to-yellow-400/5 blur-3xl" />
      </div>
      {children}
      <ToastContainer />
    </div>
  );
};
