import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Trophy, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addNotification } = useSettings();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      addNotification('error', 'Kata Sandi Lemah', 'Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName, phone);
      addNotification('success', 'Pendaftaran Akun Berhasil', 'Akun peserta Anda telah dibuat dan email verifikasi telah dikirimkan!');
      navigate('/dashboard');
    } catch (err: any) {
      addNotification('error', 'Registrasi Gagal', err.message || 'Gagal mendaftarkan akun baru.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-wider">RACE<span className="text-orange-500">PRO</span></span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Buat Akun Peserta Lomba</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Daftarkan akun resmi untuk kemudahan pendaftaran event lomba.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Budi Santoso"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Nomor WhatsApp / HP</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@email.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Kata Sandi (Min 6 Karakter)</label>
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
            <span>{loading ? 'Membuat Akun...' : 'Daftar Sekarang'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="text-orange-400 font-bold hover:underline">
            Masuk Di Sini
          </Link>
        </p>

      </div>
    </div>
  );
};
