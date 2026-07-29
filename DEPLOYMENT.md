# Panduan Deployment Production — GUWIGO EVENTS

**Produk:** GUWIGO EVENTS  
**Perusahaan:** PT Guwigo Teknologi Indonesia  
**Production URL:** [https://ev.guwigo.com](https://ev.guwigo.com)  
**Main Corporate Website:** [https://guwigo.com](https://guwigo.com)  

---

## 1. Build Aplikasi
Proyek ini dibangun menggunakan React 18, TypeScript, Tailwind CSS, Vite, dan Firebase SDK.

### Perintah Build:
```bash
npm run build
```
Hasil kompilasi file statis akan berada di direktori `dist/`.

---

## 2. Konfigurasi Firebase
Aplikasi ini terhubung secara langsung dengan infrastruktur Firebase (Project ID: `raceproevent` atau yang disesuaikan):

1. Masuk ke [Firebase Console](https://console.firebase.google.com/).
2. Buat / Pilih Project `raceproevent`.
3. Tambahkan aplikasi Web baru ("Guwigo Events Web App").
4. Salin kunci konfigurasi Firebase ke environment variables.

---

## 3. Firebase Authentication
1. Pada menu **Authentication** di Firebase Console:
   - Aktifkan provider **Email / Password**.
   - Aktifkan provider **Google** (jika sudah menyiapkan OAuth consent screen di Google Cloud Console).
2. Di tab **Settings -> Authorized Domains**, tambahkan domain production:
   - `ev.guwigo.com`
   - `localhost` (untuk pengujian lokal)

---

## 4. Firestore Database
1. Buka menu **Firestore Database** di Firebase Console.
2. Buat database Firestore di region terdekat (misal: `asia-southeast1`).
3. Koleksi utama yang digunakan oleh Guwigo Events:
   - `users`
   - `organizers`
   - `events`
   - `event_categories`
   - `registrations`
   - `participants`
   - `payments`
   - `medical_assessments`
   - `bib_numbers`
   - `qr_codes`
   - `race_packs`
   - `race_results`
   - `certificates`
   - `notifications`
   - `announcements`
   - `sponsors`
   - `galleries`
   - `faqs`
   - `audit_logs`
   - `system_settings`

---

## 5. Firebase Storage
1. Buka menu **Storage** di Firebase Console.
2. Aktifkan bucket storage untuk pengunggahan banner event, bukti pembayaran, dan gambar pendukung lainnya.

---

## 6. Security Rules (Keamanan Database)
Terapkan aturan `firestore.rules` dari proyek ini ke Firebase Console:

```bash
# Apabila menggunakan Firebase CLI
firebase deploy --only firestore:rules
```

Pastikan aturan keamanan memverifikasi otorisasi pengguna (`request.auth.uid == userId`) dan mencegah pembacaan data medis atau pribadi secara publik.

---

## 7. Authorized Domains
Untuk mengizinkan login dan otentikasi Firebase di domain custom:
1. Buka **Authentication > Settings > Authorized Domains**.
2. Klik **Add Domain**.
3. Masukkan `ev.guwigo.com`.

---

## 8. Deployment Production
Aplikasi siap dideploy ke platform Cloud Hosting modern seperti Google Cloud Run, Vercel, Netlify, atau Firebase Hosting.

### Contoh Deployment ke Firebase Hosting:
```bash
firebase init hosting
firebase deploy --only hosting
```

---

## 9. Konfigurasi Custom Domain (`ev.guwigo.com`)
`ev.guwigo.com` adalah subdomain resmi dalam ekosistem **Guwigo** (`guwigo.com`).

1. Masuk ke DNS Management Penyedia Domain `guwigo.com`.
2. Tambahkan DNS Record untuk subdomain `ev`:
   - **Type:** `CNAME`
   - **Host / Name:** `ev`
   - **Target / Value:** `<cname-target-hosting-provider>` (misal: `ghs.googlehosted.com` atau CNAME dari hosting pilihan Anda)
   - **TTL:** `3600` (atau Auto)

---

## 10. Konfigurasi HTTPS & SSL
Sebagian besar provider cloud hosting secara otomatis menerbitkan sertifikat SSL Let's Encrypt / Google Managed Certificate begitu DNS Record `CNAME` terverifikasi.

---

## 11. Environment Variables
Buat file `.env.production` (atau atur pada dashboard CI/CD hosting Anda):

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="raceproevent.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="raceproevent"
VITE_FIREBASE_STORAGE_BUCKET="raceproevent.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"
```

---

*Panduan Deployment ini disusun secara resmi untuk PT Guwigo Teknologi Indonesia (GUWIGO EVENTS).*
