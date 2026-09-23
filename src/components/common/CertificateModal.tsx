import React, { useRef } from 'react';
import { Certificate } from '../../types';
import { Award, Download, Printer, X, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

interface CertificateModalProps {
 certificate: Certificate;
 onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
 const printRef = useRef<HTMLDivElement>(null);

 const handlePrint = () => {
 window.print();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-red-950/80 backdrop-blur-md overflow-y-auto">
 <div className="bg-white dark:bg-red-950 border border-[var(--glass-border)] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8">
 
 {/* Header */}
 <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-slate-50 dark:bg-red-950/50">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
 <Award className="w-6 h-6" />
 </div>
 <div>
 <h3 className="text-lg font-black text-[var(--text-primary)] dark:text-[var(--text-primary)] uppercase tracking-wider">E-Sertifikat Finisher Resmi</h3>
 <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">Nomor Sertifikat: {certificate.certificateNumber}</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-2 text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Printable Certificate Frame */}
 <div className="p-8 overflow-x-auto flex justify-center">
 <div
 ref={printRef}
 className="w-[800px] h-[560px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-8 border-yellow-500/40 p-10 rounded-2xl relative shadow-2xl flex flex-col justify-between text-center select-none shrink-0"
 style={{
 backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.05) 0%, transparent 70%)'
 }}
 >
 {/* Watermark / Badge */}
 <div className="absolute top-6 left-8 flex items-center gap-2">
 <Trophy className="w-6 h-6 text-yellow-400" />
 <span className="text-sm font-black text-[var(--text-primary)] tracking-widest uppercase">RACEPRO</span>
 </div>

 <div className="absolute top-6 right-8 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
 <ShieldCheck className="w-3.5 h-3.5" />
 <span>OFFICIAL FINISHER</span>
 </div>

 {/* Header Title */}
 <div className="mt-8 space-y-2">
 <span className="text-xs font-bold tracking-[0.3em] text-yellow-400 uppercase">SERTIFIKAT PENGHARGAAN FINISHER</span>
 <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-wide font-serif italic">
 {certificate.eventName}
 </h2>
 </div>

 {/* Awardee Body */}
 <div className="my-6 space-y-3">
 <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] uppercase tracking-widest">Diberikan Dengan Bangga Kepada:</p>
 <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-400 tracking-wide uppercase font-sans border-b-2 border-yellow-500/30 pb-3 inline-block px-8">
 {certificate.participantName}
 </h1>
 <p className="text-xs text-slate-600 dark:text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
 Atas keberhasilan menuntaskan lomba dalam kategori <strong className="text-[var(--text-primary)] ">{certificate.categoryName}</strong> dengan nomor peserta BIB <strong className="text-yellow-400">{certificate.bibNumber}</strong>.
 </p>
 </div>

 {/* Metrics */}
 <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto my-2 bg-white dark:bg-red-950/80 border border-yellow-500/20 p-4 rounded-xl">
 <div>
 <span className="block text-[10px] font-bold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] uppercase">WAKTU FINISH</span>
 <span className="block text-xl font-black text-[var(--text-primary)] font-mono mt-0.5">{certificate.finishTime}</span>
 </div>
 <div>
 <span className="block text-[10px] font-bold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] uppercase">RANK KATEGORI</span>
 <span className="block text-xl font-black text-yellow-400 font-mono mt-0.5">#{certificate.categoryRank}</span>
 </div>
 <div>
 <span className="block text-[10px] font-bold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] uppercase">RANK OVERALL</span>
 <span className="block text-xl font-black text-[var(--text-primary)] font-mono mt-0.5">#{certificate.rank}</span>
 </div>
 </div>

 {/* Footer Signatures */}
 <div className="flex items-end justify-between text-left text-[10px] text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] pt-4 border-t border-[var(--glass-border)] ">
 <div>
 <p className="font-semibold text-slate-600 dark:text-slate-600 ">Sistem Verifikasi EventHub by Guwigo</p>
 <p>Diterbitkan: {new Date(certificate.issuedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
 <p className="font-mono text-[9px] text-[var(--text-secondary)]">ID: {certificate.id}</p>
 </div>
 <div className="text-right">
 <div className="w-24 h-12 border-b border-[var(--glass-border)] mb-1 flex items-center justify-end">
 <Sparkles className="w-6 h-6 text-yellow-400/50" />
 </div>
 <p className="font-bold text-[var(--text-primary)] dark:text-slate-200 uppercase">Race Director</p>
 <p className="text-[var(--text-secondary)]">Komite Penyelenggara</p>
 </div>
 </div>

 </div>
 </div>

 {/* Modal Controls */}
 <div className="p-6 bg-slate-50 dark:bg-red-950/80 border-t border-[var(--glass-border)] flex items-center justify-between">
 <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
 Sertifikat ini resmi dan dapat diverifikasi melalui database EventHub by Guwigo.
 </p>
 <div className="flex items-center gap-3">
 <button
 onClick={handlePrint}
 className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] hover:bg-slate-200 dark:bg-slate-700 text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider transition-all"
 >
 <Printer className="w-4 h-4" />
 <span>Cetak / PDF</span>
 </button>
 <button
 onClick={handlePrint}
 className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all"
 >
 <Download className="w-4 h-4" />
 <span>Unduh Sertifikat</span>
 </button>
 </div>
 </div>

 </div>
 </div>
 );
};
