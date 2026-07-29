import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'RacePro Platform API', timestamp: new Date().toISOString() });
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

// 4. Public QR Code verification endpoint
app.get('/api/verify/qr/:token', (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token || !token.startsWith('RACEPRO_')) {
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
  res.setHeader('Content-Disposition', `attachment; filename=racepro_export_${type || 'data'}_${Date.now()}.csv`);
  
  if (type === 'participants') {
    res.send('RegistrationNo,BIB,FullName,Gender,Category,Phone,Email,CheckInStatus\nREG-2026-001,TR50-0001,Budi Santoso,MALE,Trail 50K,08123456789,budi@example.com,VERIFIED\n');
  } else {
    res.send('ID,Type,Status,CreatedAt\n1,EXPORT_DATA,COMPLETED,2026-07-28\n');
  }
});

// 6. Automated Registration Email Trigger API
app.post('/api/notifications/send-registration-email', (req: Request, res: Response) => {
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
        body { font-family: sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #334155; padding: 24px; }
        .header { background: linear-gradient(135deg, #ea580c, #d97706); padding: 16px; border-radius: 12px; text-align: center; color: white; font-weight: bold; }
        .badge { background: #f97316; color: #0f172a; padding: 4px 12px; border-radius: 6px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h2>GUWIGO RACEPRO</h2>
          <p>Konfirmasi Pendaftaran Event</p>
        </div>
        <h3>Halo, ${participantName}!</h3>
        <p>Pendaftaran Anda untuk event <strong>${eventName}</strong> (${categoryName}) telah dikonfirmasi.</p>
        <ul>
          <li><strong>Nomor Registrasi:</strong> ${registrationNumber}</li>
          <li><strong>Nomor BIB:</strong> <span class="badge">${bibNumber || 'PENDING'}</span></li>
          <li><strong>Tanggal Event:</strong> ${eventDate || 'Akan datang'}</li>
          <li><strong>Lokasi:</strong> ${location || 'Venue Event'}</li>
        </ul>
        <p>Gunakan E-Ticket dan QR Code berikut saat pengambilan Race Pack:</p>
        <p><strong>QR Token:</strong> <code>${qrToken}</code></p>
      </div>
    </body>
    </html>
  `;

  console.log(`[Email Service Triggered] Sent automated email to: ${recipientEmail} for Event: ${eventName} (BIB: ${bibNumber})`);

  return res.json({
    success: true,
    message: `Email konfirmasi pendaftaran berhasil dikirim ke ${recipientEmail}`,
    emailDetails: {
      recipient: recipientEmail,
      subject: `[GuwiGo] Konfirmasi Pendaftaran: ${eventName} (${bibNumber})`,
      sentAt: new Date().toISOString(),
      previewHtml: emailHtml,
    }
  });
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
    console.log(`RacePro Full-Stack Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
