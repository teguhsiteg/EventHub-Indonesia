const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure Transporter (uses environment variables or SMTP configuration)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'notifications@guwigo.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

/**
 * Generate HTML Email Template for Race Registration Confirmation
 */
function buildRegistrationEmailHtml(data) {
  const { participantName, registrationNumber, bibNumber, eventName, categoryName, eventDate, location, qrToken } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmasi Pendaftaran - ${eventName}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #0f172a; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
        .header { background: linear-gradient(135deg, #ea580c 0%, #d97706 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
        .header p { color: #fef08a; margin: 8px 0 0; font-size: 14px; font-weight: 700; text-transform: uppercase; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
        .info-card { background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 20px; margin-bottom: 24px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
        .value { font-size: 14px; color: #f8fafc; font-weight: 700; text-align: right; }
        .bib-badge { display: inline-block; background-color: #f97316; color: #0f172a; font-weight: 900; font-size: 20px; padding: 6px 16px; border-radius: 8px; margin-top: 4px; }
        .cta-button { display: block; width: 100%; text-align: center; background-color: #f97316; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 15px; padding: 14px 0; border-radius: 10px; margin: 24px 0 16px; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer { background-color: #090d16; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GUWIGO RACEPRO</h1>
          <p>Konfirmasi Pendaftaran Event</p>
        </div>
        <div class="content">
          <div class="greeting">Halo, ${participantName}!</div>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Selamat! Pendaftaran Anda untuk event <strong>${eventName}</strong> telah berhasil diproses. Berikut adalah rincian pendaftaran dan nomor BIB Anda.
          </p>
          
          <div class="info-card">
            <div class="info-row">
              <span class="label">Nomor Registrasi</span>
              <span class="value" style="font-family: monospace; color: #f97316;">${registrationNumber}</span>
            </div>
            <div class="info-row">
              <span class="label">Nomor BIB Peserta</span>
              <span class="value"><span class="bib-badge">${bibNumber || 'PENDING'}</span></span>
            </div>
            <div class="info-row">
              <span class="label">Kategori Lomba</span>
              <span class="value">${categoryName}</span>
            </div>
            <div class="info-row">
              <span class="label">Tanggal Event</span>
              <span class="value">${eventDate}</span>
            </div>
            <div class="info-row">
              <span class="label">Lokasi / Venue</span>
              <span class="value">${location}</span>
            </div>
          </div>

          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5;">
            📌 <strong>Petunjuk Check-In Race Pack:</strong> Tunjukkan E-Ticket & QR Code di bawah ini saat pengambilan Race Pack Collection (RPC) di venue.
          </p>

          <a href="https://guwigo.com/dashboard/checkin?qr=${qrToken}" class="cta-button">Lihat E-Ticket & QR Check-In</a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} GuwiGo Event Platform. Semua hak dilindungi.<br>
          Pesan ini dikirimkan secara otomatis dari sistem pendaftaran GuwiGo RacePro.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Cloud Function Trigger: Fires automatically when a new document is created in the `registrations` Firestore collection
 */
exports.sendRegistrationConfirmationEmail = onDocumentCreated(
  {
    document: 'registrations/{registrationId}',
    region: 'asia-southeast1',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.error('No data associated with the event');
      return;
    }

    const registration = snap.data();
    const registrationId = event.params.registrationId;

    logger.info(`Processing registration email for ID: ${registrationId}`, { registration });

    try {
      const db = admin.firestore();

      // Fetch event details
      const eventSnap = await db.collection('events').doc(registration.eventId).get();
      const eventData = eventSnap.exists ? eventSnap.data() : { name: 'GuwiGo Race Event', location: 'Lokasi Event', startDate: new Date().toISOString() };

      // Fetch category details
      const categorySnap = await db.collection('event_categories').doc(registration.categoryId).get();
      const categoryData = categorySnap.exists ? categorySnap.data() : { name: 'General Category' };

      // Fetch participant details
      const participantQuery = await db.collection('participants').where('registrationId', '==', registrationId).limit(1).get();
      let participantData = { fullName: 'Peserta', email: '', bibNumber: '-', qrToken: '' };
      
      if (!participantQuery.empty) {
        participantData = participantQuery.docs[0].data();
      }

      const recipientEmail = participantData.email || registration.email;
      if (!recipientEmail) {
        logger.warn(`No recipient email found for registration ${registrationId}`);
        return;
      }

      const formattedDate = new Date(eventData.startDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const emailHtml = buildRegistrationEmailHtml({
        participantName: participantData.fullName,
        registrationNumber: registration.registrationNumber,
        bibNumber: participantData.bibNumber,
        eventName: eventData.name,
        categoryName: categoryData.name,
        eventDate: formattedDate,
        location: eventData.location,
        qrToken: participantData.qrToken,
      });

      const mailOptions = {
        from: `"GuwiGo RacePro Notifications" <${process.env.SMTP_USER || 'no-reply@guwigo.com'}>`,
        to: recipientEmail,
        subject: `[GuwiGo] Konfirmasi Pendaftaran: ${eventData.name} (${participantData.bibNumber})`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Successfully sent registration email to ${recipientEmail}`, { messageId: info.messageId });

      // Update registration document with notification log status
      await snap.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      logger.error(`Error sending registration email for ID ${registrationId}:`, err);
    }
  }
);
