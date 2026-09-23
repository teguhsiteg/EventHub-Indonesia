import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Headphones, MessageCircle, HelpCircle } from 'lucide-react';
import { saveAssistantMessage } from '../../services/assistantChatService';

// Fallback smart responses jika offline / API key belum aktif di production hosting
const SMART_KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['tiket', 'e-tiket', 'eticket', 'unduh', 'cek tiket', 'download'],
    answer: 'Untuk mengecek atau mengunduh E-Tiket Anda, Anda tidak perlu login! Cukup klik menu "Cek E-Tiket" di bagian atas halaman web, lalu masukkan Email atau Nomor Registrasi Anda.'
  },
  {
    keywords: ['daftar', 'cara daftar', 'registrasi', 'ikut event', 'peserta'],
    answer: 'Pendaftaran di Guwigo Events sangat praktis tanpa perlu akun/login (Guest Checkout). Pilih event olahraga yang ingin Anda ikuti, pilih kategori tiket, isi identitas singkat, dan langsung selesaikan pembayaran.'
  },
  {
    keywords: ['bayar', 'metode pembayaran', 'qris', 'transfer', 'va', 'kartu kredit'],
    answer: 'Pembayaran resmi mendukung QRIS (semua e-wallet dan mobile banking), Transfer Bank / Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan Kartu Debit/Kredit.'
  },
  {
    keywords: ['jadwal', 'kapan', 'waktu', 'lokasi', 'tempat'],
    answer: 'Rincian jadwal pelaksanaan, waktu start perlombaan, dan peta rute dapat Anda lihat langsung pada rincian setiap event di menu Jelajah Event.'
  },
  {
    keywords: ['batal', 'refund', 'pengembalian'],
    answer: 'Ketentuan pembatalan dan refund bergantung pada kebijakan panitia penyelenggara. Silakan cek informasi pada halaman event atau hubungi narahubung panitia.'
  },
  {
    keywords: ['kontak', 'hubungi', 'wa', 'whatsapp', 'admin', 'bantuan'],
    answer: 'Layanan WhatsApp resmi Guwigo: +62 822-4467-3335 atau email: support@guwigo.com.'
  }
];

function getLocalSmartReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const item of SMART_KNOWLEDGE_BASE) {
    if (item.keywords.some(kw => lower.includes(kw))) {
      return item.answer;
    }
  }
  return 'Halo! Saya Asisten Layanan Guwigo. Ada yang bisa kami bantu mengenai pendaftaran event tanpa akun, pengecekan e-tiket, jadwal lomba, atau metode pembayaran resmi?';
}

export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; timestamp?: Date }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Buat atau pertahankan sessionId di localStorage pengunjung
  const [sessionId] = useState<string>(() => {
    let id = localStorage.getItem('guwigo_assistant_session_id');
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('guwigo_assistant_session_id', id);
    }
    return id;
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (customText?: string) => {
    const msg = (customText || input).trim();
    if (!msg || loading) return;

    const userTimestamp = new Date();
    setMessages(prev => [...prev, { role: 'user', text: msg, timestamp: userTimestamp }]);
    setInput('');
    setLoading(true);

    // 1. Simpan pesan user ke Firestore (Realtime Admin Monitor)
    saveAssistantMessage(sessionId, 'user', msg, {
      pathname: window.location.pathname,
      referrer: document.referrer
    });

    let botReply = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId })
      });

      if (res.ok) {
        const data = await res.json();
        botReply = data.reply || getLocalSmartReply(msg);
      } else {
        botReply = getLocalSmartReply(msg);
      }
    } catch {
      botReply = getLocalSmartReply(msg);
    }

    const botTimestamp = new Date();
    setMessages(prev => [...prev, { role: 'bot', text: botReply, timestamp: botTimestamp }]);
    setLoading(false);

    // 2. Simpan respon ke Firestore (Realtime Admin Monitor)
    saveAssistantMessage(sessionId, 'bot', botReply);

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const quickPrompts = [
    'Cara cek E-Tiket saya?',
    'Bagaimana cara daftar event?',
    'Metode pembayaran apa saja?'
  ];

  return (
    <>
      {/* Floating Action Button - Clean iOS Standard Style */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white shadow-lg shadow-blue-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Bantuan & Dukungan"
        title="Layanan Bantuan Guwigo"
      >
        {open ? (
          <X className="w-6 h-6 stroke-[2.2]" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#007AFF] rounded-full" />
          </div>
        )}
      </button>

      {/* Chat Window Panel - Clean Flat iOS Design */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-250">
          
          {/* Header - Flat iOS Bar */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#007AFF] flex items-center justify-center text-white">
                <Headphones className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold tracking-tight">Layanan Guwigo</p>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Pusat Bantuan Event & Tiket</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* Session Banner Info */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <MessageSquare className="w-3.5 h-3.5 text-[#007AFF]" />
              Dukungan Langsung Guwigo
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {sessionId.substring(0, 10)}
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F2F2F7]/50">
            {messages.length === 0 && (
              <div className="py-6 px-3 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#007AFF] flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Ada yang bisa kami bantu?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto leading-relaxed">
                    Tanyakan seputar pendaftaran tiket, pembayaran resmi, atau informasi event olahraga.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1.5 pt-2 text-left">
                  <p className="text-[11px] font-semibold text-slate-400 px-1">
                    Topik yang sering ditanyakan:
                  </p>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => send(prompt)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200/80 hover:border-[#007AFF]/50 hover:bg-blue-50/40 transition flex items-center justify-between group shadow-sm"
                    >
                      <span>{prompt}</span>
                      <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#007AFF] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Headphones className="w-4 h-4 stroke-[2]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-[#007AFF] text-white rounded-br-sm font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white border border-slate-200/70 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Footer - iOS Search / Input field style */}
          <form
            onSubmit={e => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 px-3.5 py-3 border-t border-slate-100 bg-white shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0062cc] text-white disabled:opacity-40 transition shadow-sm shrink-0 active:scale-95"
              aria-label="Kirim"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
