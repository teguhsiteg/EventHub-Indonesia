import React, { useState } from 'react';
import { createEvent, updateEvent, createCategory } from '../../services/eventService';
import { UserProfile, EventItem } from '../../types';
import { EVENT_CATEGORIES } from '../../utils/constants';

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
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<string[]>([]);

  React.useEffect(() => {
    if (initialData) {
      import('../../services/eventService').then(({ getEventCategories }) => {
        getEventCategories(initialData.id).then(cats => {
          setCategories(cats);
        }).catch(err => console.error(err));
      });
    }
  }, [initialData]);

  // Form States - Basic Info
  const [eventName, setEventName] = useState(initialData?.name || '');
  const [eventSlug, setEventSlug] = useState(initialData?.slug || '');
  const [eventDesc, setEventDesc] = useState(initialData?.description || '');
  const [eventBanner, setEventBanner] = useState(initialData?.banner || '');
  const [eventCategory, setEventCategory] = useState(initialData?.category || '');
  const [eventLocation, setEventLocation] = useState(initialData?.location || '');
  const [eventStartDate, setEventStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '');
  const [eventRegStart, setEventRegStart] = useState(initialData?.registrationStart ? new Date(initialData.registrationStart).toISOString().slice(0, 16) : '');
  const [eventRegEnd, setEventRegEnd] = useState(initialData?.registrationEnd ? new Date(initialData.registrationEnd).toISOString().slice(0, 16) : '');
  
  // Form States - Organizer
  const [organizerName, setOrganizerName] = useState(initialData?.organizerName || '');
  const [organizerWebsite, setOrganizerWebsite] = useState(initialData?.organizerWebsite || '');
  const [organizerSocialMedia, setOrganizerSocialMedia] = useState(initialData?.organizerSocialMedia || '');

  // Form States - Facilities & Rules
  const [facilities, setFacilities] = useState(initialData?.facilities?.join(', ') || 'Medali Finisher, Jersey Finisher, BIB dengan Timing Chip, Water Station, Asuransi');
  const [rules, setRules] = useState(initialData?.rules || 'Peserta wajib dalam keadaan sehat. Wajib mematuhi cut-off time.');
  
  // Extra visual infos
  const [jerseySizeChartUrl, setJerseySizeChartUrl] = useState(initialData?.jerseySizeChartUrl || '');
  const [jacketSizeChartUrl, setJacketSizeChartUrl] = useState(initialData?.jacketSizeChartUrl || '');
  const [medalImageUrl, setMedalImageUrl] = useState(initialData?.medalImageUrl || '');

  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>(initialData?.faqs || []);

  const [schedules, setSchedules] = useState<{time: string, title: string, description: string}[]>(initialData?.schedule || []);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDesc, setScheduleDesc] = useState('');

  // Form States - Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [catName, setCatName] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catQuota, setCatQuota] = useState('');
  const [catDistance, setCatDistance] = useState('');
  const [catCutoff, setCatCutoff] = useState('');
  const [catEarlyBirdPrice, setCatEarlyBirdPrice] = useState('');
  const [catEarlyBirdEndDate, setCatEarlyBirdEndDate] = useState('');
  const [catEarlyBirdQuota, setCatEarlyBirdQuota] = useState('');

  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  // Form States - Add-ons (Step 4)
  const [addons, setAddons] = useState<any[]>(initialData?.addons || []);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonDesc, setAddonDesc] = useState('');

  // Form States - Vouchers and Promos (Step 5)
  const [specialVouchers, setSpecialVouchers] = useState<{code: string, categoryId: string}[]>(initialData?.specialVouchers || []);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherCatId, setVoucherCatId] = useState('');
  const [enableVoucherCode, setEnableVoucherCode] = useState(initialData?.enableVoucherCode || false);

  const [promoCodes, setPromoCodes] = useState<{code: string, discountType: 'PERCENTAGE'|'FIXED', discountValue: number}[]>(initialData?.promoCodes || []);
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState<'PERCENTAGE'|'FIXED'>('PERCENTAGE');
  const [promoValue, setPromoValue] = useState('');

  // Form States - Payment Routing & Hotel Bundles (Step 6)
  const [paymentType, setPaymentType] = useState<'DIRECT_EO' | 'WEB'>(initialData?.paymentType || 'WEB');
  const [webFeeBearer, setWebFeeBearer] = useState<'BUYER' | 'EO'>(initialData?.webFeeBearer || 'BUYER');
  const [webFeeAmount, setWebFeeAmount] = useState<number>(initialData?.webFeeAmount || 5000);
  const [eoBankName, setEoBankName] = useState(initialData?.eoBankName || '');
  const [eoBankAccountName, setEoBankAccountName] = useState(initialData?.eoBankAccountName || '');
  const [eoBankAccountNumber, setEoBankAccountNumber] = useState(initialData?.eoBankAccountNumber || '');
  const [eoNpwp, setEoNpwp] = useState(initialData?.eoNpwp || '');

  const [hotelBundles, setHotelBundles] = useState<any[]>(initialData?.hotelBundles || []);
  const [hotelName, setHotelName] = useState('');
  const [hotelPrice, setHotelPrice] = useState('');
  const [hotelQuota, setHotelQuota] = useState('');
  const [hotelDesc, setHotelDesc] = useState('');

  const handleAddVoucher = () => {
    if (voucherCode && voucherCatId) {
      setSpecialVouchers([...specialVouchers, { code: voucherCode.toUpperCase(), categoryId: voucherCatId }]);
      setVoucherCode('');
      setVoucherCatId('');
    }
  };

  const handleAddPromo = () => {
    if (promoCode && promoValue) {
      setPromoCodes([...promoCodes, { code: promoCode.toUpperCase(), discountType: promoType, discountValue: Number(promoValue) }]);
      setPromoCode('');
      setPromoValue('');
    }
  };

  const handleAddFaq = () => {
    if (faqQ && faqA) {
      setFaqs([...faqs, { question: faqQ, answer: faqA }]);
      setFaqQ('');
      setFaqA('');
    }
  };

  const handleAddSchedule = () => {
    if (scheduleTime && scheduleTitle) {
      setSchedules([...schedules, { time: scheduleTime, title: scheduleTitle, description: scheduleDesc }]);
      setScheduleTime('');
      setScheduleTitle('');
      setScheduleDesc('');
    }
  };

  const handleAddCategory = () => {
    if (catName && catPrice && catQuota && catDistance) {
      const newCat = {
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: `Kategori ${catName}`,
        distance: catDistance,
        elevation: '-',
        price: Number(catPrice),
        ...(catEarlyBirdPrice ? { earlyBirdPrice: Number(catEarlyBirdPrice) } : {}),
        ...(catEarlyBirdEndDate ? { earlyBirdEndDate: new Date(catEarlyBirdEndDate).toISOString() } : {}),
        ...(catEarlyBirdQuota ? { earlyBirdQuota: Number(catEarlyBirdQuota) } : {}),
        quota: Number(catQuota),
        startTime: '05:30 WIB',
        cutoffTime: catCutoff || '4 Jam',
        genderRestriction: 'NONE',
        minimumAge: 12,
        status: 'ACTIVE'
      };
      
      if (editingCategoryIndex !== null) {
        const updated = [...categories];
        // Preserve id if editing existing category
        if (updated[editingCategoryIndex].id) {
          (newCat as any).id = updated[editingCategoryIndex].id;
        }
        updated[editingCategoryIndex] = newCat;
        setCategories(updated);
        setEditingCategoryIndex(null);
      } else {
        setCategories([...categories, newCat]);
      }
      
      setCatName('');
      setCatPrice('');
      setCatQuota('');
      setCatDistance('');
      setCatCutoff('');
      setCatEarlyBirdPrice('');
      setCatEarlyBirdEndDate('');
      setCatEarlyBirdQuota('');
    }
  };

  const handleEditCategory = (index: number) => {
    const c = categories[index];
    setCatName(c.name || '');
    setCatPrice(c.price?.toString() || '');
    setCatQuota(c.quota?.toString() || '');
    setCatDistance(c.distance || '');
    setCatCutoff(c.cutoffTime === '4 Jam' ? '' : (c.cutoffTime || ''));
    setCatEarlyBirdPrice(c.earlyBirdPrice?.toString() || '');
    if (c.earlyBirdEndDate) {
      setCatEarlyBirdEndDate(new Date(c.earlyBirdEndDate).toISOString().slice(0, 16));
    } else {
      setCatEarlyBirdEndDate('');
    }
    setCatEarlyBirdQuota(c.earlyBirdQuota?.toString() || '');
    setEditingCategoryIndex(index);
  };


  const handleRemoveCategory = (index: number) => {
    const cat = categories[index];
    if (cat.id) {
      setDeletedCategoryIds([...deletedCategoryIds, cat.id]);
    }
    setCategories(categories.filter((_, idx) => idx !== index));
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

  const handleAddHotel = () => {
    if (hotelName && hotelPrice && hotelQuota) {
      setHotelBundles([...hotelBundles, {
        id: 'hotel_' + Date.now(),
        name: hotelName,
        price: Number(hotelPrice),
        quota: Number(hotelQuota),
        registeredCount: 0,
        description: hotelDesc
      }]);
      setHotelName('');
      setHotelPrice('');
      setHotelQuota('');
      setHotelDesc('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && categories.length === 0) {
      addNotification('error', 'Validasi Gagal', 'Mohon tambahkan setidaknya satu kategori lomba.');
      return;
    }
    
    if (paymentType === 'DIRECT_EO') {
      if (!eoBankName || !eoBankAccountNumber || !eoBankAccountName || !eoNpwp) {
        addNotification('error', 'Validasi Gagal', 'Mohon lengkapi Detail Rekening EO & NPWP untuk metode pembayaran langsung.');
        return;
      }
      if (!webFeeAmount) {
        addNotification('error', 'Validasi Gagal', 'Mohon isi Nominal Fee Web.');
        return;
      }
    }

    setLoading(true);
    try {
      const eventPayload = {
        name: eventName,
        slug: eventSlug || eventName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: eventDesc,
        category: eventCategory,
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
        organizerName: organizerName || user.displayName || 'EventHub by Guwigo Admin',
        organizerWebsite: organizerWebsite,
        organizerSocialMedia: organizerSocialMedia,
        featured: true,
        facilities: facilities.split(',').map(f => f.trim()).filter(f => f),
        jerseySizeChartUrl: jerseySizeChartUrl || null,
        jacketSizeChartUrl: jacketSizeChartUrl || null,
        medalImageUrl: medalImageUrl || null,
        schedule: schedules,
        rules: rules,
        faqs: faqs,
        addons: addons,
        enableVoucherCode: enableVoucherCode,
        specialVouchers: specialVouchers,
        promoCodes: promoCodes,
        paymentType: paymentType,
        webFeeBearer: webFeeBearer,
        webFeeAmount: webFeeAmount,
        eoBankName: paymentType === 'DIRECT_EO' ? eoBankName : '',
        eoBankAccountName: paymentType === 'DIRECT_EO' ? eoBankAccountName : '',
        eoBankAccountNumber: paymentType === 'DIRECT_EO' ? eoBankAccountNumber : '',
        eoNpwp: paymentType === 'DIRECT_EO' ? eoNpwp : '',
        hotelBundles: hotelBundles,
        updatedBy: user.uid
      };

      if (initialData) {
        await updateEvent(initialData.id, eventPayload, user.uid, user.email || '');
        
        // Update or Create categories
        const { updateCategory, deleteCategory } = await import('../../services/eventService');
        for (const cat of categories) {
          if (cat.id) {
            await updateCategory(cat.id, cat, user.uid, user.email || '');
          } else {
            await createCategory({
              ...cat,
              eventId: initialData.id,
            }, user.uid, user.email || '');
          }
        }

        // Process deletions
        for (const catId of deletedCategoryIds) {
          if (deleteCategory) await deleteCategory(catId, user.uid, user.email || '');
        }
        
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-red-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative my-auto">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-600 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </span>
          {initialData ? 'Edit Event Lomba' : 'Buat Event Lomba Baru'}
        </h3>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <React.Fragment key={i}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shrink-0 ${step === i ? 'bg-red-500 text-white' : step > i ? 'bg-red-200 text-red-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500 dark:text-slate-400'}`}>
                {step > i ? '✓' : i}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${step === i ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-500 dark:text-slate-400'}`}>
                {i === 1 ? 'Info' : i === 2 ? 'Aturan' : i === 3 ? 'Kategori' : i === 4 ? 'Add-Ons' : i === 5 ? 'Voucher' : 'Hotel & Pay'}
              </span>
              {i < 6 && <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 min-w-[20px]" />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={step === 6 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }} className="space-y-6 text-sm">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Nama Event *</label>
                    <input
                      type="text"
                      required
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Contoh: Rinjani Ultra Trail 2026"
                      className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Jenis Event *</label>
                    <select
                      required
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                      className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none appearance-none"
                    >
                      <option value="">Pilih Jenis Event...</option>
                      {EVENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>


              <div>
                <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Waktu Pelaksanaan *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Lokasi Event *</label>
                <input
                  type="text"
                  required
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Nama Tempat / Kota"
                  className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Awal Pendaftaran *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventRegStart}
                  onChange={(e) => setEventRegStart(e.target.value)}
                  className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Tutup Pendaftaran *</label>
                <input
                  type="datetime-local"
                  required
                  value={eventRegEnd}
                  onChange={(e) => setEventRegEnd(e.target.value)}
                  className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">URL Banner Event</label>
                  <input
                    type="url"
                    value={eventBanner}
                    onChange={(e) => setEventBanner(e.target.value)}
                    placeholder="https://..."
                    className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Deskripsi Lengkap *</label>
                  <textarea
                    rows={4}
                    required
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    placeholder="Jelaskan detail event lomba ini..."
                    className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase mb-4">Informasi Penyelenggara (Opsional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Nama Organizer</label>
                      <input
                        type="text"
                        value={organizerName}
                        onChange={(e) => setOrganizerName(e.target.value)}
                        placeholder="Contoh: RunID, LariYuk"
                        className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Website Organizer</label>
                      <input
                        type="url"
                        value={organizerWebsite}
                        onChange={(e) => setOrganizerWebsite(e.target.value)}
                        placeholder="https://..."
                        className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Sosial Media</label>
                      <input
                        type="url"
                        value={organizerSocialMedia}
                        onChange={(e) => setOrganizerSocialMedia(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Facilities & Rules */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Fasilitas Peserta (Pisahkan dengan koma) *</label>
                <textarea
                  rows={2}
                  required
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">Aturan Lomba (Rules) *</label>
                <textarea
                  rows={3}
                  required
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">URL Size Chart Jersey (Opsional)</label>
                  <input
                    type="url"
                    value={jerseySizeChartUrl}
                    onChange={(e) => setJerseySizeChartUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">URL Size Chart Jaket (Opsional)</label>
                  <input
                    type="url"
                    value={jacketSizeChartUrl}
                    onChange={(e) => setJacketSizeChartUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase mb-1.5 text-xs">URL Gambar Medali (Opsional)</label>
                  <input
                    type="url"
                    value={medalImageUrl}
                    onChange={(e) => setMedalImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-white font-medium focus:border-red-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className=" border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <label className="block text-slate-900 dark:text-white font-black uppercase mb-4">Susunan Acara (Opsional)</label>
                {schedules.map((s, i) => (
                  <div key={i} className="mb-3 p-3 bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mb-1">{s.time} - {s.title}</p>
                      <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-[10px]">{s.description}</p>
                    </div>
                    <button type="button" onClick={() => setSchedules(schedules.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold">HAPUS</button>
                  </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    placeholder="Waktu (Cth: 05:00 WIB)"
                    className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white outline-none text-xs"
                  />
                  <input
                    type="text"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="Judul (Cth: Flag-off)"
                    className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white outline-none text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={scheduleDesc}
                      onChange={(e) => setScheduleDesc(e.target.value)}
                      placeholder="Deskripsi"
                      className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white outline-none text-xs"
                    />
                    <button type="button" onClick={handleAddSchedule} className="px-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 shrink-0 text-xs">
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              <div className=" border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <label className="block text-slate-900 dark:text-white font-black uppercase mb-4">FAQ (Pertanyaan Umum)</label>
                {faqs.map((f, i) => (
                  <div key={i} className="mb-3 p-3 bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mb-1">Q: {f.question}</p>
                      <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs">A: {f.answer}</p>
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
                    className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={faqA}
                      onChange={(e) => setFaqA(e.target.value)}
                      placeholder="Jawaban"
                      className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white outline-none"
                    />
                    <button type="button" onClick={handleAddFaq} className="px-4 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 shrink-0">
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
              
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 mb-6">
                <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Kategori Tersimpan ({categories.length})</h4>
                {categories.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs text-center py-4">Belum ada kategori. Tambahkan di bawah.</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-red-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{c.name} ({c.distance})</span>
                          <span className="text-xs text-slate-500">
                            Rp {c.price.toLocaleString('id-ID')} | Kuota: {c.quota} 
                            {c.earlyBirdPrice && ` | EB: Rp ${c.earlyBirdPrice.toLocaleString('id-ID')}${c.earlyBirdQuota ? ` (Kuota: ${c.earlyBirdQuota})` : ''}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => handleEditCategory(i)} className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100">
                            Edit
                          </button>
                          <button type="button" onClick={() => setCategories(categories.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100">
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className=" border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">
                  {editingCategoryIndex !== null ? 'Edit Kategori Lomba' : 'Tambah Kategori Lomba'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nama Kategori</label>
                    <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Cth: 10K Open" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Jarak</label>
                    <input type="text" value={catDistance} onChange={e => setCatDistance(e.target.value)} placeholder="Cth: 10 KM" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Harga (Rp)</label>
                    <input type="number" value={catPrice} onChange={e => setCatPrice(e.target.value)} placeholder="Cth: 250000" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Kuota Maksimal</label>
                    <input type="number" value={catQuota} onChange={e => setCatQuota(e.target.value)} placeholder="Cth: 500" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Batas Waktu (Cut-Off Time)</label>
                    <input type="text" value={catCutoff} onChange={e => setCatCutoff(e.target.value)} placeholder="Cth: 3 Jam" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Harga Early Bird (Opsional)</label>
                    <input type="number" value={catEarlyBirdPrice} onChange={e => setCatEarlyBirdPrice(e.target.value)} placeholder="Cth: 200000" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Batas Waktu Early Bird (Opsional)</label>
                    <input type="datetime-local" value={catEarlyBirdEndDate} onChange={e => setCatEarlyBirdEndDate(e.target.value)} className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Batas Kuota Early Bird (Opsional)</label>
                    <input type="number" value={catEarlyBirdQuota} onChange={e => setCatEarlyBirdQuota(e.target.value)} placeholder="Cth: 50" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div className="flex items-end gap-2 sm:col-span-2">
                    <button type="button" onClick={handleAddCategory} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded-xl p-3 transition-colors shadow-lg shadow-red-500/25">
                      {editingCategoryIndex !== null ? 'Simpan Perubahan' : 'Simpan Kategori'}
                    </button>
                    {editingCategoryIndex !== null && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingCategoryIndex(null);
                          setCatName('');
                          setCatPrice('');
                          setCatQuota('');
                          setCatDistance('');
                          setCatCutoff('');
                          setCatEarlyBirdPrice('');
                          setCatEarlyBirdEndDate('');
                          setCatEarlyBirdQuota('');
                        }} 
                        className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider rounded-xl p-3 hover:bg-slate-300 transition-colors"
                      >
                        Batal
                      </button>
                    )}
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
                  <div className="text-center p-8 bg-slate-50 dark:bg-red-950/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium">Belum ada Add-Ons. (Misal: Jersey Tambahan, Topi Finisher)</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addons.map((addon, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-red-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
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

              <div className=" border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Tambah Add-On Baru</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nama Item</label>
                    <input type="text" value={addonName} onChange={e => setAddonName(e.target.value)} placeholder="Cth: Topi Eksklusif Event" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Harga (Rp)</label>
                    <input type="number" value={addonPrice} onChange={e => setAddonPrice(e.target.value)} placeholder="Cth: 150000" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Deskripsi Singkat</label>
                    <input type="text" value={addonDesc} onChange={e => setAddonDesc(e.target.value)} placeholder="Opsional" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="button" onClick={handleAddAddon} className="w-full md:w-auto bg-white dark:bg-red-950 dark:bg-slate-700 text-white font-bold uppercase tracking-wider rounded-xl p-3 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                      Simpan Add-On
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Vouchers & Promos */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* VOUCHER KHUSUS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase text-sm">Kode Voucher (Buka Kategori Sold Out)</h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400">
                    <input type="checkbox" checked={enableVoucherCode} onChange={(e) => setEnableVoucherCode(e.target.checked)} className="rounded text-red-500" />
                    Tampilkan Selalu (Bypass Sold Out)
                  </label>
                </div>
                {specialVouchers.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 dark:bg-red-950/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium text-xs">Belum ada kode voucher khusus ditambahkan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {specialVouchers.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-red-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{v.code}</span>
                          <span className="text-xs text-slate-500">Membuka Kategori ID: {v.categoryId}</span>
                        </div>
                        <button type="button" onClick={() => setSpecialVouchers(specialVouchers.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mt-4">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Tambah Kode Voucher</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Kode Voucher</label>
                      <input type="text" value={voucherCode} onChange={e => setVoucherCode(e.target.value)} placeholder="Cth: VIP-10K" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none uppercase" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Untuk Kategori</label>
                      <select value={voucherCatId} onChange={e => setVoucherCatId(e.target.value)} className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none">
                        <option value="">Pilih Kategori...</option>
                        {categories.map((c, i) => (
                          <option key={i} value={c.id || c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="button" onClick={handleAddVoucher} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider rounded-xl p-3 hover:bg-slate-300 transition-colors">
                        Tambah Voucher
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* KODE PROMO */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-sm">Kode Promo (Diskon)</h4>
                {promoCodes.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 dark:bg-red-950/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium text-xs">Belum ada kode promo ditambahkan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {promoCodes.map((p, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-red-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{p.code}</span>
                          <span className="text-xs text-slate-500">Diskon {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `Rp ${p.discountValue.toLocaleString('id-ID')}`}</span>
                        </div>
                        <button type="button" onClick={() => setPromoCodes(promoCodes.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mt-4">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Tambah Kode Promo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Kode Promo</label>
                      <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Cth: MERDEKA20" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none uppercase" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Tipe Diskon</label>
                      <select value={promoType} onChange={e => setPromoType(e.target.value as 'PERCENTAGE'|'FIXED')} className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none">
                        <option value="PERCENTAGE">Persentase (%)</option>
                        <option value="FIXED">Nominal Tetap (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nilai Diskon</label>
                      <input type="number" value={promoValue} onChange={e => setPromoValue(e.target.value)} placeholder="Cth: 20 atau 50000" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                    </div>
                    <div className="md:col-span-3 flex justify-end mt-2">
                      <button type="button" onClick={handleAddPromo} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider rounded-xl p-3 hover:bg-slate-300 transition-colors">
                        Tambah Promo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Hotel Bundles & Payment Routing */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-sm">Pengaturan Pembayaran</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                  <div>
                    <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Metode Pembayaran</label>
                    <select value={paymentType} onChange={e => setPaymentType(e.target.value as 'DIRECT_EO' | 'WEB')} className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none">
                      <option value="WEB">Via Web (Sistem)</option>
                      <option value="DIRECT_EO">Langsung ke EO (Transfer Manual)</option>
                    </select>
                  </div>
                  {paymentType === 'WEB' ? (
                    <>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Biaya Layanan Web Ditanggung Oleh</label>
                        <select value={webFeeBearer} onChange={e => setWebFeeBearer(e.target.value as 'BUYER' | 'EO')} className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white">
                          <option value="BUYER">Pembeli (Peserta)</option>
                          <option value="EO">Penyelenggara (EO)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nominal Biaya Layanan (Rp)</label>
                        <input type="number" value={webFeeAmount} onChange={e => setWebFeeAmount(Number(e.target.value))} className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                        <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs mb-3">Detail Rekening EO & Fee Web</h5>
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nama Bank *</label>
                        <input type="text" value={eoBankName} onChange={e => setEoBankName(e.target.value)} placeholder="Cth: BCA" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" required={paymentType === 'DIRECT_EO'} />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nomor Rekening *</label>
                        <input type="text" value={eoBankAccountNumber} onChange={e => setEoBankAccountNumber(e.target.value)} placeholder="Cth: 1234567890" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" required={paymentType === 'DIRECT_EO'} />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nama Pemilik Rekening *</label>
                        <input type="text" value={eoBankAccountName} onChange={e => setEoBankAccountName(e.target.value)} placeholder="Cth: PT Event Organizer" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" required={paymentType === 'DIRECT_EO'} />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">NPWP *</label>
                        <input type="text" value={eoNpwp} onChange={e => setEoNpwp(e.target.value)} placeholder="Cth: 12.345.678.9-012.000" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" required={paymentType === 'DIRECT_EO'} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Fee untuk Web (Dipotong dari EO) Rp *</label>
                        <input type="number" value={webFeeAmount} onChange={e => setWebFeeAmount(Number(e.target.value))} placeholder="Cth: 5000" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none text-slate-900 dark:text-white" required={paymentType === 'DIRECT_EO'} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-sm">Bundling Hotel (Opsional)</h4>
                {hotelBundles.length === 0 ? (
                  <div className="text-center p-6 bg-slate-50 dark:bg-red-950/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 font-medium text-xs">Belum ada paket hotel ditambahkan.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hotelBundles.map((hotel, i) => (
                      <div key={i} className="flex items-center justify-between bg-white dark:bg-red-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{hotel.name}</span>
                          <span className="text-xs text-slate-500">Rp {hotel.price.toLocaleString('id-ID')} | Kuota: {hotel.quota} kamar</span>
                        </div>
                        <button type="button" onClick={() => setHotelBundles(hotelBundles.filter((_, idx) => idx !== i))} className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-100">
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mt-4">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase mb-4 text-xs">Tambah Paket Hotel</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Nama Hotel / Paket</label>
                      <input type="text" value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="Cth: Hotel Aston - 1 Malam" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Harga (Rp)</label>
                      <input type="number" value={hotelPrice} onChange={e => setHotelPrice(e.target.value)} placeholder="Cth: 500000" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Kuota Kamar</label>
                      <input type="number" value={hotelQuota} onChange={e => setHotelQuota(e.target.value)} placeholder="Cth: 20" className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-500 font-bold uppercase mb-1 text-[10px]">Deskripsi (Opsional)</label>
                      <input type="text" value={hotelDesc} onChange={e => setHotelDesc(e.target.value)} placeholder="Fasilitas kamar, jarak ke venue, dll." className="w-full bg-white dark:bg-red-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none" />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="button" onClick={handleAddHotel} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider rounded-xl p-3 hover:bg-slate-300 transition-colors">
                        Tambah Hotel
                      </button>
                    </div>
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
                className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-600 dark:text-slate-300 font-bold uppercase text-xs hover:bg-slate-200 dark:hover:bg-slate-200 dark:bg-slate-700"
              >
                Kembali
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 font-bold uppercase text-xs"
              >
                Batal
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-wider shadow-lg transition-all ${
                loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              }`}
            >
              {loading ? 'Memproses...' : ((initialData && step === 2) || step === 6) ? (initialData ? 'Simpan Perubahan' : 'Terbitkan Event') : 'Selanjutnya'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
