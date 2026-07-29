import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getParticipantByQrToken } from '../services/registrationService';
import { Participant } from '../types';
import { ShieldCheck, XCircle, QrCode, CheckCircle2, User, Trophy } from 'lucide-react';

export const VerifyQRPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      if (!token) return;
      setLoading(true);
      try {
        const part = await getParticipantByQrToken(token);
        if (part) {
          setParticipant(part);
          setValid(true);
        } else {
          setValid(false);
        }
      } catch (e) {
        setValid(false);
      }
      setLoading(false);
    }
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center">
        
        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Memverifikasi Token QR Code...</p>
          </div>
        ) : valid && participant ? (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/40">
                PESERTA TERVERIFIKASI
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mt-3">
                {participant.fullName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">BIB Nomor: <strong className="text-amber-400 font-mono text-sm">{participant.bibNumber}</strong></p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Status Check-in:</span>
                <span className={`font-bold ${participant.checkInStatus ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {participant.checkInStatus ? 'SUDAH CHECK-IN' : 'BELUM CHECK-IN'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Ukuran Jersey:</span>
                <span className="font-bold text-slate-900 dark:text-white">{participant.jerseySize}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Nomor Registrasi:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">REG-VERIFIED</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Tunjukkan halaman verifikasi ini atau bawa KTP fisik saat mengambil Race Pack di lokasi event.
            </p>

            <Link
              to="/"
              className="block w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest bg-rose-950/80 px-3 py-1 rounded-full border border-rose-800/40">
                TOKEN QR TIDAK VALID
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">Verifikasi Gagal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Token QR Code tidak ditemukan di database atau telah kedaluwarsa.
              </p>
            </div>

            <Link
              to="/"
              className="block w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider"
            >
              Kembali ke Beranda
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};
