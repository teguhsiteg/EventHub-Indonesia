import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from '../common/ToastContainer';

interface RpcLayoutProps {
 children: React.ReactNode;
}

export const RpcLayout: React.FC<RpcLayoutProps> = ({ children }) => {
 const { user, logout } = useAuth();
 const navigate = useNavigate();

 const handleLogout = async () => {
 await logout();
 navigate('/');
 };

 return (
 <div className="min-h-screen bg-slate-50 font-sans text-[var(--text-primary)]">
 {/* Top Bar */}
 <header className="bg-white border-b border-[var(--glass-border)] sticky top-0 z-50 shadow-sm">
 <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
 <ShieldCheck className="w-5 h-5 text-white" />
 </div>
 <div>
 <h1 className="text-sm font-black text-[var(--text-primary)] leading-tight">RPC STATION</h1>
 <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">EventHub by Guwigo</p>
 </div>
 </div>
 
 <div className="flex items-center gap-4">
 <div className="hidden sm:block text-right">
 <p className="text-xs font-bold text-[var(--text-primary)]">{user?.displayName || 'Petugas RPC'}</p>
 <p className="text-[10px] text-[var(--text-secondary)]">{user?.email}</p>
 </div>
 <button
 onClick={handleLogout}
 className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
 title="Keluar"
 >
 <LogOut className="w-5 h-5" />
 </button>
 </div>
 </div>
 </header>

 {/* Main Content */}
 <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
 {children}
 </main>

 <ToastContainer />
 </div>
 );
};
