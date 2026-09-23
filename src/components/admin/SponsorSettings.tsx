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
 <div className="flex justify-between items-center bg-white dark:bg-red-950/60 p-6 rounded-2xl border border-[var(--glass-border)] ">
 <div>
 <h2 className="text-xl font-black text-[var(--text-primary)] uppercase flex items-center gap-2">
 <Trophy className="w-5 h-5 text-red-500" />
 Mitra & Sponsor
 </h2>
 <p className="text-xs text-[var(--text-secondary)] mt-1">Kelola daftar sponsor yang tampil di halaman utama</p>
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
 <div className="bg-white dark:bg-red-950/60 rounded-2xl border border-[var(--glass-border)] overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs">
 <thead className="bg-[var(--bg-secondary)] dark:bg-[var(--bg-primary)]/50 text-[var(--text-secondary)] font-bold uppercase tracking-wider">
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
 <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-secondary)]">Belum ada sponsor</td>
 </tr>
 ) : (
 sponsors.map(sp => (
 <tr key={sp.id} className="hover:bg-[var(--bg-primary)] dark:hover:bg-[var(--bg-secondary)]/30 transition-colors">
 <td className="px-6 py-4 font-bold text-[var(--text-primary)] uppercase">{sp.name}</td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
 sp.tier === 'PLATINUM' ? 'bg-slate-200 text-slate-700' :
 sp.tier === 'GOLD' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
 sp.tier === 'SILVER' ? 'bg-slate-300/20 text-[var(--text-secondary)] border border-[var(--glass-border)]/30' :
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
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/80 backdrop-blur-sm">
 <div className="bg-white dark:bg-[var(--bg-primary)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[var(--glass-border)] ">
 <div className="p-6 border-b border-[var(--glass-border)] flex justify-between items-center">
 <h3 className="text-lg font-black text-[var(--text-primary)] uppercase">
 {editingSponsor ? 'Edit Sponsor' : 'Tambah Sponsor'}
 </h3>
 <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-white">
 <X className="w-5 h-5" />
 </button>
 </div>
 <form onSubmit={handleSave} className="p-6 space-y-4">
 <div>
 <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Nama Sponsor *</label>
 <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-red-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">URL Logo (Opsional)</label>
 <input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-red-500 outline-none" />
 </div>
 <div>
 <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">URL Website (Opsional)</label>
 <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-red-500 outline-none" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Tier</label>
 <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value as any})} className="w-full bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-red-500 outline-none">
 <option value="PLATINUM">Platinum</option>
 <option value="GOLD">Gold</option>
 <option value="SILVER">Silver</option>
 <option value="BRONZE">Bronze</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Urutan</label>
 <input type="number" required min={1} value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="w-full bg-[var(--bg-secondary)] dark:bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-red-500 outline-none" />
 </div>
 </div>
 <div className="pt-4 flex justify-end gap-3">
 <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--bg-secondary)]">Batal</button>
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
