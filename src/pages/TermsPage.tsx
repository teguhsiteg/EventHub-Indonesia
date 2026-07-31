import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, ChevronRight, Home, FileBadge, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import app from '../config/firebase';

const DEFAULT_TERMS = `# Syarat dan Ketentuan

Berlaku untuk seluruh platform **RacePro** ("kami", "platform"). Dengan mendaftar, mengakses, atau menggunakan layanan ini, Anda ("Pengguna") menyetujui seluruh ketentuan berikut.

---

## 1. Definisi

| Istilah | Arti |
|---------|------|
| **Platform** | Sistem manajemen event RacePro yang diakses melalui web |
| **Penyelenggara** | Pihak yang membuat dan mengelola event melalui platform |
| **Peserta** | Individu yang mendaftar untuk mengikuti suatu event |
| **Pengguna** | Seluruh pihak yang mengakses platform, termasuk Penyelenggara dan Peserta |

## 2. Pendaftaran Akun

2.1 Pengguna wajib mendaftar dengan data yang benar dan sesuai dengan identitas resmi (KTP/SIM/Paspor).

2.2 Setiap akun bersifat pribadi dan tidak dapat dialihkan kepada pihak lain.

2.3 Pengguna bertanggung jawab penuh atas keamanan kredensial akunnya.

## 3. Pendaftaran Event

3.1 Pendaftaran event bersifat final setelah pembayaran dikonfirmasi.

3.2 **Kebijakan Pengembalian Dana (Refund):** Tiket yang sudah dibeli dan dibayarkan tidak dapat dikembalikan (*non-refundable*) dengan alasan apa pun, **kecuali**:
   - Event dibatalkan oleh pihak penyelenggara (100% refund)
   - Terjadi perubahan jadwal yang tidak dapat diakomodasi peserta (100% refund)

3.3 Penyelenggara berhak menolak atau membatalkan pendaftaran peserta yang memberikan data palsu.

## 4. Kesehatan dan Keselamatan

4.1 Peserta bertanggung jawab penuh atas kondisi kesehatannya masing-masing.

4.2 Pihak penyelenggara dan platform tidak bertanggung jawab atas cedera, risiko medis, atau kejadian tidak diinginkan yang terjadi selama event berlangsung.

4.3 Peserta wajib mengisi *Medical Assessment* dengan jujur sebelum hari pelaksanaan event.

## 5. Hak Kekayaan Intelektual

5.1 Seluruh konten, desain, dan kode platform adalah milik **RacePro Indonesia**.

5.2 Dilarang menyalin, memodifikasi, atau mendistribusikan ulang konten platform tanpa izin tertulis.

## 6. Pembatasan Tanggung Jawab

6.1 Platform bertindak sebagai penyedia sistem manajemen event dan tidak bertanggung jawab atas pelaksanaan teknis event di lapangan.

6.2 Penyelenggara bertanggung jawab penuh atas akurasi data event, kategori, jadwal, dan hasil lomba.

## 7. Perubahan Ketentuan

7.1 Kami berhak memperbarui Syarat dan Ketentuan ini sewaktu-waktu.

7.2 Pengguna akan diberitahukan melalui email atau pemberitahuan di platform.

---

> *Ketentuan ini diperbarui terakhir: **Juli 2026** — Dikelola oleh **RacePro**.*`;

export const TermsPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const db = getFirestore(app);
        const docRef = doc(db, 'system_settings', 'pages_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().terms) {
          setContent(docSnap.data().terms);
        } else {
          await setDoc(docRef, { terms: DEFAULT_TERMS }, { merge: true });
          setContent(DEFAULT_TERMS);
        }
      } catch (error) {
        console.error("Error fetching terms page:", error);
        setContent(DEFAULT_TERMS);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-blue-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Memuat...</span>
        </div>
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
          <span className="text-blue-400">Syarat & Ketentuan</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-blue-950/90 border border-slate-200 dark:border-slate-800 text-blue-500 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shadow-xl mb-6">
            <FileBadge className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>RACEPRO — SYARAT & KETENTUAN</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-tight leading-[1.05]">
            Syarat & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-300">
              Ketentuan
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 text-base mt-4 max-w-2xl leading-relaxed">
            Dengan menggunakan platform RacePro, Anda menyetujui seluruh ketentuan yang tercantum di halaman ini. Harap baca dengan saksama sebelum mendaftar atau menggunakan layanan kami.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white/60 dark:bg-blue-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl prose dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-lg prose-h3:mt-8 prose-p:text-slate-600 dark:prose-p:text-slate-700 dark:text-slate-600 dark:text-slate-300 prose-p:leading-relaxed prose-a:text-blue-500 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-600 dark:hover:prose-a:text-blue-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:text-blue-500 dark:prose-code:text-blue-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-100 dark:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-li:text-slate-600 dark:prose-li:text-slate-700 dark:text-slate-600 dark:text-slate-300 prose-hr:border-slate-200 dark:prose-hr:border-slate-300 dark:border-slate-700 prose-blockquote:border-blue-500 prose-blockquote:text-slate-500 dark:prose-blockquote:text-slate-600 dark:text-slate-500 dark:text-slate-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-slate-100 dark:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-2xl prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 prose-headings:flex prose-headings:items-center prose-headings:gap-2 backdrop-blur-md">
          <ReactMarkdown>{content || DEFAULT_TERMS}</ReactMarkdown>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/80 dark:bg-blue-950 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">
              Ada pertanyaan hukum? Hubungi{' '}
              <a href="mailto:legal@racepro.id" className="text-blue-500 dark:text-blue-400 font-bold hover:text-blue-600 dark:hover:text-blue-300">
                legal@racepro.id
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
