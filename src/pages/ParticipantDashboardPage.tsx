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
  EventItem 
} from '../types';
import { ETicketTemplate } from '../components/common/ETicketTemplate';
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
  Download
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
          const newCert = await issueCertificateForFinisher(res, ev?.name || 'Event RacePro', 'Trail Run / Road Race');
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
    <div className="min-h-screen  text-slate-900 dark:text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl shadow-blue-900/5 dark:shadow-none border border-slate-200/60 dark:border-white/10 group">
          {/* Glass background layers */}
          <div className="absolute inset-0 bg-white dark:bg-[#0a0f1e] z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-orange-50/50 dark:from-blue-900/20 dark:to-orange-900/10 z-0 opacity-80"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent blur-3xl rounded-full z-0 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-orange-500/20 to-transparent blur-3xl rounded-full z-0 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-orange-500 p-[3px] shadow-xl shadow-blue-500/20">
                  <div className="w-full h-full rounded-xl bg-white dark:bg-[#0a0f1e] flex items-center justify-center">
                    <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-blue-600 to-orange-500 uppercase">
                      {user?.displayName ? user.displayName[0] : 'P'}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0f1e] flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              
              {/* Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-950/50 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800/40">
                    RACEPRO PESERTA
                  </span>
                  {eventData && ((new Date(eventData.startDate).getTime() - Date.now()) / (1000 * 60 * 60)) <= 48 && ((new Date(eventData.startDate).getTime() - Date.now()) / (1000 * 60 * 60)) >= -24 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/40 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                      <Bell className="w-3 h-3" />
                      <span>RACE DAY &lt; 48 JAM</span>
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.displayName}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              {participant && (
                <>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-slate-900/20 dark:shadow-blue-600/25 transition-all hover:-translate-y-0.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Check-In</span>
                  </button>
                  <button
                    onClick={handleDownloadTicket}
                    disabled={isDownloading || !eventData}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-700 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Proses...' : 'Unduh Tiket'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hidden E-Ticket Render Container */}
        {participant && eventData && (
          <div className="absolute -left-[9999px] top-0">
            <div id="eticket-container" className="p-4 bg-transparent inline-block">
              <ETicketTemplate 
                participant={participant} 
                event={eventData} 
                category={eventData.categories?.find((c: any) => c.id === participant.categoryId) || null} 
              />
            </div>
          </div>
        )}

        {/* 48-Hour Race Day Warning Notification Indicator Banner */}
        {eventData && (
          <UpcomingEventAlert
            event={eventData}
            participant={participant}
            onOpenQr={() => setShowQrModal(true)}
            onOpenMedical={() => navigate('?tab=medical')}
            hasCompletedMedical={!!medical && medical.declarationAccepted}
          />
        )}

        {/* Registrations Switcher Dropdown if Multiple */}
        {registrations.length > 0 && (
          <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500 dark:text--600 dark:text--400 uppercase">Pilih Pendaftaran Event:</span>
            <select
              value={selectedReg?.id || ''}
              onChange={(e) => {
                const found = registrations.find(r => r.id === e.target.value);
                if (found) loadRegistrationDetails(found);
              }}
              className=" border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
            >
              {registrations.map(r => (
                <option key={r.id} value={r.id}>
                  {r.registrationNumber} - {r.status} ({formatRupiah(r.amount)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Contents */}
        {loading ? (
          <div className="bg-white dark:bg-blue-950 h-64 rounded-3xl animate-pulse border border-slate-200 dark:border-slate-800" />
        ) : registrations.length === 0 ? (
          <div className="relative overflow-hidden p-12 sm:p-20 text-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-orange-50/50 dark:from-blue-900/10 dark:to-orange-900/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-blue-100 to-orange-100 dark:from-blue-900/40 dark:to-orange-900/40 flex items-center justify-center shadow-inner">
                <Trophy className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">Belum Ada Pendaftaran Lomba</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                Anda belum terdaftar pada event apapun saat ini. Mari mulai perjalanan Anda dengan menjelajahi katalog event kami.
              </p>
              <button onClick={() => navigate('/events')} className="px-8 py-3.5 bg-slate-900 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-xl shadow-slate-900/20 dark:shadow-blue-900/20 transition-all hover:-translate-y-1">
                Jelajahi Katalog Event
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && selectedReg && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Status Card */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text--600 dark:text--400 uppercase">NOMOR REGISTRASI</span>
                        <h3 className="text-xl font-mono font-black text-slate-900 dark:text-white">{selectedReg.registrationNumber}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                        selectedReg.status === 'VERIFIED' ? 'bg-emerald-950 text--600 dark:text--400 border-emerald-800' :
                        selectedReg.status === 'WAITING_PAYMENT' ? 'bg-yellow-950 text--600 dark:text--400 border-yellow-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}>
                        STATUS: {selectedReg.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-4  rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 dark:text--600 dark:text--400 text-[10px] uppercase font-bold">NOMOR BIB</span>
                        <span className="block text-2xl font-black text--600 dark:text--400 font-mono mt-1">
                          {participant?.bibNumber || 'DIPROSES'}
                        </span>
                      </div>
                      <div className="p-4  rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 dark:text--600 dark:text--400 text-[10px] uppercase font-bold">UKURAN JERSEY</span>
                        <span className="block text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                          {participant?.jerseySize || '-'}
                        </span>
                      </div>
                      <div className="p-4  rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="block text-slate-500 dark:text--600 dark:text--400 text-[10px] uppercase font-bold">CHECK-IN RACE PACK</span>
                        <span className={`block text-xs font-black mt-2 ${participant?.checkInStatus ? 'text--600 dark:text--400' : 'text-slate-500 dark:text--600 dark:text--400'}`}>
                          {participant?.checkInStatus ? 'SUDAH AMBIL' : 'SIAP AMBIL'}
                        </span>
                      </div>
                    </div>

                    {/* Event Banner Summary */}
                    {eventData && (
                      <div className="p-4  rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <img src={eventData.banner} alt={eventData.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">{eventData.name}</h4>
                          <p className="text-xs text-slate-500 dark:text--600 dark:text--400 mt-0.5">{eventData.location} • {new Date(eventData.startDate).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right QR Widget */}
                <div className="lg:col-span-1">
                  {participant && (
                    <QRCodeViewer value={participant.qrToken} label="Tunjukkan QR ini kepada panitia saat race pack pickup" />
                  )}
                </div>

              </div>
            )}

            {/* INVOICE & PAYMENT TAB */}
            {activeTab === 'registrations' && payment && (
              <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text--600 dark:text--400 uppercase">TAGIHAN INVOICE</span>
                    <h3 className="text-xl font-mono font-black text-slate-900 dark:text-white">{payment.invoiceId}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    payment.status === 'PAID' ? 'bg-emerald-950 text--600 dark:text--400' : 'bg-yellow-950 text--600 dark:text--400'
                  }`}>
                    {payment.status}
                  </span>
                </div>

                <div className="p-4  rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Total Pembayaran:</span>
                    <span className="font-black text--600 dark:text--400 text-base">{formatRupiah(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text--600 dark:text--400 text-[11px]">
                    <span>Metode:</span>
                    <span>{payment.paymentMethod}</span>
                  </div>
                </div>

                {payment.status !== 'PAID' && (
                  <form onSubmit={handleSubmitProof} className="space-y-4 text-xs pt-2">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">URL / Link Bukti Transfer Pembayaran</label>
                      <input
                        type="url"
                        required
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingProof}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{submittingProof ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* MEDICAL TAB */}
            {activeTab === 'medical' && (
              <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Asesmen Kondisi Kesehatan Peserta</h3>
                  <p className="text-xs text-slate-500 dark:text--600 dark:text--400">Pernyataan medis wajib untuk keselamatan dan pertolongan tim medis di lintasan.</p>
                </div>

                <form onSubmit={handleSaveMedical} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Riwayat Kondisi Medis / Alergi Obat</label>
                    <textarea
                      rows={3}
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500"
                    />
                  </div>

                  <div className="p-4  rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text--600 dark:text--400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Saya menyatakan bahwa data kesehatan yang diisi adalah benar, serta menyetujui standar keselamatan dan pertolongan medis dari penyelenggara RacePro.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider"
                  >
                    Simpan Pernyataan Medis
                  </button>
                </form>
              </div>
            )}

            {/* RESULT & CERTIFICATE TAB */}
            {activeTab === 'result' && (
              <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-6">
                <Award className="w-16 h-16 text--600 dark:text--400 mx-auto" />
                
                {result ? (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">{result.participantName}</h3>
                    <div className="grid grid-cols-2 gap-4 text-left p-4  rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text--600 dark:text--400 font-bold uppercase">Gun Time:</span>
                        <span className="block text-lg font-mono font-bold text-slate-900 dark:text-white">{result.gunTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text--600 dark:text--400 font-bold uppercase">Chip Time:</span>
                        <span className="block text-lg font-mono font-bold text--600 dark:text--400">{result.chipTime}</span>
                      </div>
                    </div>

                    {certificate && (
                      <button
                        onClick={() => setShowCertModal(true)}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-colors"
                      >
                        Buka E-Sertifikat Finisher
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Hasil Belum Diterbitkan</h3>
                    <p className="text-xs text-slate-500 dark:text--600 dark:text--400">
                      Waktu finisher akan diperbarui otomatis oleh juri setelah Anda menuntaskan garis finish.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* QR Modal */}
      {showQrModal && participant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-blue-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-500 dark:text--600 dark:text--400 hover:text-slate-900 dark:text-white"
            >
              ✕
            </button>
            <QRCodeViewer value={participant.qrToken} />
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
