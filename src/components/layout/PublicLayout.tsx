import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '../common/ToastContainer';
import { AutoLogout } from '../auth/AutoLogout';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex flex-col min-h-screen  font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-500/30 selection:text-orange-200">
      {/* Subtle animated gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-orange-600/10 via-amber-500/5 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-orange-500/8 via-transparent to-amber-400/5 blur-3xl" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent blur-3xl" style={{ animationDelay: '4s' }} />
      </div>

      <Navbar />
      <main className="flex-1 relative z-0">
        {children}
      </main>
      <Footer />
      <ToastContainer />
      <AutoLogout />
    </div>
  );
};
