import React from 'react';
import { ShieldAlert, Clock, RefreshCw } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
 <div className="max-w-md w-full bg-white dark:bg-red-950/80 backdrop-blur-xl border border-[var(--glass-border)] dark:border-white/[0.06] rounded-2xl p-8 shadow-2xl space-y-6">
 <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center mx-auto">
 <ShieldAlert className="w-8 h-8" />
 </div>

 <div className="space-y-2">
 <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-950 px-3 py-1 rounded-full border border-yellow-800/40">
 PEMELIHARAAN SISTEM
 </span>
 <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase mt-2">Sistem Dalam Pemeliharaan</h1>
 <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] leading-relaxed">
 Platform EventHub by Guwigo Indonesia sedang menjalani pemeliharaan berkala untuk peningkatan performa server dan keamanan data. Silakan kembali dalam beberapa saat.
 </p>
 </div>

 <button
 onClick={() => window.location.reload()}
 className="w-full py-3 rounded-xl bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] hover:bg-slate-200 dark:bg-slate-700 text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
 >
 <RefreshCw className="w-4 h-4" />
 <span>Muat Ulang Halaman</span>
 </button>
 </div>
 </div>
 );
};
