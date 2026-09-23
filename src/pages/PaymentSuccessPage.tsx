import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getRegistrationByInvoiceOrNumber, getParticipantByRegistrationId } from '../services/registrationService';
import { getEventById } from '../services/eventService';
import { Registration, Participant, EventItem } from '../types';
import { ETicketTemplate } from '../components/common/ETicketTemplate';
import { QRCodeViewer } from '../components/common/QRCodeViewer';
import * as htmlToImage from 'html-to-image';
import { 
  CheckCircle2, 
  Download, 
  QrCode, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Ticket,
  Mail,
  Share2
} from 'lucide-react';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('id') || '';
  
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [eventData, setEventData] = useState<EventItem | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const reg = await getRegistrationByInvoiceOrNumber(orderId);
        if (reg) {
          setRegistration(reg);
          const [part, ev] = await Promise.all([
            getParticipantByRegistrationId(reg.id),
            getEventById(reg.eventId)
          ]);
          setParticipant(part);
          setEventData(ev);
        }
      } catch (err) {
        console.error('Failed to load order details', err);
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  const handleDownloadTicket = async () => {
    const node = document.getElementById('eticket-container');
    if (!node || !participant || !eventData) return;
    
    try {
      setIsDownloading(true);
      const dataUrl = await htmlToImage.toPng(node, { 
        quality: 1, 
        pixelRatio: 2, 
        skipAutoScale: true 
      });
      
      const link = document.createElement('a');
      link.download = `E-Ticket_${eventData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${participant.bibNumber || participant.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#090d16] text-[var(--text-primary)] pt-8 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Brand Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Guwigo Events" className="h-12 sm:h-14 w-auto object-contain transition-transform hover:scale-105" />
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              to="/events" 
              className="btn-brand-primary !py-2 !px-4 text-xs font-bold"
            >
              Eksplor Event
            </Link>
          </div>
        </div>

        {/* Top Success Banner (DOKU Style Enterprise Card) */}
        <div className="enterprise-card p-8 sm:p-10 text-center bg-white dark:bg-[#0f172a] shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="badge-brand !bg-emerald-50 dark:!bg-emerald-950/40 !text-emerald-600 dark:!text-emerald-400 !border-emerald-300">
            Pendaftaran & Pembayaran Terkonfirmasi
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            Pendaftaran Sukses!
          </h1>
          
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
            Terima kasih! Tiket dan QR code check-in resmi Anda telah siap. Rincian konfirmasi telah dikirimkan ke email pendaftar.
          </p>

          {/* Quick Meta */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Nomor Registrasi</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {registration?.registrationNumber || orderId || 'REG-PENDING'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Nama Peserta</span>
              <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                {participant?.fullName || 'Peserta Terdaftar'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Status Tiket</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Siap Digunakan
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {participant && (
              <button
                onClick={() => setShowQrModal(true)}
                className="btn-brand-primary w-full sm:w-auto !py-3 !px-6 text-xs uppercase tracking-wider"
              >
                <QrCode className="w-4 h-4" />
                <span>Lihat QR Code Tiket</span>
              </button>
            )}

            {participant && eventData && (
              <button
                onClick={handleDownloadTicket}
                disabled={isDownloading}
                className="btn-brand-secondary w-full sm:w-auto !py-3 !px-6 text-xs uppercase tracking-wider !bg-slate-100 dark:!bg-slate-800"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Menyiapkan Tiket...' : 'Unduh Gambar E-Tiket'}</span>
              </button>
            )}

            <Link
              to="/events"
              className="btn-brand-secondary w-full sm:w-auto !py-3 !px-6 text-xs uppercase tracking-wider"
            >
              <span>Jelajahi Event Lain</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p className="leading-relaxed">
            <strong>Tips Pengambilan Race Pack:</strong> Simpan atau tangkap layar (*screenshot*) QR Code Anda. Tunjukkan QR Code ini kepada panitia saat pengambilan Race Pack di lokasi pengambilan (RPC).
          </p>
        </div>

        {/* Hidden template for html-to-image download */}
        {participant && eventData && (
          <div className="absolute left-[-9999px] top-[-9999px]">
            <ETicketTemplate 
              participant={participant} 
              event={eventData} 
              category={null} 
            />
          </div>
        )}

        {/* QR Code Modal for Guest */}
        {showQrModal && participant && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="enterprise-card bg-white dark:bg-[#0f172a] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">QR Code E-Tiket Anda</h3>
              <p className="text-xs text-slate-500">Tunjukkan QR code ini saat verifikasi / RPC check-in.</p>
              
              <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto">
                <QRCodeViewer value={participant.qrToken} size={200} />
              </div>

              <div className="text-left bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-xs space-y-1">
                <p className="text-slate-500">Nama: <strong className="text-slate-900 dark:text-white">{participant.fullName}</strong></p>
                <p className="text-slate-500">Jersey: <strong className="text-slate-900 dark:text-white">{participant.jerseySize}</strong></p>
                <p className="text-slate-500">Token ID: <span className="font-mono text-[10px] text-slate-400">{participant.qrToken.substring(0, 24)}...</span></p>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="btn-brand-primary w-full text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
