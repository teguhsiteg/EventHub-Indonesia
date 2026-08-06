import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { EVENT_CATEGORIES } from '../utils/constants';
import { createEventRequest } from '../services/requestService';

export const HostEventPage: React.FC = () => {
  const [formData, setFormData] = useState({
    eoName: '',
    picName: '',
    picPhone: '',
    picEmail: '',
    eventName: '',
    plannedDate: '',
    estimatedParticipants: '',
    location: '',
    eventType: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createEventRequest({
        ...formData,
        estimatedParticipants: parseInt(formData.estimatedParticipants) || 0
      });
      
      setIsSuccess(true);
      
      // WhatsApp notification redirect
      const adminPhone = '6281234567890'; // Default phone
      const waMessage = `Halo Admin EventHub by Guwigo,
Saya telah mengirimkan formulir Permohonan Event baru.

*Data EO & PIC*
Nama EO: ${formData.eoName}
Nama PIC: ${formData.picName}
No. WA: ${formData.picPhone}
Email: ${formData.picEmail}

*Data Event*
Nama Event: ${formData.eventName}
Jenis Event: ${formData.eventType}
Rencana Tanggal: ${formData.plannedDate}
Estimasi Peserta: ${formData.estimatedParticipants}
Lokasi: ${formData.location}

*Catatan Tambahan*
${formData.additionalNotes || '-'}

Mohon untuk ditinjau. Terima kasih!`;
      
      const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, '_blank');
      
    } catch (err: any) {
      console.error(err);
      setError('Terjadi kesalahan saat mengirim formulir. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase">Permohonan Berhasil</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
            Terima kasih telah mengajukan event Anda di EventHub by Guwigo. Formulir Anda telah kami terima dan tim kami akan segera menghubungi Anda untuk proses verifikasi selanjutnya.
          </p>
          <Link to="/" className="inline-block px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-amber-400 dark:hover:text-amber-300 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
            Selenggarakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-amber-400">Event</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Jadikan event olahraga Anda lebih profesional dengan manajemen registrasi, pembayaran, dan timing terintegrasi dari EventHub by Guwigo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex gap-3 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Informasi Penyelenggara</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Organizer / Komunitas *</label>
                <input type="text" name="eoName" required value={formData.eoName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="Contoh: Trail Runners Indo" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Penanggung Jawab (PIC) *</label>
                <input type="text" name="picName" required value={formData.picName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="Nama Lengkap" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor WhatsApp PIC *</label>
                <input type="tel" name="picPhone" required value={formData.picPhone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="0812xxxxxx" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email PIC *</label>
                <input type="email" name="picEmail" required value={formData.picEmail} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="email@contoh.com" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Informasi Event</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Event *</label>
                <input type="text" name="eventName" required value={formData.eventName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="Contoh: Merapi Trail Run 2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jenis Event *</label>
                <select name="eventType" required value={formData.eventType} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 appearance-none">
                  <option value="">Pilih Jenis Event...</option>
                  {EVENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rencana Tanggal Pelaksanaan *</label>
                <input type="date" name="plannedDate" required value={formData.plannedDate} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Lokasi Event (Kota/Kabupaten) *</label>
                <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="Contoh: Yogyakarta" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Estimasi Jumlah Peserta *</label>
                <input type="number" name="estimatedParticipants" required min="1" value={formData.estimatedParticipants} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="Contoh: 1000" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Catatan Tambahan (Opsional)</label>
                <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows={4} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="Tuliskan kebutuhan khusus atau pertanyaan Anda di sini..."></textarea>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-blue-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              'Mengirim Permohonan...'
            ) : (
              <>
                <Send className="w-4 h-4" />
                Kirim Permohonan Event
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
