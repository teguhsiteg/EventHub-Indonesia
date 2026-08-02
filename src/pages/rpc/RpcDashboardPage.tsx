import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { checkInParticipantByQr, getRecentCheckIns, findParticipantForRpc } from '../../services/racePackService';
import { Participant } from '../../types';
import { QrCode, ShieldCheck, CheckCircle2, Search, ArrowLeft, Camera, X, Clock, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { RpcReceiptTemplate } from '../../components/rpc/RpcReceiptTemplate';
import ReactDOMServer from 'react-dom/server';

export const RpcDashboardPage: React.FC = () => {
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
  
  // Custom RPC state
  const [inputBib, setInputBib] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scannedToken, setScannedToken] = useState('');
  const [rpcEventName, setRpcEventName] = useState('EventHub Running Event');
  const [rpcCategoryName, setRpcCategoryName] = useState('');
  const [scannedParticipantCache, setScannedParticipantCache] = useState<Participant | null>(null);

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

  const handlePrintReceipt = (part: Participant, eName?: string, cName?: string) => {
    const receiptHtml = ReactDOMServer.renderToString(
      <RpcReceiptTemplate 
        participant={part} 
        eventName={eName || 'EventHub Running Event'} 
        categoryName={cName || part.categoryId} 
        adminName={user?.displayName || 'Admin'} 
      />
    );
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Struk RPC - ${part.fullName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body onload="window.print();window.close()">
            ${receiptHtml}
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const executeRPC = async () => {
    if (!user || !scannedToken) return;

    setLoading(true);
    setStatusMessage(null);
    setShowConfirmModal(false);

    try {
      const res = await checkInParticipantByQr(scannedToken, user.uid, user.email || '', inputBib);
      setIsSuccess(res.success);
      setStatusMessage(res.message);
      if (res.eventName) setRpcEventName(res.eventName);
      if (res.categoryName) setRpcCategoryName(res.categoryName);
      
      if (res.participant) {
        const checkedInPart = res.participant;
        setParticipant(checkedInPart);
        setScanHistory(prev => {
          const filtered = prev.filter(p => p.id !== checkedInPart.id);
          return [checkedInPart, ...filtered].slice(0, 20);
        });
      }
      if (res.success) {
        addNotification('success', 'RPC Berhasil', res.message);
      } else {
        addNotification('warning', 'RPC Gagal', res.message);
      }
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage('Terjadi kesalahan saat memproses data.');
      addNotification('error', 'Error System', err.message);
    }
    setLoading(false);
    setScannedToken('');
    setInputBib('');
  };

  // When a token is scanned, we don't immediately RPC. We check if they exist and prompt for BIB if needed.
  const verifyTokenBeforeRPC = async (token: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const part = await findParticipantForRpc(token);
      if (part) {
        setScannedParticipantCache(part);
        setScannedToken(token);
        setInputBib(part.bibNumber || '');
        setShowConfirmModal(true);
      } else {
        addNotification('error', 'Gagal', 'Peserta tidak ditemukan dengan QR / BIB / Email tersebut.');
      }
    } catch(e) {
      addNotification('error', 'Gagal', 'Terjadi kesalahan sistem');
    }
    setLoading(false);
  };

  const handleScanCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyTokenBeforeRPC(qrInput.trim());
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
      addNotification('error', 'Akses Kamera Ditolak', 'Mohon izinkan akses kamera di browser Anda.');
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
          html5QrCode?.stop().then(() => {
            setIsCameraActive(false);
            setQrInput(decodedText);
            verifyTokenBeforeRPC(decodedText);
          });
        },
        () => {}
      ).catch(err => {
        setIsCameraActive(false);
        addNotification('error', 'Gagal Membuka Kamera', err.message);
      });
    }
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isCameraActive]);

  return (
    <div className="space-y-6">
      
      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            Scanner Race Pack (RPC)
          </h2>
          <form onSubmit={handleScanCheckIn} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                placeholder="Tempel / Scan QR Token (RACEPRO_QR_...)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !qrInput}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Cari
            </button>
          </form>
        </div>

        <div className="hidden md:block w-px bg-slate-200" />

        <div className="md:w-64 flex flex-col justify-center">
          {!isCameraActive ? (
            <button
              type="button"
              onClick={requestCameraPermission}
              className="w-full py-4 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors text-slate-600"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-bold text-sm">Gunakan Kamera</span>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-[250px] mx-auto border-2 border-blue-500 shadow-lg">
              <div id="qr-reader" className="w-full h-full object-cover"></div>
              <button 
                onClick={() => setIsCameraActive(false)}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-50 backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Status */}
      {statusMessage && (
        <div className={`p-6 rounded-3xl shadow-sm border ${
          isSuccess 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-red-50 border-red-100 text-red-800'
        } animate-in fade-in slide-in-from-top-2`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {isSuccess ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <ShieldCheck className="w-6 h-6 text-red-600" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{isSuccess ? 'RPC Berhasil' : 'RPC Gagal'}</h3>
              <p className="text-sm font-medium opacity-90">{statusMessage}</p>
              
              {isSuccess && participant && (
                <div className="mt-4 p-4 bg-white/60 rounded-2xl border border-black/5 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-900/60 uppercase tracking-widest mb-1">Informasi Peserta</p>
                    <p className="font-black text-lg text-emerald-900">{participant.fullName}</p>
                    <div className="flex gap-4 mt-2">
                      <p className="text-sm font-medium"><span className="opacity-70">BIB:</span> <span className="font-bold">{participant.bibNumber || '-'}</span></p>
                      <p className="text-sm font-medium"><span className="opacity-70">Jersey:</span> <span className="font-bold">{participant.jerseySize || '-'}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePrintReceipt(participant, rpcEventName, rpcCategoryName)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
                  >
                    <Printer className="w-5 h-5" />
                    Cetak Struk
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Riwayat RPC Terbaru
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{scanHistory.length} scan terakhir</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Waktu Scan</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Peserta</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">BIB</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scanHistory.map(history => (
                <tr key={history.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-slate-900">
                      {new Date(history.checkInTime || '').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(history.checkInTime || '').toLocaleDateString('id-ID')}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-slate-900">{history.fullName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{history.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600">
                      {history.bibNumber || 'TBA'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handlePrintReceipt(history)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Cetak Ulang Struk"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {scanHistory.length === 0 && !historyLoading && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 text-sm font-medium">
                    Belum ada riwayat RPC hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Konfirmasi RPC</h3>
            {scannedParticipantCache ? (
              <p className="text-sm text-slate-700 mb-6">
                Peserta: <strong className="text-blue-600 text-base">{scannedParticipantCache.fullName}</strong><br/>
                <span className="text-slate-500 text-xs">{scannedParticipantCache.email}</span>
              </p>
            ) : (
              <p className="text-sm text-slate-500 mb-6">Pastikan identitas peserta sesuai.</p>
            )}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nomor BIB (Opsional jika sudah ada)
                </label>
                <input
                  type="text"
                  value={inputBib}
                  onChange={e => setInputBib(e.target.value.toUpperCase())}
                  placeholder="Misal: 5K-001"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setScannedToken('');
                  setInputBib('');
                }}
                className="flex-1 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeRPC}
                disabled={loading}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
              >
                {loading ? 'Memproses...' : 'Konfirmasi RPC'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
