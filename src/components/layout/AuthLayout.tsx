import React from 'react';
import { ToastContainer } from '../common/ToastContainer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen  font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-500/30 selection:text-orange-200 flex flex-col items-center justify-center p-4">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-0 -left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-600/10 via-amber-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 -right-10 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-orange-500/8 via-transparent to-amber-400/5 blur-3xl" />
      </div>
      {children}
      <ToastContainer />
    </div>
  );
};
