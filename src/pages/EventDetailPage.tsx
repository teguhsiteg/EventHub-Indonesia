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
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1998-05-12');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [bloodType, setBloodType] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNSPECIFIED'>('O+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Orang Tua / Pasangan');
  const [jerseySize, setJerseySize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'>('L');

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
        if (cats.length > 0) setSelectedCategory(cats[0]);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  useEffect(() => {
    if (user) {
      setFullName(user.displayName || '');
      setPhone(user.phoneNumber || '');
    }
  }, [user]);

  const handleStartRegistration = () => {
    if (!user) {
      addNotification('warning', 'Autentikasi Diperlukan', 'Silakan masuk atau buat akun peserta terlebih dahulu untuk mendaftar lomba.');
      navigate('/login', { state: { from: `/events/${slug}` } });
      return;
    }
    setIsRegistering(true);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event || !selectedCategory) return;

    if (!nik || nik.length < 16) {
      addNotification('error', 'Validasi Gagal', 'NIK harus terdiri dari 16 digit.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createRegistration(user.uid, event.id, selectedCategory.id, {
        fullName,
        nik,
        email: user.email,
        phone,
        birthDate,
        gender,
        address,
        city,
        province,
        bloodType,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        emergencyContactRelation: emergencyRelation,
        jerseySize
      });

      addNotification('success', 'Pendaftaran Berhasil!', `Nomor Registrasi: ${result.registration.registrationNumber}. BIB: ${result.participant.bibNumber}`);
      navigate('/dashboard');
    } catch (err: any) {
      addNotification('error', 'Pendaftaran Gagal', err.message || 'Terjadi kesalahan sistem saat mendaftar.');
    }
    setSubmitting(false);
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-3">Deskripsi Event</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-4">Kategori Lomba & Biaya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const isFull = cat.registeredCount >= cat.quota;
                  const isSelected = selectedCategory?.id === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isFull && setSelectedCategory(cat)}
                      className={`p-5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'bg-orange-950/40 border-orange-500 shadow-lg shadow-orange-500/10' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700'
                      } ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-amber-400 uppercase">{cat.distance}</span>
                        {isFull ? (
                          <span className="bg-red-950 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800/40">KUOTA HABIS</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Kuota: {cat.registeredCount}/{cat.quota}</span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white uppercase">{cat.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{cat.description}</p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">COT: {cat.cutoffTime}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{formatRupiah(cat.price)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Facilities */}
            {event.facilities && event.facilities.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-4">Fasilitas Peserta (Race Pack)</h3>
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

            {/* Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
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

          </div>

          {/* Sticky Registration Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">KATEGORI TERPILIH</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">
                  {selectedCategory ? selectedCategory.name : 'Pilih Kategori'}
                </h3>
                <div className="text-2xl font-black text-amber-400 mt-2">
                  {selectedCategory ? formatRupiah(selectedCategory.price) : '-'}
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-200 dark:border-slate-800 py-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status Pendaftaran:</span>
                  <span className="font-bold text-emerald-400">DIBUKA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Lokasi:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{event.location}</span>
                </div>
              </div>

              <button
                onClick={handleStartRegistration}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/25 transition-all transform hover:-translate-y-0.5"
              >
                Daftar Sekarang
              </button>

              <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Proses pendaftaran & pembayaran resmi terverifikasi</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Registration Form Modal */}
      {isRegistering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl my-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Formulir Data Peserta Lomba</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Pastikan data sesuai NIK/KTP untuk keperluan asuransi dan nomor BIB.</p>

            <form onSubmit={handleSubmitRegistration} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Nama Lengkap (Sesuai KTP)</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">NIK KTP / Paspor (16 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="331201xxxxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  >
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Yogyakarta"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Contoh: D.I. Yogyakarta"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Golongan Darah</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  >
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O+">O+</option>
                    <option value="UNSPECIFIED">Tidak Tahu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Ukuran Jersey Lomba</label>
                  <select
                    value={jerseySize}
                    onChange={(e) => setJerseySize(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-orange-500"
                  >
                    <option value="S">S (Unisex)</option>
                    <option value="M">M (Unisex)</option>
                    <option value="L">L (Unisex)</option>
                    <option value="XL">XL (Unisex)</option>
                    <option value="XXL">XXL (Unisex)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="font-bold text-orange-400 uppercase">Kontak Darurat</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Nama Kontak Darurat</label>
                    <input
                      type="text"
                      required
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Nomor Telepon Darurat</label>
                    <input
                      type="text"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider shadow-lg shadow-orange-600/30"
                >
                  {submitting ? 'Memproses...' : 'Lanjutkan Ke Pembayaran'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
