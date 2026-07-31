import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck, MapPin, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    about: 'RacePro adalah platform resmi manajemen event & olahraga. Temukan, daftar, dan kelola pengalaman event olahraga Anda bersama RacePro.',
    copyright: `© ${currentYear} RacePro. All rights reserved.`,
  });

  useEffect(() => {
    async function loadFooter() {
      try {
        const snap = await getDoc(doc(db, 'system_settings', 'footer_config'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.about) setFooterData(p => ({...p, about: data.about}));
          if (data.copyright) setFooterData(p => ({...p, copyright: data.copyright}));
        }
      } catch (e) {
        console.error('Error loading footer config', e);
      }
    }
    loadFooter();
  }, []);

  return (
    <footer className="relative  border-t border-slate-200 dark:border-white/[0.06] pt-16 pb-8">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-yellow-400 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Trophy className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  RACE<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-yellow-400">PRO</span>
                </span>
                <span className="block text-[9px] font-medium text-slate-500 tracking-wider uppercase">
                  Platform Event Olahraga Terdepan di Indonesia
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              {footerData.about}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Sistem Manajemen & Integrasi Terverifikasi</span>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4">Navigasi</h4>
            <ul className="space-y-3">
              {[
                { to: '/events', label: 'Jelajahi Event' },
                { to: '/results', label: 'Hasil & Klasemen' },
                { to: '/about', label: 'Tentang Kami' },
                { to: '/contact', label: 'Bantuan' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              {[
                { to: '/terms', label: 'Syarat & Ketentuan' },
                { to: '/privacy', label: 'Kebijakan Privasi' },
                { to: '/contact', label: 'Laporkan Masalah' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <span>Jakarta, Indonesia</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <a href="mailto:support@racepro.id" className="hover:text-blue-400 transition-colors">
                  support@racepro.id
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-500 dark:text-slate-400">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <a href="tel:+6281234567890" className="hover:text-blue-400 transition-colors">
                  +62 812-XXXX-XXXX
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {footerData.copyright}
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link to="/terms" className="hover:text-slate-700 dark:text-slate-600 dark:text-slate-300 transition-colors">Syarat & Ketentuan</Link>
            <Link to="/privacy" className="hover:text-slate-700 dark:text-slate-600 dark:text-slate-300 transition-colors">Privasi</Link>
            <Link to="/contact" className="hover:text-slate-700 dark:text-slate-600 dark:text-slate-300 transition-colors">Bantuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
