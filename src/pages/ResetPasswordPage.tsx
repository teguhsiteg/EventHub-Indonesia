import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Trophy, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [email, setEmail] = useState('');

  // Verify the code is valid on mount
  useEffect(() => {
    if (!oobCode) {
      setError('Kode reset tidak valid atau tidak ditemukan.');
      setValidating(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setValidating(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Tautan reset kata sandi ini tidak valid atau sudah kadaluarsa. Silakan minta tautan baru.');
        setValidating(false);
      });
  }, [oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    
    if (password.length < 6) {
      setError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah kata sandi. Tautan mungkin sudah kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-[#0f172a] relative overflow-hidden">
      <div className="w-full max-w-md bg-white dark:bg-[#020617] rounded-3xl shadow-xl border border-slate-200 dark:border-white/[0.08] p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Atur Ulang Kata Sandi
          </h1>
          {email && !success && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Masukkan kata sandi baru untuk akun <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
            </p>
          )}
        </div>

        {validating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-500">Memverifikasi tautan...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-left leading-relaxed">{error}</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : success ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kata Sandi Berhasil Diubah!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kata sandi Anda telah berhasil diperbarui. Silakan gunakan kata sandi baru Anda untuk masuk.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              Masuk Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ubah Kata Sandi</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
