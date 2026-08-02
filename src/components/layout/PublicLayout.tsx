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
    <div className="relative flex flex-col min-h-screen font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 bg-slate-50/30">
      {/* Background is clean, let pages manage their own glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-white" aria-hidden="true" />

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
