import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
 return (
 <div className="min-h-screen flex items-center justify-center p-4">
 <div className="max-w-md w-full text-center space-y-8">
 <div className="space-y-4">
 <h1 className="text-8xl font-black text-white">404</h1>
 <div className="h-1 w-24 bg-red-500 mx-auto rounded-full" />
 <h2 className="text-2xl font-bold text-[var(--text-primary)] dark:text-slate-200">
 Halaman Tidak Ditemukan
 </h2>
 <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
 Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
 </p>
 </div>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
 <button
 onClick={() => window.history.back()}
 className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-red-950 hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] text-slate-700 dark:text-slate-600 font-bold text-sm transition-colors border border-[var(--glass-border)] flex items-center justify-center gap-2"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>Kembali</span>
 </button>
 <Link
 to="/"
 className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
 >
 <Home className="w-4 h-4" />
 <span>Ke Halaman Utama</span>
 </Link>
 </div>
 </div>
 </div>
 );
};
