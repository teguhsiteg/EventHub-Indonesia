import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventBySlug, getEventCategories } from '../services/eventService';
import { createRegistration } from '../services/registrationService';
import { EventItem, EventCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Countdown } from '../components/common/Countdown';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = Info, 1 = Kategori, 2 = Form, 3 = Pembayaran
  const [cartItems, setCartItems] = useState<{ categoryId: string; quantity: number; price: number; earlyBird: boolean; name: string }[]>([]);
  const [formsData, setFormsData] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<{addonId: string, quantity: number, price: number, name: string}[]>([]);

  const { user } = useAuth();
  const { addNotification } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      const ev = await getEventBySlug(slug);
      if (ev) {
        setEvent(ev);
        const cats = await getEventCategories(ev.id);
        setCategories(cats);
        if (cats.length > 0) {}
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);



  const handleCartUpdate = (categoryId: string, name: string, quantity: number, max: number, price: number, earlyBird: boolean) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.categoryId === categoryId);
      let newCart = [...prev];
      if (idx >= 0) {
        if (quantity === 0) newCart.splice(idx, 1);
        else newCart[idx] = { ...newCart[idx], quantity: Math.min(quantity, max) };
      } else {
        if (quantity > 0) newCart.push({ categoryId, name, quantity: Math.min(quantity, max), price, earlyBird });
      }
      return newCart;
    });
  };

  const handleStartRegistration = () => {
    if (!user) {
      addNotification('warning', 'Autentikasi Diperlukan', 'Silakan masuk atau buat akun peserta terlebih dahulu untuk mendaftar lomba.');
      navigate('/login', { state: { from: `/events/${slug}` } });
      return;
    }
    
    if (cartItems.length === 0) {
      addNotification('warning', 'Keranjang Kosong', 'Silakan pilih setidaknya 1 tiket kategori lomba.');
      return;
    }

    // Generate formsData based on cartItems
    const newForms: any[] = [];
    cartItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        newForms.push({
          categoryId: item.categoryId,
          categoryName: item.name,
          fullName: user.displayName || '', 
          nik: '', 
          phone: user.phoneNumber || '', 
          email: user.email || '', 
          birthDate: '1998-05-12', 
          gender: 'MALE', 
          address: '', city: '', province: '', bloodType: 'O+', 
          emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: 'Orang Tua / Pasangan', jerseySize: 'L'
        });
      }
    });
    setFormsData(newForms);
    setCheckoutStep(2);
  };

  const handleFormChange = (index: number, field: string, value: string) => {
    setFormsData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event || cartItems.length === 0) return;

    // Validate NIK
    for (let i = 0; i < formsData.length; i++) {
      if (!formsData[i].nik || formsData[i].nik.length < 16) {
        addNotification('error', 'Validasi Gagal', `NIK Peserta ${i + 1} (${formsData[i].categoryName}) harus terdiri dari 16 digit.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const result = await createRegistration(user.uid, event.id, cartItems, formsData, selectedAddons);
      addNotification('success', 'Pendaftaran Berhasil!', `Nomor Registrasi: ${result.registration.registrationNumber}. Harap selesaikan pembayaran.`);
      navigate('/dashboard');
    } catch (err: any) {
      addNotification('error', 'Pendaftaran Gagal', err.message || 'Terjadi kesalahan sistem saat mendaftar.');
    }
    setSubmitting(false);
  };

  const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const grandTotal = subTotal + addonsTotal;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-12 text-center text-slate-900 dark:text-white">
        <h2 className="text-2xl font-bold">Event tidak ditemukan.</h2>
        <Link to="/events" className="text-orange-400 underline mt-4 inline-block">Kembali ke Katalog Event</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      
      {/* Banner Hero */}
      <div className="relative h-[400px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <img src={event.banner} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Link to="/events" className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-bold uppercase tracking-wider mb-2 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog</span>
            </Link>
            <div className="inline-flex items-center gap-2 bg-orange-600/90 text-white text-[10px] font-black uppercase px-3 py-1 rounded">
              {event.status === 'REGISTRATION_OPEN' ? 'PENDAFTARAN DIBUKA' : event.status}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-400" /> {event.location}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-400" /> {new Date(event.startDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-80">
            <Countdown targetDateISO={event.startDate} />
          </div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Stepper Header (Only show if in checkout) */}
        {checkoutStep > 0 && (
          <div className="flex items-center justify-center mb-10 overflow-x-auto pb-4">
            {[
              { step: 1, label: 'Pilih Kategori' },
              { step: 2, label: 'Detail Pesanan' },
              { step: 3, label: 'Metode Pembayaran' }
            ].map((s, idx) => (
              <React.Fragment key={s.step}>
                <div className={`flex items-center gap-2 ${checkoutStep >= s.step ? 'text-orange-500' : 'text-slate-400 dark:text-slate-600'}`}>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${checkoutStep >= s.step ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    {s.step}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
                </div>
                {idx < 2 && <div className="w-12 md:w-24 h-px bg-slate-200 dark:bg-slate-800 mx-4" />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* STEP 0: INFO */}
            {checkoutStep === 0 && (
              <>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-3">Deskripsi Event</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
                {event.facilities && event.facilities.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-4">Fasilitas Peserta</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {event.facilities.map((fac, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{fac}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {event.schedule && event.schedule.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-4">Jadwal Acara</h3>
                    <div className="space-y-3">
                      {event.schedule.map((sch, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                          <span className="bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-black px-3 py-1 rounded-md shrink-0">
                            {sch.time}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase">{sch.title}</h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sch.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STEP 1: PILIH KATEGORI */}
            {checkoutStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 mb-6">
                    <Trophy className="w-5 h-5 text-orange-500" /> Kategori Tiket
                  </h3>
                  <div className="space-y-4">
                    {categories.map((cat) => {
                      const isFull = cat.registeredCount >= cat.quota;
                      const cartItem = cartItems.find(i => i.categoryId === cat.id);
                      const currentQty = cartItem ? cartItem.quantity : 0;
                      
                      const now = new Date();
                      let currentPrice = cat.price;
                      let isEarlyBird = false;
                      if (cat.earlyBirdPrice && cat.earlyBirdEndDate) {
                        if (now <= new Date(cat.earlyBirdEndDate)) {
                          currentPrice = cat.earlyBirdPrice;
                          isEarlyBird = true;
                        }
                      }

                      return (
                        <div key={cat.id} className={`p-4 md:p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isFull ? 'bg-slate-100 dark:bg-slate-950 opacity-60 border-slate-200 dark:border-slate-800' : currentQty > 0 ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">{cat.name}</h4>
                              {isEarlyBird && <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-200">EARLY BIRD</span>}
                              {isFull && <span className="bg-red-100 text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-red-200">HABIS</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2">Kuota: {cat.registeredCount}/{cat.quota} | COT: {cat.cutoffTime}</p>
                            <div className="text-base font-black text-orange-500">{formatRupiah(currentPrice)}</div>
                          </div>
                          
                          <div className="shrink-0 flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
                            <button 
                              type="button"
                              disabled={currentQty === 0}
                              onClick={() => handleCartUpdate(cat.id, cat.name, currentQty - 1, cat.quota - cat.registeredCount, currentPrice, isEarlyBird)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:text-orange-500 disabled:opacity-50 shadow-sm"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-bold text-sm">{currentQty}</span>
                            <button 
                              type="button"
                              disabled={isFull || currentQty >= (cat.quota - cat.registeredCount)}
                              onClick={() => handleCartUpdate(cat.id, cat.name, currentQty + 1, cat.quota - cat.registeredCount, currentPrice, isEarlyBird)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold hover:text-orange-500 disabled:opacity-50 shadow-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {event.addons && event.addons.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 mb-6">
                      <Sparkles className="w-5 h-5 text-amber-500" /> Tambahan (Add-ons)
                    </h3>
                    <div className="space-y-3">
                      {event.addons.map((addon) => {
                        const existing = selectedAddons.find(a => a.addonId === addon.id);
                        const qty = existing ? existing.quantity : 0;
                        return (
                          <div key={addon.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white uppercase">{addon.name}</p>
                              <p className="text-[11px] text-slate-500">{addon.description}</p>
                              <p className="text-xs font-bold text-amber-500 mt-1">{formatRupiah(addon.price)}</p>
                            </div>
                            <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                              <button type="button" onClick={() => {
                                if (qty > 0) {
                                  if (qty - 1 === 0) setSelectedAddons(selectedAddons.filter(a => a.addonId !== addon.id));
                                  else setSelectedAddons(selectedAddons.map(a => a.addonId === addon.id ? {...a, quantity: qty - 1} : a));
                                }
                              }} className="w-6 h-6 flex items-center justify-center text-slate-600 font-bold">-</button>
                              <span className="w-6 text-center text-xs font-bold">{qty}</span>
                              <button type="button" onClick={() => {
                                if (qty === 0) setSelectedAddons([...selectedAddons, {addonId: addon.id, name: addon.name, quantity: 1, price: addon.price}]);
                                else setSelectedAddons(selectedAddons.map(a => a.addonId === addon.id ? {...a, quantity: qty + 1} : a));
                              }} className="w-6 h-6 flex items-center justify-center text-slate-600 font-bold">+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ISI DATA PESERTA */}
            {checkoutStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={() => setCheckoutStep(1)} className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1 mb-4"><ArrowLeft className="w-3 h-3"/> Kembali ke Pemilihan Tiket</button>
                {formsData.map((data, index) => (
                  <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-orange-500" />
                        Data Peserta {index + 1}
                      </h4>
                      <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded border border-orange-200 uppercase">{data.categoryName}</span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nama Lengkap (Sesuai KTP) *</label>
                          <input type="text" required value={data.fullName} onChange={(e) => handleFormChange(index, 'fullName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nomor KTP (NIK) *</label>
                          <input type="text" required maxLength={16} value={data.nik} onChange={(e) => handleFormChange(index, 'nik', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Email *</label>
                          <input type="email" required value={data.email} onChange={(e) => handleFormChange(index, 'email', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nomor WhatsApp *</label>
                          <input type="text" required value={data.phone} onChange={(e) => handleFormChange(index, 'phone', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Tanggal Lahir *</label>
                            <input type="date" required value={data.birthDate} onChange={(e) => handleFormChange(index, 'birthDate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                          </div>
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Jenis Kelamin *</label>
                            <select value={data.gender} onChange={(e) => handleFormChange(index, 'gender', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500">
                              <option value="MALE">Laki-Laki</option>
                              <option value="FEMALE">Perempuan</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Alamat Lengkap *</label>
                          <textarea required value={data.address} onChange={(e) => handleFormChange(index, 'address', e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                        </div>
                        
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Kota *</label>
                          <input type="text" required value={data.city} onChange={(e) => handleFormChange(index, 'city', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Provinsi *</label>
                          <input type="text" required value={data.province} onChange={(e) => handleFormChange(index, 'province', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                        </div>

                        <div className="sm:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-rose-500"/> Data Medis & Darurat</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Golongan Darah *</label>
                              <select value={data.bloodType} onChange={(e) => handleFormChange(index, 'bloodType', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500">
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                                <option value="UNSPECIFIED">Tidak Tahu</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Ukuran Jersey *</label>
                              <select value={data.jerseySize} onChange={(e) => handleFormChange(index, 'jerseySize', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500">
                                <option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nama Kontak Darurat *</label>
                              <input type="text" required value={data.emergencyContactName} onChange={(e) => handleFormChange(index, 'emergencyContactName', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                            </div>
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">No HP Darurat *</label>
                              <input type="text" required value={data.emergencyContactPhone} onChange={(e) => handleFormChange(index, 'emergencyContactPhone', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                            </div>
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Hubungan *</label>
                              <input type="text" required value={data.emergencyContactRelation} onChange={(e) => handleFormChange(index, 'emergencyContactRelation', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3: METODE PEMBAYARAN */}
            {checkoutStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={() => setCheckoutStep(2)} className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1 mb-4"><ArrowLeft className="w-3 h-3"/> Kembali ke Data Peserta</button>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center gap-2 mb-6">Syarat & Ketentuan</h3>
                  <div className="h-48 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 space-y-3 leading-relaxed">
                    <p>1. Pihak penyelenggara berhak mengubah rute lomba jika terjadi kondisi cuaca buruk atau hal-hal lain di luar kendali.</p>
                    <p>2. Uang pendaftaran yang telah dibayarkan tidak dapat dikembalikan (Non-refundable) dengan alasan apapun.</p>
                    <p>3. Nomor dada (BIB) tidak dapat dipindahtangankan kepada orang lain.</p>
                    <p>4. Peserta menyatakan bahwa dirinya dalam keadaan sehat jasmani dan rohani serta sanggup mengikuti lomba.</p>
                    <p>5. Panitia tidak bertanggung jawab atas cedera, kehilangan barang, atau kejadian tidak terduga lainnya selama perlombaan.</p>
                    {event.rules && <p className="font-bold mt-4">Aturan Khusus: {event.rules}</p>}
                  </div>
                  <label className="flex items-start gap-3 mt-4 cursor-pointer">
                    <input type="checkbox" required className="mt-1 shrink-0 text-orange-500 focus:ring-orange-500 rounded border-slate-300" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Saya dan seluruh peserta yang saya daftarkan telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan serta Aturan Lomba yang berlaku.</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Registration / Cart Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {checkoutStep === 0 ? (
                <>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-800 pb-2">STATUS PENDAFTARAN</span>
                    <div className="flex items-center gap-2 text-emerald-500 font-black text-lg uppercase">
                      <CheckCircle2 className="w-6 h-6" />
                      SEDANG DIBUKA
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (event.status !== 'REGISTRATION_OPEN') return;
                      setCheckoutStep(1);
                    }}
                    disabled={event.status !== 'REGISTRATION_OPEN'}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {event.status === 'REGISTRATION_OPEN' ? 'Daftar Sekarang' : 'Ditutup'}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                    Rincian Pesanan
                  </h3>
                  
                  {cartItems.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Belum ada tiket dipilih</div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white uppercase block">{item.name}</span>
                            <span className="text-slate-500">{item.quantity}x tiket dipesan {item.earlyBird && '(EB)'}</span>
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      
                      {selectedAddons.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2 space-y-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Tambahan (Add-ons)</span>
                          {selectedAddons.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs">
                              <span className="text-slate-600 dark:text-slate-400">{item.quantity}x {item.name}</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-dashed border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Sub Total</span>
                          <span>{formatRupiah(subTotal)}</span>
                        </div>
                        {addonsTotal > 0 && (
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Add-ons</span>
                            <span>{formatRupiah(addonsTotal)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>Grand Total</span>
                          <span className="text-orange-500">{formatRupiah(grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 1 && (
                    <button
                      onClick={handleStartRegistration}
                      className="w-full mt-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
                    >
                      Isi Data Peserta
                    </button>
                  )}
                  {checkoutStep === 2 && (
                    <button
                      onClick={() => {
                        let valid = true;
                        // Basic validation check
                        formsData.forEach(d => {
                          if (!d.fullName || !d.nik || !d.email || !d.phone || !d.address || !d.city || !d.province || !d.emergencyContactName || !d.emergencyContactPhone || !d.emergencyContactRelation) {
                            valid = false;
                          }
                        });
                        if (!valid) addNotification('error', 'Form Belum Lengkap', 'Mohon lengkapi semua data dengan tanda bintang (*) sebelum melanjutkan.');
                        else setCheckoutStep(3);
                      }}
                      className="w-full mt-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
                    >
                      Lanjut Pembayaran
                    </button>
                  )}
                  {checkoutStep === 3 && (
                    <button
                      onClick={handleSubmitRegistration}
                      disabled={submitting}
                      className="w-full mt-4 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-green-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                      {submitting ? 'MEMPROSES...' : 'BAYAR SEKARANG'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
