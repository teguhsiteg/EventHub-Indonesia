import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  MailCheck,
  Medal,
  CalendarCheck,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Email atau kata sandi salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Gagal masuk dengan Google.');
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return;
    setResetLoading(true);
    setError('');
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim email reset kata sandi.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] lg:min-h-screen w-full flex overflow-hidden bg-white dark:bg-[#0f172a]">
      {/* Left: Brand Section */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 dark:bg-[#020617] items-center justify-center p-12">
        <div className="relative z-10 max-w-md text-center">
          {/* Logo */}
          <div className="inline-flex mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Selamat Datang Kembali
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
            Masuk ke akun Guwigo Anda untuk melanjutkan. Kelola pendaftaran event, lacak hasil, dan dapatkan pengalaman terbaik.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: CalendarCheck, text: 'Pendaftaran Event Mudah & Cepat' },
              { icon: Medal, text: 'Hasil & Sertifikat Real-Time' },
              { icon: Users, text: 'Komunitas Olahraga Indonesia' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Platform Terverifikasi & Terenkripsi</span>
          </div>
        </div>
      </div>

      {/* Right: Form Section */}
      <div className="w-full h-full lg:w-1/2 flex flex-col justify-center overflow-y-auto px-6 py-4 sm:p-12">
        <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8 my-auto">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-2">
            <div className="inline-flex mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">GUWIGO</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Masuk</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Masukkan kredensial Anda untuk melanjutkan
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-slate-600 dark:text-slate-500 dark:text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-slate-600 dark:text-slate-500 dark:text-slate-400">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetModal(true);
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
            <span className="text-xs text-slate-400 font-medium">ATAU</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
          </div>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] shadow-sm dark:shadow-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Belum punya akun?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-white/[0.08] shadow-2xl p-6">
            {resetSent ? (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <MailCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Email Terkirim!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400">
                  Periksa inbox Anda untuk tautan reset kata sandi.
                </p>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-700 dark:text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-white/[0.06] transition-colors"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-white mb-2">Lupa Kata Sandi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400 mb-4">
                  Masukkan email Anda dan kami akan mengirimkan tautan reset.
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setShowResetModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-600 dark:text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-white transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleResetPassword}
                      disabled={!resetEmail || resetLoading}
                      className="flex-1 flex justify-center items-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold disabled:opacity-50 transition-all"
                    >
                      {resetLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Kirim Tautan'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
