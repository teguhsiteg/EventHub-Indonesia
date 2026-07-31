import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { checkInParticipantByQr, getRecentCheckIns } from '../services/racePackService';
import { Participant } from '../types';
import { QrCode, ShieldCheck, CheckCircle2, UserCheck, Search, AlertCircle, ArrowLeft, Camera, X, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

export const AdminCheckInPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useSettings();

  const [qrInput, setQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanHistory, setScanHistory] = useState<Participant[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  React.useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getRecentCheckIns(20);
        setScanHistory(history);
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  // Helper for actual checkin to reuse between form submit and camera scan
  const performCheckIn = async (token: string) => {
    if (!user || !token) return;

    setLoading(true);
    setStatusMessage(null);
    setParticipant(null);

    try {
      const res = await checkInParticipantByQr(token, user.uid, user.email || '');
      setIsSuccess(res.success);
      setStatusMessage(res.message);
      if (res.participant) {
        const checkedInPart = res.participant;
        setParticipant(checkedInPart);
        // Add to history automatically (at the beginning)
        setScanHistory(prev => {
          // Remove if it somehow already exists in history (to prevent duplicates)
          const filtered = prev.filter(p => p.id !== checkedInPart.id);
          return [checkedInPart, ...filtered].slice(0, 20); // keep only 20
        });
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

  const handleScanCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await performCheckIn(qrInput.trim());
  };

  const requestCameraPermission = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setIsCameraActive(true);
      } else {
        addNotification('warning', 'Kamera Tidak Ditemukan', 'Tidak ada kamera yang terdeteksi di perangkat Anda.');
      }
    } catch (err: any) {
      console.error("Camera permission error:", err);
      addNotification('error', 'Akses Kamera Ditolak', 'Mohon izinkan akses kamera di pengaturan browser Anda untuk menggunakan fitur ini.');
    }
  };

  React.useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    if (isCameraActive) {
      html5QrCode = new Html5Qrcode("qr-reader");
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // On successful scan
          setQrInput(decodedText);
          performCheckIn(decodedText);
          
          if (html5QrCode) {
            html5QrCode.stop().then(() => {
              html5QrCode?.clear();
              setIsCameraActive(false);
            }).catch(e => console.error("Error stopping", e));
          }
        },
        (error) => {
          // parse errors are normal
        }
      ).catch((err) => {
        console.error("Error starting camera", err);
        setIsCameraActive(false);
        addNotification('error', 'Kamera Error', 'Tidak dapat mengakses kamera. Pastikan izin sudah diberikan.');
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode?.clear();
        }).catch(e => console.error("Failed to stop scanner", e));
      } else if (html5QrCode) {
        html5QrCode.clear();
      }
    };
  }, [isCameraActive]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:underline uppercase">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>
          
          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold uppercase border border-blue-500/20">
            <Activity className="w-4 h-4" />
            <span>Live Check-In Monitor</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: SCANNER */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8" />
              </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">QR Check-In Scanner</h1>
            <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">Pemindaian token QR Code peserta untuk pengambilan Race Pack & BIB.</p>
          </div>

          {!isCameraActive ? (
            <button
              onClick={requestCameraPermission}
              className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors border-2 border-dashed border-slate-300 dark:border-slate-600"
            >
              <Camera className="w-5 h-5" />
              Buka Kamera Scanner
            </button>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border-2 border-blue-500/30 bg-black">
                <div id="qr-reader" className="w-full"></div>
              </div>
              <button
                onClick={() => setIsCameraActive(false)}
                className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Tutup Kamera
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            ATAU MANUAL
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
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
                className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white font-mono text-xs focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Memverifikasi...' : 'VERIFIKASI & CHECK-IN'}
            </button>
          </form>

          {statusMessage && (
            <div className={`p-4 rounded-2xl border text-xs text-left ${
              isSuccess ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-yellow-950/60 border-yellow-800 text-yellow-300'
            }`}>
              <div className="flex items-center gap-2 font-bold uppercase mb-1">
                {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                <span>{isSuccess ? 'STATUS CHECK-IN BERHASIL' : 'CATATAN CHECK-IN'}</span>
              </div>
              <p className="leading-relaxed">{statusMessage}</p>
            </div>
          )}

          {participant && (
            <div className=" p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Detail Data Peserta</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Nama:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{participant.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Nomor BIB:</span>
                  <span className="font-mono font-black text-yellow-400 text-sm">{participant.bibNumber}</span>
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

      {/* RIGHT COLUMN: HISTORY */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase">Riwayat Check-In</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">20 Data Peserta Terakhir</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700">
              {scanHistory.length} Terdata
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Waktu</th>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3">BIB</th>
                  <th className="px-4 py-3">Jersey</th>
                  <th className="px-4 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historyLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">Memuat data riwayat...</td>
                  </tr>
                ) : scanHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">Belum ada riwayat check-in</td>
                  </tr>
                ) : (
                  scanHistory.map((hist) => (
                    <tr key={hist.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {hist.checkInTime ? new Date(hist.checkInTime).toLocaleTimeString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {hist.fullName}
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-yellow-500 whitespace-nowrap">
                        {hist.bibNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {hist.jerseySize}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          SELESAI
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</div>
  );
};
