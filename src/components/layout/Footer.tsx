import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    about: 'Guwigo Events adalah platform teknologi pendaftaran, timing, dan tiket event olahraga terintegrasi di Indonesia.',
    copyright: `\u00a9 ${currentYear} Guwigo Events. Hak Cipta Dilindungi.`,
    contactAddress: 'Jakarta, Indonesia',
    contactEmail: 'support@guwigo.id',
    contactPhone: '+62 812-8888-9999',
    navLinks: [
      { to: '/events', label: 'Eksplorasi Event' },
      { to: '/check-ticket', label: 'Cek E-Tiket Saya' },
      { to: '/results', label: 'Hasil & Klasemen' },
      { to: '/host-event', label: 'Buka Event (Organizer)' },
      { to: '/about', label: 'Tentang Kami' },
    ],
    legalLinks: [
      { to: '/terms', label: 'Syarat & Ketentuan' },
      { to: '/privacy', label: 'Kebijakan Privasi' },
      { to: '/contact', label: 'Pusat Bantuan & Laporan' },
    ]
  });

  useEffect(() => {
    async function loadFooter() {
      try {
        const snap = await getDoc(doc(db, 'system_settings', 'footer_config'));
        if (snap.exists()) {
          const data = snap.data();
          setFooterData(p => ({
            ...p,
            about: data.about || p.about,
            copyright: data.copyright || p.copyright,
            contactAddress: data.contactAddress || p.contactAddress,
            contactEmail: data.contactEmail || p.contactEmail,
            contactPhone: data.contactPhone || p.contactPhone,
            navLinks: data.navLinks || p.navLinks,
            legalLinks: data.legalLinks || p.legalLinks
          }));
        }
      } catch (e) {
        console.error('Error loading footer config', e);
      }
    }
    loadFooter();
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">
          
          {/* Brand & Value Prop */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="Guwigo Events" 
                className="h-10 w-auto object-contain brightness-0 invert opacity-95"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 pr-4">
              {footerData.about}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Pembayaran Resmi Terenkripsi</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide">Navigasi Utama</h4>
            <ul className="space-y-2.5">
              {footerData.navLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#e50a38] transition-colors" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide">Legalitas</h4>
            <ul className="space-y-2.5">
              {footerData.legalLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-4 text-sm tracking-wide">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                <span>{footerData.contactAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <a href={`mailto:${footerData.contactEmail}`} className="hover:text-white transition-colors">
                  {footerData.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <a href={`tel:${footerData.contactPhone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors">
                  {footerData.contactPhone}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Payment Channels Showcase (Official DOKU Ecosystem Banner) */}
        <div className="py-8 border-t border-slate-800 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Metode Pembayaran Resmi & Terverifikasi</span>
          </div>
          
          <div className="w-full max-w-4xl px-4 flex justify-center">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-md backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <img 
                src="https://cdn-doku.oss-ap-southeast-5.aliyuncs.com/doku-ui-framework/doku/img/register-page/Merchants/Line-1.png"
                alt="Metode Pembayaran Resmi DOKU - Bank Transfer, Virtual Account, Kartu Kredit, E-Wallet, QRIS, Gerai Ritel"
                className="max-h-12 sm:max-h-14 w-auto object-contain transition-transform hover:scale-102"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{footerData.copyright}</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Syarat Penggunaan</Link>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Kebijakan Privasi</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Bantuan</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
