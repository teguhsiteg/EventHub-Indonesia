import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Trophy, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginGoogle, resetPassword } = useAuth();
  const { addNotification } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/dashboard';

  const handleResetPassword = async () => {
    if (!email) {
      addNotification('warning', 'Masukkan Email', 'Silakan isi kolom email di atas terlebih dahulu.');
      return;
    }
    try {
      await resetPassword(email);
      addNotification('success', 'Email Reset Terkirim', `Tautan instruksi reset kata sandi telah dikirimkan ke ${email}.`);
    } catch (err: any) {
      addNotification('error', 'Gagal Mengirim Email', err.message || 'Terjadi kesalahan saat mengirim instruksi reset kata sandi.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      addNotification('success', 'Login Berhasil', `Selamat datang kembali, ${profile.displayName}!`);
      
      if (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN' || profile.role === 'ORGANIZER') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      addNotification('error', 'Login Gagal', err.message || 'Email atau kata sandi tidak cocok.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { profile } = await loginGoogle();
      addNotification('success', 'Login Google Berhasil', `Selamat datang, ${profile.displayName}!`);
      
      if (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN' || profile.role === 'ORGANIZER') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      addNotification('error', 'Login Google Gagal', err.message || 'Gagal masuk menggunakan Google.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-wider">RACE<span className="text-orange-500">PRO</span></span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Masuk Akun Peserta</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Akses pendaftaran, nomor BIB, QR Code, dan sertifikat finisher Anda.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase">Kata Sandi</label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-orange-400 hover:underline text-[11px] font-medium"
              >
                Lupa kata sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase">ATAU</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.3 21.32 7.38 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.38 0 3.3 2.68 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
          </svg>
          <span>Masuk Dengan Google</span>
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Belum memiliki akun?{' '}
          <Link to="/register" className="text-orange-400 font-bold hover:underline">
            Daftar Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
};
