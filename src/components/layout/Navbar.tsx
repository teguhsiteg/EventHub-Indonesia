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
  Medal
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isOrganizer, isParticipant } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
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

  const isActive = (path: string) => location.pathname === path;

  const roleLabel = isAdmin ? 'Admin' : isOrganizer ? 'Penyelenggara' : 'Peserta';
  const roleGradient = isAdmin ? 'from-amber-400 to-red-500' : isOrganizer ? 'from-red-400 to-amber-500' : 'from-gray-400 to-gray-500';

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/events', label: 'Event' },
    { path: '/results', label: 'Hasil' },
    { path: '/about', label: 'Tentang' },
    { path: '/contact', label: 'Kontak' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/85 dark:bg-[#0B0F14]/85 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-auto h-10 flex items-center group-hover:scale-105 transition-transform">
              <span className="font-display text-2xl tracking-wider text-white dark:text-white"
                style={{ textShadow: scrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.3)' }}>
                <span className={scrolled ? 'text-red-600 dark:text-amber-400' : 'text-white'}>
                  GUWIGO
                </span>
                <span className={scrolled ? 'text-gray-800 dark:text-white' : 'text-white/90'}>
                  EVENTS
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/20 dark:border-white/10">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive(link.path) 
                    ? 'text-red-600 dark:text-amber-400 bg-white dark:bg-gray-800 shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-amber-400'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {(isAdmin || isOrganizer) && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-amber-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-amber-500/30 shadow-sm transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                      {user.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 max-w-[120px] truncate hidden lg:block">
                      {user.displayName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-elegant overflow-hidden z-50">
                      <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                          {roleLabel}
                        </span>
                      </div>

                      <div className="py-1">
                        {isAdmin || isOrganizer ? (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            Panel Admin
                          </Link>
                        ) : (
                          <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Medal className="w-4 h-4 text-red-400" />
                            Dashboard Saya
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-800 py-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                          <LogOut className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
                  Masuk
                </Link>
                <Link to="/register"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition">
                  <span>Daftar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B0F14] border-t border-gray-100 dark:border-gray-800">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 px-4 rounded-xl text-sm font-medium transition ${
                  isActive(link.path)
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient} flex items-center justify-center text-xs font-bold text-white`}>
                      {user.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                      <p className="text-[10px] text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {(isAdmin || isOrganizer) && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-amber-400 bg-red-50 dark:bg-red-900/20">
                      <ShieldAlert className="w-4 h-4" /> Panel Admin
                    </Link>
                  )}
                  {isParticipant && !isAdmin && !isOrganizer && (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-amber-400 bg-red-50 dark:bg-red-900/20">
                      <Medal className="w-4 h-4" /> Dashboard Saya
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    Masuk
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-500/30">
                    Daftar Akun
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
