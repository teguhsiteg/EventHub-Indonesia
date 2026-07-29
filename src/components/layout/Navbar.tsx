import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Trophy, 
  User, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X, 
  ChevronRight,
  ArrowLeft,
  Search,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isOrganizer, isParticipant } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-50 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Corporate Ecosystem Link */}
          <div className="flex items-center gap-4">
            <a
              href="https://guwigo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-orange-400 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors"
              title="Ke Website Utama Guwigo"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Guwigo</span>
            </a>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-amber-300 p-0.5 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all">
                <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-sans uppercase">
                  GUWIGO <span className="text-orange-500">EVENTS</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  Part of Guwigo Ecosystem
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white dark:bg-slate-900/60 p-1.5 rounded-full border border-slate-200 dark:border-slate-800/60">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-orange-500 text-slate-900 dark:text-white font-semibold shadow-md shadow-orange-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/events') 
                  ? 'bg-orange-500 text-slate-900 dark:text-white font-semibold shadow-md shadow-orange-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800/50'
              }`}
            >
              Events
            </Link>
            <Link
              to="/results"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/results') 
                  ? 'bg-orange-500 text-slate-900 dark:text-white font-semibold shadow-md shadow-orange-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800/50'
              }`}
            >
              Results
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'bg-orange-500 text-slate-900 dark:text-white font-semibold shadow-md shadow-orange-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800/50'
              }`}
            >
              About
            </Link>
            <Link
              to="/faq"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/faq') 
                  ? 'bg-orange-500 text-slate-900 dark:text-white font-semibold shadow-md shadow-orange-500/20' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800/50'
              }`}
            >
              FAQ
            </Link>
          </nav>

          {/* User Controls & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 text-amber-400 hover:text-amber-300 transition-all flex items-center justify-center shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <Link
              to="/events"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:text-white text-xs font-bold uppercase transition-all"
            >
              <Search className="w-3.5 h-3.5 text-orange-400" />
              <span>Temukan Event</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                {isOrganizer && !isAdmin && (
                  <Link
                    to="/organizer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Organizer
                  </Link>
                )}

                {isParticipant && !isAdmin && !isOrganizer && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-all"
                  >
                    <User className="w-4 h-4 text-orange-400" />
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title="Keluar Akun"
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-white dark:bg-slate-900 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 transition-all"
                >
                  <span>Daftar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button & Theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <a
            href="https://guwigo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800"
          >
            <span>Kembali ke Guwigo.com</span>
            <ArrowLeft className="w-4 h-4 text-orange-400 rotate-180" />
          </a>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-orange-400"
          >
            Home
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-orange-400"
          >
            Events
          </Link>
          <Link
            to="/results"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-orange-400"
          >
            Results
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-orange-400"
          >
            About
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200 hover:text-orange-400"
          >
            FAQ
          </Link>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 rounded-lg bg-white dark:bg-slate-900 text-orange-400 font-bold border border-slate-200 dark:border-slate-800"
            >
              Temukan Event
            </Link>

            {user ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold"
                  >
                    Dashboard Admin
                  </Link>
                ) : isOrganizer ? (
                  <Link
                    to="/organizer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold"
                  >
                    Dashboard Organizer
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-lg bg-orange-600 text-white font-bold"
                  >
                    Dashboard Saya
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center py-2.5 rounded-lg bg-white dark:bg-slate-900 text-red-400 font-semibold"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-800"
                >
                  Masuk Akun
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg bg-orange-600 text-white font-bold shadow-lg shadow-orange-600/30"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
