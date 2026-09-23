import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getRegistrationsByGuestEmail, 
  getRegistrationByInvoiceOrNumber,
  getParticipantByRegistrationId 
} from '../services/registrationService';
import { getEventById } from '../services/eventService';
import { Registration, Participant, EventItem } from '../types';
import { ETicketTemplate } from '../components/common/ETicketTemplate';
import { QRCodeViewer } from '../components/common/QRCodeViewer';
import * as htmlToImage from 'html-to-image';
import { 
  Search, 
  Ticket, 
  QrCode, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail
} from 'lucide-react';

export const CheckTicketPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Array<{
    registration: Registration;
    participant: Participant | null;
    event: EventItem | null;
  }>>([]);

  const [selectedTicket, setSelectedTicket] = useState<{
    registration: Registration;
    participant: Participant;
    event: EventItem;
  } | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchTerm.trim();
    if (!clean) return;

    setSearching(true);
    setHasSearched(true);
    setResults([]);
    setSelectedTicket(null);

    try {
      let regList: Registration[] = [];

      // 1. If it looks like an email
      if (clean.includes('@')) {
        regList = await getRegistrationsByGuestEmail(clean);
      } else {
        // 2. Lookup by Registration Number or Invoice ID
        const singleReg = await getRegistrationByInvoiceOrNumber(clean);
        if (singleReg) {
          regList = [singleReg];
        } else {
          // Fallback search email if user typed email without @ by mistake
          regList = await getRegistrationsByGuestEmail(clean);
        }
      }

      // Fetch participants and events for each registration
      const mappedResults = await Promise.all(
        regList.map(async (reg) => {
          const [part, ev] = await Promise.all([
            getParticipantByRegistrationId(reg.id),
            getEventById(reg.eventId)
          ]);
          return { registration: reg, participant: part, event: ev };
        })
      );

      setResults(mappedResults);
    } catch (err) {
      console.error('Error finding tickets', err);
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadTicket = async () => {
    const node = document.getElementById('eticket-container');
    if (!node || !selectedTicket) return;

    try {
      setIsDownloading(true);
      const dataUrl = await htmlToImage.toPng(node, { 
        quality: 1, 
        pixelRatio: 2, 
        skipAutoScale: true 
      });

      const link = document.createElement('a');
      link.download = `E-Ticket_${selectedTicket.event.name.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedTicket.participant.bibNumber || selectedTicket.participant.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#090d16] text-[var(--text-primary)] pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Brand Header Bar */}
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-200/60 dark:border-slate-800">
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
            <Link 
              to="/" 
              className="btn-brand-secondary !py-2 !px-4 text-xs font-bold"
            >
              Beranda
            </Link>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-800/60 text-[#e50a38] text-xs font-bold uppercase tracking-wider">
            <Ticket className="w-3.5 h-3.5" />
            <span>Pencarian Tiket Mandiri (Tanpa Login)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cek & Unduh E-Tiket Saya
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Masukkan alamat email yang Anda gunakan saat mendaftar, atau masukkan Nomor Registrasi (cth: <span className="font-mono text-[#e50a38]">REG-2026-XXXX</span>).
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="enterprise-card p-4 sm:p-6 bg-white dark:bg-[#0f172a] shadow-lg max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Masukkan Email atau Nomor REG / Invoice..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#e50a38]"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchTerm.trim()}
              className="btn-brand-primary !py-3.5 !px-7 text-xs font-bold uppercase tracking-wider shrink-0"
            >
              <span>{searching ? 'Mencari...' : 'Cari Tiket'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searching && (
          <div className="text-center py-12 space-y-3">
            <div className="w-10 h-10 border-4 border-[#e50a38] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Mencari data registrasi tiket...</p>
          </div>
        )}

        {!searching && hasSearched && results.length === 0 && (
          <div className="enterprise-card p-12 text-center max-w-md mx-auto bg-white dark:bg-[#0f172a]">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Tiket Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pastikan alamat email atau nomor registrasi yang Anda ketikkan sesuai dengan data pendaftaran awal Anda.
            </p>
          </div>
        )}

        {!searching && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Ditemukan {results.length} Pendaftaran:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(({ registration, participant, event }) => {
                const isPaid = registration.status === 'VERIFIED' || registration.status === 'RACE_PACK_READY' || registration.status === 'FINISHED';
                return (
                  <div 
                    key={registration.id}
                    className="enterprise-card p-5 bg-white dark:bg-[#0f172a] flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-mono font-bold text-slate-500">
                          {registration.registrationNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        }`}>
                          {isPaid ? '🟢 Terverifikasi' : '⏳ ' + registration.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {event?.name || 'Event Olahraga'}
                      </h3>

                      <div className="mt-2 text-xs text-slate-500 space-y-1">
                        <p>Peserta: <strong className="text-slate-800 dark:text-slate-200">{participant?.fullName || '-'}</strong></p>
                        {participant?.bibNumber && (
                          <p>BIB: <strong className="font-mono text-[#e50a38]">{participant.bibNumber}</strong></p>
                        )}
                        <p>Email: <span>{participant?.email || registration.customerEmail || '-'}</span></p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      {participant && event ? (
                        <button
                          onClick={() => setSelectedTicket({ registration, participant, event })}
                          className="btn-brand-primary !py-2 !px-4 text-xs font-bold w-full"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Buka QR & E-Tiket</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Data tiket belum lengkap</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal QR Code & Download E-Ticket */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="enterprise-card bg-white dark:bg-[#0f172a] p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">E-Tiket Resmi</span>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                >
                  ✕ Tutup
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedTicket.event.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tunjukkan QR code ini saat verifikasi dan pengambilan Race Pack (RPC).
                </p>
              </div>

              {/* QR Code Canvas Container */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto">
                <QRCodeViewer value={selectedTicket.participant.qrToken} size={210} />
              </div>

              {/* Details table */}
              <div className="text-left bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedTicket.participant.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nomor BIB:</span>
                  <strong className="font-mono text-[#e50a38]">{selectedTicket.participant.bibNumber || 'Akan Diberikan'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ukuran Jersey:</span>
                  <strong className="text-slate-900 dark:text-white">{selectedTicket.participant.jerseySize}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Check-In:</span>
                  <strong className={selectedTicket.participant.checkInStatus ? 'text-emerald-500' : 'text-slate-400'}>
                    {selectedTicket.participant.checkInStatus ? 'SUDAH CHECK-IN' : 'BELUM CHECK-IN'}
                  </strong>
                </div>
              </div>

              {/* Download button */}
              <div className="space-y-2">
                <button
                  onClick={handleDownloadTicket}
                  disabled={isDownloading}
                  className="btn-brand-primary w-full !py-3 text-xs uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Menyiapkan Gambar...' : 'Unduh Gambar E-Tiket (PNG)'}</span>
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="btn-brand-secondary w-full !py-2.5 text-xs"
                >
                  Kembali
                </button>
              </div>

              {/* Hidden template for htmlToImage download */}
              <div className="absolute left-[-9999px] top-[-9999px]">
                <ETicketTemplate 
                  participant={selectedTicket.participant} 
                  event={selectedTicket.event} 
                  category={null} 
                />
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
