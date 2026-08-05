import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  getUserRegistrations, 
  getParticipantByRegistrationId 
} from '../services/registrationService';
import { getPaymentByRegistrationId, submitPaymentProof } from '../services/paymentService';
import { getParticipantRacePack } from '../services/racePackService';
import { getMedicalAssessmentByParticipant, submitMedicalAssessment } from '../services/medicalService';
import { getResultByParticipantId } from '../services/resultService';
import { getCertificateByParticipant, issueCertificateForFinisher } from '../services/certificateService';
import { getEventById } from '../services/eventService';
import { UpcomingEventAlert } from '../components/dashboard/UpcomingEventAlert';
import { 
  Registration, 
  Participant, 
  Payment, 
  RacePack, 
  MedicalAssessment, 
  RaceResult, 
  Certificate,
  EventItem,
  EventCategory 
} from '../types';
import { ETicketTemplate } from '../components/common/ETicketTemplate';
import { QRCodeViewer } from '../components/common/QRCodeViewer';
import * as htmlToImage from 'html-to-image';
import { CertificateModal } from '../components/common/CertificateModal';
import { 
  Trophy, 
  CreditCard, 
  QrCode, 
  Activity, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  PackageCheck, 
  ShieldCheck, 
  FileText,
  User,
  Bell,
  AlertTriangle,
  Download,
  X
} from 'lucide-react';

export const ParticipantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useSettings();
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = (searchParams.get('tab') || 'overview') as 'overview' | 'registrations' | 'medical' | 'result';
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [racePack, setRacePack] = useState<RacePack | null>(null);
  const [medical, setMedical] = useState<MedicalAssessment | null>(null);
  const [result, setResult] = useState<RaceResult | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [eventData, setEventData] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTicket = async () => {
    const node = document.getElementById('eticket-container');
    if (!node || !participant || !eventData) return;
    
    try {
      setIsDownloading(true);
      // We use html-to-image to generate the ticket.
      const dataUrl = await htmlToImage.toPng(node, { 
        quality: 1, 
        pixelRatio: 2, 
        skipAutoScale: true 
      });
      
      const link = document.createElement('a');
      link.download = `Ticket_${eventData.name}_${participant.bibNumber || participant.id}.png`;
      link.href = dataUrl;
      link.click();
      
      addNotification('success', 'Berhasil', 'E-Ticket berhasil diunduh!');
    } catch (err) {
      console.error('Failed to download ticket', err);
      addNotification('error', 'Gagal', 'Terjadi kesalahan saat mengunduh tiket.');
    } finally {
      setIsDownloading(false);
    }
  };
  const [showCertModal, setShowCertModal] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);

  // Medical form
  const [medConditions, setMedConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('Tidak Ada');

  useEffect(() => {
    async function loadParticipantData() {
      if (!user) return;
      setLoading(true);
      try {
        const regs = await getUserRegistrations(user.uid);
        setRegistrations(regs);

        if (regs.length > 0) {
          const firstReg = regs[0];
          setSelectedReg(firstReg);
          await loadRegistrationDetails(firstReg);
        }
      } catch (err) {
        console.error('Error loading participant dashboard:', err);
      }
      setLoading(false);
    }
    loadParticipantData();
  }, [user]);

  // Auto redirect away from overview if payment is not paid
  useEffect(() => {
    if (payment && payment.status !== 'PAID' && activeTab === 'overview') {
      navigate('/dashboard?tab=registrations', { replace: true });
    }
  }, [payment, activeTab, navigate]);

  const loadRegistrationDetails = async (reg: Registration) => {
    setSelectedReg(reg);
    const part = await getParticipantByRegistrationId(reg.id);
    setParticipant(part);

    const pay = await getPaymentByRegistrationId(reg.id);
    setPayment(pay);

    if (part) {
      const pack = await getParticipantRacePack(part.id);
      setRacePack(pack);

      const med = await getMedicalAssessmentByParticipant(part.id);
      setMedical(med);
      if (med) {
        setMedConditions(med.medicalConditions || []);
        setAllergies(med.allergies || 'Tidak Ada');
      }

      const res = await getResultByParticipantId(part.id);
      setResult(res);

      if (res && res.status === 'FINISH') {
        const cert = await getCertificateByParticipant(part.id);
        if (cert) {
          setCertificate(cert);
        } else {
          const ev = await getEventById(reg.eventId);
          const newCert = await issueCertificateForFinisher(res, ev?.name || 'Event EventHub by Guwigo', 'Trail Run / Road Race');
          setCertificate(newCert);
        }
      }
    }

    const ev = await getEventById(reg.eventId);
    setEventData(ev);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment || !selectedReg || !user || !proofUrl.trim()) return;

    setSubmittingProof(true);
    try {
      await submitPaymentProof(payment.id, selectedReg.id, proofUrl, 'TRANSFER_BANK_MANUAL', user.uid, user.email);
      addNotification('success', 'Bukti Diterima', 'Bukti pembayaran berhasil dikirim. Admin akan melakukan verifikasi.');
      
      setPayment(prev => prev ? { ...prev, proofUrl, status: 'PENDING' } : null);
      setSelectedReg(prev => prev ? { ...prev, status: 'PAYMENT_REVIEW' } : null);
      setProofUrl('');
    } catch (err: any) {
      addNotification('error', 'Gagal Kirim', err.message || 'Gagal mengirim bukti pembayaran.');
    }
    setSubmittingProof(false);
  };

  const handleSaveMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participant || !user || !selectedReg) return;

    try {
      const updated = await submitMedicalAssessment(
        participant.id,
        user.uid,
        selectedReg.eventId,
        medConditions,
        allergies,
        true,
        true
      );
      setMedical(updated);
      addNotification('success', 'Pernyataan Medis Tersimpan', 'Data asesmen medis Anda telah diperbarui.');
    } catch (err: any) {
      addNotification('error', 'Gagal Menyimpan', err.message);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-500">
      
      {/* Sleek Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Minimal Avatar */}
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-slate-400 dark:text-slate-500" />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Peserta
              </span>
              {eventData && ((new Date(eventData.startDate).getTime() - Date.now()) / (1000 * 60 * 60)) <= 48 && ((new Date(eventData.startDate).getTime() - Date.now()) / (1000 * 60 * 60)) >= -24 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                  <Bell className="w-3 h-3" />
                  <span>Race Day &lt; 48 Jam</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user?.displayName}</h1>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {participant && payment?.status === 'PAID' && (
            <>
              <button
                onClick={() => setShowQrModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Check-In</span>
              </button>
              <button
                onClick={handleDownloadTicket}
                disabled={isDownloading || !eventData}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Memproses...' : 'Unduh Tiket'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden E-Ticket Render Container */}
      {participant && eventData && (
        <div className="absolute -left-[9999px] top-0">
          <div id="eticket-container" className="p-4 bg-transparent inline-block">
            <ETicketTemplate 
              participant={participant} 
              event={eventData} 
              category={null} 
            />
          </div>
        </div>
      )}

      {/* 48-Hour Race Day Warning */}
      {eventData && (
        <div className="mb-8">
          <UpcomingEventAlert
            event={eventData}
            participant={participant}
            onOpenQr={() => setShowQrModal(true)}
            onOpenMedical={() => navigate('?tab=medical')}
            hasCompletedMedical={!!medical && medical.declarationAccepted}
          />
        </div>
      )}

      {/* Registrations Switcher (Pills layout) */}
      {registrations.length > 1 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pilih Pendaftaran:</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {registrations.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.id !== selectedReg?.id) loadRegistrationDetails(r);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  selectedReg?.id === r.id 
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {r.registrationNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Contents */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 h-64 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800" />
      ) : registrations.length === 0 ? (
        <div className="p-12 sm:p-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Belum Ada Pendaftaran</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Anda belum terdaftar pada event apapun saat ini. Mari mulai perjalanan Anda dengan menjelajahi katalog event kami.
          </p>
          <button onClick={() => navigate('/events')} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-lg shadow-sm transition-colors">
            Lihat Katalog Event
          </button>
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && selectedReg && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Main Status & Info (Bento Grid Style) */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Primary Info Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nomor Registrasi</p>
                      <h3 className="text-lg font-mono font-semibold text-slate-900 dark:text-white">{selectedReg.registrationNumber}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedReg.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                        selectedReg.status === 'WAITING_PAYMENT' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20' :
                        'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {selectedReg.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">No. BIB</p>
                      <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{participant?.bibNumber || '-'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Jersey</p>
                      <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{participant?.jerseySize || '-'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Race Pack</p>
                      {participant?.checkInStatus ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                      ) : (
                        <p className="text-xs font-semibold text-slate-500 mt-1">Pending</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Summary Card */}
                {eventData && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <img src={eventData.banner} alt={eventData.name} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800" />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{eventData.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(eventData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{eventData.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar: QR Code */}
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center text-center">
                  <div className="mb-4">
                    <QrCode className="w-8 h-8 text-slate-400 mx-auto" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Identitas Peserta</h3>
                  <p className="text-xs text-slate-500 mb-6">Gunakan QR Code ini saat pengambilan Race Pack.</p>
                  
                  {participant ? (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <QRCodeViewer value={participant.qrToken} label="" />
                    </div>
                  ) : (
                    <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      <p className="text-xs text-slate-400">QR Belum Tersedia</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* INVOICE & PAYMENT TAB */}
          {activeTab === 'registrations' && payment && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                
                {/* Receipt Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rincian Pembayaran</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">INV: {payment.invoiceId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    payment.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 
                    payment.status === 'VERIFIED' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>

                {/* Receipt Body */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Tagihan</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Metode</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{payment.paymentMethod}</span>
                  </div>
                </div>

                {/* Action Area */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                  {payment.status !== 'PAID' && payment.paymentMethod === 'MIDTRANS' ? (
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Selesaikan pembayaran Anda melalui layanan Midtrans.</p>
                      <button
                        onClick={() => window.open(`/events/${eventData?.id}`, '_self')}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                      >
                        Lanjutkan Pembayaran
                      </button>
                    </div>
                  ) : payment.status !== 'PAID' && payment.status !== 'VERIFIED' && (
                    <form onSubmit={handleSubmitProof} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                          Link Bukti Transfer (Google Drive / Image URL)
                        </label>
                        <input
                          type="url"
                          required
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingProof}
                        className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{submittingProof ? 'Mengirim...' : 'Kirim Bukti'}</span>
                      </button>
                    </form>
                  )}
                  {payment.status === 'PAID' && (
                    <div className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Pembayaran Anda telah lunas dan terverifikasi.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* MEDICAL TAB */}
          {activeTab === 'medical' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Asesmen Medis</h3>
                    <p className="text-xs text-slate-500">Pernyataan ini wajib diisi demi keselamatan Anda.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveMedical} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Riwayat Kondisi Medis / Alergi Obat
                    </label>
                    <textarea
                      rows={4}
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="Sebutkan jika ada riwayat asma, jantung, alergi obat tertentu, dsb."
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Saya menyatakan bahwa data kesehatan yang diisi adalah benar, serta menyetujui standar keselamatan dan pertolongan medis dari penyelenggara acara. Penyelenggara dibebaskan dari tuntutan apabila terjadi hal di luar kendali medis akibat informasi yang tidak jujur.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-sm transition-colors"
                  >
                    Simpan Pernyataan Medis
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* RESULT & CERTIFICATE TAB */}
          {activeTab === 'result' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-amber-500" />
                </div>
                
                {result ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">{result.participantName}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gun Time</p>
                        <p className="text-xl font-mono font-bold text-slate-900 dark:text-white">{result.gunTime}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-5 text-left">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Chip Time</p>
                        <p className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">{result.chipTime}</p>
                      </div>
                    </div>

                    {certificate && (
                      <button
                        onClick={() => setShowCertModal(true)}
                        className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-sm transition-colors mt-4"
                      >
                        Lihat E-Sertifikat
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hasil Belum Tersedia</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Waktu finisher akan diperbarui otomatis oleh juri setelah Anda menuntaskan garis finish secara sah.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* QR Modal */}
      {showQrModal && participant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full relative shadow-xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">QR Code Check-In</h3>
              <p className="text-xs text-slate-500">Tunjukkan QR ini kepada panitia</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 flex justify-center">
              <QRCodeViewer value={participant.qrToken} label="" />
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertModal && certificate && (
        <CertificateModal certificate={certificate} onClose={() => setShowCertModal(false)} />
      )}

    </div>
  );
};
