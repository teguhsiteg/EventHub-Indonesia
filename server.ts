import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3000;

app.use(express.json());

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
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'parthner@guwigo.com',
        pass: 'iiwh kcgf bkdo kxop'
      }
    });

    const info = await transporter.sendMail({
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
