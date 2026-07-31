import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, Info, ChevronRight, Home, Shield, FileText, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import app from '../config/firebase';

const DEFAULT_ABOUT = `# Tentang RacePro

**RacePro** adalah platform manajemen event olahraga terpadu yang dirancang khusus untuk memenuhi kebutuhan penyelenggara dan peserta. Kami hadir untuk membuat pengalaman event olahraga lebih profesional, modern, dan bebas hambatan.

---

## Misi Kami

Kami percaya bahwa setiap event olahraga berhak mendapatkan sistem manajemen yang handal. Mulai dari pendaftaran peserta, manajemen kategori harga, verifikasi QR Code untuk pengambilan Race Pack, hingga penerbitan sertifikat digital — semuanya dapat dikelola dalam satu ekosistem terpadu.

## Fitur Unggulan

### Manajemen Event End-to-End
Dari pembuatan event, pengaturan kategori lomba, hingga publikasi — semuanya bisa dilakukan dalam hitungan menit.

### Registrasi Peserta Otomatis
Peserta dapat mendaftar secara mandiri dengan sistem BIB (Back Induk Bertanding) yang terintegrasi. Setiap pendaftar mendapatkan nomor BIB unik dan QR Code untuk keperluan check-in.

### Verifikasi QR Code
Sistem verifikasi QR Code real-time untuk pengambilan Race Pack, memastikan tidak ada duplikasi atau kesalahan data.

### Sertifikat Digital
Peserta yang berhasil finish akan mendapatkan e-certificate yang dapat diunduh kapan saja.

---

## Untuk Siapa Platform Ini?

| Pengguna | Manfaat |
|----------|---------|
| **Penyelenggara Event** | Kelola pendaftaran, peserta, pembayaran, dan hasil lomba dari satu dashboard |
| **Peserta Lomba** | Daftar online, cek status pendaftaran, unduh QR Code, dan klaim e-certificate |
| **Admin & Panitia** | Verifikasi pembayaran, check-in peserta, dan publikasi hasil lomba secara real-time |

---

## Teknologi

Dibangun dengan teknologi modern untuk performa maksimal:

- ⚛ **React** — Antarmuka yang responsif dan interaktif
- 🔥 **Firebase** — Database real-time dan autentikasi aman
- ⚡ **Vite** — Performa development dan build yang cepat
- 🎨 **Tailwind CSS** — Desain yang konsisten dan mudah dikustomisasi

---

> *"Website dan ekosistem ini dibangun secara menyeluruh oleh tim **RacePro**."*

<div align="center" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #334155;">
  <p style="color: #94a3b8; font-size: 0.8rem;">
    © {new Date().getFullYear()} RacePro — Platform Management Event Olahraga Profesional
  </p>
</div>`;

export const AboutPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const db = getFirestore(app);
        const docRef = doc(db, 'system_settings', 'pages_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().about) {
          setContent(docSnap.data().about);
        } else if (docSnap.exists() && !docSnap.data().about) {
          // Seed default jika field kosong
          await setDoc(docRef, { about: DEFAULT_ABOUT }, { merge: true });
          setContent(DEFAULT_ABOUT);
        } else {
          // Seed full default jika dokumen tidak ada
          const defaults = {
            about: DEFAULT_ABOUT,
            terms: `# Syarat dan Ketentuan\n\n...`,
            privacy: `# Kebijakan Privasi\n\n...`
          };
          await setDoc(docRef, defaults);
          setContent(DEFAULT_ABOUT);
        }
      } catch (error) {
        console.error("Error fetching about page:", error);
        setContent(DEFAULT_ABOUT);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-blue-950">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-slate-900 dark:text-slate-100 pb-16">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-0">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
          <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-blue-400">Tentang Kami</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-blue-950/90 border border-slate-200 dark:border-slate-800 text-blue-500 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shadow-xl mb-6">
            <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            <span>RACEPRO — TENTANG KAMI</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-tight leading-[1.05]">
            Tentang <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-yellow-400 to-yellow-200">
              RacePro
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 text-base mt-4 max-w-2xl leading-relaxed">
            **RacePro** didirikan pada tahun 2026 dengan visi tunggal: *Mendigitalisasi dan menyatukan ekosistem olahraga di seluruh Indonesia*.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white/60 dark:bg-blue-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl prose dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-lg prose-h3:mt-8 prose-p:text-slate-600 dark:prose-p:text-slate-700 dark:text-slate-600 dark:text-slate-300 prose-p:leading-relaxed prose-a:text-blue-500 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-600 dark:hover:prose-a:text-blue-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:text-blue-500 dark:prose-code:text-blue-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-100 dark:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-li:text-slate-600 dark:prose-li:text-slate-700 dark:text-slate-600 dark:text-slate-300 prose-hr:border-slate-200 dark:prose-hr:border-slate-300 dark:border-slate-700 prose-blockquote:border-blue-500 prose-blockquote:text-slate-500 dark:prose-blockquote:text-slate-600 dark:text-slate-500 dark:text-slate-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-slate-100 dark:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-2xl backdrop-blur-md">
          <ReactMarkdown>{content || DEFAULT_ABOUT}</ReactMarkdown>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/80 dark:bg-blue-950 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
            <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">
              Ada pertanyaan? Hubungi kami di{' '}
              <a href="mailto:support@racepro.id" className="text-blue-500 dark:text-blue-400 font-bold hover:text-blue-600 dark:hover:text-blue-300">
                support@racepro.id
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
