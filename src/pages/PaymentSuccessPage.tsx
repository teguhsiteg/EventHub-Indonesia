import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for effect
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
        
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Memverifikasi Pembayaran...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                PEMBAYARAN BERHASIL
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                Terima Kasih!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Pembayaran Anda telah berhasil dikonfirmasi. Pendaftaran Anda pada event ini sudah aktif.
              </p>
            </div>

            {orderId && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-left space-y-2 text-xs bg-slate-50 dark:bg-slate-800/50">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{orderId}</span>
                </div>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <Link
                to="/dashboard"
                className="flex items-center justify-center w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Lihat Tiket Saya
              </Link>
              
              <Link
                to="/events"
                className="block w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-200 dark:border-slate-700"
              >
                Jelajahi Event Lain
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
