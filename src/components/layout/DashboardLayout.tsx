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
    <div className="relative min-h-screen bg-slate-50/50 dark:bg-[#0a0f1e] font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-bl from-blue-500/5 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-orange-500/5 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.06] shadow-sm shadow-slate-200/20 dark:shadow-none">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-600 dark:text-slate-400 transition-colors"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest hidden sm:block">
                RACE<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">PRO</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-600 dark:text-slate-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-white/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-sm font-black uppercase shadow-sm border border-slate-300/50 dark:border-slate-600/50">
                {user?.displayName?.[0] || 'P'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{user?.displayName}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 ml-1 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1400px] mx-auto">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-200/50 dark:border-white/[0.06] bg-transparent p-6 gap-2">
          {sidebarTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = location.pathname + location.search === tab.href || 
                             (tab.href === '/dashboard' && location.pathname === '/dashboard' && !location.search);
            return (
              <Link
                key={tab.id}
                to={tab.href}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-white/10 scale-[1.02]' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent'}`}>
                  <Icon className="w-4 h-4" />
                </div>
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
