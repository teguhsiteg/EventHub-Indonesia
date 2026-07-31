import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Edit3, Save, Loader2, Link2, FileText } from 'lucide-react';
import { db } from '../../config/firebase';

export const FooterSettings: React.FC<{ addNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void }> = ({ addNotification }) => {
  const [about, setAbout] = useState('');
  const [copyright, setCopyright] = useState('');
  const [contactAddress, setContactAddress] = useState('Jakarta, Indonesia');
  const [contactEmail, setContactEmail] = useState('support@racepro.id');
  const [contactPhone, setContactPhone] = useState('+62 812-XXXX-XXXX');
  const [navLinksText, setNavLinksText] = useState("Jelajahi Event : /events\\nHasil & Klasemen : /results\\nTentang Kami : /about\\nBantuan : /contact");
  const [legalLinksText, setLegalLinksText] = useState("Syarat & Ketentuan : /terms\\nKebijakan Privasi : /privacy\\nLaporkan Masalah : /contact");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, 'system_settings', 'footer_config'));
        if (snap.exists()) {
          const d = snap.data();
          setAbout(d.about || '');
          setCopyright(d.copyright || '');
          if (d.contactAddress) setContactAddress(d.contactAddress);
          if (d.contactEmail) setContactEmail(d.contactEmail);
          if (d.contactPhone) setContactPhone(d.contactPhone);
          if (d.navLinks) setNavLinksText(d.navLinks.map((l:any) => `${l.label} : ${l.to}`).join('\\n'));
          if (d.legalLinks) setLegalLinksText(d.legalLinks.map((l:any) => `${l.label} : ${l.to}`).join('\\n'));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const parseLinks = (text: string) => text.split('\\n').filter(Boolean).map(l => { 
        const parts = l.split(/[:;,]/); 
        const label = parts[0]?.trim() || '';
        const to = parts.slice(1).join(':')?.trim() || '';
        return { label, to };
      });
      const navLinks = parseLinks(navLinksText);
      const legalLinks = parseLinks(legalLinksText);
      
      await setDoc(doc(db, 'system_settings', 'footer_config'), {
        about,
        copyright,
        contactAddress,
        contactEmail,
        contactPhone,
        navLinks,
        legalLinks,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      addNotification('success', 'Berhasil', 'Pengaturan Footer telah disimpan. Refresh halaman utama untuk melihat perubahan.');
    } catch (e: any) {
      addNotification('error', 'Gagal', e.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-xl animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-wider">Footer & Tampilan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">Sesuaikan teks di bagian bawah situs web</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-pink-500" /> Tentang Kami (Singkat)
          </label>
          <textarea
            rows={3}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all resize-none shadow-sm"
            placeholder="Tuliskan deskripsi singkat platform yang akan muncul di Footer..."
          />
          <p className="text-[10px] text-slate-500 mt-1.5">Maksimal disarankan 150 karakter agar tata letak Footer tetap rapi.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-pink-500" /> Teks Hak Cipta (Copyright)
          </label>
          <input
            type="text"
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
            className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/50 transition-all shadow-sm"
            placeholder="© 2026 RacePro. Seluruh Hak Cipta Dilindungi."
          />
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06]">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Informasi Kontak</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Alamat Lengkap</label>
              <input type="text" value={contactAddress} onChange={e => setContactAddress(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none bg-transparent" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Email Support</label>
              <input type="text" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none bg-transparent" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nomor Telepon/WA</label>
              <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none bg-transparent" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06]">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Pengaturan Link Navigasi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Link Navigasi (Format: Teks : /url)</label>
              <textarea rows={4} value={navLinksText} onChange={e => setNavLinksText(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none bg-transparent font-mono text-xs whitespace-pre" placeholder="Jelajahi Event : /events" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Link Legal (Format: Teks : /url)</label>
              <textarea rows={4} value={legalLinksText} onChange={e => setLegalLinksText(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:border-pink-500 focus:outline-none bg-transparent font-mono text-xs whitespace-pre" placeholder="Syarat & Ketentuan : /terms" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-pink-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Footer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
