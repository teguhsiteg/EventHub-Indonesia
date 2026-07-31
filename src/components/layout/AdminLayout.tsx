import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ToastContainer } from '../common/ToastContainer';
import { AutoLogout } from '../auth/AutoLogout';
import { 
  Trophy, ShieldAlert, Users, CreditCard, DollarSign,
  Activity, Settings, FileText, QrCode, Plus, Sun, Moon,
  LogOut, Menu, X, ChevronRight, ClipboardList
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminTabs = [
  { id: 'stats', label: 'Ringkasan', icon: Activity, href: '/admin' },
  { id: 'events', label: 'Event', icon: Trophy, href: '/admin?tab=events' },
  { id: 'requests', label: 'Permohonan', icon: ClipboardList, href: '/admin?tab=requests' },
  { id: 'payments', label: 'Pembayaran', icon: CreditCard, href: '/admin?tab=payments' },
  { id: 'payouts', label: 'Pencairan Dana', icon: DollarSign, href: '/admin?tab=payouts' },
  { id: 'results', label: 'Hasil Lomba', icon: FileText, href: '/admin?tab=results' },
  { id: 'users', label: 'Pengguna', icon: Users, href: '/admin?tab=users' },
  { id: 'settings', label: 'Pengaturan', icon: Settings, href: '/admin?tab=settings' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, isSuperAdmin } = useAuth();
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
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-600/5 via-yellow-500/3 to-transparent blur-3xl" />
      </div>

      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-50 dark:bg-blue-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="xl:hidden p-2 rounded-lg hover:bg-white/[0.05] text-slate-600 dark:text-slate-500 dark:text-slate-400"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                RACE<span className="text-blue-600">PRO</span>
              </span>
              <span className="hidden sm:inline text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded ml-2">
                ADMIN
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/check-in"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Check-In</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-600 dark:text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/[0.06]">
              <span className="hidden sm:block text-xs font-medium text-slate-600 dark:text-slate-500 dark:text-slate-400">{user?.displayName}</span>
            </div>
            <Link to="/" className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-600 dark:text-slate-500 dark:text-slate-400" title="Ke Website">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden xl:flex flex-col w-60 shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-blue-950/50 backdrop-blur-sm p-3 gap-1">
          {adminTabs.map(tab => {
            const Icon = tab.icon;
            const tabParam = new URLSearchParams(tab.href.includes('?') ? tab.href.split('?')[1] : '').get('tab');
            const currentParam = location.search ? new URLSearchParams(location.search).get('tab') : null;
            const isActive = tabParam
              ? currentParam === tabParam
              : location.pathname === '/admin' && !currentParam;
            return (
              <Link
                key={tab.id}
                to={tab.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-yellow-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                    : 'text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
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
          <div className="fixed inset-0 z-40 xl:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="absolute top-16 left-0 bottom-0 w-64  border-r border-slate-200 dark:border-white/[0.06] p-3 flex flex-col gap-1 animate-in slide-in-from-left">
              {adminTabs.map(tab => {
                const Icon = tab.icon;
                const tabParam = new URLSearchParams(tab.href.includes('?') ? tab.href.split('?')[1] : '').get('tab');
                const currentParam = location.search ? new URLSearchParams(location.search).get('tab') : null;
                const isActive = tabParam
                  ? currentParam === tabParam
                  : location.pathname === '/admin' && !currentParam;
                return (
                  <Link
                    key={tab.id}
                    to={tab.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-yellow-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                        : 'text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-slate-200 dark:border-white/[0.06] mt-2 pt-2">
                <Link
                  to="/admin/check-in"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Check-In</span>
                </Link>
              </div>
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
