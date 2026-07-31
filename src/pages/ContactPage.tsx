import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { settings, addNotification } = useSettings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addNotification('success', 'Pesan Terkirim', 'Tim helpdesk akan merespons pesan Anda via email.');
  };

  return (
    <div className="min-h-screen  text-slate-900 dark:text-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-blue-500 uppercase tracking-widest block">HUBUNGI KAMI</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white uppercase tracking-tight">Hubungi Tim {settings.siteName}</h1>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs">Punya pertanyaan seputar pendaftaran, pembayaran, atau kemitraan organizer?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-blue-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase">Informasi Kontak</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3  rounded-xl border border-slate-200 dark:border-slate-800">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="block text-slate-500 dark:text-slate-500 dark:text-slate-400 text-[10px]">Email Support</span>
                  <span className="font-bold text-slate-900 dark:text-white">{settings.contactEmail}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3  rounded-xl border border-slate-200 dark:border-slate-800">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-slate-500 dark:text-slate-500 dark:text-slate-400 text-[10px]">WhatsApp Helpdesk</span>
                  <span className="font-bold text-slate-900 dark:text-white">{settings.contactPhone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3  rounded-xl border border-slate-200 dark:border-slate-800">
                <MapPin className="w-5 h-5 text-yellow-400 shrink-0" />
                <div>
                  <span className="block text-slate-500 dark:text-slate-500 dark:text-slate-400 text-[10px]">Kantor Operasional</span>
                  <span className="font-bold text-slate-900 dark:text-white">Yogyakarta & Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-blue-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Pesan Anda Telah Diterima</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400">Tim kami akan menghubungi Anda kembali segera.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Nama Anda</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Pesan / Pertanyaan</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
