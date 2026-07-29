import React from 'react';
import { Trophy, ShieldCheck, Zap, Award, ExternalLink } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest block">TENTANG GUWIGO EVENTS</span>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Official Event Platform</h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            GUWIGO EVENTS adalah platform resmi dari PT Guwigo Teknologi Indonesia yang didesain untuk menghubungkan penyelenggara event olahraga dengan peserta secara cepat, transparan, dan terpercaya.
          </p>
          <div className="pt-2">
            <a
              href="https://guwigo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-400 border border-slate-800 text-xs font-bold transition-all"
            >
              <span>Kunjungi Corporate Site (guwigo.com)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <Trophy className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-white uppercase">Sistem BIB Server-Side</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Algoritma penomoran BIB unik dengan kualifikasi otomatis untuk mencegah terjadinya nomor ganda antar peserta.
            </p>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <Zap className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-lg font-bold text-white uppercase">QR Code Check-in</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Verifikasi cepat saat pengambilan Race Pack di venue event menggunakan pemindaian QR Code peserta yang aman.
            </p>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white uppercase">Manajemen Data Terproteksi</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Perlindungan data pribadi & rekam medis peserta dengan standar keamanan dan otorisasi terpusat.
            </p>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <Award className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-bold text-white uppercase">E-Sertifikat Finisher</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Penerbitan otomatis sertifikat digital finisher yang dapat langsung diunduh dari dashboard peserta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
