import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  Clock, 
  Trash2, 
  RefreshCw, 
  Globe, 
  Search, 
  Headphones,
  Send
} from 'lucide-react';
import { 
  ChatSession, 
  ChatMessage, 
  subscribeToChatSessions, 
  subscribeToSessionMessages,
  deleteChatSession,
  saveAssistantMessage 
} from '../../services/assistantChatService';

export const ChatMonitorTab: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Subscribe ke daftar sesi percakapan secara realtime
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToChatSessions((data) => {
      setSessions(data);
      setLoading(false);
      // Auto-select session pertama jika belum ada yang dipilih
      if (!selectedSession && data.length > 0) {
        setSelectedSession(data[0]);
      } else if (selectedSession) {
        const updated = data.find(s => s.id === selectedSession.id);
        if (updated) setSelectedSession(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe ke pesan-pesan dalam sesi yang dipilih secara realtime
  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToSessionMessages(selectedSession.id, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedSession?.id]);

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Hapus sesi percakapan ini dari log?')) return;
    try {
      await deleteChatSession(sessionId);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    } catch (err) {
      alert('Gagal menghapus sesi.');
    }
  };

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !replyText.trim() || isSendingReply) return;

    try {
      setIsSendingReply(true);
      await saveAssistantMessage(
        selectedSession.id, 
        'bot', 
        `[Admin] ${replyText.trim()}`
      );
      setReplyText('');
    } catch (err) {
      alert('Gagal mengirim respon admin');
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const q = search.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      (s.lastMessage && s.lastMessage.toLowerCase().includes(q)) ||
      (s.userMeta?.pathname && s.userMeta.pathname.toLowerCase().includes(q))
    );
  });

  const formatDate = (val: any) => {
    if (!val) return '-';
    const date = val?.toDate ? val.toDate() : new Date(val);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' • ' + 
           date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#007AFF] text-white flex items-center justify-center shadow-sm">
            <MessageSquare className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Monitoring Percakapan Pengunjung
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Cloud Sync
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau seluruh interaksi bantuan dan pertanyaan pengunjung web secara realtime dari Firestore.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Sesi Aktif
            </span>
            <span className="text-lg font-bold text-slate-800">
              {sessions.length} Percakapan
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Sesi List */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari sesi atau kata kunci..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#007AFF]" />
                <span className="text-xs font-medium">Memuat percakapan...</span>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-20 text-slate-400 px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 stroke-[2]" />
                <p className="text-xs font-semibold">Belum ada riwayat sesi percakapan.</p>
                <p className="text-[11px] text-slate-400 mt-1">Interaksi pengunjung dengan layanan bantuan akan muncul otomatis di sini.</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-50/70 border border-blue-200 shadow-sm'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-[#007AFF] text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <User className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 font-mono">
                            {session.id.substring(0, 16)}...
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 stroke-[2]" />
                            {formatDate(session.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-white transition"
                        title="Hapus sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 pl-9">
                      {session.lastMessage || 'Mulai percakapan'}
                    </p>

                    {session.userMeta?.pathname && (
                      <div className="mt-2 pl-9 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <Globe className="w-2.5 h-2.5 stroke-[2]" />
                        <span>Halaman: {session.userMeta.pathname}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Percakapan Terpilih */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono text-xs font-bold">
                    ID
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 font-mono">
                      {selectedSession.id}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Terakhir aktif: {formatDate(selectedSession.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedSession.userMeta?.pathname && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-600">
                      URL: {selectedSession.userMeta.pathname}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F2F2F7]/40">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-xs">
                    Memuat riwayat pesan sesi ini...
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 ${isUser ? 'justify-start' : 'justify-end'}`}
                      >
                        {isUser && (
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4 stroke-[2]" />
                          </div>
                        )}

                        <div className={`max-w-[78%] space-y-1 ${isUser ? 'text-left' : 'text-right'}`}>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
                            <span>{isUser ? 'Pengunjung (Guest)' : 'Layanan Guwigo'}</span>
                            <span>•</span>
                            <span>{formatDate(msg.timestamp)}</span>
                          </div>
                          <div
                            className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                              isUser
                                ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm font-medium'
                                : 'bg-[#007AFF] text-white rounded-tr-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>

                        {!isUser && (
                          <div className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <Headphones className="w-4 h-4 stroke-[2]" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply as Admin */}
              <form onSubmit={handleAdminReply} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Ketik balasan admin ke pengunjung..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 border-none rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSendingReply}
                  className="px-4 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0062cc] text-white font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-40 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20 stroke-[2]" />
              <h4 className="text-sm font-bold text-slate-600">Pilih Sesi Percakapan</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Pilih salah satu sesi di sebelah kiri untuk melihat pesan antara pengunjung dan layanan bantuan.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
