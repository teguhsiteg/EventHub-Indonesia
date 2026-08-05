import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '../common/ToastContainer';
import { ChatWidget } from '../common/ChatWidget';
import { AutoLogout } from '../auth/AutoLogout';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex flex-col min-h-screen font-sans text-slate-800 dark:text-gray-200 antialiased bg-white dark:bg-[#0B0F14]">
      <Navbar />
      <main className="flex-1 relative z-0">
        {children}
      </main>
      <Footer />
      <ToastContainer />
      <ChatWidget />
      <AutoLogout />
    </div>
  );
};
