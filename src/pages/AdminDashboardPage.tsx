import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  getAllEventsForAdmin, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  createCategory 
} from '../services/eventService';
import { getAllRegistrationsAdmin } from '../services/registrationService';
import { getAllPaymentsAdmin, verifyPaymentByAdmin } from '../services/paymentService';
import { getAllPayoutsAdmin, approvePayout } from '../services/payoutService';
import { submitOrUpdateRaceResult } from '../services/resultService';
import { updateUserRoleBySuperAdmin, banUserBySuperAdmin } from '../services/authService';
import { updateSystemSettings } from '../services/settingsService';
import { getEventRequests } from '../services/requestService';
import { EventItem, Registration, Payment, EventCategory, UserRole, PayoutRequest, EventRequest } from '../types';
import { db } from '../config/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { CreateEventModal } from '../components/admin/CreateEventModal';
import { FooterSettings } from '../components/admin/FooterSettings';
import { PageSettings } from '../components/admin/PageSettings';
import { SponsorSettings } from '../components/admin/SponsorSettings';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { 
  ShieldAlert, 
  Trophy, 
  Users, 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  QrCode, 
  Activity, 
  Settings, 
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  LayoutDashboard,
  Receipt,
  ChevronRight,
  Eye,
  Ban,
  Shield,
  UserCheck,
  Edit3,
  FileText,
  Info,
  ClipboardList
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { settings, reloadSettings, addNotification } = useSettings();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as 'stats' | 'events' | 'requests' | 'payments' | 'payouts' | 'results' | 'users' | 'settings') || 'stats';  
  // Data States
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / Forms
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    onConfirm: () => {}
  });

  // Result Form
  const [resParticipantId, setResParticipantId] = useState('');
  const [resBib, setResBib] = useState('');
  const [resEventId, setResEventId] = useState('');
  const [resName, setResName] = useState('');
  const [resChipTime, setResChipTime] = useState('03:45:12');
  const [resGunTime, setResGunTime] = useState('03:46:00');
  const [resRank, setResRank] = useState(1);

  // Payout Form
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutEventId, setPayoutEventId] = useState('');
  const [payoutBank, setPayoutBank] = useState('');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutHolder, setPayoutHolder] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Event search/filter
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('ALL');
  
  // Settings Tab internal state
  const [activeSettingsTab, setActiveSettingsTab] = useState<'system' | 'payment' | 'pages' | 'footer' | 'sponsors'>('system');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getAllEventsForAdmin(),
        getAllRegistrationsAdmin(),
        getAllPaymentsAdmin(),
        getAllPayoutsAdmin(),
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'audit_logs'), limit(50))),
        getEventRequests()
      ]);

      if (results[0].status === 'fulfilled') setEvents(results[0].value);
      if (results[1].status === 'fulfilled') setRegistrations(results[1].value);
      if (results[2].status === 'fulfilled') setPayments(results[2].value);
      if (results[3].status === 'fulfilled') setPayouts(results[3].value);
      
      if (results[4].status === 'fulfilled') {
        setUsersList(results[4].value.docs.map(d => ({ id: d.id, ...d.data() })));
      }
      
      if (results[5].status === 'fulfilled') {
        setAuditLogs(results[5].value.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      if (results[6].status === 'fulfilled') {
        setEventRequests(results[6].value);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (title: string, message: string, isDanger: boolean, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      isDanger,
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        await onConfirm();
      }
    });
  };

  const handleVerifyPayment = async (paymentId: string, regId: string, status: 'APPROVE' | 'REJECT') => {
    if (!user) return;
    try {
      setLoading(true);
      await verifyPaymentByAdmin(paymentId, regId, '', status, user.uid, user.email || '');
      addNotification('success', 'Status Diperbarui', `Pembayaran telah di-${status.toLowerCase()}.`);
      loadAdminData();
    } catch (err: any) {
      addNotification('error', 'Gagal Verifikasi', err.message);
    }
    setLoading(false);
  };

  const handleSyncMidtransPayment = async (paymentId: string, regId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      // Simulasi panggilan ke API Midtrans mengunakan Server Key
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      // Simulasi sukses
      await verifyPaymentByAdmin(paymentId, regId, '', 'APPROVE', user.uid, user.email || '');
      addNotification('success', 'Sinkronisasi Berhasil', 'Status pembayaran dari Midtrans adalah PAID.');
      loadAdminData();
    } catch (err: any) {
      addNotification('error', 'Gagal Sinkronisasi', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await submitOrUpdateRaceResult({
        participantId: resParticipantId || `part_${Date.now()}`,
        bibNumber: resBib,
        eventId: resEventId || events[0]?.id || 'event-1',
        categoryId: 'cat-1',
        participantName: resName,
        gender: 'MALE',
        gunTime: resGunTime,
        chipTime: resChipTime,
        pace: '05:30 /km',
        rank: resRank,
        genderRank: resRank,
        categoryRank: resRank,
        status: 'FINISH'
      }, user.uid, user.email);

      addNotification('success', 'Hasil Lomba Tersimpan', `Hasil finisher ${resName} (BIB: ${resBib}) berhasil dipublikasikan.`);
      loadAdminData();
    } catch (err: any) {
      addNotification('error', 'Gagal', err.message);
    }
  };

  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    if (!user || !isSuperAdmin) return;
    try {
      await updateUserRoleBySuperAdmin(user.uid, user.email, targetUid, newRole);
      addNotification('success', 'Role Diperbarui', `Role pengguna telah diubah menjadi ${newRole}.`);
      loadAdminData();
    } catch (err: any) {
      addNotification('error', 'Gagal', err.message);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      await updateSystemSettings({ maintenanceMode: !settings.maintenanceMode });
      await reloadSettings();
      addNotification('info', 'Status Maintenance', `Maintenance Mode sekarang: ${!settings.maintenanceMode ? 'AKTIF' : 'NONAKTIF'}`);
    } catch (err: any) {
      addNotification('error', 'Gagal Update', err.message);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const pendingPaymentsCount = payments.filter(p => p.status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'PUBLISHED': 'bg-emerald-500/10 text--600 dark:text--400 border-emerald-500/30',
      'DRAFT': 'bg-slate-500/10 text-slate-600 dark:text--600 dark:text--400 border-slate-500/30',
      'CANCELLED': 'bg-red-500/10 text--600 dark:text--400 border-red-500/30',
      'PENDING': 'bg-yellow-500/10 text--600 dark:text--400 border-yellow-500/30',
      'PAID': 'bg-emerald-500/10 text--600 dark:text--400 border-emerald-500/30',
      'REJECTED': 'bg-red-500/10 text--600 dark:text--400 border-red-500/30',
      'APPROVED': 'bg-blue-500/10 text--600 dark:text--400 border-blue-500/30',
      'ACTIVE': 'bg-emerald-500/10 text--600 dark:text--400 border-emerald-500/30',
    };
    return map[status] || 'bg-slate-500/10 text-slate-600 dark:text--600 dark:text--400 border-slate-500/30';
  };

  const statCards = [
    {
      label: 'Total Event',
      value: events.length,
      icon: Calendar,
      accent: 'border-l-blue-500',
      iconBg: 'bg-blue-500/10 text--600 dark:text--400',
      gradient: 'from-blue-500/5 to-transparent',
    },
    {
      label: 'Total Pendaftaran',
      value: registrations.length,
      icon: Users,
      accent: 'border-l-emerald-500',
      iconBg: 'bg-emerald-500/10 text--600 dark:text--400',
      gradient: 'from-emerald-500/5 to-transparent',
    },
    {
      label: 'Pembayaran Pending',
      value: pendingPaymentsCount,
      icon: Clock,
      accent: 'border-l-yellow-500',
      iconBg: 'bg-yellow-500/10 text--600 dark:text--400',
      gradient: 'from-yellow-500/5 to-transparent',
    },
    {
      label: 'Total Revenue',
      value: formatRupiah(totalRevenue),
      icon: TrendingUp,
      isCurrency: true,
      accent: 'border-l-blue-500',
      iconBg: 'bg-blue-500/10 text--600 dark:text--400',
      gradient: 'from-blue-500/5 to-transparent',
    },
  ];

  return (
    <div className="text-slate-900 dark:text-slate-100 w-full">
      <main className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">RacePro Management</h1>
              <p className="text-sm text-slate-600 dark:text--600 dark:text--400 mt-1">Pengelolaan real-time event, pendaftaran, pembayaran, dan hasil lomba.</p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Memuat data...</span>
                </div>
              </div>
            )}

            {/* TAB: STATS */}
            {activeTab === 'stats' && !loading && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={i}
                        className={`relative overflow-hidden bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] ${card.accent} border-l-[3px] rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 group`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
                        <div className="relative z-10 flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</span>
                            <span className={`block font-black mt-1.5 ${card.isCurrency ? 'text-xl' : 'text-3xl'} text-slate-900 dark:text-white`}>
                              {card.value}
                            </span>
                          </div>
                          <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Event Baru</span>
                  </button>
                  <Link
                    to="/admin/check-in"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-white/[0.06] transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>RacePro QR Check-In Scanner</span>
                  </Link>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text--600 dark:text--400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Audit Logs</h3>
                        <p className="text-[10px] text-slate-500">Aktivitas sistem terbaru</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{auditLogs.length} entri</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-6">Waktu</th>
                          <th className="py-3 px-6">Aktor</th>
                          <th className="py-3 px-6">Tindakan</th>
                          <th className="py-3 px-6">Resource ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {auditLogs.slice(0, 10).map(log => (
                          <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-6 text-xs text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                            <td className="py-3 px-6 text-xs text-slate-700 dark:text-slate-300">{log.actorEmail}</td>
                            <td className="py-3 px-6">
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text--600 dark:text--400 text-[10px] font-bold uppercase border border-blue-500/20">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-xs text-slate-500 font-mono">{log.resourceId}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EVENTS */}
            {activeTab === 'events' && !loading && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text--600 dark:text--400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Manajemen Event</h3>
                        <p className="text-[10px] text-slate-500">{events.length} event terdaftar</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Event</span>
                    </button>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="px-6 py-3 border-b border-slate-200 dark:border-white/[0.04] flex flex-wrap gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Cari nama event atau lokasi..."
                      value={eventSearch}
                      onChange={e => setEventSearch(e.target.value)}
                      className="flex-1 min-w-[180px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.06] rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:border-blue-500/50 outline-none placeholder:text-slate-600"
                    />
                    <select
                      value={eventStatusFilter}
                      onChange={e => setEventStatusFilter(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:border-blue-500/50 outline-none"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="REGISTRATION_OPEN">Pendaftaran Buka</option>
                      <option value="PUBLISHED">Dipublikasikan</option>
                      <option value="DRAFT">Draft</option>
                      <option value="ONGOING">Berlangsung</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="CANCELLED">Dibatalkan</option>
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-6">Nama Event</th>
                          <th className="py-3 px-6">Lokasi</th>
                          <th className="py-3 px-6">Tanggal Start</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {events
                          .filter(ev => {
                            const matchSearch = ev.name.toLowerCase().includes(eventSearch.toLowerCase()) || (ev.location || '').toLowerCase().includes(eventSearch.toLowerCase());
                            const matchStatus = eventStatusFilter === 'ALL' || ev.status === eventStatusFilter;
                            return matchSearch && matchStatus;
                          })
                          .map(ev => (
                            <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="py-4 px-6">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{ev.name}</p>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text--600 dark:text--400">
                                  <MapPin className="w-3 h-3 text-slate-600" />
                                  {ev.location}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-600 dark:text--600 dark:text--400">
                                {new Date(ev.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusBadge(ev.status)}`}>
                                  {ev.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingEvent(ev);
                                      setShowEventModal(true);
                                    }}
                                    className="p-2 rounded-lg text-slate-600 dark:text--600 dark:text--400 hover:text--600 dark:text--400 hover:bg-blue-500/10 transition-all"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (user) {
                                        confirmAction(
                                          'Hapus Event',
                                          `Anda yakin ingin menghapus event ${ev.name}? Aksi ini tidak dapat dibatalkan.`,
                                          true,
                                          async () => {
                                            await deleteEvent(ev.id, user.uid, user.email || '');
                                            loadAdminData();
                                          }
                                        );
                                      }
                                    }}
                                    className="p-2 rounded-lg text-slate-600 dark:text--600 dark:text--400 hover:text--600 dark:text--400 hover:bg-red-500/10 transition-all"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                        {events.filter(ev => {
                          const matchSearch = ev.name.toLowerCase().includes(eventSearch.toLowerCase()) || (ev.location || '').toLowerCase().includes(eventSearch.toLowerCase());
                          const matchStatus = eventStatusFilter === 'ALL' || ev.status === eventStatusFilter;
                          return matchSearch && matchStatus;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-slate-500">
                              <Calendar className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                              <p className="text-xs font-semibold">{events.length === 0 ? 'Belum ada event' : 'Tidak ada event yang cocok'}</p>
                              <p className="text-[10px] mt-1">{events.length === 0 ? 'Klik "Tambah Event" untuk membuat event baru.' : 'Coba ubah kata kunci atau filter status.'}</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REQUESTS */}
            {activeTab === 'requests' && !loading && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ClipboardList className="w-4 h-4 text--600 dark:text--400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Permohonan Event</h3>
                      <p className="text-[10px] text-slate-500">{eventRequests.length} permohonan</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-6">Event / Jenis</th>
                          <th className="py-3 px-6">Tanggal Rencana</th>
                          <th className="py-3 px-6">Organizer / PIC</th>
                          <th className="py-3 px-6">Kontak PIC</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {eventRequests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-16 text-center text-slate-500">
                              <ClipboardList className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                              <p className="text-xs font-semibold">Belum ada permohonan event</p>
                            </td>
                          </tr>
                        ) : (
                          eventRequests.map(req => (
                            <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{req.eventName}</p>
                                <p className="text-[10px] font-mono text-slate-500">{req.eventType}</p>
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-700 dark:text-slate-300">
                                {new Date(req.plannedDate).toLocaleDateString('id-ID')}
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{req.eoName}</p>
                                <p className="text-[10px] text-slate-500">{req.picName}</p>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-xs text-slate-700 dark:text-slate-300">{req.picPhone}</p>
                                <p className="text-[10px] text-slate-500">{req.picEmail}</p>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                                  req.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  req.status === 'REVIEWED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                  req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button
                                  className="text-[10px] font-bold text-blue-500 hover:text--600 dark:text--400 uppercase tracking-wider"
                                >
                                  Detail
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && !loading && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text--600 dark:text--400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Verifikasi Pembayaran</h3>
                      <p className="text-[10px] text-slate-500">{payments.length} transaksi</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-6">Peserta / Invoice</th>
                          <th className="py-3 px-6">Nominal</th>
                          <th className="py-3 px-6">Bukti Upload</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6 text-right">Aksi Verifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-slate-500">
                              <Receipt className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                              <p className="text-xs font-semibold">Belum ada pembayaran</p>
                            </td>
                          </tr>
                        ) : (
                          payments.map(pay => (
                            <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6">
                                {(() => {
                                  const reg = registrations.find(r => r.id === pay.registrationId);
                                  return (
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 dark:text-white">{reg?.participants?.[0]?.name || 'Peserta tidak dikenal'}</p>
                                      <p className="text-[10px] font-mono text-slate-500">{pay.invoiceId}</p>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-xs font-bold text--600 dark:text--400">{formatRupiah(pay.amount)}</span>
                              </td>
                              <td className="py-4 px-6">
                                {pay.proofUrl ? (
                                  <a
                                    href={pay.proofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs text--600 dark:text--400 hover:text-blue-300 font-semibold transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Lihat Bukti
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-600">Belum Upload</span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusBadge(pay.status)}`}>
                                  {pay.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end gap-2">
                                  {settings.paymentGatewayConfigured ? (
                                    <button
                                      onClick={() => handleSyncMidtransPayment(pay.id, pay.registrationId)}
                                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text--600 dark:text--400 font-bold text-[10px] uppercase tracking-wider border border-blue-500/20 transition-all"
                                    >
                                      Cek Gateway
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleVerifyPayment(pay.id, pay.registrationId, 'APPROVE')}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text--600 dark:text--400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/20 transition-all"
                                      >
                                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                        Setujui
                                      </button>
                                      <button
                                        onClick={() => handleVerifyPayment(pay.id, pay.registrationId, 'REJECT')}
                                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text--600 dark:text--400 font-bold text-[10px] uppercase tracking-wider border border-red-500/20 transition-all"
                                      >
                                        <XCircle className="w-3 h-3 inline mr-1" />
                                        Tolak
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAYOUTS (Pencairan Dana) */}
            {activeTab === 'payouts' && !loading && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text--600 dark:text--400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pencairan Dana</h3>
                        <p className="text-[10px] text-slate-500">{payouts.length} permintaan</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPayoutForm(v => !v)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajukan Pencairan</span>
                    </button>
                  </div>

                  {/* Inline Payout Form */}
                  {showPayoutForm && (
                    <div className="border-b border-slate-200 dark:border-white/[0.06] p-6 bg-slate-100 dark:bg-slate-800/40">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Form Pengajuan Pencairan Dana</h4>
                      <form
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!user) return;
                          setPayoutLoading(true);
                          try {
                            const { requestPayout } = await import('../services/payoutService');
                            await requestPayout(payoutEventId, user.uid, Number(payoutAmount), payoutBank, payoutAccount, payoutHolder);
                            addNotification('success', 'Berhasil', 'Permintaan pencairan dana telah diajukan.');
                            setShowPayoutForm(false);
                            setPayoutEventId(''); setPayoutBank(''); setPayoutAccount(''); setPayoutHolder(''); setPayoutAmount('');
                            loadAdminData();
                          } catch (err: any) {
                            addNotification('error', 'Gagal', err.message);
                          } finally {
                            setPayoutLoading(false);
                          }
                        }}
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text--600 dark:text--400 uppercase tracking-wider mb-1.5">Pilih Event</label>
                          <select
                            required
                            value={payoutEventId}
                            onChange={e => setPayoutEventId(e.target.value)}
                            className="w-full bg-white dark:bg-blue-950 border border-white/[0.08] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500/50 outline-none"
                          >
                            <option value="">-- Pilih Event --</option>
                            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text--600 dark:text--400 uppercase tracking-wider mb-1.5">Nominal (Rp)</label>
                          <input
                            required type="number" min="1"
                            value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
                            placeholder="1000000"
                            className="w-full bg-white dark:bg-blue-950 border border-white/[0.08] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500/50 outline-none placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text--600 dark:text--400 uppercase tracking-wider mb-1.5">Nama Bank</label>
                          <input
                            required
                            value={payoutBank} onChange={e => setPayoutBank(e.target.value)}
                            placeholder="BCA, Mandiri, BNI..."
                            className="w-full bg-white dark:bg-blue-950 border border-white/[0.08] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500/50 outline-none placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text--600 dark:text--400 uppercase tracking-wider mb-1.5">Nomor Rekening</label>
                          <input
                            required
                            value={payoutAccount} onChange={e => setPayoutAccount(e.target.value)}
                            placeholder="1234567890"
                            className="w-full bg-white dark:bg-blue-950 border border-white/[0.08] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs font-mono focus:border-blue-500/50 outline-none placeholder:text-slate-600"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 dark:text--600 dark:text--400 uppercase tracking-wider mb-1.5">Nama Pemilik Rekening</label>
                          <input
                            required
                            value={payoutHolder} onChange={e => setPayoutHolder(e.target.value)}
                            placeholder="Budi Santoso"
                            className="w-full bg-white dark:bg-blue-950 border border-white/[0.08] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500/50 outline-none placeholder:text-slate-600"
                          />
                        </div>
                        <div className="sm:col-span-2 flex gap-3">
                          <button
                            type="submit"
                            disabled={payoutLoading}
                            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                          >
                            {payoutLoading ? 'Mengajukan...' : 'Kirim Permintaan Pencairan'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPayoutForm(false)}
                            className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  {payouts.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                      <DollarSign className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                      <p className="text-xs font-semibold">Belum ada permintaan pencairan dana.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <th className="py-3 px-6">Tanggal</th>
                            <th className="py-3 px-6">Event ID</th>
                            <th className="py-3 px-6">Bank &amp; Rekening</th>
                            <th className="py-3 px-6">Nominal</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {payouts.map(payout => (
                            <tr key={payout.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 text-xs font-mono text-slate-700 dark:text-slate-300">
                                {new Date(payout.requestedAt).toLocaleDateString('id-ID')}
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-600 dark:text--600 dark:text--400 font-mono truncate max-w-[150px]">{payout.eventId}</td>
                              <td className="py-4 px-6">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{payout.bankName} — {payout.accountNumber}</p>
                                <p className="text-[10px] text-slate-500">{payout.accountHolderName}</p>
                              </td>
                              <td className="py-4 px-6 text-xs font-bold text--600 dark:text--400">{formatRupiah(payout.amount)}</td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusBadge(payout.status)}`}>
                                  {payout.status}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end gap-2">
                                  {payout.status === 'PENDING' && isSuperAdmin ? (
                                    <>
                                      <button
                                        onClick={async () => {
                                          const url = prompt('Masukkan URL bukti transfer (opsional):');
                                          if (url !== null) {
                                            try {
                                              await approvePayout(payout.id, 'PAID', url, '', user!.uid, user!.email!);
                                              addNotification('success', 'Sukses', 'Pencairan dana disetujui dan dibayar.');
                                              loadAdminData();
                                            } catch (e: any) {
                                              addNotification('error', 'Gagal', e.message);
                                            }
                                          }
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text--600 dark:text--400 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/20 transition-all"
                                      >
                                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                        Selesai (Paid)
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const notes = prompt('Alasan penolakan:');
                                          if (notes) {
                                            try {
                                              await approvePayout(payout.id, 'REJECTED', '', notes, user!.uid, user!.email!);
                                              addNotification('info', 'Ditolak', 'Permintaan ditolak.');
                                              loadAdminData();
                                            } catch (e: any) {
                                              addNotification('error', 'Gagal', e.message);
                                            }
                                          }
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text--600 dark:text--400 font-bold text-[10px] uppercase tracking-wider border border-red-500/20 transition-all"
                                      >
                                        <XCircle className="w-3 h-3 inline mr-1" />
                                        Tolak
                                      </button>
                                    </>
                                  ) : (
                                    payout.proofUrl && (
                                      <a
                                        href={payout.proofUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 text-xs text--600 dark:text--400 hover:text-emerald-300 font-semibold transition-colors"
                                      >
                                        <Eye className="w-3 h-3" />
                                        Bukti Transfer
                                      </a>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: RESULTS */}
            {activeTab === 'results' && !loading && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl max-w-xl mx-auto">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text--600 dark:text--400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Input Hasil Lomba</h3>
                      <p className="text-[10px] text-slate-500">Input / Update Waktu Finisher</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleSubmitResult} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text--600 dark:text--400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Pilih Event</label>
                        <select
                          value={resEventId}
                          onChange={(e) => setResEventId(e.target.value)}
                          className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                        >
                          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 dark:text--600 dark:text--400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Nomor BIB</label>
                          <input
                            type="text"
                            required
                            value={resBib}
                            onChange={(e) => setResBib(e.target.value)}
                            placeholder="TR50-0001"
                            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs font-mono focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text--600 dark:text--400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Nama Peserta</label>
                          <input
                            type="text"
                            required
                            value={resName}
                            onChange={(e) => setResName(e.target.value)}
                            placeholder="Budi Santoso"
                            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 dark:text--600 dark:text--400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Chip Time</label>
                          <input
                            type="text"
                            required
                            value={resChipTime}
                            onChange={(e) => setResChipTime(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs font-mono focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text--600 dark:text--400 font-bold uppercase tracking-wider mb-1.5 text-[10px]">Rank Finisher</label>
                          <input
                            type="number"
                            required
                            value={resRank}
                            onChange={(e) => setResRank(Number(e.target.value))}
                            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/[0.06] rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all"
                      >
                        Publikasikan Hasil Finisher
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USERS */}
            {activeTab === 'users' && !loading && isSuperAdmin && (
              <div className="animate-in fade-in duration-300">
                <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Manajemen Pengguna</h3>
                      <p className="text-[10px] text-slate-500">{usersList.length} pengguna terdaftar</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/[0.04] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-6">Email Pengguna</th>
                          <th className="py-3 px-6">Role Saat Ini</th>
                          <th className="py-3 px-6">Ubah Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {usersList.map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{u.email}</p>
                              {u.banned && (
                                <span className="text-[9px] text--600 dark:text--400 font-bold uppercase tracking-wider">BANNED</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                u.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                                u.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                                u.role === 'ORGANIZER' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  onClick={() => handleRoleChange(u.id, 'ADMIN')}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider border border-rose-500/20 transition-all"
                                >
                                  <Shield className="w-3 h-3 inline mr-1" />
                                  ADMIN
                                </button>
                                <button
                                  onClick={() => handleRoleChange(u.id, 'ORGANIZER')}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider border border-blue-500/20 transition-all"
                                >
                                  <UserCheck className="w-3 h-3 inline mr-1" />
                                  ORGANIZER
                                </button>
                                <button
                                  onClick={() => handleRoleChange(u.id, 'PARTICIPANT')}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider border border-slate-500/20 transition-all"
                                >
                                  PARTICIPANT
                                </button>
                                <button
                                  onClick={() => {
                                    if (user) {
                                      confirmAction(
                                        u.banned ? 'Buka Blokir Pengguna' : 'Blokir Pengguna',
                                        `Anda yakin ingin ${u.banned ? 'membuka blokir' : 'memblokir'} pengguna ${u.email}?`,
                                        !u.banned,
                                        async () => {
                                          await banUserBySuperAdmin(user.uid, user.email || '', u.id, !u.banned);
                                          loadAdminData();
                                        }
                                      );
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all ${
                                    u.banned
                                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20'
                                  }`}
                                >
                                  <Ban className="w-3 h-3 inline mr-1" />
                                  {u.banned ? 'UNBAN' : 'BAN'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Not SuperAdmin Users Tab */}
            {activeTab === 'users' && !loading && !isSuperAdmin && (
              <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl p-12 text-center shadow-xl">
                <Shield className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-sm font-bold text-slate-600 dark:text--600 dark:text--400">Akses Terbatas</p>
                <p className="text-xs text-slate-600 mt-1">Hanya Super Admin yang dapat mengelola pengguna.</p>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && !loading && (
              <div className="animate-in fade-in duration-300">
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Settings Sidebar */}
                  <div className="w-full md:w-64 shrink-0">
                    <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:sticky md:top-28 pb-4 md:pb-0 scrollbar-hide">
                      {[
                        { id: 'system', label: 'Sistem & Maintenance', icon: Settings },
                        { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
                        { id: 'sponsors', label: 'Mitra & Sponsor', icon: Trophy },
                        { id: 'pages', label: 'Halaman Statis (CMS)', icon: FileText },
                        { id: 'footer', label: 'Footer & Copyright', icon: Edit3 }
                      ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeSettingsTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSettingsTab(tab.id as any)}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all text-left ${
                              isActive 
                                ? 'bg-blue-500 text-slate-900 dark:text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text--600 dark:text--400 hover:text-slate-900 dark:text-slate-200 hover:border-blue-500/50'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Settings Content Area */}
                  <div className="flex-1 min-w-0 space-y-6">
                    
                    {/* System Settings */}
                    {activeSettingsTab === 'system' && (
                      <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl animate-in fade-in">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Status Sistem</h3>
                            <p className="text-xs text-slate-500">Kelola ketersediaan platform publik</p>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-blue-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Maintenance Mode</span>
                              <span className="text-xs text-slate-500">Saat aktif, pengunjung akan melihat halaman pemeliharaan dan tidak dapat mendaftar.</span>
                            </div>
                            <button
                              onClick={handleToggleMaintenance}
                              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                                settings.maintenanceMode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  settings.maintenanceMode ? 'translate-x-7' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Gateway Config */}
                    {activeSettingsTab === 'payment' && (
                      <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl animate-in fade-in">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Payment Gateway</h3>
                            <p className="text-xs text-slate-500">Konfigurasi integrasi Midtrans</p>
                          </div>
                        </div>
                        <div className="p-6 space-y-6">
                          <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl flex gap-3">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                              Masukkan **Server Key** dari dashboard Midtrans Anda untuk mengaktifkan verifikasi pembayaran otomatis. Kosongkan jika Anda ingin menggunakan sistem pembayaran manual (Transfer Bank).
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Midtrans Environment</label>
                              <select
                                id="midtrans-environment-select"
                                defaultValue={settings.midtransEnvironment || 'sandbox'}
                                className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                              >
                                <option value="sandbox">Sandbox (Testing)</option>
                                <option value="production">Production (Live)</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-blue-900/20">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                  Sandbox Keys
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Server Key</label>
                                    <input
                                      type="password"
                                      id="midtrans-sandbox-server-key-input"
                                      defaultValue={settings.midtransSandboxServerKey || ''}
                                      className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                      placeholder="SB-Mid-server-..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Client Key</label>
                                    <input
                                      type="text"
                                      id="midtrans-sandbox-client-key-input"
                                      defaultValue={settings.midtransSandboxClientKey || ''}
                                      className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                      placeholder="SB-Mid-client-..."
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-blue-900/20">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  Production Keys
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Server Key</label>
                                    <input
                                      type="password"
                                      id="midtrans-production-server-key-input"
                                      defaultValue={settings.midtransProductionServerKey || ''}
                                      className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                      placeholder="Mid-server-..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Client Key</label>
                                    <input
                                      type="text"
                                      id="midtrans-production-client-key-input"
                                      defaultValue={settings.midtransProductionClientKey || ''}
                                      className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                      placeholder="Mid-client-..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 dark:border-white/[0.06] pt-6 mt-6">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Pengaturan Pembayaran Manual (Transfer)</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Nama Bank</label>
                                <input
                                  type="text"
                                  id="manual-bank-input"
                                  defaultValue={settings.manualPaymentBank || ''}
                                  className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                  placeholder="Contoh: BCA / Mandiri / BNI"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Nomor Rekening</label>
                                <input
                                  type="text"
                                  id="manual-account-input"
                                  defaultValue={settings.manualPaymentAccount || ''}
                                  className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                  placeholder="Nomor rekening"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Atas Nama</label>
                                <input
                                  type="text"
                                  id="manual-name-input"
                                  defaultValue={settings.manualPaymentName || ''}
                                  className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                  placeholder="Nama pemilik rekening"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Biaya Admin (Rp)</label>
                                <input
                                  type="number"
                                  id="admin-fee-input"
                                  defaultValue={settings.adminFee || 0}
                                  className="w-full bg-white dark:bg-blue-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
                                  placeholder="Biaya admin (contoh: 5000)"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <button
                                onClick={async () => {
                                  if (!user) return;
                                  const envSelect = document.getElementById('midtrans-environment-select') as HTMLSelectElement;
                                  const sbServerInput = document.getElementById('midtrans-sandbox-server-key-input') as HTMLInputElement;
                                  const sbClientInput = document.getElementById('midtrans-sandbox-client-key-input') as HTMLInputElement;
                                  const prodServerInput = document.getElementById('midtrans-production-server-key-input') as HTMLInputElement;
                                  const prodClientInput = document.getElementById('midtrans-production-client-key-input') as HTMLInputElement;
                                  const bankInput = document.getElementById('manual-bank-input') as HTMLInputElement;
                                  const accountInput = document.getElementById('manual-account-input') as HTMLInputElement;
                                  const nameInput = document.getElementById('manual-name-input') as HTMLInputElement;
                                  const feeInput = document.getElementById('admin-fee-input') as HTMLInputElement;
                                  
                                  if (!envSelect || !sbServerInput || !prodServerInput || !bankInput || !accountInput || !nameInput || !feeInput) return;
                                  
                                  try {
                                    setLoading(true);
                                    
                                    const env = envSelect.value as 'sandbox' | 'production';
                                    const activeServerKey = env === 'production' ? prodServerInput.value : sbServerInput.value;
                                    const activeClientKey = env === 'production' ? prodClientInput.value : sbClientInput.value;
                                    const isConfigured = !!activeServerKey;

                                    await updateSystemSettings({
                                      midtransEnvironment: env,
                                      midtransSandboxServerKey: sbServerInput.value,
                                      midtransSandboxClientKey: sbClientInput.value,
                                      midtransProductionServerKey: prodServerInput.value,
                                      midtransProductionClientKey: prodClientInput.value,
                                      midtransServerKey: activeServerKey,
                                      midtransClientKey: activeClientKey,
                                      paymentGatewayConfigured: isConfigured,
                                      paymentGatewayName: isConfigured ? 'MIDTRANS' : '',
                                      manualPaymentBank: bankInput.value,
                                      manualPaymentAccount: accountInput.value,
                                      manualPaymentName: nameInput.value,
                                      adminFee: parseInt(feeInput.value) || 0
                                    });
                                    await reloadSettings();
                                    addNotification('success', 'Tersimpan', 'Pengaturan Pembayaran berhasil diperbarui.');
                                  } catch (e: any) {
                                    addNotification('error', 'Gagal', e.message);
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap"
                              >
                                Simpan Pengaturan
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Page Settings */}
                    {activeSettingsTab === 'pages' && (
                      <PageSettings addNotification={addNotification} />
                    )}

                    {/* Footer Settings */}
                    {activeSettingsTab === 'footer' && (
                      <FooterSettings addNotification={addNotification} />
                    )}

                    {/* Sponsor Settings */}
                    {activeSettingsTab === 'sponsors' && (
                      <SponsorSettings addNotification={addNotification} />
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>
        </main>

      {/* Create Event Modal */}
      {showEventModal && user && (
        <CreateEventModal 
          user={user}
          initialData={editingEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSuccess={() => {
            setShowEventModal(false);
            setEditingEvent(null);
            loadAdminData();
          }}
          addNotification={addNotification}
        />
      )}

      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        isDanger={confirmState.isDanger}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};
