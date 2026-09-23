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
 <div className="min-h-screen text-[var(--text-primary)] dark:text-slate-100 py-16">
 <div className="max-w-4xl mx-auto px-4 space-y-12">
 <div className="text-center space-y-2">
 <span className="text-xs font-extrabold text-[var(--accent)] dark:text-amber-400 uppercase tracking-widest block">HUBUNGI KAMI</span>
 <h1 className="text-3xl font-black text-[var(--text-primary)] dark:text-[var(--text-primary)] uppercase tracking-tight">Hubungi Tim {settings.siteName}</h1>
 <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-xs">Punya pertanyaan seputar pendaftaran, pembayaran, atau kemitraan organizer?</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[var(--glass-border)] dark:border-gray-800 space-y-6">
 <h3 className="text-base font-bold text-[var(--text-primary)] uppercase">Informasi Kontak</h3>
 <div className="space-y-4 text-xs">
 <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--glass-border)] ">
 <Mail className="w-5 h-5 text-blue-400 shrink-0" />
 <div>
 <span className="block text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-[10px]">Email Support</span>
 <span className="font-bold text-[var(--text-primary)] ">{settings.contactEmail}</span>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--glass-border)] ">
 <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
 <div>
 <span className="block text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-[10px]">WhatsApp Helpdesk</span>
 <span className="font-bold text-[var(--text-primary)] ">{settings.contactPhone}</span>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--glass-border)] ">
 <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
 <div>
 <span className="block text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-[10px]">Kantor Operasional</span>
 <span className="font-bold text-[var(--text-primary)] ">Yogyakarta & Jakarta, Indonesia</span>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-[var(--glass-border)] dark:border-gray-800">
 {submitted ? (
 <div className="py-12 text-center space-y-3">
 <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
 <h4 className="text-lg font-bold text-[var(--text-primary)] uppercase">Pesan Anda Telah Diterima</h4>
 <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">Tim kami akan menghubungi Anda kembali segera.</p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4 text-xs">
 <div>
 <label className="block text-slate-600 dark:text-slate-600 font-bold uppercase mb-1">Nama Anda</label>
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="w-full border border-[var(--glass-border)] rounded-xl p-3 text-[var(--text-primary)] focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-slate-600 dark:text-slate-600 font-bold uppercase mb-1">Email</label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full border border-[var(--glass-border)] rounded-xl p-3 text-[var(--text-primary)] focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-slate-600 dark:text-slate-600 font-bold uppercase mb-1">Pesan / Pertanyaan</label>
 <textarea
 rows={4}
 required
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 className="w-full border border-[var(--glass-border)] rounded-xl p-3 text-[var(--text-primary)] focus:border-blue-500"
 />
 </div>
 <button
 type="submit"
 className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
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
