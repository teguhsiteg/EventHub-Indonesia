/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { EventMarketplace } from './components/EventMarketplace';
import { EventDetailPage } from './components/EventDetailPage';
import { RegistrationMultiStep } from './components/RegistrationMultiStep';
import { ParticipantDashboard } from './components/ParticipantDashboard';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { Megaphone, X, ShieldCheck, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavigationState {
  view: 'landing' | 'marketplace' | 'detail' | 'checkout' | 'dashboard';
  selectedEventId?: string;
  selectedCategoryId?: string;
}

const AppContent: React.FC = () => {
  const { userRole, announcements } = useApp();
  
  // Navigation State management
  const [navState, setNavState] = useState<NavigationState>({
    view: 'landing'
  });

  // Back to Top button scroll visibility state
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Announcement bar state
  const [showBroadcast, setShowBroadcast] = useState(true);

  const handleNavigate = (
    view: NavigationState['view'], 
    extraEventId?: string, 
    selectedCategoryId?: string
  ) => {
    // Scroll window to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    setNavState({
      view,
      selectedEventId: extraEventId,
      selectedCategoryId
    });
  };

  // Find latest announcement matching the role target
  const activeAnnouncement = announcements.find(ann => 
    ann.targetRole === 'all' || 
    ann.targetRole === userRole
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Dynamic top broadcast alert banner */}
      {activeAnnouncement && showBroadcast && (
        <div 
          className="bg-linear-to-r from-slate-900 to-slate-850 border-b border-cyan-500/20 px-4 py-2 text-white z-50 animate-in slide-in-from-top duration-300"
          id="broadcast-bar"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between font-sans text-[11px] font-bold">
            <div className="flex items-center space-x-2 truncate">
              <Megaphone className="h-3.5 w-3.5 text-cyan-400 shrink-0 animate-bounce" />
              <span className="text-cyan-400 uppercase tracking-widest text-[9px]">ANNOUNCEMENT:</span>
              <span className="truncate text-slate-200">{activeAnnouncement.title} — {activeAnnouncement.message}</span>
            </div>
            
            <button 
              onClick={() => setShowBroadcast(false)}
              className="text-slate-400 hover:text-white rounded-md p-1 shrink-0"
              id="dismiss-broadcast-btn"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Sticky Header */}
      <Header onNavigate={handleNavigate} activeView={navState.view} />

      {/* Core Dynamic View Routers */}
      <main className="flex-1">
        
        {/* VIEW 1: HERO LANDING PAGE */}
        {navState.view === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {/* VIEW 2: EVENT MARKETPLACE */}
        {navState.view === 'marketplace' && (
          <EventMarketplace onNavigate={handleNavigate} />
        )}

        {/* VIEW 3: EVENT DETAILED PRESENTATION */}
        {navState.view === 'detail' && navState.selectedEventId && (
          <EventDetailPage 
            eventId={navState.selectedEventId} 
            onNavigate={handleNavigate} 
          />
        )}

        {/* VIEW 4: 8-STEP WIZARD CHECKOUT FUNNEL */}
        {navState.view === 'checkout' && navState.selectedEventId && navState.selectedCategoryId && (
          <RegistrationMultiStep 
            eventId={navState.selectedEventId} 
            categoryId={navState.selectedCategoryId} 
            onNavigate={handleNavigate} 
          />
        )}

        {/* VIEW 5: MULTI-ROLE ADAPTIVE DASHBOARDS */}
        {navState.view === 'dashboard' && (
          <>
            {userRole === 'participant' && <ParticipantDashboard />}
            {userRole === 'organizer' && <OrganizerDashboard />}
            {userRole === 'super_admin' && <SuperAdminDashboard />}
          </>
        )}

      </main>

      {/* Modern High-End Platform Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400" id="global-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-4 font-sans text-xs">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700">
                <div className="w-4 h-4 border border-[#06B6D4] rotate-45"></div>
              </div>
              <h5 className="font-extrabold text-white text-sm tracking-tight">
                EVENTHUB<span className="text-[#06B6D4]">ID</span>
              </h5>
            </div>
            <p className="leading-relaxed text-slate-500">
              The premier SaaS ticketing & registration ecosystem built for high-performance sporting events, marathons, trail loops, and triathlons.
            </p>
          </div>

          <div>
            <h6 className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">Ecosystem Products</h6>
            <ul className="space-y-2.5 text-slate-500 font-semibold">
              <li className="hover:text-cyan-400 transition-colors pointer-events-none">Automated BIB Allocations</li>
              <li className="hover:text-cyan-400 transition-colors pointer-events-none">Fonnte WhatsApp API Gateway</li>
              <li className="hover:text-cyan-400 transition-colors pointer-events-none">Escrow Daily Settlement</li>
              <li className="hover:text-cyan-400 transition-colors pointer-events-none">Interactive Heatmaps</li>
            </ul>
          </div>

          <div>
            <h6 className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">Elite Tournaments</h6>
            <ul className="space-y-2.5 text-slate-500 font-semibold">
              <li onClick={() => handleNavigate('detail', 'evt-boro-marathon-2026')} className="hover:text-cyan-400 cursor-pointer transition-colors">Borobudur Marathon 2026</li>
              <li onClick={() => handleNavigate('detail', 'evt-rinjani-ultra-2026')} className="hover:text-cyan-400 cursor-pointer transition-colors">Rinjani 100 Ultra-Trail</li>
              <li onClick={() => handleNavigate('detail', 'evt-bali-triathlon-2026')} className="hover:text-cyan-400 cursor-pointer transition-colors">Bali Int&apos;l Triathlon</li>
              <li onClick={() => handleNavigate('detail', 'evt-tour-borobudur-2026')} className="hover:text-cyan-400 cursor-pointer transition-colors">Tour de Borobudur Cycling</li>
            </ul>
          </div>

          <div>
            <h6 className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">Enterprise Compliance</h6>
            <ul className="space-y-2.5 text-slate-500 font-semibold">
              <li className="flex items-center space-x-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" /><span>Midtrans PCI-DSS Licensed</span></li>
              <li className="text-slate-500">Kemenparekraf Registered No. 04092026</li>
              <li className="text-slate-500">© 2026 EventHub Corp. All rights reserved.</li>
            </ul>
          </div>

        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/90 text-cyan-400 shadow-lg shadow-slate-950/30 hover:bg-slate-900 border border-slate-800/80 cursor-pointer backdrop-blur-md transition-transform active:scale-95 focus:outline-hidden"
            id="back-to-top-btn"
            title="Back to Top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
