import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown, 
  Sun, 
  Moon, 
  Medal,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
  Ticket
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isOrganizer, isParticipant } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const roleLabel = isAdmin ? 'Super Admin' : isOrganizer ? 'Organizer' : 'Pelari / Peserta';
  const roleColor = isAdmin ? 'bg-red-500' : isOrganizer ? 'bg-amber-500' : 'bg-sky-500';

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/events', label: 'Eksplor Event' },
    { path: '/check-ticket', label: 'Cek E-Tiket' },
    { path: '/results', label: 'Hasil & Klasemen' },
    { path: '/host-event', label: 'Jadi Penyelenggara' },
    { path: '/about', label: 'Tentang' },
    { path: '/contact', label: 'Bantuan' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* ── Signature Top Announcement Bar (Style DOKU) ── */}
      {showTopBar && (
        <div className="doku-header-bar text-white text-xs sm:text-sm py-2 px-4 flex items-center justify-between shadow-inner relative z-50">
          <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shrink-0">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Hot
            </span>
            <span className="font-normal truncate">
              Pendaftaran Event Marathon & Trail 2026 Resmi Dibuka!
            </span>
            <Link 
              to="/events" 
              className="inline-flex items-center gap-1 font-bold underline hover:text-amber-200 transition-colors ml-1 shrink-0"
            >
              Daftar Sekarang <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <button 
            onClick={() => setShowTopBar(false)} 
            aria-label="Tutup bar pengumuman"
            className="text-white/70 hover:text-white p-1 ml-2 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Main Navbar ── */}
      <div 
        className={`w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-xl shadow-md border-slate-200/80 dark:border-slate-800' 
            : 'bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-slate-100 dark:border-slate-800/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Logo Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Guwigo Events" 
                  className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-102"
                />
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map(link => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        active 
                          ? 'text-[#e50a38] dark:text-[#ff2b58] bg-red-50 dark:bg-red-950/30' 
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Ganti mode tema"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  {(isAdmin || isOrganizer) && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 text-[#e50a38] dark:text-[#ff476f] text-xs font-bold hover:bg-red-100 transition"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Hub</span>
                    </Link>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm transition"
                    >
                      <div className={`w-7 h-7 rounded-full ${roleColor} text-white flex items-center justify-center text-xs font-bold`}>
                        {user.displayName?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                        {user.displayName || 'Akun'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden py-1 z-50">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                            {roleLabel}
                          </span>
                        </div>

                        <div className="py-1">
                          {isAdmin || isOrganizer ? (
                            <Link 
                              to="/admin" 
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <ShieldAlert className="w-4 h-4 text-[#e50a38]" />
                              Portal Dashboard Admin
                            </Link>
                          ) : (
                            <Link 
                              to="/dashboard" 
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Medal className="w-4 h-4 text-sky-500" />
                              Dashboard & E-Tiket Saya
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <LogOut className="w-4 h-4" />
                            Keluar Akun
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link 
                    to="/check-ticket" 
                    className="btn-brand-primary text-xs !py-2.5 !px-5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Cek E-Tiket Saya</span>
                  </Link>
                  <Link 
                    to="/login"
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#e50a38] transition"
                  >
                    Portal EO / Admin
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Burger & Theme toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={toggleTheme} 
                aria-label="Toggle theme"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 shadow-xl px-4 py-5 animate-in slide-in-from-top duration-200">
          <div className="space-y-1.5 mb-4">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-xl text-sm font-bold ${
                  isActive(link.path)
                    ? 'text-[#e50a38] bg-red-50 dark:bg-red-950/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl mb-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${roleColor} text-white flex items-center justify-center text-xs font-bold`}>
                    {user.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>

                {isAdmin || isOrganizer ? (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e50a38] text-xs font-bold"
                  >
                    Portal Admin
                  </Link>
                ) : (
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 text-xs font-bold"
                  >
                    Dashboard Saya
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Keluar Akun
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link 
                  to="/check-ticket" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-brand-primary w-full text-xs !py-3 justify-center"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Cek E-Tiket Saya</span>
                </Link>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Portal Penyelenggara / Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
