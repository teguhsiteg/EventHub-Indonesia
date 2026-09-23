import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'profilcode-firebase-adminsdk-fbsvc-79c6afa1de.json');
let db: FirebaseFirestore.Firestore;
try {
  let serviceAccount: any;
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    throw new Error('No Firebase service account found. Set FIREBASE_SERVICE_ACCOUNT env var or place JSON file.');
  }
  initializeApp({
    credential: cert(serviceAccount)
  });
  db = getFirestore();
  console.log('Firebase Admin initialized successfully.');
} catch (err) {
  console.error('Failed to initialize Firebase Admin:', err);
}

// Email Transporter (shared across all email endpoints)
const EMAIL_USER = process.env.GMAIL_USER || 'parthner@guwigo.com';
const EMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'cjus auns wopc zvkw';
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Automated Cleanup Job for Unverified Users (Runs every hour)
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
setInterval(async () => {
  if (!db) return;
  try {
    console.log('[Cleanup Job] Running unverified users cleanup...');
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    // Query only users who haven't verified their email (saves quota vs querying all users)
    const unverifiedUsersSnap = await db.collection('users')
      .where('isEmailVerified', '==', false)
      .get();
      
    let deletedCount = 0;
    
    for (const doc of unverifiedUsersSnap.docs) {
      const userData = doc.data();
      const createdAtStr = userData.createdAt;
      
      if (createdAtStr) {
        const createdAt = new Date(createdAtStr);
        if (createdAt < twentyFourHoursAgo) {
          // 1. Delete from Firestore
          await doc.ref.delete();
          // 2. Delete from Firebase Auth
          try {
            await getAuth().deleteUser(doc.id);
          } catch (authErr) {
            console.warn(`[Cleanup Job] Failed to delete user from Auth (UID: ${doc.id}):`, authErr);
          }
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      console.log(`[Cleanup Job] Successfully cleaned up ${deletedCount} unverified users older than 24h.`);
    } else {
      console.log('[Cleanup Job] No stale unverified users found.');
    }
  } catch (error) {
    console.error('[Cleanup Job] Error during cleanup:', error);
  }
}, CLEANUP_INTERVAL);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Trust Cloudflare proxy — required for correct client IP & HTTPS detection
app.set('trust proxy', true);

app.use(express.json());

// Cloudflare verification token route (TXT alternative)
// Set CLOUDFLARE_VERIFY_TOKEN env var in Render dashboard
const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_VERIFY_TOKEN || '';
app.get('/.well-known/cloudflare-verify', (req, res) => {
  if (CLOUDFLARE_TOKEN) {
    res.type('text/plain').send(CLOUDFLARE_TOKEN);
  } else {
    res.status(404).send('not configured');
  }
});

// Security headers + HTTPS redirect behind Cloudflare proxy
app.use((req, res, next) => {
  // HTTPS enforcement — Cloudflare sends X-Forwarded-Proto
  // Only redirect browser page loads (GET/HEAD), never API calls (POST etc)
  const proto = req.headers['x-forwarded-proto'];
  if (proto && proto !== 'https' && process.env.NODE_ENV === 'production' && req.method === 'GET') {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }

  // HSTS (only when HTTPS)
  if (proto === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Cloudflare-compatible security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restore client IP from Cloudflare
  const clientIP = req.headers['cf-connecting-ip'] as string;
  if (clientIP) {
    (req as any).clientIP = clientIP;
  }

  // COOP for Firebase Auth
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// API Routes

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'Guwigo Indonesia Platform API', timestamp: new Date().toISOString() });
});

// 1.5 AI Chat Assistant (Gemini)
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  if (!GEMINI_KEY) return res.status(503).json({ error: 'AI assistant not configured' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Kamu adalah asisten virtual Guwigo Events, platform event olahraga terdepan di Indonesia. Bantu pelanggan dengan ramah dalam Bahasa Indonesia. Jawab singkat dan helpful.\n\nPelanggan: ${message}`
            }]
          }]
        })
      }
    );
    const data = await response.json();
    if (data.error) {
      console.error('Gemini API error:', data.error);
      return res.status(429).json({ reply: 'Maaf, asisten AI sedang sibuk. Silakan coba lagi sebentar lagi ya! 🙏' });
    }
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak bisa menjawab saat ini.';
    res.json({ reply });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Service Abstraction: OAuth2 Endpoint Info
app.get('/api/auth/oauth2/authorize', (req: Request, res: Response) => {
  res.json({ 
    enabled: true, 
    provider: 'Firebase Auth Google Provider', 
    message: 'Google Authentication is handled directly via Firebase Auth SDK in the client.' 
  });
});

// 3. Service Abstraction: Payment Gateway Webhook
app.post('/api/payment/webhook', (req: Request, res: Response) => {
  return res.json({ 
    status: 'UNCONFIGURED', 
    message: 'Payment Gateway integration abstraction is currently idle until payment credentials are provided.' 
  });
});

// 3.5. Midtrans Snap Token Generator
app.post('/api/payment/midtrans-token', async (req: Request, res: Response) => {
  const { serverKey, isProduction, transactionDetails } = req.body;

  if (!serverKey || !transactionDetails) {
    return res.status(400).json({ error: 'serverKey and transactionDetails are required' });
  }

  const midtransUrl = isProduction 
    ? 'https://app.midtrans.com/snap/v1/transactions' 
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  try {
    const authString = Buffer.from(`${serverKey}:`).toString('base64');
    
    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(transactionDetails)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Midtrans API Error:', data);
      return res.status(response.status).json({ error: data.error_messages || 'Failed to generate token' });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Midtrans Snap Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 3.6. Midtrans Auto-Verify (Client calls this on onSuccess)
app.post('/api/payment/auto-verify', async (req: Request, res: Response) => {
  const { paymentId, registrationId, userId } = req.body;
  if (!paymentId || !registrationId || !db) {
    return res.status(400).json({ error: 'Missing parameters or db' });
  }

  try {
    const now = new Date().toISOString();
    const payRef = db.collection('payments').doc(paymentId);
    const regRef = db.collection('registrations').doc(registrationId);

    const regSnap = await regRef.get();
    if (!regSnap.exists) return res.status(404).json({ error: 'Registration not found' });
    const registration = regSnap.data();

    // Fetch participants
    const partSnap = await db.collection('participants').where('registrationId', '==', registrationId).get();
    
    // Generate BIBs
    const participantsByCategory: any = {};
    partSnap.forEach(d => {
      const data = d.data() as any;
      const p = { id: d.id, ...data };
      if (!participantsByCategory[p.categoryId]) participantsByCategory[p.categoryId] = [];
      participantsByCategory[p.categoryId].push(p);
    });

    for (const categoryId of Object.keys(participantsByCategory)) {
      const catParticipants = participantsByCategory[categoryId];
      const catSnap = await db.collection('event_categories').doc(categoryId).get();
      if (!catSnap.exists) continue;
      
      const category = catSnap.data();
      // Simple prefix generation inline
      const distanceStr = category?.distance || '0K';
      const cleanDist = distanceStr.replace(/[^0-9]/g, '').padStart(2, '0');
      const words = (category?.name || '').trim().toUpperCase().split(' ');
      let prefix = 'RC';
      if (words.length >= 2) prefix = `${words[0][0]}${words[1][0]}`;
      else if (words.length === 1 && words[0].length >= 2) prefix = words[0].substring(0, 2);
      const categoryPrefix = `${prefix}${cleanDist}`;

      const bibSnap = await db.collection('participants')
        .where('eventId', '==', registration?.eventId)
        .where('categoryId', '==', categoryId)
        .get();
      
      let participantsWithBib = 0;
      bibSnap.forEach(d => { if (d.data().bibNumber) participantsWithBib++; });
      let nextBibCount = participantsWithBib + 1;

      for (const pData of catParticipants) {
        if (!pData.bibNumber) {
          const newBib = `${categoryPrefix}-${String(nextBibCount).padStart(4, '0')}`;
          const parts = pData.qrToken.split('_');
          parts[3] = newBib; 
          const newQrToken = parts.join('_');

          await db.collection('participants').doc(pData.id).update({
            bibNumber: newBib,
            qrToken: newQrToken,
            updatedAt: now
          });
          nextBibCount++;
        }
      }
    }

    await payRef.update({ status: 'PAID', paidAt: now, updatedAt: now });
    await regRef.update({ status: 'VERIFIED', updatedAt: now });

    // Update race packs
    for (const pDoc of partSnap.docs) {
      const packSnap = await db.collection('race_packs').where('participantId', '==', pDoc.id).limit(1).get();
      if (!packSnap.empty) {
        await db.collection('race_packs').doc(packSnap.docs[0].id).update({ pickupStatus: 'READY', updatedAt: now });
      }
    }

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Auto Verify Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 4. Public QR Code verification endpoint
app.get('/api/verify/qr/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token || !token.startsWith('GUWIGO_')) {
    return res.status(400).json({ valid: false, message: 'Format token QR Code tidak valid.' });
  }

  return res.json({
    valid: true,
    token,
    verifiedAt: new Date().toISOString(),
    instruction: 'Scan QR berhasil. Buka dashboard admin check-in untuk konfirmasi pengambilan Race Pack & BIB.'
  });
});

// 4.5. Admin Users Fetcher (Bypass Firestore client rules)
app.get('/api/admin/users', async (req: Request, res: Response) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not initialized' });
    const snap = await db.collection('users').get();
    const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. CSV Export endpoint
app.get('/api/export/csv', (req: Request, res: Response) => {
  const { type } = req.query;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=guwigo_export_${type || 'data'}_${Date.now()}.csv`);
  
  if (type === 'participants') {
    res.send('RegistrationNo,BIB,FullName,Gender,Category,Phone,Email,CheckInStatus\nREG-2026-001,TR50-0001,Budi Santoso,MALE,Trail 50K,08123456789,budi@example.com,VERIFIED\n');
  } else {
    res.send('ID,Type,Status,CreatedAt\n1,EXPORT_DATA,COMPLETED,2026-07-28\n');
  }
});

// 6. Automated Registration & Event Email Trigger APIs

// Helper logo URL & Base Styles
const GUWIGO_LOGO_URL = 'https://guwigo-events.web.app/logo.png';
const BASE_APP_URL = 'https://guwigo-events.web.app';

// 6.1 Email Konfirmasi Pendaftaran Awal (Pending Payment / Registered)
app.post('/api/notifications/send-registration-email', async (req: Request, res: Response) => {
  const { recipientEmail, participantName, registrationNumber, bibNumber, eventName, categoryName, eventDate, location, qrToken, totalAmount, paymentMethod, paymentDueDate } = req.body;

  if (!recipientEmail || !participantName || !eventName) {
    return res.status(400).json({ success: false, message: 'Parameter pendaftaran tidak lengkap.' });
  }

  const formatCurrency = (val?: number) => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Pendaftaran Berhasil - ${eventName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px 12px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 32px 24px; text-align: center; }
        .logo { height: 42px; width: auto; margin-bottom: 12px; }
        .header-title { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .header-subtitle { color: #94a3b8; font-size: 13px; margin-top: 4px; }
        .content { padding: 32px 28px; }
        .badge-status { display: inline-block; padding: 6px 14px; background: #eff6ff; color: #007aff; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #bfdbfe; }
        .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
        .lead-text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; }
        .ticket-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; margin-bottom: 24px; }
        .ticket-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .ticket-row:last-child { border-bottom: none; padding-bottom: 0; }
        .label { color: #64748b; font-weight: 600; }
        .value { color: #0f172a; font-weight: 700; text-align: right; }
        .btn-primary { display: block; text-align: center; background: #e50a38; color: #ffffff !important; text-decoration: none; padding: 15px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; margin: 24px 0 12px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; }
        .footer a { color: #007aff; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="${GUWIGO_LOGO_URL}" alt="Guwigo Events" class="logo" />
          <h1 class="header-title">${eventName}</h1>
          <p class="header-subtitle">Official Sports Event Platform</p>
        </div>
        <div class="content">
          <span class="badge-status">Registrasi Diterima</span>
          <h2 class="greeting">Halo, ${participantName}!</h2>
          <p class="lead-text">
            Terima kasih telah mendaftar di <strong>${eventName}</strong>. Data Anda telah berhasil tercatat di sistem kami.
          </p>

          <div class="ticket-card">
            <div class="ticket-row">
              <span class="label">Nomor Registrasi</span>
              <span class="value" style="font-family: monospace;">${registrationNumber}</span>
            </div>
            <div class="ticket-row">
              <span class="label">Kategori Lomba</span>
              <span class="value">${categoryName || 'Peserta'}</span>
            </div>
            <div class="ticket-row">
              <span class="label">Jadwal Event</span>
              <span class="value">${eventDate || 'Sesuai Jadwal'}</span>
            </div>
            <div class="ticket-row">
              <span class="label">Lokasi</span>
              <span class="value">${location || 'Lokasi Penyelenggaraan'}</span>
            </div>
            ${totalAmount ? `
            <div class="ticket-row">
              <span class="label">Total Biaya</span>
              <span class="value" style="color: #e50a38;">${formatCurrency(totalAmount)}</span>
            </div>` : ''}
          </div>

          <a href="${BASE_APP_URL}/check-ticket?q=${registrationNumber}" class="btn-primary">
            Cek Status &amp; E-Tiket Saya
          </a>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
            Tidak perlu login, Anda dapat mengecek status dan mengunduh tiket kapan saja menggunakan nomor registrasi Anda.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Guwigo Events Indonesia. All rights reserved.</p>
          <p>Jika ada pertanyaan, silakan hubungi tim support kami melalui website resmi <a href="${BASE_APP_URL}">guwigo-events.web.app</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await emailTransporter.sendMail({
      from: '"Guwigo Events" <parthner@guwigo.com>',
      to: recipientEmail,
      subject: `[Guwigo] Pendaftaran Diterima: ${eventName} (#${registrationNumber})`,
      html: emailHtml
    });
    return res.json({ success: true, message: `Email pendaftaran terkirim ke ${recipientEmail}`, messageId: info.messageId });
  } catch (error: any) {
    console.error('[Email Registration Error]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email pendaftaran.', error: error.message });
  }
});

// 6.2 Email Notifikasi Status Pembayaran (PAID / Approved / E-Tiket Terbit)
app.post('/api/notifications/send-payment-status-email', async (req: Request, res: Response) => {
  const { recipientEmail, participantName, registrationNumber, bibNumber, eventName, categoryName, amount, status = 'PAID', qrToken } = req.body;

  if (!recipientEmail || !participantName || !eventName) {
    return res.status(400).json({ success: false, message: 'Parameter pembayaran tidak lengkap.' });
  }

  const isPaid = status === 'PAID' || status === 'VERIFIED';
  const qrImageUrl = qrToken ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrToken)}` : '';

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Pembayaran Terverifikasi - ${eventName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px 12px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 32px 24px; text-align: center; }
        .logo { height: 42px; width: auto; margin-bottom: 12px; }
        .header-title { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .content { padding: 32px 28px; }
        .badge-success { display: inline-block; padding: 6px 14px; background: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #a7f3d0; }
        .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
        .lead-text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; }
        .qr-card { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .qr-img { width: 170px; height: 170px; margin: 12px auto; display: block; border-radius: 12px; background: #ffffff; padding: 8px; border: 1px solid #e2e8f0; }
        .bib-badge { display: inline-block; background: #e50a38; color: #ffffff; padding: 4px 14px; border-radius: 8px; font-weight: 800; font-size: 14px; font-family: monospace; letter-spacing: 1px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .info-table td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .info-table td:last-child { text-align: right; font-weight: 700; color: #0f172a; }
        .info-table td:first-child { color: #64748b; font-weight: 600; }
        .btn-primary { display: block; text-align: center; background: #e50a38; color: #ffffff !important; text-decoration: none; padding: 15px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; margin: 24px 0 12px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="${GUWIGO_LOGO_URL}" alt="Guwigo Events" class="logo" />
          <h1 class="header-title">E-Tiket &amp; Konfirmasi Pembayaran</h1>
        </div>
        <div class="content">
          <span class="badge-success">Pembayaran Lunas &amp; Sah</span>
          <h2 class="greeting">Halo, ${participantName}!</h2>
          <p class="lead-text">
            Pembayaran untuk pendaftaran Anda di <strong>${eventName}</strong> telah berhasil diverifikasi secara resmi. E-Tiket Anda telah terbit dengan rincian berikut:
          </p>

          <table class="info-table">
            <tr>
              <td>Nomor Registrasi</td>
              <td style="font-family: monospace;">${registrationNumber}</td>
            </tr>
            <tr>
              <td>Nomor BIB Resmi</td>
              <td><span class="bib-badge">${bibNumber || 'READY'}</span></td>
            </tr>
            <tr>
              <td>Kategori</td>
              <td>${categoryName || 'Official Race'}</td>
            </tr>
            <tr>
              <td>Status Pembayaran</td>
              <td style="color: #059669;">LUNAS (VERIFIED)</td>
            </tr>
          </table>

          ${qrImageUrl ? `
          <div class="qr-card">
            <p style="margin: 0; font-weight: 700; font-size: 13px; color: #0f172a;">QR Code Pengambilan Race Pack</p>
            <p style="margin: 4px 0 12px; font-size: 12px; color: #64748b;">Tunjukkan QR Code ini kepada petugas RPC di lokasi</p>
            <img src="${qrImageUrl}" alt="QR E-Ticket" class="qr-img" />
            <p style="margin: 8px 0 0; font-size: 11px; color: #64748b; font-family: monospace;">${qrToken}</p>
          </div>
          ` : ''}

          <a href="${BASE_APP_URL}/check-ticket?q=${registrationNumber}" class="btn-primary">
            Lihat &amp; Unduh E-Tiket Digital
          </a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Guwigo Events Indonesia. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await emailTransporter.sendMail({
      from: '"Guwigo Events" <parthner@guwigo.com>',
      to: recipientEmail,
      subject: `[Guwigo] Pembayaran Lunas & E-Tiket Resmi: ${eventName} (BIB: ${bibNumber || 'TERBIT'})`,
      html: emailHtml
    });
    return res.json({ success: true, message: `Email konfirmasi pembayaran terkirim ke ${recipientEmail}`, messageId: info.messageId });
  } catch (error: any) {
    console.error('[Email Payment Error]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email pembayaran.', error: error.message });
  }
});

// 6.3 Email Informasi Pengambilan Race Pack (RPC)
app.post('/api/notifications/send-racepack-email', async (req: Request, res: Response) => {
  const { recipientEmail, participantName, registrationNumber, bibNumber, eventName, pickupLocation, pickupSchedule, requirements, qrToken } = req.body;

  if (!recipientEmail || !participantName || !eventName) {
    return res.status(400).json({ success: false, message: 'Parameter Race Pack tidak lengkap.' });
  }

  const qrImageUrl = qrToken ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrToken)}` : '';

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Informasi Pengambilan Race Pack - ${eventName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px 12px; }
        .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
        .header { background: #0f172a; padding: 32px 24px; text-align: center; }
        .logo { height: 42px; width: auto; margin-bottom: 12px; }
        .header-title { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
        .content { padding: 32px 28px; }
        .badge-rpc { display: inline-block; padding: 6px 14px; background: #fef3c7; color: #b45309; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; border: 1px solid #fde68a; }
        .greeting { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
        .lead-text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; }
        .card-rpc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; margin-bottom: 24px; }
        .card-row { margin-bottom: 14px; }
        .card-row:last-child { margin-bottom: 0; }
        .card-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
        .card-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px; }
        .qr-card { background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin: 20px 0; }
        .qr-img { width: 160px; height: 160px; margin: 8px auto; display: block; }
        .btn-primary { display: block; text-align: center; background: #e50a38; color: #ffffff !important; text-decoration: none; padding: 15px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; margin: 24px 0 12px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="${GUWIGO_LOGO_URL}" alt="Guwigo Events" class="logo" />
          <h1 class="header-title">${eventName}</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Official Race Pack Collection (RPC)</p>
        </div>
        <div class="content">
          <span class="badge-rpc">Informasi Pengambilan Paket Lomba</span>
          <h2 class="greeting">Halo, ${participantName}!</h2>
          <p class="lead-text">
            Persiapkan perlengkapan lari Anda! Paket lomba (Jersey, BIB, Race Pack) untuk <strong>${eventName}</strong> siap diambil sesuai dengan jadwal berikut:
          </p>

          <div class="card-rpc">
            <div class="card-row">
              <div class="card-label">Nomor Dada (BIB)</div>
              <div class="card-value" style="color: #e50a38; font-size: 16px; font-family: monospace;">${bibNumber || '-'}</div>
            </div>
            <div class="card-row">
              <div class="card-label">Lokasi Pengambilan (Venue RPC)</div>
              <div class="card-value">${pickupLocation || 'Venue Resmi Event'}</div>
            </div>
            <div class="card-row">
              <div class="card-label">Waktu &amp; Jadwal</div>
              <div class="card-value">${pickupSchedule || 'H-1 Acara (09:00 - 20:00 WIB)'}</div>
            </div>
            <div class="card-row">
              <div class="card-label">Syarat Pengambilan</div>
              <div class="card-value" style="font-weight: 500; font-size: 13px; color: #334155;">
                ${requirements || '1. Tunjukkan QR Code E-Tiket<br>2. Bawa Kartu Identitas Resmi (KTP/SIM/Paspor)<br>3. Surat kuasa jika diwakilkan'}
              </div>
            </div>
          </div>

          ${qrImageUrl ? `
          <div class="qr-card">
            <p style="margin: 0; font-weight: 700; font-size: 13px; color: #0f172a;">QR Check-In Pengambilan</p>
            <img src="${qrImageUrl}" alt="QR E-Ticket" class="qr-img" />
            <p style="margin: 4px 0 0; font-size: 11px; color: #64748b; font-family: monospace;">Nomor Registrasi: ${registrationNumber}</p>
          </div>
          ` : ''}

          <a href="${BASE_APP_URL}/check-ticket?q=${registrationNumber}" class="btn-primary">
            Buka E-Tiket di Smartphone
          </a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Guwigo Events Indonesia. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await emailTransporter.sendMail({
      from: '"Guwigo Events" <parthner@guwigo.com>',
      to: recipientEmail,
      subject: `[Guwigo] Jadwal Pengambilan Race Pack: ${eventName} (BIB: ${bibNumber || '-'})`,
      html: emailHtml
    });
    return res.json({ success: true, message: `Email Race Pack terkirim ke ${recipientEmail}`, messageId: info.messageId });
  } catch (error: any) {
    console.error('[Email RacePack Error]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email Race Pack.', error: error.message });
  }
});

// 7. Custom Password Reset Email API
app.post('/api/auth/send-reset-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email dibutuhkan.' });
  }

  try {
    const origin = req.headers.origin || 'http://localhost:3000';
    const actionCodeSettings = {
      url: `${origin}/reset-password`,
      handleCodeInApp: false
    };

    // Generate reset link using Firebase Admin SDK
    const firebaseLink = await getAuth().generatePasswordResetLink(email, actionCodeSettings);
    
    // Extract oobCode to create a direct link to our custom React page
    const url = new URL(firebaseLink);
    const oobCode = url.searchParams.get('oobCode');
    const resetLink = `${actionCodeSettings.url}?oobCode=${oobCode}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Atur Ulang Kata Sandi - Guwigo Indonesia</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 20px; line-height: 1.6; }
          .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background: linear-gradient(135deg, #f97316, #d97706); padding: 30px 20px; text-align: center; color: white; }
          .header h2 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
          .content { padding: 30px; }
          .cta-button { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 16px; margin-top: 20px; }
          .footer { background: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h2>GUWIGO INDONESIA</h2>
          </div>
          <div class="content">
            <h3 style="margin-top: 0; font-size: 20px;">Permintaan Atur Ulang Kata Sandi</h3>
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di Guwigo Indonesia. Jika Anda memang meminta ini, silakan klik tombol di bawah untuk membuat kata sandi baru:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" class="cta-button">Atur Ulang Kata Sandi</a>
            </div>
            <p style="font-size: 14px; color: #64748b;">Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan menempelkan tautan berikut ke browser Anda:</p>
            <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${resetLink}</p>
            <p style="margin-top: 30px; font-size: 14px;">Jika Anda tidak pernah meminta pengaturan ulang kata sandi, abaikan saja pesan ini.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} GuwiGo Indonesia. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await emailTransporter.sendMail({
      from: '"GuwiGo Events" <parthner@guwigo.com>',
      to: email,
      subject: '[GuwiGo] Atur Ulang Kata Sandi Akun Anda',
      html: emailHtml
    });

    console.log(`[Email Service] Sent reset password email to: ${email}. MessageId: ${info.messageId}`);

    return res.json({ success: true, message: 'Email reset password telah dikirim.' });
  } catch (error: any) {
    console.error('[Email Service Error]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email reset password.', error: error.message });
  }
});

// 8. Custom Verification Email API
app.post('/api/auth/send-verification-email', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email dibutuhkan.' });
  }

  try {
    const origin = req.headers.origin || 'http://localhost:3000';
    const actionCodeSettings = {
      url: `${origin}/login?verified=true`,
      handleCodeInApp: false
    };

    const verificationLink = await getAuth().generateEmailVerificationLink(email, actionCodeSettings);

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Verifikasi Email - Guwigo Indonesia</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 20px; line-height: 1.6; }
          .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px 20px; text-align: center; color: white; }
          .header h2 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
          .content { padding: 30px; }
          .cta-button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 16px; margin-top: 20px; }
          .footer { background: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h2>GUWIGO INDONESIA</h2>
          </div>
          <div class="content">
            <h3 style="margin-top: 0; font-size: 20px;">Verifikasi Alamat Email Anda</h3>
            <p>Halo,</p>
            <p>Terima kasih telah mendaftar di Guwigo Indonesia. Untuk mulai menggunakan akun Anda, silakan verifikasi alamat email ini dengan mengklik tombol di bawah:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="cta-button">Verifikasi Email Saya</a>
            </div>
            <p style="font-size: 14px; color: #64748b;">Jika tombol di atas tidak berfungsi, salin tautan berikut ke browser Anda:</p>
            <p style="font-size: 12px; color: #10b981; word-break: break-all;">${verificationLink}</p>
            <p style="margin-top: 30px; font-size: 14px; font-weight: bold; color: #ef4444;">Perhatian: Akun yang tidak diverifikasi dalam waktu 1x24 jam akan dihapus otomatis oleh sistem.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} GuwiGo Indonesia. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await emailTransporter.sendMail({
      from: '"GuwiGo Events" <parthner@guwigo.com>',
      to: email,
      subject: '[GuwiGo] Verifikasi Alamat Email Anda',
      html: emailHtml
    });

    console.log(`[Email Service] Sent verification email to: ${email}. MessageId: ${info.messageId}`);
    return res.json({ success: true, message: 'Email verifikasi telah dikirim.' });
  } catch (error: any) {
    console.error('[Email Service Error]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email verifikasi.', error: error.message });
  }
});

// Mount Vite middleware for dev / static for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Guwigo Indonesia Full-Stack Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
