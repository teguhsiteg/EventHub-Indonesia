import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Announcement } from '../../types';
import { Plus, Trash2, Edit, X, Save, Pin, PinOff, Eye, EyeOff } from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false, status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' });

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'announcements'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAnnouncements(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    const data = {
      ...form,
      publishedAt: form.status === 'PUBLISHED' ? (editing?.publishedAt || new Date().toISOString()) : null,
      updatedAt: new Date().toISOString(),
    };
    if (editing) {
      await updateDoc(doc(db, 'announcements', editing.id), data);
    } else {
      await addDoc(collection(db, 'announcements'), { ...data, createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', content: '', isPinned: false, status: 'DRAFT' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus berita ini?')) return;
    await deleteDoc(doc(db, 'announcements', id));
    load();
  };

  const togglePublish = async (item: Announcement) => {
    const newStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await updateDoc(doc(db, 'announcements', item.id), {
      status: newStatus,
      publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : null,
    });
    load();
  };

  const startEdit = (item: Announcement) => {
    setEditing(item);
    setForm({ title: item.title, content: item.content, isPinned: item.isPinned, status: item.status });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Berita & Pengumuman</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola berita dan pengumuman yang tampil di halaman public</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ title: '', content: '', isPinned: false, status: 'DRAFT' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Buat Berita
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">{editing ? 'Edit Berita' : 'Buat Berita Baru'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Judul *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-red-500"
              placeholder="Judul berita..." />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Konten *</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={5}
              className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-red-500"
              placeholder="Tulis konten berita di sini..." />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500" />
              <span className="text-xs font-bold text-slate-600">Pin (tampil di atas)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.status === 'PUBLISHED'} onChange={e => setForm(p => ({ ...p, status: e.target.checked ? 'PUBLISHED' : 'DRAFT' }))}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500" />
              <span className="text-xs font-bold text-slate-600">Published</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-gray-800">
              Batal
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold">
              <Save className="w-4 h-4" /> {editing ? 'Update' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl">
          <p className="text-slate-500 text-sm">Belum ada berita</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(item => (
            <div key={item.id} className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 transition-all ${
              item.isPinned ? 'border-amber-300 dark:border-amber-700 shadow-md' : 'border-slate-200 dark:border-gray-700'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.content}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => togglePublish(item)} title={item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-slate-600 transition-colors">
                    {item.status === 'PUBLISHED' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => startEdit(item)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-400 hover:text-red-500 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
