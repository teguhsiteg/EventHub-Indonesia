import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, ChevronRight, Home, Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import app from '../config/firebase';

const DEFAULT_PRIVACY = `# Kebijakan Privasi

**Terakhir diperbarui: Juli 2026**

EventHub by Guwigo ("kami", "platform") berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda.

---

## 1. Data yang Kami Kumpulkan

Kami mengumpulkan data yang Anda berikan secara langsung saat mendaftar atau menggunakan platform:

### 1.1 Informasi Akun
- Nama lengkap
- Alamat email
- Nomor telepon
- Kata sandi (dienkripsi)

### 1.2 Informasi Peserta Event
- Nomor Induk Kependudukan (NIK/KTP)
- Tanggal lahir
- Jenis kelamin
- Alamat lengkap
- Golongan darah
- Ukuran jersey
- Data medis (kondisi kesehatan, alergi)
- Kontak darurat

### 1.3 Informasi Pembayaran
- Metode pembayaran
- Status transaksi (kami **tidak** menyimpan nomor kartu kredit atau data perbankan sensitif)

## 2. Penggunaan Data

Data Anda digunakan untuk:

| Tujuan | Data yang Digunakan |
|--------|-------------------|
| Pendaftaran & verifikasi akun | Informasi akun |
| Pendaftaran event olahraga | Informasi peserta |
| Penerbitan nomor BIB dan QR Code | Nama, kategori lomba |
| Verifikasi medis | Data medis |
| Pengiriman e-certificate | Nama, email |
| Customer support | Seluruh data yang relevan |

**Kami tidak akan pernah menjual data pribadi Anda kepada pihak ketiga.**

## 3. Penyimpanan & Keamanan

3.1 Data Anda disimpan di server **Firebase** (Google Cloud Platform) dengan enkripsi standar industri.

3.2 Akses ke data dibatasi hanya untuk:
   - Administrator platform
   - Penyelenggara event tempat Anda mendaftar
   - Anda sendiri

3.3 Setiap akses ke data sensitif dicatat dalam *audit log*.

## 4. Hak Anda

Sebagai pengguna, Anda memiliki hak:

- **Akses** — Meminta salinan data pribadi Anda
- **Koreksi** — Memperbaiki data yang tidak akurat
- **Hapus** — Meminta penghapusan akun dan data Anda
- **Batasan** — Membatasi pemrosesan data tertentu

Untuk menggunakan hak-hak di atas, hubungi **support@racepro.id**.

## 5. Cookie & Tracking

Platform menggunakan cookie esensial untuk menjaga sesi login dan preferensi pengguna. Kami tidak menggunakan cookie pelacakan (*tracking cookies*) untuk kepentingan iklan.

## 6. Perubahan Kebijakan

Kami akan memberitahukan perubahan signifikan pada kebijakan privasi ini melalui email atau pemberitahuan di platform.

---

> *Dengan menggunakan platform EventHub by Guwigo, Anda menyetujui praktik yang dijelaskan dalam kebijakan privasi ini. Jika Anda memiliki pertanyaan, hubungi **support@racepro.id**.*`;

export const PrivacyPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const db = getFirestore(app);
        const docRef = doc(db, 'system_settings', 'pages_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().privacy) {
          setContent(docSnap.data().privacy);
        } else {
          await setDoc(docRef, { privacy: DEFAULT_PRIVACY }, { merge: true });
          setContent(DEFAULT_PRIVACY);
        }
      } catch (error) {
        console.error("Error fetching privacy page:", error);
        setContent(DEFAULT_PRIVACY);
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
          <span className="text-blue-400">Kebijakan Privasi</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-blue-950/90 border border-slate-200 dark:border-slate-800 text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-xl mb-6">
            <Lock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>EventHub by Guwigo — KEBIJAKAN PRIVASI</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-tight leading-[1.05]">
            Kebijakan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300">
              Privasi
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-500 dark:text-slate-400 text-base mt-4 max-w-2xl leading-relaxed">
            Keamanan dan privasi data Anda adalah prioritas utama kami. Kebijakan ini menjelaskan bagaimana kami mengelola, melindungi, dan menggunakan informasi pribadi Anda.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white/60 dark:bg-blue-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl prose dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-lg prose-h3:mt-8 prose-p:text-slate-600 dark:prose-p:text-slate-700 dark:text-slate-600 dark:text-slate-300 prose-p:leading-relaxed prose-a:text-emerald-500 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:text-emerald-600 dark:hover:prose-a:text-emerald-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:text-emerald-500 dark:prose-code:text-emerald-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-100 dark:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-li:text-slate-600 dark:prose-li:text-slate-700 dark:text-slate-600 dark:text-slate-300 prose-hr:border-slate-200 dark:prose-hr:border-slate-300 dark:border-slate-700 prose-blockquote:border-emerald-500 prose-blockquote:text-slate-500 dark:prose-blockquote:text-slate-600 dark:text-slate-500 dark:text-slate-400 prose-blockquote:bg-emerald-50 dark:prose-blockquote:bg-slate-100 dark:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-2xl prose-ol:list-decimal prose-ol:pl-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1 backdrop-blur-md">
          <ReactMarkdown>{content || DEFAULT_PRIVACY}</ReactMarkdown>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/80 dark:bg-blue-950 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm">
            <Shield className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">
              Data Anda aman bersama kami —{' '}
              <a href="mailto:dpo@racepro.id" className="text-emerald-500 dark:text-emerald-400 font-bold hover:text-emerald-600 dark:hover:text-emerald-300">
                dpo@racepro.id
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
