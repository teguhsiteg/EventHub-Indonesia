import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-wider uppercase">
                  GUWIGO <span className="text-orange-500">EVENTS</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Part of Guwigo Ecosystem
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-md">
              Guwigo Events adalah platform resmi manajemen event & balap dari PT Guwigo Teknologi Indonesia. Temukan, daftar, dan kelola pengalaman event olahraga Anda bersama Guwigo Events.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Manajemen & Integrasi Terverifikasi</span>
            </div>
            <div className="pt-2">
              <a
                href="https://guwigo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-orange-400 border border-slate-800 transition-colors"
              >
                <span>Kunjungi Guwigo Corporate</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Navigasi Utama</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-orange-400 transition-colors">Events</Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-orange-400 transition-colors">Results</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 transition-colors">About</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-orange-400 transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Guwigo Ecosystem</h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <a href="https://guwigo.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  <span>Guwigo Official Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a href="https://ev.guwigo.com" className="hover:text-orange-400 transition-colors">
                  Guwigo Events Platform
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {currentYear} PT Guwigo Teknologi Indonesia. All rights reserved. Part of Guwigo Ecosystem.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-300">Tentang Guwigo</Link>
            <Link to="/faq" className="hover:text-slate-300">Bantuan & FAQ</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
