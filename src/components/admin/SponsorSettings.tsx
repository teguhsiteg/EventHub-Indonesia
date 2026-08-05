import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit3, Loader2, Save, X, Trophy } from 'lucide-react';
import app from '../../config/firebase';
import { Sponsor } from '../../types';

interface SponsorSettingsProps {
  addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export const SponsorSettings: React.FC<SponsorSettingsProps> = ({ addNotification }) => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  
  const [formData, setFormData] = useState<Partial<Sponsor>>({
    name: '',
    logoUrl: '',
    website: '',
    tier: 'GOLD',
    order: 1
  });
  const [saving, setSaving] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'sponsors'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor));
      setSponsors(data.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      addNotification('error', 'Gagal Memuat Data', err.message);
    }
    setLoading(false);
  };

  const handleOpenModal = (sponsor?: Sponsor) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setFormData(sponsor);
    } else {
      setEditingSponsor(null);
      setFormData({ name: '', logoUrl: '', website: '', tier: 'GOLD', order: sponsors.length + 1 });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = editingSponsor?.id || `sp_${Date.now()}`;
      const payload = {
        ...formData,
        id,
        createdAt: editingSponsor?.createdAt || new Date().toISOString()
      };
      await setDoc(doc(db, 'sponsors', id), payload);
      addNotification('success', 'Berhasil', 'Data sponsor berhasil disimpan');
      setShowModal(false);
      fetchSponsors();
    } catch (err: any) {
      addNotification('error', 'Gagal Menyimpan', err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus sponsor ini?')) return;
    try {
      await deleteDoc(doc(db, 'sponsors', id));
      addNotification('success', 'Berhasil', 'Sponsor dihapus');
      fetchSponsors();
    } catch (err: any) {
      addNotification('error', 'Gagal Menghapus', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-red-950/60 p-6 rounded-2xl border border-slate-300 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-500" />
            Mitra & Sponsor
          </h2>
          <p className="text-xs text-slate-500 mt-1">Kelola daftar sponsor yang tampil di halaman utama</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/25"
        >
          <Plus className="w-4 h-4" />
          Tambah Sponsor
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-red-950/60 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama Sponsor</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">Urutan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {sponsors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada sponsor</td>
                  </tr>
                ) : (
                  sponsors.map(sp => (
                    <tr key={sp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase">{sp.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          sp.tier === 'PLATINUM' ? 'bg-slate-200 text-slate-700' :
                          sp.tier === 'GOLD' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          sp.tier === 'SILVER' ? 'bg-slate-300/20 text-slate-400 border border-slate-300/30' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {sp.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">{sp.order}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleOpenModal(sp)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(sp.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">
                {editingSponsor ? 'Edit Sponsor' : 'Tambah Sponsor'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Sponsor *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Logo (Opsional)</label>
                <input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Website (Opsional)</label>
                <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-red-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tier</label>
                  <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value as any})} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-red-500 outline-none">
                    <option value="PLATINUM">Platinum</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="BRONZE">Bronze</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Urutan</label>
                  <input type="number" required min={1} value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:border-red-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase bg-red-600 hover:bg-red-500 text-white flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
