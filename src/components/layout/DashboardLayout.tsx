import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ToastContainer } from '../common/ToastContainer';
import { AutoLogout } from '../auth/AutoLogout';
import { 
  Trophy, User, LogOut, Sun, Moon, Menu, X,
  CreditCard, Activity, Award, PackageCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarTabs = [
  { id: 'overview', label: 'Ringkasan Event', icon: Trophy, href: '/dashboard' },
  { id: 'registrations', label: 'Pembayaran & Invoice', icon: CreditCard, href: '/dashboard?tab=registrations' },
  { id: 'medical', label: 'Asesmen Medis', icon: Activity, href: '/dashboard?tab=medical' },
  { id: 'result', label: 'Hasil & E-Sertifikat', icon: Award, href: '/dashboard?tab=result' },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen  font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600/5 via-yellow-500/3 to-transparent blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-50 dark:bg-blue-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/[0.05] text-slate-600 dark:text-slate-500 dark:text-slate-400"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                RACE<span className="text-blue-500">PRO</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-600 dark:text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/[0.06]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center text-white text-xs font-bold">
                {user?.displayName?.[0] || 'P'}
              </div>
              <span className="hidden sm:block text-xs font-medium text-slate-700 dark:text-slate-600 dark:text-slate-300">{user?.displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-blue-950/50 backdrop-blur-sm p-4 gap-1">
          {sidebarTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = location.pathname + location.search === tab.href || 
                             (tab.href === '/dashboard' && location.pathname === '/dashboard' && !location.search);
            return (
              <Link
                key={tab.id}
                to={tab.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-yellow-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' 
                    : 'text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="absolute top-16 left-0 bottom-0 w-64  border-r border-slate-200 dark:border-white/[0.06] p-4 flex flex-col gap-1 animate-in slide-in-from-left">
              {sidebarTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = location.pathname + location.search === tab.href || 
                                 (tab.href === '/dashboard' && location.pathname === '/dashboard' && !location.search);
                return (
                  <Link
                    key={tab.id}
                    to={tab.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500/20 to-yellow-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' 
                        : 'text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <ToastContainer />
      <AutoLogout />
    </div>
  );
};
