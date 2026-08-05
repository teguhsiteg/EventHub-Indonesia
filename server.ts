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
const EMAIL_PASS = process.env.GMAIL_APP_PASSWORD || '';
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

app.use(express.json());

// Set COOP header to fix Firebase Auth popup issue in dev
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// API Routes

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'Guwigo Indonesia Platform API', timestamp: new Date().toISOString() });
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

// 6. Automated Registration Email Trigger API
app.post('/api/notifications/send-registration-email', async (req: Request, res: Response) => {
  const { recipientEmail, participantName, registrationNumber, bibNumber, eventName, categoryName, eventDate, location, qrToken } = req.body;

  if (!recipientEmail || !participantName || !eventName) {
    return res.status(400).json({ success: false, message: 'Parameter pendaftaran tidak lengkap.' });
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Konfirmasi Pendaftaran - ${eventName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 20px; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background: linear-gradient(135deg, #f97316, #d97706); padding: 30px 20px; text-align: center; color: white; }
        .header h2 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; }
        .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; }
        .info-box { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f97316; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 10px; font-size: 14px; }
        .info-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        .info-label { color: #64748b; font-weight: 600; }
        .info-value { color: #0f172a; font-weight: 700; text-align: right; }
        .badge { background: #f97316; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
        .qr-section { text-align: center; margin: 30px 0; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 16px; background: #f8fafc; }
        .qr-code { width: 180px; height: 180px; margin: 10px auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .qr-text { font-size: 12px; color: #64748b; margin-top: 10px; font-family: monospace; }
        .cta-button { display: block; width: 100%; text-align: center; background: #2563eb; color: white; text-decoration: none; padding: 14px 0; border-radius: 12px; font-weight: 700; font-size: 16px; margin-top: 20px; }
        .footer { background: #0f172a; color: #94a3b8; text-align: center; padding: 20px; font-size: 12px; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h2>GUWIGO INDONESIA</h2>
          <p>E-Ticket & Konfirmasi Pendaftaran</p>
        </div>
        <div class="content">
          <h3 class="greeting">Halo, ${participantName}!</h3>
          <p>Selamat! Pendaftaran Anda untuk event <strong>${eventName}</strong> telah berhasil dikonfirmasi. Berikut adalah rincian tiket Anda:</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Nomor Registrasi</span>
              <span class="info-value">${registrationNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Nomor BIB</span>
              <span class="info-value"><span class="badge">${bibNumber || 'PENDING'}</span></span>
            </div>
            <div class="info-row">
              <span class="info-label">Kategori</span>
              <span class="info-value">${categoryName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tanggal Event</span>
              <span class="info-value">${eventDate || 'Akan datang'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Lokasi</span>
              <span class="info-value">${location || 'Venue Event'}</span>
            </div>
          </div>

          <div class="qr-section">
            <p style="margin:0 0 15px; font-weight: 700; color: #0f172a;">Tunjukkan QR Code ini saat pengambilan Race Pack</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken}" alt="QR Code" class="qr-code" />
            <div class="qr-text">Token: ${qrToken}</div>
          </div>

          <p style="font-size: 14px; text-align: center; color: #64748b;">Simpan email ini baik-baik. Anda juga dapat melihat e-ticket sewaktu-waktu melalui dashboard.</p>
          
          <a href="https://ev.guwigo.com/dashboard" class="cta-button">Buka Dashboard Saya</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} GuwiGo Indonesia. All rights reserved.</p>
          <p>Butuh bantuan? Kunjungi <a href="https://guwigo.com" target="_blank">guwigo.com</a> atau hubungi panitia acara.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await emailTransporter.sendMail({
      from: '"GuwiGo Events" <parthner@guwigo.com>',
      to: recipientEmail,
      subject: `[GuwiGo] Konfirmasi Pendaftaran: ${eventName} (${bibNumber || 'PENDING'})`,
      html: emailHtml
    });

    console.log(`[Email Service] Sent automated email to: ${recipientEmail} for Event: ${eventName}. MessageId: ${info.messageId}`);

    return res.json({
      success: true,
      message: `Email konfirmasi pendaftaran berhasil dikirim ke ${recipientEmail}`,
      emailDetails: {
        recipient: recipientEmail,
        subject: `[GuwiGo] Konfirmasi Pendaftaran: ${eventName} (${bibNumber})`,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('[Email Service Error]', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email konfirmasi.', error: error.message });
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
