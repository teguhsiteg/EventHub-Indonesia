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
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
  const roleGradient = isAdmin ? 'from-amber-400 to-orange-500' : isOrganizer ? 'from-orange-400 to-amber-500' : 'from-slate-400 to-slate-500';

  const navLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/events', label: 'Event' },
    { path: '/results', label: 'Hasil' },
    { path: '/about', label: 'Tentang' },
    { path: '/contact', label: 'Kontak' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-blue-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-[1.5px] shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all duration-300">
              <div className="w-full h-full  rounded-[10px] flex items-center justify-center">
                <Trophy className="w-4.5 h-4.5 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-amber-300 group-hover:scale-110 transition-transform duration-300" style={{ color: '#fb923c' }} />
              </div>
            </div>
            <div className="leading-tight">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                RACE<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">PRO</span>
              </span>
              <span className="block text-[9px] font-medium text-slate-600 dark:text-slate-500 tracking-wider uppercase">
                Platform Event Indonesia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/[0.04] p-1 rounded-full border border-slate-200 dark:border-white/[0.06] backdrop-blur-sm">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.path) 
                    ? 'text-orange-600 dark:text-white' 
                    : 'text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-800 dark:text-slate-200'
                }`}
              >
                {isActive(link.path) && (
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30" />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              aria-label="Ganti Tema"
              className="p-2 rounded-xl bg-slate-100/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-orange-500/30 transition-all duration-300"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Admin/Organizer badge */}
                {(isAdmin || isOrganizer) && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 text-amber-400 text-xs font-semibold hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-300"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-300 group"
                  >
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${roleGradient} flex items-center justify-center text-[10px] font-bold text-white shadow-md`}>
                      {user.displayName?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-600 dark:text-slate-300 max-w-[100px] truncate hidden lg:block">
                      {user.displayName}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/[0.08] shadow-2xl shadow-black/10 dark:shadow-black/40 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${roleGradient} bg-clip-text text-transparent`} style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text', color: '#fb923c' }}>
                          {roleLabel}
                        </span>
                      </div>

                      {/* Links */}
                      <div className="py-1">
                        {isAdmin || isOrganizer ? (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            Panel Admin
                          </Link>
                        ) : (
                          <Link
                            to="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Medal className="w-4 h-4 text-orange-400" />
                            Dashboard Saya
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-200 dark:border-white/[0.06] py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
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
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/[0.04] transition-all duration-300"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300"
                >
                  <span>Daftar</span>
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              aria-label="Ganti Tema"
              className="p-2 rounded-lg bg-slate-100/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100/50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-blue-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06] animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-5 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                    : 'text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient} flex items-center justify-center text-xs font-bold text-white`}>
                      {user.displayName?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.displayName}</p>
                      <p className="text-[10px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  {(isAdmin || isOrganizer) && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Panel Admin
                    </Link>
                  )}
                  {isParticipant && !isAdmin && !isOrganizer && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20"
                    >
                      <Medal className="w-4 h-4" />
                      Dashboard Saya
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-600 dark:text-slate-300 bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20"
                  >
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
