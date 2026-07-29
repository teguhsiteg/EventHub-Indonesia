import React, { useState } from 'react';
import { createEvent, updateEvent, createCategory } from '../../services/eventService';
import { UserProfile, EventItem } from '../../types';

interface CreateEventModalProps {
  user: UserProfile;
  initialData?: EventItem | null;
  onClose: () => void;
  onSuccess: () => void;
  addNotification: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ user, initialData, onClose, onSuccess, addNotification }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form States - Basic Info
  const [eventName, setEventName] = useState(initialData?.name || '');
  const [eventSlug, setEventSlug] = useState(initialData?.slug || '');
  const [eventDesc, setEventDesc] = useState(initialData?.description || '');
  const [eventBanner, setEventBanner] = useState(initialData?.banner || '');
  const [eventLocation, setEventLocation] = useState(initialData?.location || '');
  const [eventStartDate, setEventStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '');
  const [eventRegStart, setEventRegStart] = useState(initialData?.registrationStart ? new Date(initialData.registrationStart).toISOString().slice(0, 16) : '');
  const [eventRegEnd, setEventRegEnd] = useState(initialData?.registrationEnd ? new Date(initialData.registrationEnd).toISOString().slice(0, 16) : '');

  // Form States - Facilities & Rules
  const [facilities, setFacilities] = useState(initialData?.facilities?.join(', ') || 'Medali Finisher, Jersey Finisher, BIB dengan Timing Chip, Water Station, Asuransi');
  const [rules, setRules] = useState(initialData?.rules || 'Peserta wajib dalam keadaan sehat. Wajib mematuhi cut-off time.');
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>(initialData?.faqs || []);

  // Form States - Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catQuota, setCatQuota] = useState('');
  const [catDistance, setCatDistance] = useState('');
  const [catCutoff, setCatCutoff] = useState('');
  const [catEarlyBirdPrice, setCatEarlyBirdPrice] = useState('');
  const [catEarlyBirdEndDate, setCatEarlyBirdEndDate] = useState('');

  // Form States - Add-ons (Step 4)
  const [addons, setAddons] = useState<any[]>(initialData?.addons || []);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonDesc, setAddonDesc] = useState('');

  const handleAddFaq = () => {
    if (faqQ && faqA) {
      setFaqs([...faqs, { question: faqQ, answer: faqA }]);
      setFaqQ('');
      setFaqA('');
    }
  };

  const handleAddCategory = () => {
    if (catName && catPrice && catQuota && catDistance) {
      setCategories([...categories, {
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: `Kategori ${catName}`,
        distance: catDistance,
        elevation: '-',
        price: Number(catPrice),
        earlyBirdPrice: catEarlyBirdPrice ? Number(catEarlyBirdPrice) : undefined,
        earlyBirdEndDate: catEarlyBirdEndDate ? new Date(catEarlyBirdEndDate).toISOString() : undefined,
        quota: Number(catQuota),
        startTime: '05:30 WIB',
        cutoffTime: catCutoff || '4 Jam',
        genderRestriction: 'NONE',
        minimumAge: 12,
        status: 'ACTIVE'
      }]);
      setCatName('');
      setCatPrice('');
      setCatQuota('');
      setCatDistance('');
      setCatCutoff('');
      setCatEarlyBirdPrice('');
      setCatEarlyBirdEndDate('');
    }
  };

  const handleAddAddon = () => {
    if (addonName && addonPrice) {
      setAddons([...addons, {
        id: 'addon_' + Date.now(),
        name: addonName,
        price: Number(addonPrice),
        description: addonDesc
      }]);
      setAddonName('');
      setAddonPrice('');
      setAddonDesc('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && categories.length === 0) {
      addNotification('error', 'Validasi Gagal', 'Mohon tambahkan setidaknya satu kategori lomba.');
      return;
    }

    setLoading(true);
    try {
      const eventPayload = {
        name: eventName,
        slug: eventSlug || eventName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: eventDesc,
        banner: eventBanner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=1600&q=80',
        thumbnail: eventBanner || 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=600&q=80',
        location: eventLocation,
        address: eventLocation,
        startDate: new Date(eventStartDate).toISOString(),
        endDate: new Date(eventStartDate).toISOString(),
        registrationStart: new Date(eventRegStart || Date.now()).toISOString(),
        registrationEnd: new Date(eventRegEnd).toISOString(),
        status: initialData ? initialData.status : 'REGISTRATION_OPEN',
        organizerId: user.uid,
        organizerName: user.displayName || 'RacePro Admin',
        featured: true,
        facilities: facilities.split(',').map(f => f.trim()).filter(f => f),
        schedule: initialData?.schedule || [{ time: '05:00 WIB', title: 'Flag-off', description: 'Pelepasan peserta' }],
        rules: rules,
        faqs: faqs,
        addons: addons,
        updatedBy: user.uid
      };

      if (initialData) {
        await updateEvent(initialData.id, eventPayload, user.uid, user.email || '');
        addNotification('success', 'Event Diperbarui', `Event ${eventName} telah berhasil diperbarui.`);
      } else {
        const newEv = await createEvent({
          ...eventPayload,
          createdBy: user.uid
        } as any, user.uid, user.email || '');

        // Create all categories
        for (const cat of categories) {
          await createCategory({
            ...cat,
            eventId: newEv.id,
          }, user.uid, user.email || '');
        }
        addNotification('success', 'Event Berhasil Dibuat', `Event ${eventName} telah diterbitkan dengan ${categories.length} kategori.`);
      }

      onSuccess();
    } catch (err: any) {
      addNotification('error', 'Gagal Memproses Event', err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </span>
          {initialData ? 'Edit Event Lomba' : 'Buat Event Lomba Baru'}
        </h3>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4].filter(i => !(initialData && (i === 3 || i === 4))).map(i => (
            <React.Fragment key={i}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shrink-0 ${step === i ? 'bg-orange-500 text-white' : step > i ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {step > i ? '✓' : i}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${step === i ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {i === 1 ? 'Info Dasar' : i === 2 ? 'Fasilitas & Aturan' : i === 3 ? 'Kategori Tiket' : 'Add-Ons'}
              </span>
              {(i < 4 && !(initialData && i === 2)) && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 min-w-[20px]" />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={(initialData && step === 2) || step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }} className="space-y-6 text-sm">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4 md:col-span-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Nama Event *</label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Contoh: Rinjani Ultra Trail 2026"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Waktu Pelaksanaan *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Lokasi Event *</label>
                <input
                  type="text"
                  required
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Nama Tempat / Kota"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Awal Pendaftaran *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventRegStart}
                  onChange={(e) => setEventRegStart(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Tutup Pendaftaran *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventRegEnd}
                  onChange={(e) => setEventRegEnd(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">URL Banner Event</label>
                  <input
                    type="url"
                    value={eventBanner}
                    onChange={(e) => setEventBanner(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Deskripsi Lengkap *</label>
                  <textarea
                    rows={4}
                    required
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Jelaskan detail event lomba ini..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Facilities & Rules */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Fasilitas Peserta (Pisahkan dengan koma) *</label>
                <textarea
                  rows={2}
                  required
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Aturan Lomba (Rules) *</label>
                <textarea
                  rows={3}
                  required
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <label className="block text-slate-900 dark:text-white font-black uppercase mb-4">FAQ (Pertanyaan Umum)</label>
                {faqs.map((f, i) => (
                  <div key={i} className="mb-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mb-1">Q: {f.question}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">A: {f.answer}</p>
                    </div>
                    <button type="button" onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold">HAPUS</button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <input
                    type="text"
                    value={faqQ}
                    onChange={(e) => setFaqQ(e.target.value)}
                    placeholder="Pertanyaan (Cth: Ada Water Station?)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={faqA}
                      onChange={(e) => setFaqA(e.target.value)}
                      placeholder="Jawaban"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white outline-none"
                    />
                    <button type="button" onClick={handleAddFaq} className="px-4 bg-orange-100 text-orange-600 rounded-xl font-bold hover:bg-orange-200 shrink-0">
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Categories */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-2xl p-5 mb-6">
                <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Kategori Tersimpan ({categories.length})</h4>
                {categories.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-xs text-center py-4">Belum ada kategori. Tambahkan di bawah.</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{c.name} ({c.distance})</span>
                          <span className="text-xs text-slate-500">
                            Rp {c.price.toLocaleString('id-ID')} | Kuota: {c.quota} 
                            {c.earlyBirdPrice && ` | EB: Rp ${c.earlyBirdPrice.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                        <button type="button" onClick={() => setCategories(categories.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Tambah Kategori Lomba</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nama Kategori</label>
                    <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Cth: 10K Open" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Jarak</label>
                    <input type="text" value={catDistance} onChange={e => setCatDistance(e.target.value)} placeholder="Cth: 10 KM" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Harga (Rp)</label>
                    <input type="number" value={catPrice} onChange={e => setCatPrice(e.target.value)} placeholder="Cth: 250000" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Kuota Maksimal</label>
                    <input type="number" value={catQuota} onChange={e => setCatQuota(e.target.value)} placeholder="Cth: 500" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Batas Waktu (Cut-Off Time)</label>
                    <input type="text" value={catCutoff} onChange={e => setCatCutoff(e.target.value)} placeholder="Cth: 3 Jam" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Harga Early Bird (Opsional)</label>
                    <input type="number" value={catEarlyBirdPrice} onChange={e => setCatEarlyBirdPrice(e.target.value)} placeholder="Cth: 200000" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Batas Waktu Early Bird (Opsional)</label>
                    <input type="datetime-local" value={catEarlyBirdEndDate} onChange={e => setCatEarlyBirdEndDate(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={handleAddCategory} className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold uppercase tracking-wider rounded-xl p-3 hover:bg-slate-800 transition-colors">
                      Simpan Kategori
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Add-Ons (Merchandise) */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-sm">Daftar Merchandise / Add-Ons</h4>
                {addons.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium">Belum ada Add-Ons. (Misal: Jersey Tambahan, Topi Finisher)</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addons.map((addon, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{addon.name}</span>
                          <span className="text-xs text-slate-500">Rp {addon.price.toLocaleString('id-ID')} | {addon.description}</span>
                        </div>
                        <button type="button" onClick={() => setAddons(addons.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Tambah Add-On Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nama Item</label>
                    <input type="text" value={addonName} onChange={e => setAddonName(e.target.value)} placeholder="Cth: Topi Eksklusif Event" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Harga (Rp)</label>
                    <input type="number" value={addonPrice} onChange={e => setAddonPrice(e.target.value)} placeholder="Cth: 150000" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Deskripsi Singkat</label>
                    <input type="text" value={addonDesc} onChange={e => setAddonDesc(e.target.value)} placeholder="Opsional" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="button" onClick={handleAddAddon} className="w-full md:w-auto bg-slate-900 dark:bg-slate-700 text-white font-bold uppercase tracking-wider rounded-xl p-3 hover:bg-slate-800 transition-colors">
                      Simpan Add-On
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-200 dark:border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Kembali
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold uppercase text-xs"
              >
                Batal
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-wider shadow-lg transition-all ${
                loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30'
              }`}
            >
              {loading ? 'Memproses...' : ((initialData && step === 2) || step === 4) ? (initialData ? 'Simpan Perubahan' : 'Terbitkan Event') : 'Selanjutnya'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
