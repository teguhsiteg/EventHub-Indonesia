import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, MapPin, Mail, Phone } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    about: 'Guwigo Events adalah platform resmi manajemen event olahraga. Temukan, daftar, dan kelola pengalaman event olahraga Anda bersama kami.',
    copyright: `\u00a9 ${currentYear} Guwigo Events. All rights reserved.`,
    contactAddress: 'Jakarta, Indonesia',
    contactEmail: 'support@racepro.id',
    contactPhone: '+62 812-XXXX-XXXX',
    navLinks: [
      { to: '/events', label: 'Jelajahi Event' },
      { to: '/results', label: 'Hasil & Klasemen' },
      { to: '/about', label: 'Tentang Kami' },
      { to: '/contact', label: 'Bantuan' },
    ],
    legalLinks: [
      { to: '/terms', label: 'Syarat & Ketentuan' },
      { to: '/privacy', label: 'Kebijakan Privasi' },
      { to: '/contact', label: 'Laporkan Masalah' },
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
    <footer className="bg-[#0B0F14] text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="font-display text-2xl tracking-wider text-white">
                GUWIGO<span className="text-amber-400">EVENTS</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70 max-w-xs">
              {footerData.about}
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigasi</h4>
            <ul className="space-y-3">
              {footerData.navLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerData.legalLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span>{footerData.contactAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`mailto:${footerData.contactEmail}`} className="hover:text-amber-400 transition-colors">
                  {footerData.contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`tel:${footerData.contactPhone.replace(/[^0-9+]/g, '')}`} className="hover:text-amber-400 transition-colors">
                  {footerData.contactPhone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-60">
          <p>{footerData.copyright}</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-amber-400 transition-colors">Syarat & Ketentuan</Link>
            <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privasi</Link>
            <Link to="/contact" className="hover:text-amber-400 transition-colors">Bantuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
