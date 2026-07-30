import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Loader2, FileText, FileBadge, Info, Bold, Italic, Link as LinkIcon, Heading2, List } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import app from '../../config/firebase';

interface PageSettingsProps {
  addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export const PageSettings: React.FC<PageSettingsProps> = ({ addNotification }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'terms' | 'privacy'>('about');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [pagesConfig, setPagesConfig] = useState({
    about: '',
    terms: '',
    privacy: ''
  });

  const db = getFirestore(app);

  useEffect(() => {
    fetchPagesConfig();
  }, []);

  const fetchPagesConfig = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'system_settings', 'pages_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPagesConfig({
          about: data.about || '',
          terms: data.terms || '',
          privacy: data.privacy || ''
        });
      } else {
        // Seed default if missing
        const defaultPages = {
          about: `# Tentang Kami\n\nSelamat datang di RacePro, platform manajemen event olahraga terpadu yang dirancang khusus untuk memenuhi kebutuhan penyelenggara dan peserta.\n\nDengan sistem registrasi instan, manajemen kategori harga yang dinamis, hingga pemindai kode QR untuk klaim Race Pack, kami hadir untuk membuat pengalaman event olahraga lebih profesional dan modern.\n\n---\n\n*Website dan ekosistem ini dibangun secara menyeluruh oleh tim **RacePro**.*`,
          terms: `# Syarat dan Ketentuan\n\nBerikut adalah Syarat dan Ketentuan dalam penggunaan platform kami. Dengan mendaftar atau melakukan pembayaran, Anda secara otomatis menyetujui poin-poin berikut:\n\n1. **Kebenaran Data**\n   Peserta wajib memberikan data asli yang sesuai dengan kartu identitas (KTP/SIM).\n\n2. **Kebijakan Pengembalian Dana (Refund)**\n   Tiket yang sudah dibeli dan dibayarkan tidak dapat dikembalikan (Non-refundable) dengan alasan apa pun, kecuali event dibatalkan oleh pihak penyelenggara.\n\n3. **Kesehatan dan Keselamatan**\n   Peserta bertanggung jawab penuh atas kondisi kesehatannya masing-masing. Pihak penyelenggara tidak bertanggung jawab atas cedera atau risiko medis yang terjadi selama event berlangsung.\n\n---\n\n*Sistem ini dikelola dan dibangun oleh **RacePro**.*`,
          privacy: `# Kebijakan Privasi\n\nKeamanan data Anda adalah prioritas kami. Berikut adalah rincian mengenai bagaimana kami mengelola data Anda:\n\n### Pengumpulan Data\nKami mengumpulkan informasi pribadi seperti Nama Lengkap, Nomor Telepon, Alamat Email, dan Data Medis Dasar hanya untuk keperluan operasional event olahraga.\n\n### Penggunaan Data\nData tersebut tidak akan pernah dijual kepada pihak ketiga mana pun. Data hanya digunakan oleh penyelenggara untuk keperluan asuransi, pencetakan nama di nomor BIB, dan verifikasi saat pengambilan Race Pack.\n\n### Keamanan\nSistem kami dilengkapi perlindungan setingkat industri untuk menjaga kerahasiaan Anda.\n\n---\n\n*Keamanan platform ini didukung penuh dan dibangun oleh **RacePro**.*`
        };
        await setDoc(docRef, defaultPages);
        setPagesConfig(defaultPages);
      }
    } catch (err: any) {
      addNotification('error', 'Gagal', 'Gagal memuat pengaturan halaman: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'system_settings', 'pages_config');
      await setDoc(docRef, pagesConfig, { merge: true });
      addNotification('success', 'Tersimpan', 'Pengaturan halaman berhasil diperbarui.');
    } catch (err: any) {
      addNotification('error', 'Gagal', 'Gagal menyimpan pengaturan halaman: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = pagesConfig[activeTab];
    const selectedText = currentText.substring(start, end);
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);
    
    const newText = before + prefix + selectedText + suffix + after;
    setPagesConfig(prev => ({ ...prev, [activeTab]: newText }));
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-xl animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-wider">Halaman Statis (CMS)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">Kelola konten publik dengan Live Markdown Editor</p>
          </div>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Simpan Konten</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/[0.06] pb-4 mb-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('about')}
          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'about' 
              ? 'bg-indigo-50 dark:bg-blue-600/10 text-blue-800 dark:text-blue-400 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Info className="w-4 h-4" /> Tentang Kami
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'terms' 
              ? 'bg-indigo-50 dark:bg-blue-600/10 text-blue-800 dark:text-blue-400 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileBadge className="w-4 h-4" /> Syarat & Ketentuan
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'privacy' 
              ? 'bg-indigo-50 dark:bg-blue-600/10 text-blue-800 dark:text-blue-400 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Kebijakan Privasi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Editor Side */}
        <div className="flex flex-col border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-blue-950">
          <div className=" border-b border-slate-200 dark:border-white/[0.06] p-2 flex items-center gap-1">
            <button onClick={() => insertFormat('**', '**')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-500 dark:text-slate-400" title="Bold"><Bold className="w-4 h-4" /></button>
            <button onClick={() => insertFormat('*', '*')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-500 dark:text-slate-400" title="Italic"><Italic className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button onClick={() => insertFormat('## ')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-500 dark:text-slate-400" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
            <button onClick={() => insertFormat('- ')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-500 dark:text-slate-400" title="List"><List className="w-4 h-4" /></button>
            <button onClick={() => insertFormat('[', '](url)')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-500 dark:text-slate-400" title="Link"><LinkIcon className="w-4 h-4" /></button>
            <div className="ml-auto px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Markdown Editor</div>
          </div>
          <textarea
            ref={textareaRef}
            value={pagesConfig[activeTab]}
            onChange={(e) => setPagesConfig(prev => ({ ...prev, [activeTab]: e.target.value }))}
            className="flex-1 w-full bg-transparent p-4 text-sm text-slate-800 dark:text-slate-200 font-mono resize-none focus:outline-none"
            placeholder="Ketik konten dengan format Markdown..."
          />
        </div>

        {/* Live Preview Side */}
        <div className="flex flex-col border border-slate-200 dark:border-white/[0.06] rounded-xl overflow-hidden bg-white dark:bg-blue-950">
          <div className=" border-b border-slate-200 dark:border-white/[0.06] p-3 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Preview</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
            <article className="prose prose-slate dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown>{pagesConfig[activeTab] || '*Belum ada konten.*'}</ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
