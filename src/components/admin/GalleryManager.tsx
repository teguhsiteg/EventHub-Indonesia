import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { GalleryItem } from '../../types';
import { Plus, Trash2, Edit, Image, X, Save, Upload } from 'lucide-react';

export const GalleryManager: React.FC = () => {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', imageUrl: '', category: 'Event' });

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'galleries'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
    setGalleries(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) return;
    if (editing) {
      await updateDoc(doc(db, 'galleries', editing.id), { ...form, updatedAt: new Date().toISOString() });
    } else {
      await addDoc(collection(db, 'galleries'), { ...form, createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', imageUrl: '', category: 'Event' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus foto ini?')) return;
    await deleteDoc(doc(db, 'galleries', id));
    load();
  };

  const startEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({ title: item.title, imageUrl: item.imageUrl, category: item.category || 'Event' });
    setShowForm(true);
  };

  const categories = ['Hero Background', 'Event', 'Gallery', 'Sponsor', 'Lainnya'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Galeri & Background</h2>
          <p className="text-xs text-slate-500 mt-1">Kelola foto, background hero, dan galeri event</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ title: '', imageUrl: '', category: 'Event' }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Foto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">{editing ? 'Edit Foto' : 'Tambah Foto Baru'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Judul Foto *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-red-500"
                placeholder="Contoh: Hero Background 2026" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Kategori</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-red-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">URL Gambar *</label>
              <input type="url" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-red-500"
                placeholder="https://images.unsplash.com/..." />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" className="mt-3 w-full h-40 object-cover rounded-xl border" />
              )}
            </div>
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

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl">
          <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Belum ada foto di galeri</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleries.map(item => (
            <div key={item.id} className="group relative bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <img src={item.imageUrl} alt={item.title} className="w-full aspect-[4/3] object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => startEdit(item)} className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full bg-white/90 hover:bg-red-50 text-red-500 shadow-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
