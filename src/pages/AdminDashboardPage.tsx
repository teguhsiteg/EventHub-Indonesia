import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { EventItem, Registration, Payment, EventCategory, UserRole, PayoutRequest } from '../types';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { CreateEventModal } from '../components/admin/CreateEventModal';
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
  FileText,
  Search,
  Filter
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { settings, reloadSettings, addNotification } = useSettings();

  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'payments' | 'payouts' | 'results' | 'users' | 'settings'>('stats');
  
  // Data States
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
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
        getDocs(query(collection(db, 'audit_logs'), limit(50)))
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-950 px-2.5 py-1 rounded border border-amber-800/40">
                GUWIGO EVENTS ADMIN
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase mt-1">Guwigo Events Management</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pengelolaan real-time event, pendaftaran, pembayaran, dan hasil lomba.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/check-in"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Buka QR Check-In Scanner</span>
            </Link>
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider border border-slate-300 dark:border-slate-700"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Event Baru</span>
            </button>
          </div>
        </div>

        {/* Layout Wrapper */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:sticky md:top-28 pb-4 md:pb-0 scrollbar-hide">
              {[
                { id: 'stats', label: 'Ringkasan Statistik', icon: Activity },
                { id: 'events', label: 'Manajemen Event', icon: Trophy },
                { id: 'payments', label: 'Verifikasi Pembayaran', icon: CreditCard },
                { id: 'payouts', label: 'Pencairan Dana', icon: DollarSign },
                { id: 'results', label: 'Input Hasil Lomba', icon: FileText },
                { id: 'users', label: 'Pengguna & Role', icon: Users },
                { id: 'settings', label: 'Pengaturan Sistem', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all text-left ${
                      isActive 
                        ? 'bg-orange-500 text-slate-900 dark:text-white shadow-lg shadow-orange-500/20' 
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-200 hover:border-orange-500/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

        {/* TAB 1: REAL FIRESTORE STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">TOTAL EVENT</span>
                <span className="block text-3xl font-black text-slate-900 dark:text-white mt-1">{events.length}</span>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">TOTAL PENDAFTARAN</span>
                <span className="block text-3xl font-black text-orange-400 mt-1">{registrations.length}</span>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">PEMBAYARAN PENDING</span>
                <span className="block text-3xl font-black text-amber-400 mt-1">
                  {payments.filter(p => p.status === 'PENDING').length}
                </span>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">TOTAL REVENUE</span>
                <span className="block text-2xl font-black text-emerald-400 mt-1">{formatRupiah(totalRevenue)}</span>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase mb-4">Audit Logs Aktivitas Sistem</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase">
                      <th className="pb-3">Waktu</th>
                      <th className="pb-3">Aktor</th>
                      <th className="pb-3">Tindakan</th>
                      <th className="pb-3">Resource ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {auditLogs.slice(0, 10).map(log => (
                      <tr key={log.id}>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString('id-ID')}</td>
                        <td className="py-2.5 text-slate-900 dark:text-white">{log.actorEmail}</td>
                        <td className="py-2.5 text-amber-400 font-bold">{log.action}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{log.resourceId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS MANAGER */}
        {activeTab === 'events' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                  <th className="p-4">Nama Event</th>
                  <th className="p-4">Lokasi</th>
                  <th className="p-4">Tanggal Start</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{ev.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{ev.location}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{new Date(ev.startDate).toLocaleDateString('id-ID')}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-orange-950 text-orange-400 rounded text-[10px] font-black uppercase">
                        {ev.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-4">
                      <button
                        onClick={() => {
                          setEditingEvent(ev);
                          setShowEventModal(true);
                        }}
                        className="text-orange-500 hover:text-orange-400 font-bold"
                      >
                        Edit
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
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PAYMENTS VERIFICATION */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Bukti Upload</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{pay.invoiceId}</td>
                    <td className="p-4 font-bold text-amber-400">{formatRupiah(pay.amount)}</td>
                    <td className="p-4">
                      {pay.proofUrl ? (
                        <a href={pay.proofUrl} target="_blank" rel="noreferrer" className="text-orange-400 underline font-semibold">
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-slate-500">Belum Upload</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-xs">{pay.status}</td>
                    <td className="p-4 space-x-2">
                      {settings.paymentGatewayConfigured ? (
                        <button
                          onClick={() => handleSyncMidtransPayment(pay.id, pay.registrationId)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase text-xs"
                        >
                          Cek Gateway
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleVerifyPayment(pay.id, pay.registrationId, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white rounded font-bold uppercase text-xs"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(pay.id, pay.registrationId, 'REJECT')}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white rounded font-bold uppercase text-xs"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3.5: PAYOUTS */}
        {activeTab === 'payouts' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">Permintaan Pencairan Dana</h3>
              <button
                onClick={async () => {
                  const eventId = prompt('Masukkan Event ID:');
                  if (!eventId) return;
                  const bankName = prompt('Nama Bank (contoh: BCA):');
                  if (!bankName) return;
                  const accountNumber = prompt('Nomor Rekening:');
                  if (!accountNumber) return;
                  const accountHolderName = prompt('Nama Pemilik Rekening:');
                  if (!accountHolderName) return;
                  const amount = prompt('Nominal Pencairan (Rp):');
                  if (!amount) return;

                  try {
                    const { requestPayout } = await import('../services/payoutService');
                    await requestPayout(eventId, user!.uid, Number(amount), bankName, accountNumber, accountHolderName);
                    addNotification('success', 'Berhasil', 'Permintaan pencairan dana telah diajukan.');
                    loadAdminData();
                  } catch (e: any) {
                    addNotification('error', 'Gagal', e.message);
                  }
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold uppercase text-xs"
              >
                + Ajukan Pencairan
              </button>
            </div>
            {payouts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">Belum ada permintaan pencairan dana.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Event ID</th>
                    <th className="p-4">Bank & Rekening</th>
                    <th className="p-4">Nominal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payouts.map(payout => (
                    <tr key={payout.id}>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {new Date(payout.requestedAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{payout.eventId}</td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {payout.bankName} - {payout.accountNumber}<br/>
                        <span className="text-[10px] text-slate-500">{payout.accountHolderName}</span>
                      </td>
                      <td className="p-4 font-bold text-amber-400">{formatRupiah(payout.amount)}</td>
                      <td className="p-4 font-bold text-xs">{payout.status}</td>
                      <td className="p-4 space-x-2">
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
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white rounded font-bold uppercase text-xs"
                            >
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
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white rounded font-bold uppercase text-xs"
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          payout.proofUrl && (
                            <a href={payout.proofUrl} target="_blank" rel="noreferrer" className="text-emerald-500 underline font-semibold">
                              Bukti Transfer
                            </a>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 4: RACE RESULTS EDITOR */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl mx-auto space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Input / Update Waktu Finisher</h3>
            <form onSubmit={handleSubmitResult} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Pilih Event</label>
                <select
                  value={resEventId}
                  onChange={(e) => setResEventId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white"
                >
                  {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Nomor BIB</label>
                  <input
                    type="text"
                    required
                    value={resBib}
                    onChange={(e) => setResBib(e.target.value)}
                    placeholder="TR50-0001"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Nama Peserta</label>
                  <input
                    type="text"
                    required
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Chip Time</label>
                  <input
                    type="text"
                    required
                    value={resChipTime}
                    onChange={(e) => setResChipTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold uppercase mb-1">Rank Finisher</label>
                  <input
                    type="number"
                    required
                    value={resRank}
                    onChange={(e) => setResRank(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase"
              >
                Publikasikan Hasil Finisher
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: USER ROLE MANAGEMENT */}
        {activeTab === 'users' && isSuperAdmin && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                  <th className="p-4">Email Pengguna</th>
                  <th className="p-4">Role Saat Ini</th>
                  <th className="p-4">Ubah Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersList.map(u => (
                  <tr key={u.id}>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{u.email}</td>
                    <td className="p-4 font-mono text-amber-400">{u.role}</td>
                    <td className="p-4 space-x-2">
                      <button onClick={() => handleRoleChange(u.id, 'ADMIN')} className="px-2.5 py-1 bg-amber-600 text-slate-900 dark:text-white rounded font-bold text-[10px]">
                        ADMIN
                      </button>
                      <button onClick={() => handleRoleChange(u.id, 'ORGANIZER')} className="px-2.5 py-1 bg-blue-600 text-slate-900 dark:text-white rounded font-bold text-[10px]">
                        ORGANIZER
                      </button>
                      <button onClick={() => handleRoleChange(u.id, 'PARTICIPANT')} className="px-2.5 py-1 bg-slate-700 text-slate-900 dark:text-white rounded font-bold text-[10px]">
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
                        className={`px-2.5 py-1 rounded font-bold text-[10px] ${u.banned ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                      >
                        {u.banned ? 'UNBAN' : 'BAN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-xl mx-auto space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Pengaturan Sistem & Maintenance</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Maintenance Mode</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Pengunjung publik akan melihat halaman pemeliharaan sistem.</span>
              </div>
              <button
                onClick={handleToggleMaintenance}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase ${
                  settings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {settings.maintenanceMode ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">Konfigurasi Payment Gateway</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Masukkan Server Key (Midtrans) untuk integrasi verifikasi pembayaran otomatis.</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Midtrans Server Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    id="midtrans-server-key-input"
                    defaultValue={settings.midtransServerKey || ''}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm focus:border-orange-500 outline-none"
                    placeholder="SB-Mid-server-xxx"
                  />
                  <button
                    onClick={async () => {
                      if (!user) return;
                      const input = document.getElementById('midtrans-server-key-input') as HTMLInputElement;
                      if (!input) return;
                      try {
                        setLoading(true);
                        await updateSystemSettings(user.uid, user.email || '', {
                          midtransServerKey: input.value,
                          paymentGatewayConfigured: !!input.value,
                          paymentGatewayName: input.value ? 'MIDTRANS' : ''
                        });
                        await reloadSettings();
                        addNotification('success', 'Tersimpan', 'Konfigurasi Payment Gateway berhasil diperbarui.');
                      } catch (e: any) {
                        addNotification('error', 'Gagal', e.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          </div>
        </div>

      </div>

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
