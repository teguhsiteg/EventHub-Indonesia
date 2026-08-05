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
  { id: 'participants', label: 'Data Peserta', icon: Users, href: '/admin?tab=participants' },
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
    <div className="relative min-h-screen font-sans text-slate-800 bg-slate-50/50 selection:bg-red-100 selection:text-red-900">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-white" aria-hidden="true" />

      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="xl:hidden p-2 rounded-lg hover:bg-slate-50 text-slate-500"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Event<span className="text-red-600">Hub</span>
              </span>
              <span className="hidden sm:inline text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded ml-2">
                ADMIN
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/check-in"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-all shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Check-In</span>
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <span className="hidden sm:block text-xs font-bold text-slate-600">{user?.displayName}</span>
            </div>
            <Link to="/" className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors" title="Ke Website">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden xl:flex flex-col w-64 shrink-0 min-h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-100 bg-white p-4 gap-1.5">
          {(isSuperAdmin ? adminTabs : adminTabs.filter(tab => !['requests', 'users', 'settings'].includes(tab.id))).map(tab => {
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
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-red-50 text-red-600 shadow-sm border border-red-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
          
          <div className="mt-auto pt-6 pb-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="absolute top-16 left-0 bottom-0 w-64 bg-slate-50 dark:bg-red-950 border-r border-slate-200 dark:border-white/[0.06] p-3 flex flex-col gap-1 animate-in slide-in-from-left">
              {(isSuperAdmin ? adminTabs : adminTabs.filter(tab => !['requests', 'users', 'settings'].includes(tab.id))).map(tab => {
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
                        ? 'bg-gradient-to-r from-red-500/20 to-yellow-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5'
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
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-all"
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
