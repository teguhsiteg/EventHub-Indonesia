/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, User, Shield, Users, Ticket, Menu, X, Landmark, 
  Settings, LogOut, CheckCircle, Smartphone, Sun, Moon 
} from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: 'landing' | 'marketplace' | 'detail' | 'checkout' | 'dashboard', extraEventId?: string) => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeView }) => {
  const { 
    currentUser, userRole, changeRole, notifications, 
    markNotificationsAsRead, theme, toggleTheme,
    language, setLanguage, t 
  } = useApp();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleSelect = (role: 'super_admin' | 'organizer' | 'participant') => {
    changeRole(role);
    setShowRoleMenu(false);
    // Redirect to dashboard corresponding to that role when changed
    onNavigate('dashboard');
  };

  const cleanRoleName = (role: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'organizer') return 'Organizer Hub';
    return 'Participant';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 dark:bg-slate-950/80 dark:border-slate-850 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex cursor-pointer items-center space-x-3 transition-opacity hover:opacity-90"
          id="brand-logo"
        >
          <div className="w-10 h-10 bg-slate-950 dark:bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-950/10">
            <div className="w-5 h-5 border-2 border-[#06B6D4] dark:border-slate-950 rotate-45"></div>
          </div>
          <div>
            <h1 className="font-sans text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">
              EVENTHUB<span className="text-[#06B6D4] dark:text-cyan-400">ID</span>
            </h1>
            <p className="text-[8px] font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">INDONESIA</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:ml-10 md:flex md:space-x-8">
          <button
            onClick={() => onNavigate('landing')}
            className={`font-sans text-sm font-semibold transition-colors cursor-pointer ${
              activeView === 'landing' ? 'text-slate-900 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
            id="nav-home"
          >
            {t('home')}
          </button>
          <button
            onClick={() => onNavigate('marketplace')}
            className={`font-sans text-sm font-semibold transition-colors cursor-pointer ${
              activeView === 'marketplace' ? 'text-slate-900 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
            id="nav-explore"
          >
            {t('explore')}
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`font-sans text-sm font-semibold transition-colors cursor-pointer ${
              activeView === 'dashboard' ? 'text-slate-900 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
            }`}
            id="nav-dashboard"
          >
            {t('dashboard')}
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-3.5">
          
          {/* Quick Role Switcher Indicator / Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 rounded-full border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 py-1.5 pl-3 pr-3 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer md:pr-4"
              id="role-indicator-btn"
            >
              <div className={`h-2 w-2 rounded-full ${
                userRole === 'super_admin' ? 'bg-red-500' : userRole === 'organizer' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <span className="font-sans">{cleanRoleName(userRole)}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">▼</span>
            </button>
            
            {showRoleMenu && (
              <div 
                className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 p-2.5 shadow-xl shadow-slate-200/80 dark:shadow-slate-950/40 ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
                id="role-menu-dropdown"
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-800 mb-1.5 font-mono">
                  Simulate Workspace Role
                </div>
                
                <button
                  onClick={() => handleRoleSelect('participant')}
                  className={`flex w-full items-center space-x-3 rounded-xl p-2.5 text-left transition-colors cursor-pointer ${
                    userRole === 'participant' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  id="role-switch-participant"
                >
                  <Ticket className={`h-4.5 w-4.5 ${userRole === 'participant' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-sans text-xs font-bold leading-tight">Participant</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Register & download tickets</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('organizer')}
                  className={`flex w-full items-center space-x-3 rounded-xl p-2.5 text-left transition-colors cursor-pointer ${
                    userRole === 'organizer' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  id="role-switch-organizer"
                >
                  <Users className={`h-4.5 w-4.5 ${userRole === 'organizer' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-sans text-xs font-bold leading-tight">Event Organizer</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Manage check-in, BIBs & income</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('super_admin')}
                  className={`flex w-full items-center space-x-3 rounded-xl p-2.5 text-left transition-colors cursor-pointer ${
                    userRole === 'super_admin' ? 'bg-red-50 dark:bg-red-950/20 text-red-950 dark:text-red-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                  id="role-switch-admin"
                >
                  <Shield className={`h-4.5 w-4.5 ${userRole === 'super_admin' ? 'text-red-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-sans text-xs font-bold leading-tight">Super Admin</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Audit system parameters & coupons</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Language Switcher Button */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex h-9 px-2.5 items-center justify-center space-x-1 border border-slate-200/80 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer rounded-full"
            id="language-switcher-btn"
            title={language === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'}
          >
            <span className="font-sans text-[11px] font-extrabold tracking-wide uppercase">
              {language === 'id' ? 'ID 🇮🇩' : 'EN 🇬🇧'}
            </span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
            id="theme-switcher-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 fill-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="h-4 w-4 text-slate-500 fill-slate-500" />
            )}
          </button>

          {/* Core Notification Bell Panel */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsAsRead();
              }}
              className="relative rounded-full p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              id="notification-bell-btn"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900 p-2 shadow-xl shadow-slate-200/80 dark:shadow-slate-950/40 ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-3 duration-200"
                id="notifications-box"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50 dark:border-slate-800">
                  <span className="font-sans text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-cyan-100 dark:bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto custom-scrollbar p-1 dark:custom-scrollbar-dark">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                      All clean! No new notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`rounded-xl p-2.5 mb-1 text-left transition-colors ${
                          notif.read ? 'bg-white dark:bg-slate-900 border border-transparent' : 'bg-slate-50 dark:bg-slate-850 border border-cyan-500/10'
                        }`}
                      >
                        <p className="font-sans text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                          <span>{notif.title}</span>
                          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                            {new Date(notif.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                        <p className="mt-0.5 font-sans text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center space-x-2 pl-1.5 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            id="user-profile-trigger"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="h-8.5 w-8.5 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-cyan-500/55 transition-all"
            />
            <div className="hidden lg:block text-left">
              <p className="font-sans text-xs font-bold leading-tight text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{currentUser.name}</p>
              <p className="font-mono text-[9px] text-slate-400 dark:text-slate-550 leading-none mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-1.5 text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
            id="mobile-menu-trigger"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950 py-3 px-4 shadow-lg md:hidden animate-in fade-in duration-150">
          <div className="space-y-1.5 flex flex-col items-stretch">
            <button
              onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
              className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer ${
                activeView === 'landing' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => { onNavigate('marketplace'); setMobileMenuOpen(false); }}
              className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer ${
                activeView === 'marketplace' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              {t('explore')}
            </button>
            <button
              onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
              className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer ${
                activeView === 'dashboard' ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              {t('dashboard')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
