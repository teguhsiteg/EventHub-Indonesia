import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { checkInParticipantByQr } from '../services/racePackService';
import { Participant } from '../types';
import { QrCode, ShieldCheck, CheckCircle2, UserCheck, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCheckInPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useSettings();

  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScanCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !qrInput.trim()) return;

    setLoading(true);
    setStatusMessage(null);
    setParticipant(null);

    try {
      const res = await checkInParticipantByQr(qrInput.trim(), user.uid, user.email);
      setIsSuccess(res.success);
      setStatusMessage(res.message);
      if (res.participant) {
        setParticipant(res.participant);
      }
      if (res.success) {
        addNotification('success', 'Check-In Berhasil', res.message);
      } else {
        addNotification('warning', 'Check-In Gagal', res.message);
      }
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage('Terjadi kesalahan saat memproses token QR Code.');
      addNotification('error', 'Error System', err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12">
      <div className="max-w-xl mx-auto px-4 space-y-8">
        
        <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:underline uppercase">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Admin</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">QR Check-In Scanner</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pemindaian token QR Code peserta untuk pengambilan Race Pack & BIB.</p>
          </div>

          <form onSubmit={handleScanCheckIn} className="space-y-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Tempel / Scan QR Token (RACEPRO_QR_...)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white font-mono text-xs focus:border-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider shadow-lg shadow-orange-600/20"
            >
              {loading ? 'Memverifikasi...' : 'VERIFIKASI & CHECK-IN'}
            </button>
          </form>

          {statusMessage && (
            <div className={`p-4 rounded-2xl border text-xs text-left ${
              isSuccess ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-amber-950/60 border-amber-800 text-amber-300'
            }`}>
              <div className="flex items-center gap-2 font-bold uppercase mb-1">
                {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                <span>{isSuccess ? 'STATUS CHECK-IN BERHASIL' : 'CATATAN CHECK-IN'}</span>
              </div>
              <p className="leading-relaxed">{statusMessage}</p>
            </div>
          )}

          {participant && (
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Detail Data Peserta</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Nama:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{participant.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Nomor BIB:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">{participant.bibNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Ukuran Jersey:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{participant.jerseySize}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Waktu Check-In:</span>
                  <span className="font-mono text-emerald-400">{participant.checkInTime ? new Date(participant.checkInTime).toLocaleTimeString('id-ID') : '-'}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
