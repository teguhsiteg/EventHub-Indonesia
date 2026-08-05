import React, { useState } from 'react';
import { X, Save, Edit3, Eye, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Payment, PaymentStatus, Registration } from '../../types';

interface PaymentActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'VIEW' | 'EDIT';
  payment: Payment & { status: string };
  registration?: Registration;
  participantName: string;
  onUpdate: (paymentId: string, updates: Partial<Payment>) => Promise<void>;
}

export const PaymentActionModal: React.FC<PaymentActionModalProps> = ({
  isOpen,
  onClose,
  mode,
  payment,
  registration,
  participantName,
  onUpdate
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Edit form state
  const [editAmount, setEditAmount] = useState(payment.amount.toString());
  const [editStatus, setEditStatus] = useState<PaymentStatus>(payment.status);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');
    const parsedAmount = parseInt(editAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('Nominal pembayaran tidak valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: Partial<Payment> = {};
      let hasChanges = false;

      if (parsedAmount !== payment.amount) {
        updates.amount = parsedAmount;
        hasChanges = true;
      }
      if (editStatus !== payment.status) {
        updates.status = editStatus;
        hasChanges = true;
      }

      if (hasChanges) {
        await onUpdate(payment.id, updates);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              mode === 'VIEW' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
            }`}>
              {mode === 'VIEW' ? <Eye className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                {mode === 'VIEW' ? 'Detail Pembayaran' : 'Edit Pembayaran'}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{payment.invoiceId}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Participant Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Nama Peserta</p>
                <p className="font-semibold text-slate-900 dark:text-white">{participantName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">No. Registrasi</p>
                <p className="font-mono font-medium text-slate-700 dark:text-slate-300">{registration?.registrationNumber || '-'}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {mode === 'VIEW' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Nominal</p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(payment.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Metode Pembayaran</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{payment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                    payment.status === 'PAID' || payment.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                    payment.status === 'PENDING' || payment.status === 'PAYMENT_REVIEW' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                    payment.status === 'FAILED' || payment.status === 'EXPIRED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {payment.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Tanggal Dibuat</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{formatDate(payment.createdAt)}</p>
                </div>
              </div>

              {payment.proofUrl && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Bukti Pembayaran</p>
                  <a 
                    href={payment.proofUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Lihat Dokumen
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Ubah jika terdapat ketidaksesuaian nominal transfer.</p>
              </div>
              
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">
                  Status Pembayaran
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                >
                  <option value="PENDING">PENDING (Menunggu)</option>
                  <option value="PAID">PAID (Lunas)</option>
                  <option value="VERIFIED">VERIFIED (Terverifikasi)</option>
                  <option value="FAILED">FAILED (Gagal)</option>
                  <option value="EXPIRED">EXPIRED (Kedaluwarsa)</option>
                  <option value="REFUNDED">REFUNDED (Dikembalikan)</option>
                </select>
                <p className="text-[10px] text-orange-500 dark:text-orange-400 mt-1 font-medium">Peringatan: Mengubah status di sini tidak memicu pembuatan E-Ticket atau BIB otomatis.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
          {mode === 'EDIT' && (
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
