import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnnouncements } from '../services/settingsService';
import { Announcement } from '../types';
import { Megaphone, Pin, Calendar, ChevronRight, Home } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await getAnnouncements();
      const published = items.filter(a => a.status === 'PUBLISHED');
      published.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
      // Pinned items first
      published.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      setAnnouncements(published);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F14] text-slate-800 dark:text-gray-200 pb-16">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-0">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
          <Link to="/" className="hover:text-red-500 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-red-500">Berita</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-900/90 border border-slate-200 dark:border-gray-800 text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-wider shadow-xl mb-6">
            <Megaphone className="w-4 h-4 text-red-500" />
            <span>Guwigo Events — BERITA & PENGUMUMAN</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-[1.05]">
            Berita & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">
              Pengumuman
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base mt-4 max-w-2xl leading-relaxed">
            Informasi terbaru seputar event, promo, dan pengumuman penting dari Guwigo Events.
          </p>
        </div>
      </div>

      {/* News List */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-gray-800 animate-pulse" />)}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada berita</h3>
            <p className="text-sm text-slate-500 mt-1">Pantau terus halaman ini untuk update terbaru.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(item => (
              <article key={item.id} className={`bg-white dark:bg-gray-900 border rounded-2xl p-6 transition-all hover:shadow-md ${
                item.isPinned ? 'border-amber-300 dark:border-amber-800 shadow-md' : 'border-slate-200 dark:border-gray-800'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {item.isPinned && <Pin className="w-4 h-4 text-amber-500 shrink-0" />}
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{item.content}</p>
                    <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
