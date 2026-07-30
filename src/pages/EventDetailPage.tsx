import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventBySlug, getEventCategories } from '../services/eventService';
import { createRegistration } from '../services/registrationService';
import { EventItem, EventCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
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
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  Ticket,
  Users
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
          fullName: user?.displayName || '', 
          nik: '', 
          email: user?.email || '', 
          phone: user?.phoneNumber || '', 
          birthDate: '', 
          gender: 'MALE', 
          address: '', 
          city: '', 
          province: '',
          bloodType: 'UNSPECIFIED', 
          emergencyContactName: '', 
          emergencyContactPhone: '', 
          emergencyContactRelation: '', 
          jerseySize: 'M'
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
    if (!event || cartItems.length === 0) return;

    // Validate email, phone, nik for all forms
    for (let i = 0; i < formsData.length; i++) {
      if (!formsData[i].nik || formsData[i].nik.length < 16) {
        addNotification('error', 'Validasi Gagal', `NIK Peserta ${i + 1} (${formsData[i].categoryName}) harus minimal 16 karakter.`);
        return;
      }
      if (!formsData[i].email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formsData[i].email)) {
        addNotification('error', 'Validasi Gagal', `Email Peserta ${i + 1} tidak valid.`);
        return;
      }
      if (!formsData[i].phone || formsData[i].phone.length < 9) {
        addNotification('error', 'Validasi Gagal', `Nomor WhatsApp Peserta ${i + 1} tidak valid.`);
        return;
      }
    }

    setSubmitting(true);
    let currentUserId = user?.uid;

    try {
      // Auto register if guest
      if (!currentUserId) {
        const primaryEmail = formsData[0].email;
        const primaryName = formsData[0].fullName;
        const randomPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
        
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, primaryEmail, randomPassword);
          const newUser = userCredential.user;
          
          await updateProfile(newUser, { displayName: primaryName });
          
          await setDoc(doc(db, 'users', newUser.uid), {
            email: newUser.email,
            name: primaryName,
            role: 'PARTICIPANT',
            createdAt: new Date().toISOString()
          });

          // Queue welcome email (requires Trigger Email extension)
          await addDoc(collection(db, 'mail'), {
            to: newUser.email,
            message: {
              subject: 'Selamat Datang di RacePro! Ini Akun Anda',
              text: `Halo ${primaryName},\n\nTerima kasih telah mendaftar. Akun Anda telah dibuat secara otomatis.\n\nEmail: ${newUser.email}\nPassword Sementara: ${randomPassword}\n\nHarap segera login dan ganti password Anda di dashboard.\n\nSalam,\nTim RacePro`
            }
          });
          
          currentUserId = newUser.uid;
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') {
            addNotification('warning', 'Email Sudah Terdaftar', 'Email ini sudah memiliki akun. Silakan masuk (login) terlebih dahulu.');
            navigate('/login', { state: { from: `/events/${slug}` } });
            setSubmitting(false);
            return;
          }
          throw authErr;
        }
      }

      if (!currentUserId) throw new Error('Gagal mengidentifikasi sesi pengguna.');

      const result = await createRegistration(currentUserId, event.id, cartItems, formsData, selectedAddons);
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
      <div className="min-h-screen  flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Memuat Event...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen  p-12 text-center">
        <div className="max-w-md mx-auto bg-white/60 dark:bg-blue-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 backdrop-blur-sm">
          <AlertCircle className="w-12 h-12 text-slate-600 dark:text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Event tidak ditemukan.</h2>
          <Link to="/events" className="text-orange-400 hover:text-orange-300 underline text-sm font-bold inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog Event
          </Link>
        </div>
      </div>
    );
  }

  const STEP_LABELS = [
    { step: 1, icon: Ticket, label: 'Pilih Kategori' },
    { step: 2, icon: UserCheck, label: 'Data Peserta' },
    { step: 3, icon: CreditCard, label: 'Pembayaran' },
  ];

  return (
    <div className="min-h-screen  text-slate-900 dark:text-slate-100 pb-24">

      {/* HERO BANNER */}
      <div className="relative h-[420px] md:h-[480px]  border-b border-slate-300 dark:border-slate-800 overflow-hidden">
        <img src={event.banner} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#020617] via-slate-50/70 dark:via-[#020617]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 dark:from-[#020617]/80 via-transparent to-slate-50/40 dark:to-[#020617]/40" />

        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <Link to="/events" className="inline-flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider hover:text-orange-300 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Kembali ke Katalog</span>
              </Link>

              {/* Status badge */}
              <div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-md backdrop-blur-md shadow-lg ${
                  event.status === 'REGISTRATION_OPEN' 
                    ? 'bg-orange-500/90 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300'
                }`}>
                  {event.status === 'REGISTRATION_OPEN' ? (
                    <><CheckCircle2 className="w-3 h-3" /> Pendaftaran Dibuka</>
                  ) : (
                    event.status
                  )}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 bg-white dark:bg-blue-950/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700/50">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" /> {event.location}
                </span>
                <span className="flex items-center gap-1.5 bg-white dark:bg-blue-950/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700/50">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> {new Date(event.startDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </span>
              </div>
            </div>

            {/* Countdown */}
            <div className="shrink-0 w-full lg:w-80">
              <Countdown targetDateISO={event.startDate} />
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* STEPPER */}
        {checkoutStep > 0 && (
          <div className="flex items-center justify-center mb-12 overflow-x-auto pb-4">
            <div className="flex items-center gap-0">
              {STEP_LABELS.map((s, idx) => {
                const isActive = checkoutStep >= s.step;
                const isPast = checkoutStep > s.step;
                return (
                  <React.Fragment key={s.step}>
                    <div className={`flex items-center gap-3 whitespace-nowrap ${isActive ? 'text-orange-400' : 'text-slate-600'}`}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-xs font-black transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">{s.label}</span>
                      </div>
                    </div>
                    {idx < 2 && (
                      <div className={`w-12 md:w-20 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                        isPast ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-slate-100 dark:bg-slate-800'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-10">

            {/* STEP 0: INFO */}
            {checkoutStep === 0 && (
              <>
                <div className="glass-card p-6 md:p-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
                    Deskripsi Event
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{event.description}</p>

                  {event.organizerName && (
                    <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-800">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-4">Informasi Penyelenggara</h4>
                      <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-300 dark:border-slate-700/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{event.organizerName}</p>
                          <div className="flex gap-4 mt-1.5">
                            {event.organizerWebsite && (
                              <a href={event.organizerWebsite} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium">
                                Website
                              </a>
                            )}
                            {event.organizerSocialMedia && (
                              <a href={event.organizerSocialMedia} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium">
                                Sosial Media
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {event.facilities && event.facilities.length > 0 && (
                  <div className="glass-card p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
                      Fasilitas Peserta
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {event.facilities.map((fac, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-300 dark:border-slate-700/50 hover:border-emerald-500/20 transition-colors group">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-white transition-colors">{fac}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.schedule && event.schedule.length > 0 && (
                  <div className="glass-card p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-amber-500 to-amber-400 rounded-full" />
                      Jadwal Acara
                    </h3>
                    <div className="space-y-4">
                      {event.schedule.map((sch, idx) => (
                        <div key={idx} className="p-4 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-300 dark:border-slate-700/50 flex items-start gap-4 hover:border-orange-500/20 transition-colors">
                          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-black px-3 py-1.5 rounded-lg shrink-0">
                            {sch.time}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase">{sch.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">{sch.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.rules && (
                  <div className="glass-card p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-rose-500 rounded-full" />
                      Peraturan Acara
                    </h3>
                    <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line bg-slate-100 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-300 dark:border-slate-700/50">
                      {event.rules}
                    </div>
                  </div>
                )}

                {event.faqs && event.faqs.length > 0 && (
                  <div className="glass-card p-6 md:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full" />
                      Pertanyaan Umum (FAQ)
                    </h3>
                    <div className="space-y-4">
                      {event.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-slate-100 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-300 dark:border-slate-700/50">
                          <p className="font-bold text-white text-sm mb-2 flex items-start gap-2">
                            <span className="text-orange-500 font-black shrink-0">Q:</span>
                            {faq.question}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-500 font-black shrink-0">A:</span>
                            {faq.answer}
                          </p>
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
                <div className="glass-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
                      <Ticket className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Kategori Tiket</h3>
                      <p className="text-[11px] text-slate-500">Pilih kategori dan jumlah tiket yang diinginkan</p>
                    </div>
                  </div>
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
                        <div key={cat.id} className={`p-5 rounded-xl border transition-all duration-300 ${
                          isFull 
                            ? 'bg-slate-100 dark:bg-slate-800/20 border-slate-300 dark:border-slate-800 opacity-50' 
                            : currentQty > 0 
                              ? 'bg-orange-500/5 border-orange-500/30 shadow-lg shadow-orange-500/5' 
                              : 'bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700/50 hover:border-orange-500/20'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">{cat.name}</h4>
                                {isEarlyBird && (
                                  <span className="bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-md border border-amber-500/30">
                                    EARLY BIRD
                                  </span>
                                )}
                                {isFull && (
                                  <span className="bg-red-500/10 text-red-400 text-[9px] font-black px-2 py-0.5 rounded-md border border-red-500/20">
                                    HABIS
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Kuota: {cat.registeredCount}/{cat.quota} • COT: {cat.cutoffTime}
                              </p>
                              <div className="text-xl font-black text-orange-400">
                                {formatRupiah(currentPrice)}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center bg-white dark:bg-blue-950/80 rounded-xl p-1.5 border border-slate-300 dark:border-slate-700/50">
                              <button
                                type="button"
                                disabled={currentQty === 0}
                                onClick={() => handleCartUpdate(cat.id, cat.name, currentQty - 1, cat.quota - cat.registeredCount, currentPrice, isEarlyBird)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:text-orange-400 hover:bg-slate-200 dark:bg-slate-700 disabled:opacity-30 transition-all"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-bold text-sm text-white">{currentQty}</span>
                              <button
                                type="button"
                                disabled={isFull || currentQty >= (cat.quota - cat.registeredCount)}
                                onClick={() => handleCartUpdate(cat.id, cat.name, currentQty + 1, cat.quota - cat.registeredCount, currentPrice, isEarlyBird)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-bold hover:bg-orange-500 hover:text-white disabled:opacity-30 disabled:hover:bg-orange-500/20 disabled:hover:text-orange-400 transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {event.addons && event.addons.length > 0 && (
                  <div className="bg-white dark:bg-blue-950/60 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Tambahan (Add-ons)</h3>
                        <p className="text-[11px] text-slate-500">Item tambahan untuk melengkapi pengalaman event Anda</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {event.addons.map((addon) => {
                        const existing = selectedAddons.find(a => a.addonId === addon.id);
                        const qty = existing ? existing.quantity : 0;
                        return (
                          <div key={addon.id} className="flex items-center justify-between p-4 border border-slate-300 dark:border-slate-700/50 rounded-xl bg-slate-100 dark:bg-slate-800/40 hover:border-amber-500/20 transition-colors">
                            <div>
                              <p className="font-bold text-sm text-white uppercase">{addon.name}</p>
                              <p className="text-[11px] text-slate-500">{addon.description}</p>
                              <p className="text-xs font-bold text-amber-400 mt-1.5">{formatRupiah(addon.price)}</p>
                            </div>
                            <div className="flex items-center bg-white dark:bg-blue-950/80 rounded-lg p-1 border border-slate-300 dark:border-slate-700/50">
                              <button type="button" onClick={() => {
                                if (qty > 0) {
                                  if (qty - 1 === 0) setSelectedAddons(selectedAddons.filter(a => a.addonId !== addon.id));
                                  else setSelectedAddons(selectedAddons.map(a => a.addonId === addon.id ? {...a, quantity: qty - 1} : a));
                                }
                              }} className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold hover:text-orange-400 transition-colors">−</button>
                              <span className="w-8 text-center text-xs font-bold text-white">{qty}</span>
                              <button type="button" onClick={() => {
                                if (qty === 0) setSelectedAddons([...selectedAddons, {addonId: addon.id, name: addon.name, quantity: 1, price: addon.price}]);
                                else setSelectedAddons(selectedAddons.map(a => a.addonId === addon.id ? {...a, quantity: qty + 1} : a));
                              }} className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold hover:text-orange-400 transition-colors">+</button>
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
                <button onClick={() => setCheckoutStep(1)} className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 mb-4 transition-colors group">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
                  Kembali ke Pemilihan Tiket
                </button>
                {formsData.map((data, index) => (
                  <div key={index} className="bg-white dark:bg-blue-950/60 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="bg-slate-100 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-300 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
                          <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                        </div>
                        Data Peserta {index + 1}
                      </h4>
                      <span className="bg-orange-500/10 text-orange-400 text-[10px] font-black px-3 py-1 rounded-md border border-orange-500/20 uppercase">
                        {data.categoryName}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nama Lengkap (Sesuai KTP) *</label>
                          <input type="text" required value={data.fullName} onChange={(e) => handleFormChange(index, 'fullName', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nomor KTP (NIK) *</label>
                          <input type="text" required maxLength={16} value={data.nik} onChange={(e) => handleFormChange(index, 'nik', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Email *</label>
                          <input type="email" required value={data.email} onChange={(e) => handleFormChange(index, 'email', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nomor WhatsApp *</label>
                          <input type="text" required value={data.phone} onChange={(e) => handleFormChange(index, 'phone', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                          <div>
                            <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Tanggal Lahir *</label>
                            <input type="date" required value={data.birthDate} onChange={(e) => handleFormChange(index, 'birthDate', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all [color-scheme:dark]" />
                          </div>
                          <div>
                            <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Jenis Kelamin *</label>
                            <select value={data.gender} onChange={(e) => handleFormChange(index, 'gender', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all">
                              <option value="MALE">Laki-Laki</option>
                              <option value="FEMALE">Perempuan</option>
                            </select>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Alamat Lengkap *</label>
                          <textarea required value={data.address} onChange={(e) => handleFormChange(index, 'address', e.target.value)} rows={2} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                        </div>

                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Kota *</label>
                          <input type="text" required value={data.city} onChange={(e) => handleFormChange(index, 'city', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Provinsi *</label>
                          <input type="text" required value={data.province} onChange={(e) => handleFormChange(index, 'province', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                        </div>

                        <div className="sm:col-span-2 pt-6 border-t border-slate-300 dark:border-slate-700/50">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-rose-400"/> 
                            Data Medis & Darurat
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Golongan Darah *</label>
                              <select value={data.bloodType} onChange={(e) => handleFormChange(index, 'bloodType', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all">
                                <option value="A+">A+</option><option value="A-">A-</option>
                                <option value="B+">B+</option><option value="B-">B-</option>
                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                <option value="O+">O+</option><option value="O-">O-</option>
                                <option value="UNSPECIFIED">Tidak Tahu</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Ukuran Jersey *</label>
                              <select value={data.jerseySize} onChange={(e) => handleFormChange(index, 'jerseySize', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all">
                                <option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Nama Kontak Darurat *</label>
                              <input type="text" required value={data.emergencyContactName} onChange={(e) => handleFormChange(index, 'emergencyContactName', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                            </div>
                            <div>
                              <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">No HP Darurat *</label>
                              <input type="text" required value={data.emergencyContactPhone} onChange={(e) => handleFormChange(index, 'emergencyContactPhone', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
                            </div>
                            <div>
                              <label className="block text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1.5">Hubungan *</label>
                              <input type="text" required value={data.emergencyContactRelation} onChange={(e) => handleFormChange(index, 'emergencyContactRelation', e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all" />
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
                <button onClick={() => setCheckoutStep(2)} className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 mb-4 transition-colors group">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
                  Kembali ke Data Peserta
                </button>
                <div className="bg-white dark:bg-blue-950/60 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/20 border border-blue-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    Syarat & Ketentuan
                  </h3>
                  <div className="h-48 overflow-y-auto bg-slate-100 dark:bg-slate-800/40 p-5 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/50 space-y-3 leading-relaxed custom-scrollbar">
                    <p>1. Pihak penyelenggara berhak mengubah rute lomba jika terjadi kondisi cuaca buruk atau hal-hal lain di luar kendali.</p>
                    <p>2. Uang pendaftaran yang telah dibayarkan tidak dapat dikembalikan (Non-refundable) dengan alasan apapun.</p>
                    <p>3. Nomor dada (BIB) tidak dapat dipindahtangankan kepada orang lain.</p>
                    <p>4. Peserta menyatakan bahwa dirinya dalam keadaan sehat jasmani dan rohani serta sanggup mengikuti lomba.</p>
                    <p>5. Panitia tidak bertanggung jawab atas cedera, kehilangan barang, atau kejadian tidak terduga lainnya selama perlombaan.</p>
                    {event.rules && <p className="font-bold mt-4 text-orange-400">Aturan Khusus: {event.rules}</p>}
                  </div>
                  <label className="flex items-start gap-3 mt-5 cursor-pointer group">
                    <input type="checkbox" required className="mt-1 shrink-0 w-4 h-4 rounded border-slate-600 bg-slate-100 dark:bg-slate-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-700 dark:text-slate-300 transition-colors">
                      Saya dan seluruh peserta yang saya daftarkan telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan serta Aturan Lomba yang berlaku.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* STICKY SIDEBAR — ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-300 dark:border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/30 space-y-6">

              {checkoutStep === 0 ? (
                <>
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-300 dark:border-slate-800 pb-3">
                      Status Pendaftaran
                    </span>
                    {event.status === 'REGISTRATION_OPEN' ? (
                      <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <div>
                          <div className="font-black text-emerald-400 text-sm uppercase">Pendaftaran Dibuka</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Segera daftar sebelum kuota habis</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                        <div>
                          <div className="font-black text-red-400 text-sm uppercase">Ditutup</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Pendaftaran telah ditutup</div>
                        </div>
                      </div>
                    )}

                    {event.status === 'REGISTRATION_OPEN' && categories.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Kategori tersedia</span>
                          <span className="font-bold text-white">{categories.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Kuota total</span>
                          <span className="font-bold text-white">
                            {categories.reduce((sum, c) => sum + c.quota, 0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (event.status !== 'REGISTRATION_OPEN') return;
                      setCheckoutStep(1);
                    }}
                    disabled={event.status !== 'REGISTRATION_OPEN'}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {event.status === 'REGISTRATION_OPEN' ? 'Daftar Sekarang' : 'Pendaftaran Ditutup'}
                  </button>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-300 dark:border-slate-800">
                    <ShoppingCart className="w-4 h-4 text-orange-400" />
                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm">Rincian Pesanan</h3>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-xs text-slate-500">Belum ada tiket dipilih</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <span className="font-bold text-white text-xs uppercase block truncate">{item.name}</span>
                            <span className="text-[11px] text-slate-500">{item.quantity}x tiket {item.earlyBird && (
                              <span className="text-amber-400 font-bold">• Early Bird</span>
                            )}</span>
                          </div>
                          <span className="font-semibold text-sm text-slate-700 dark:text-slate-300 shrink-0">{formatRupiah(item.price * item.quantity)}</span>
                        </div>
                      ))}

                      {selectedAddons.length > 0 && (
                        <div className="pt-3 border-t border-slate-300 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Tambahan</span>
                          {selectedAddons.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs">
                              <span className="text-slate-600 dark:text-slate-400">{item.quantity}x {item.name}</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-4 space-y-2">
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
                        <div className="flex justify-between text-base font-black pt-3 border-t border-slate-300 dark:border-slate-800">
                          <span className="text-white">Grand Total</span>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{formatRupiah(grandTotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 1 && (
                    <button
                      onClick={handleStartRegistration}
                      className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Isi Data Peserta
                    </button>
                  )}
                  {checkoutStep === 2 && (
                    <button
                      onClick={() => {
                        let valid = true;
                        formsData.forEach(d => {
                          if (!d.fullName || !d.nik || !d.email || !d.phone || !d.address || !d.city || !d.province || !d.emergencyContactName || !d.emergencyContactPhone || !d.emergencyContactRelation) {
                            valid = false;
                          }
                        });
                        if (!valid) addNotification('error', 'Form Belum Lengkap', 'Mohon lengkapi semua data dengan tanda bintang (*) sebelum melanjutkan.');
                        else setCheckoutStep(3);
                      }}
                      className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Lanjut Pembayaran
                    </button>
                  )}
                  {checkoutStep === 3 && (
                    <button
                      onClick={handleSubmitRegistration}
                      disabled={submitting}
                      className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                      {submitting ? 'Memproses...' : 'Bayar Sekarang'}
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
