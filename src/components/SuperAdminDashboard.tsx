/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, Settings, Ticket, Radio, Landmark, CreditCard, 
  Plus, Trash, CheckCircle, XCircle, AlertCircle, Sparkles, 
  Bell, Check, Edit, Database, Terminal, Play, Lock, RefreshCw, Eye, Search,
  Calendar, MapPin, Users, Award, HelpCircle, Download, FileSpreadsheet
} from 'lucide-react';
import { Coupon } from '../types';

export const SuperAdminDashboard: React.FC = () => {
  const { 
    coupons, addCoupon, updateCoupon, deleteCoupon, withdrawals, updateWithdrawStatus, 
    announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    globalSettings, updateGlobalSettings, registrations, deleteRegistration, events,
    updatePaymentStatus, addEvent, updateEvent, deleteEvent
  } = useApp();

  const [activeMenu, setActiveMenu] = useState<'withdrawals' | 'coupons' | 'payments' | 'settings' | 'broadcast' | 'cms_events' | 'cms_faqs' | 'auditing'>('withdrawals');

  // Auditing Preview & Search States
  const [auditPreviewTab, setAuditPreviewTab] = useState<'users' | 'events' | 'transactions'>('users');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Payment Gateway Config & Simulator States
  const [paymentSubTab, setPaymentSubTab] = useState<'transactions' | 'midtrans_config' | 'simulator'>('transactions');
  
  const [gatewaySettings, setGatewaySettings] = useState(() => {
    const saved = localStorage.getItem('eh_gateway_settings');
    return saved ? JSON.parse(saved) : {
      mode: 'sandbox', // 'sandbox' | 'production'
      merchantId: 'M182902194',
      clientKey: 'SB-Mid-client-8XfH13ha91pS',
      serverKey: 'SB-Mid-server-9JkS82bF44pK',
      activeMethods: {
        qris: true,
        bca_va: true,
        bni_va: true,
        mandiri_va: true,
        cc: false
      },
      webhookUrl: 'https://api.eventhub.id/v1/payments/webhook'
    };
  });

  const [gatewaySuccessMsg, setGatewaySuccessMsg] = useState('');
  const [simulatorRegId, setSimulatorRegId] = useState('');
  const [simulatorStatus, setSimulatorStatus] = useState<'settlement' | 'pending' | 'expire' | 'cancel'>('settlement');
  const [simulatorMethod, setSimulatorMethod] = useState<'qris' | 'bca_va' | 'bni_va' | 'mandiri_va' | 'cc'>('qris');
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-seed some mock webhook callbacks for immersive real-time diagnostic ledger
  const [hookLogs, setHookLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('eh_gateway_hook_logs');
    if (saved) return JSON.parse(saved);
    
    return [
      {
        id: 'hook-log-1',
        timestamp: new Date(Date.now() - 3600000).toLocaleString('id-ID'),
        status: 'settlement',
        orderId: 'TX-EHB7718',
        amount: 350000,
        provider: 'Midtrans API',
        payload: {
          transaction_time: '2026-06-08 08:35:10',
          transaction_status: 'settlement',
          status_code: '200',
          gross_amount: '350000.00',
          payment_type: 'qris',
          transaction_id: '8a91cbf0-eef3-4011-8172-11883fa9012a',
          order_id: 'TX-EHB7718',
          signature_key: 'ef72183ac182a923bc110a221bdecca9918fb201bcf9128aa179eb9d91fa9a2bf'
        },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Midtrans-Webhook-Dispatcher/2.0',
          'X-Signature': 'ef72183ac182...'
        }
      },
      {
        id: 'hook-log-2',
        timestamp: new Date(Date.now() - 7200000).toLocaleString('id-ID'),
        status: 'pending',
        orderId: 'TX-EHB6291',
        amount: 500000,
        provider: 'Midtrans API',
        payload: {
          transaction_time: '2026-06-08 07:11:45',
          transaction_status: 'pending',
          status_code: '201',
          gross_amount: '500000.00',
          payment_type: 'bank_transfer',
          transaction_id: '9da12bb0-fff1-304d-bd1f-99883fb55123',
          order_id: 'TX-EHB6291',
          signature_key: 'ad782bb0dc11ea99bf881cca9bddeb12bc8bc201777fa118ef87eb9da9faad533'
        },
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Midtrans-Webhook-Dispatcher/2.0',
          'X-Signature': 'ad782bb0dc11...'
        }
      }
    ];
  });

  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem('eh_gateway_settings', JSON.stringify(gatewaySettings));
  }, [gatewaySettings]);

  useEffect(() => {
    localStorage.setItem('eh_gateway_hook_logs', JSON.stringify(hookLogs));
  }, [hookLogs]);

  // Editing state toggles
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);

  // Coupon creator form states
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 15,
    quota: 100,
    expiryDate: '2026-12-31'
  });

  // Announcement creator form states
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTarget, setAnnTarget] = useState<'all' | 'organizer' | 'participant'>('all');
  const [annSuccessMsg, setAnnSuccessMsg] = useState('');

  // Settings local overrides
  const [platformName, setPlatformName] = useState(globalSettings.platformName);
  const [feePct, setFeePct] = useState(globalSettings.platformFeePct);
  const [smsEnabled, setSmsEnabled] = useState(globalSettings.smsNotificationEnabled);
  const [emailEnabled, setEmailEnabled] = useState(globalSettings.emailNotificationEnabled);
  const [waEnabled, setWaEnabled] = useState(globalSettings.whatsAppNotificationsEnabled);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Event CMS States
  const [cmsCurrentEvent, setCmsCurrentEvent] = useState<any | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [cmsEventSuccessMsg, setCmsEventSuccessMsg] = useState('');

  // FAQ CMS States
  const [customFaqsEn, setCustomFaqsEn] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('eh_custom_faqs_en');
      return saved ? JSON.parse(saved) : [
        { id: 'en-1', question: 'How do I pay for my ticket?', answer: 'You can settle using Midtrans checkout via payment methods like QRIS, BCA VA, BNI VA, or Mandiri VA.', category: 'Participant' },
        { id: 'en-2', question: 'When is the digital ticket issue time?', answer: 'Your printable bar-ticket together with automated digital BIB allocations are generated instantly upon auto-verification.', category: 'Participant' }
      ];
    } catch (e) {
      return [];
    }
  });

  const [customFaqsId, setCustomFaqsId] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('eh_custom_faqs_id');
      return saved ? JSON.parse(saved) : [
        { id: 'id-1', question: 'Bagaimana cara membayar tiket saya?', answer: 'Anda dapat membayar tiket Anda dengan aman menggunakan Midtrans via QRIS, BCA VA, BNI VA, atau Mandiri VA.', category: 'Participant' },
        { id: 'id-2', question: 'Kapan tiket digital saya diterbitkan?', answer: 'E-Ticket otomatis bersama dengan nomor BIB akan diterbitkan secara instan setelah pembayaran Anda terverifikasi otomatis.', category: 'Participant' }
      ];
    } catch (e) {
      return [];
    }
  });
  const [faqSuccessMsg, setFaqSuccessMsg] = useState('');
  const [faqLang, setFaqLang] = useState<'id' | 'en'>('id');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || newCoupon.value <= 0) return;

    if (editingCoupon) {
      updateCoupon({
        ...editingCoupon,
        code: newCoupon.code.trim().toUpperCase(),
        type: newCoupon.type,
        value: Number(newCoupon.value),
        quota: Number(newCoupon.quota),
        expiryDate: newCoupon.expiryDate
      });
      setEditingCoupon(null);
    } else {
      addCoupon({
        code: newCoupon.code.trim().toUpperCase(),
        type: newCoupon.type,
        value: Number(newCoupon.value),
        quota: Number(newCoupon.quota),
        expiryDate: newCoupon.expiryDate
      });
    }

    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 15,
      quota: 100,
      expiryDate: '2026-12-31'
    });
  };

  const handleStartEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setNewCoupon({
      code: c.code,
      type: c.type,
      value: c.value,
      quota: c.quota,
      expiryDate: c.expiryDate
    });
  };

  const handleBroadcastAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    if (editingAnnouncement) {
      updateAnnouncement({
        ...editingAnnouncement,
        title: annTitle,
        message: annMessage,
        targetRole: annTarget
      });
      setEditingAnnouncement(null);
      setAnnSuccessMsg('Platform broadcast successfully updated.');
    } else {
      addAnnouncement(annTitle, annMessage, annTarget);
      setAnnSuccessMsg('Platform broadcast successfully deployed.');
    }

    setAnnTitle('');
    setAnnMessage('');
    setTimeout(() => setAnnSuccessMsg(''), 4000);
  };

  const handleStartEditAnnouncement = (ann: any) => {
    setEditingAnnouncement(ann);
    setAnnTitle(ann.title);
    setAnnMessage(ann.message);
    setAnnTarget(ann.targetRole);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalSettings({
      platformName,
      platformFeePct: Number(feePct),
      minWithdrawalAmount: globalSettings.minWithdrawalAmount,
      smsNotificationEnabled: smsEnabled,
      emailNotificationEnabled: emailEnabled,
      whatsAppNotificationsEnabled: waEnabled
    });
    setSettingsSuccessMsg('Global configurations modified successfully.');
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  const getAllPlatformUsers = () => {
    // Unique user profiles base dictionary
    const seedUsers: Record<string, any> = {
      'budi.santoso@gmail.com': {
        id: 'user-001',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        role: 'participant',
        whatsapp: '081234567890',
        totalRegs: 0,
        totalSpent: 0,
        status: 'Active'
      },
      'contact@borobudurmarathon.co.id': {
        id: 'org-yayasan-marathon',
        name: 'Yayasan Borobudur Marathon',
        email: 'contact@borobudurmarathon.co.id',
        role: 'organizer',
        whatsapp: '08190000444',
        totalRegs: 0,
        totalSpent: 0,
        status: 'Active'
      },
      'master@eventhub.id': {
        id: 'admin-001',
        name: 'EventHub Super Master',
        email: 'master@eventhub.id',
        role: 'super_admin',
        whatsapp: '08122334455',
        totalRegs: 0,
        totalSpent: 0,
        status: 'Active'
      }
    };

    // Parse all registrations on the platform
    registrations.forEach(r => {
      if (!r.personalInfo?.email) return;
      const emailKey = r.personalInfo.email.toLowerCase().trim();
      const statusLabel = r.checkInStatus === 'finished' ? 'Completed Finisher' : r.checkInStatus === 'checked_in' ? 'Attending Event' : 'Registered';
      const ticketFeePaid = r.paymentInfo?.status === 'paid' ? (r.paymentInfo.finalAmount || 0) : 0;

      if (seedUsers[emailKey]) {
        seedUsers[emailKey].totalRegs += 1;
        seedUsers[emailKey].totalSpent += ticketFeePaid;
        if (seedUsers[emailKey].status === 'Active' || seedUsers[emailKey].status === 'Registered') {
          seedUsers[emailKey].status = statusLabel;
        }
      } else {
        seedUsers[emailKey] = {
          id: `usr-${r.id.replace('TX-', '').slice(0, 5)}-${Math.floor(100 + Math.random() * 899)}`,
          name: `${r.personalInfo.firstName || ''} ${r.personalInfo.lastName || ''}`.trim(),
          email: r.personalInfo.email,
          role: 'participant',
          whatsapp: r.personalInfo.whatsApp || '-',
          totalRegs: 1,
          totalSpent: ticketFeePaid,
          status: statusLabel
        };
      }
    });

    const budiRegs = registrations.filter(r => r.personalInfo?.email?.toLowerCase().trim() === 'budi.santoso@gmail.com');
    if (budiRegs.length > 0) {
      seedUsers['budi.santoso@gmail.com'].totalRegs = budiRegs.length;
      seedUsers['budi.santoso@gmail.com'].totalSpent = budiRegs
        .filter(r => r.paymentInfo?.status === 'paid')
        .reduce((sum, r) => sum + (r.paymentInfo.finalAmount || 0), 0);
      const lastCheckIn = budiRegs[0].checkInStatus;
      seedUsers['budi.santoso@gmail.com'].status = lastCheckIn === 'finished' ? 'Completed Finisher' : lastCheckIn === 'checked_in' ? 'Attending Event' : 'Registered';
    }

    return Object.values(seedUsers);
  };

  const csvEscape = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const triggerCSVDownload = (headers: string[], rows: any[][], fileName: string) => {
    const headerLine = headers.map(csvEscape).join(',');
    const bodyLines = rows.map(r => r.map(csvEscape).join(',')).join('\n');
    const csvContent = '\uFEFF' + [headerLine, bodyLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.className = 'hidden';
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUsers = () => {
    const headers = [
      'User ID', 
      'Full Name', 
      'Email Address', 
      'WhatsApp Number', 
      'Access Role', 
      'Registered Events Count', 
      'Total Amount Spent (IDR)', 
      'Platform Status'
    ];
    const data = getAllPlatformUsers();
    const rows = data.map((u: any) => [
      u.id,
      u.name,
      u.email,
      u.whatsapp,
      u.role.toUpperCase(),
      String(u.totalRegs),
      `Rp ${u.totalSpent.toLocaleString('id-ID')}`,
      u.status
    ]);
    triggerCSVDownload(headers, rows, `eventhub_platform_users_audit_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleExportEvents = () => {
    const headers = [
      'Event ID', 
      'Event Title', 
      'Sport Classification', 
      'Organizer Identity', 
      'Staging Location Detail', 
      'City Address', 
      'Province Area', 
      'Scheduled Commencement Date', 
      'Total Category Slots Quota', 
      'Registered Participants Count', 
      'Remaining Seat Slots', 
      'Gross Event Ticket Income (IDR)'
    ];
    const rows = events.map(e => {
      const eventIncome = registrations
        .filter(r => r.eventId === e.id && r.paymentInfo?.status === 'paid')
        .reduce((sum, r) => sum + (r.paymentInfo.finalAmount || 0), 0);
      return [
        e.id,
        e.title,
        e.category,
        e.organizerName,
        e.location,
        e.city,
        e.province,
        e.date,
        String(e.quota),
        String(e.registeredParticipantsCount || 0),
        String(Math.max(0, e.quota - (e.registeredParticipantsCount || 0))),
        `Rp ${eventIncome.toLocaleString('id-ID')}`
      ];
    });
    triggerCSVDownload(headers, rows, `eventhub_platform_events_audit_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleExportTransactions = () => {
    const headers = [
      'Invoice / Registration ID', 
      'Seat Ticket Number', 
      'BIB Racer Number', 
      'Sporting Event Title', 
      'Distance Category Name', 
      'Athlete Full Name', 
      'Athlete Email Address', 
      'Athlete Contact WhatsApp', 
      'Charged Basic Cost (IDR)', 
      'Applied Promotional Deductions (IDR)', 
      'Final Receipt Paid (IDR)', 
      'Settlement Instrument', 
      'Payment Ledger Status', 
      'Check-In Audit Status', 
      'Transaction Creation Timestamp'
    ];
    const rows = registrations.map(r => [
      r.id,
      r.ticketNumber,
      r.bibNumber || 'Pending Assignment',
      r.eventTitle,
      r.categoryName,
      `${r.personalInfo?.firstName || ''} ${r.personalInfo?.lastName || ''}`.trim(),
      r.personalInfo?.email || '-',
      r.personalInfo?.whatsApp || '-',
      `Rp ${((r.paymentInfo?.finalAmount || 0) + (r.paymentInfo?.discountAmount || 0)).toLocaleString('id-ID')}`,
      `Rp ${(r.paymentInfo?.discountAmount || 0).toLocaleString('id-ID')}`,
      `Rp ${(r.paymentInfo?.finalAmount || 0).toLocaleString('id-ID')}`,
      (r.paymentInfo?.method || 'N/A').toUpperCase(),
      (r.paymentInfo?.status || 'N/A').toUpperCase(),
      (r.checkInStatus || 'REGISTERED').replace('_', ' ').toUpperCase(),
      r.createdAt ? new Date(r.createdAt).toLocaleString('id-ID') : 'Pre-seeded'
    ]);
    triggerCSVDownload(headers, rows, `eventhub_transactions_ledger_audit_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const totalPaymentsCollected = registrations
    .filter(r => r.paymentInfo?.status === 'paid')
    .reduce((sum, r) => sum + (r.paymentInfo?.finalAmount || 0), 0);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title and stats summary */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center space-x-1 rounded-full bg-red-100 px-3 py-1 text-[10px] font-extrabold text-red-700 uppercase tracking-widest mb-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Super Master Administration Area</span>
            </span>
            <h1 className="font-sans text-2xl font-extrabold tracking-tight text-slate-00">
              Platform General Ledger
            </h1>
          </div>

          <div className="flex space-x-4">
            <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Payments Collected</p>
              <p className="font-mono text-sm font-extrabold text-slate-900 mt-0.5">
                Rp {totalPaymentsCollected.toLocaleString('id-ID')}
              </p>
            </div>
            
            <div className="rounded-2xl border border-slate-100 bg-white px-5 py-3 text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Tournaments</p>
              <p className="font-mono text-sm font-extrabold text-slate-900 mt-0.5">{events.length} Events</p>
            </div>
          </div>
        </div>

        {/* Workspace Matrix GRID split */}
        <div className="grid gap-8 lg:grid-cols-4">
          
          {/* Navigation Tab lists */}
          <div className="lg:col-span-1 space-y-1.5" id="super-admin-sidebar">
            {[
              { id: 'withdrawals', label: 'Withdrawal Approvals', icon: Landmark },
              { id: 'cms_events', label: 'Event Content (CMS)', icon: Database },
              { id: 'cms_faqs', label: 'Landing FAQs (CMS)', icon: Radio },
              { id: 'coupons', label: 'Coupon Campaigns', icon: Ticket },
              { id: 'payments', label: 'Platform Transactions', icon: CreditCard },
              { id: 'auditing', label: 'Auditing & Exports', icon: FileSpreadsheet },
              { id: 'broadcast', label: 'News Broadcast', icon: Radio },
              { id: 'settings', label: 'System Configuration', icon: Settings },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = activeMenu === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMenu(m.id as any);
                  }}
                  className={`flex w-full items-center space-x-3 rounded-2xl p-4 text-left text-xs font-bold uppercase tracking-wide transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Core admin form tabs */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. WITHDRAWAL CLAIMS APPROVALS */}
            {activeMenu === 'withdrawals' && (
              <div className="space-y-4">
                <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">PROMPT ORGANIZER DEPOSIT SETTLEMENTS</h3>
                
                {withdrawals.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-14 text-center">
                    <CheckCircle className="h-9 w-9 text-slate-300 mx-auto" />
                    <p className="mt-2 text-xs font-bold text-slate-500">Every withdrawal cleared.</p>
                  </div>
                ) : (
                  withdrawals.map((w) => {
                    const isPending = w.status === 'pending';
                    return (
                      <div key={w.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-xs font-bold text-slate-500">Claim ID: {w.id}</p>
                            <h4 className="mt-1 font-bold text-slate-900 leading-tight">Organizer: {w.organizerName}</h4>
                            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed font-semibold">
                              Requested amount: <strong className="text-slate-800 font-mono">Rp {w.amount.toLocaleString('id-ID')}</strong> to {w.bankName} Acc {w.accountNumber} ({w.accountHolderName})
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                            {isPending ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateWithdrawStatus(w.id, 'rejected')}
                                  className="rounded-xl border border-red-150 bg-red-50 hover:bg-red-100 text-red-600 p-2"
                                  title="Reject claim"
                                >
                                  <XCircle className="h-4.5 w-4.5" />
                                </button>
                                <button
                                  onClick={() => updateWithdrawStatus(w.id, 'approved')}
                                  className="rounded-xl bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-3.5 py-2.5"
                                >
                                  Approve
                                </button>
                              </div>
                            ) : (
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider ${
                                w.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {w.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 2. COUPONS MANAGER SYSTEM */}
            {activeMenu === 'coupons' && (
              <div className="space-y-6">
                
                {/* Create Coupon campaign form */}
                <form onSubmit={handleCreateCoupon} className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 space-y-5 text-xs text-slate-650 shadow-xs">
                  <div>
                    <h3 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">LAUNCH NEW DISCOUNT PROMO</h3>
                    <p className="mt-1 text-[11px] text-slate-400">Distribute platform vouchers targeting specific cohorts.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Coupon Code</label>
                      <input
                        type="text"
                        placeholder="e.g. INTI15"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        required
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-800 uppercase focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Voucher Type</label>
                      <select
                        value={newCoupon.type}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, type: e.target.value as any }))}
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-800 focus:outline-hidden"
                      >
                        <option value="percentage">Percentage deduction (%)</option>
                        <option value="fixed">Fixed nominal (IDR)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Discount Value</label>
                      <input
                        type="number"
                        value={newCoupon.value}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, value: Number(e.target.value) }))}
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Quota usage limit</label>
                      <input
                        type="number"
                        value={newCoupon.quota}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, quota: Number(e.target.value) }))}
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry Deadline</label>
                      <input
                        type="date"
                        value={newCoupon.expiryDate}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-5 py-3"
                      id="launch-coupon-btn"
                    >
                      Deploy Voucher
                    </button>
                  </div>
                </form>

                {/* List Coupons active */}
                <div className="space-y-3">
                  <h4 className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">ACTIVE VOUCHERS</h4>
                  
                  {coupons.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-slate-100 bg-white p-4.5 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 font-mono">
                          {c.code}
                        </div>
                        <div>
                          <p className="font-sans font-bold text-slate-800">
                            {c.type === 'percentage' ? `${c.value}% Off limits` : `Rp ${c.value.toLocaleString('id-ID')} Flat discount`}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Quota: {c.usedCount} / {c.quota} Used | Expiry {c.expiryDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button 
                          onClick={() => handleStartEditCoupon(c)}
                          className="text-cyan-600 hover:text-cyan-700 rounded-lg p-2 hover:bg-slate-50"
                          title="Edit Campaign"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteCoupon(c.id)}
                          className="text-red-500 hover:text-red-600 rounded-lg p-2 hover:bg-slate-50"
                          title="Revoke campaign"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* 3. PLATFORM TRANSACTIONS LIST */}
            {activeMenu === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">REAL-TIME SETTLEMENT CHANNELS</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Configure Midtrans API keys, toggle payment methods, and run sandbox webhook transaction simulations.</p>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex border-b border-slate-200" id="payment-tabs-menu">
                  <button
                    id="btn-subtab-transactions"
                    onClick={() => setPaymentSubTab('transactions')}
                    className={`pb-3 pr-5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      paymentSubTab === 'transactions'
                        ? 'border-cyan-600 text-cyan-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Transaction Ledger
                  </button>
                  <button
                    id="btn-subtab-config"
                    onClick={() => setPaymentSubTab('midtrans_config')}
                    className={`pb-3 px-5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      paymentSubTab === 'midtrans_config'
                        ? 'border-cyan-600 text-cyan-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Midtrans Credentials
                  </button>
                  <button
                    id="btn-subtab-simulator"
                    onClick={() => setPaymentSubTab('simulator')}
                    className={`pb-3 px-5 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      paymentSubTab === 'simulator'
                        ? 'border-cyan-600 text-cyan-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Gateway API Simulator
                  </button>
                </div>

                {/* Sub Tab 1: Transaction Ledger */}
                {paymentSubTab === 'transactions' && (
                  <div className="space-y-4">
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search transaction entries by name, invoice ID, or ticket code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-slate-100 bg-white pl-10 pr-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden shadow-xs"
                      />
                    </div>

                    {registrations.filter(r => {
                      const q = searchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        r.id.toLowerCase().includes(q) ||
                        `${r.personalInfo.firstName} ${r.personalInfo.lastName}`.toLowerCase().includes(q) ||
                        r.ticketNumber.toLowerCase().includes(q) ||
                        r.categoryName.toLowerCase().includes(q) ||
                        r.eventTitle.toLowerCase().includes(q)
                      );
                    }).length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                        <AlertCircle className="h-8 w-8 text-slate-350 mx-auto" strokeWidth={1.5} />
                        <p className="mt-2 text-xs font-extrabold text-slate-500">No transaction records matched your search filters.</p>
                      </div>
                    ) : (
                      registrations
                        .filter(r => {
                          const q = searchQuery.toLowerCase().trim();
                          if (!q) return true;
                          return (
                            r.id.toLowerCase().includes(q) ||
                            `${r.personalInfo.firstName} ${r.personalInfo.lastName}`.toLowerCase().includes(q) ||
                            r.ticketNumber.toLowerCase().includes(q) ||
                            r.categoryName.toLowerCase().includes(q) ||
                            r.eventTitle.toLowerCase().includes(q)
                          );
                        })
                        .map(r => {
                          const isPaid = r.paymentInfo.status === 'paid';
                          const isPending = r.paymentInfo.status === 'pending';
                          const isExpired = r.paymentInfo.status === 'expired';
                          const isCancelled = r.paymentInfo.status === 'cancelled';
                          const isRefunded = r.paymentInfo.status === 'refunded';

                          return (
                            <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4 shadow-xs hover:border-slate-200 transition-all">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-mono text-[11px] text-cyan-700 font-extrabold tracking-wide">{r.id}</p>
                                  <span className="text-[10px] text-slate-300 font-bold">•</span>
                                  <span className="font-mono text-[10px] text-slate-400 font-bold">Ticket: {r.ticketNumber}</span>
                                </div>
                                <p className="text-slate-900 font-extrabold mt-1.5 text-sm">{r.personalInfo.firstName} {r.personalInfo.lastName}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-semibold">
                                  <span>{r.categoryName} distance class</span>
                                  <span>•</span>
                                  <span className="text-slate-700 font-extrabold">{r.eventTitle}</span>
                                </div>
                                <p className="mt-1.5 text-[10px] text-slate-400 font-medium">WhatsApp: {r.personalInfo.whatsApp} | Email: {r.personalInfo.email}</p>
                              </div>

                              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                                <div className="text-left sm:text-right">
                                  <p className="font-mono font-extrabold text-slate-900 text-[13px]">Rp {r.paymentInfo.finalAmount.toLocaleString('id-ID')}</p>
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
                                    <select
                                      value={r.paymentInfo.status}
                                      onChange={(e) => updatePaymentStatus(r.id, e.target.value as any)}
                                      className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase border focus:outline-hidden cursor-pointer ${
                                        isPaid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                        isPending ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                        isExpired ? 'bg-slate-100 border-slate-200 text-slate-600' :
                                        'bg-red-50 border-red-100 text-red-600'
                                      }`}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="paid">Paid</option>
                                      <option value="expired">Expired</option>
                                      <option value="cancelled">Cancelled</option>
                                      <option value="refunded">Refunded</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end space-x-1">
                                  <button
                                    onClick={() => deleteRegistration(r.id)}
                                    className="text-red-500 hover:text-red-650 rounded-xl p-2 hover:bg-slate-50 border border-slate-100 transition-colors"
                                    title="Decommission transaction record"
                                  >
                                    <Trash className="h-4 w-4 shrink-0" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                )}

                {/* Sub Tab 2: Midtrans Credentials Setup */}
                {paymentSubTab === 'midtrans_config' && (
                  <form onSubmit={(e) => { e.preventDefault(); setGatewaySuccessMsg('Midtrans merchant gateway parameters saved successfully.'); setTimeout(() => setGatewaySuccessMsg(''), 4500); }} className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 space-y-6 text-xs text-slate-650 shadow-xs">
                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">MIDTRANS PAYMENT SETTINGS</h4>
                      <p className="mt-1 text-[11px] text-slate-400">Manage transaction API keys, security keys, and client parameters.</p>
                    </div>

                    {gatewaySuccessMsg && (
                      <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/50 text-cyan-800 font-bold flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-cyan-600 shrink-0" />
                        <span>{gatewaySuccessMsg}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-3 p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-cyan-600">
                        <RefreshCw className="h-4.5 w-4.5 animate-spin-slow" />
                      </div>
                      <div className="flex-1">
                        <p className="font-sans font-bold text-slate-900">API Transfer Mode</p>
                        <p className="text-[10px] text-slate-400">Sandbox uses test API parameters without placing actual charges.</p>
                      </div>
                      <div className="flex items-center space-x-2.5 bg-white border border-slate-150 p-1.5 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setGatewaySettings(prev => ({ ...prev, mode: 'sandbox' }))}
                          className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                            gatewaySettings.mode === 'sandbox'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Sandbox
                        </button>
                        <button
                          type="button"
                          onClick={() => setGatewaySettings(prev => ({ ...prev, mode: 'production' }))}
                          className={`px-3 py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                            gatewaySettings.mode === 'production'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Production
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Merchant Account ID</label>
                        <input
                          type="text"
                          value={gatewaySettings.merchantId}
                          onChange={(e) => setGatewaySettings(prev => ({ ...prev, merchantId: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-mono font-bold text-slate-800 focus:outline-hidden focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Midtrans Client Key</label>
                        <input
                          type="text"
                          value={gatewaySettings.clientKey}
                          onChange={(e) => setGatewaySettings(prev => ({ ...prev, clientKey: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-mono text-slate-800 tracking-wider focus:outline-hidden focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Midtrans Server Key</label>
                        <input
                          type="password"
                          value={gatewaySettings.serverKey}
                          onChange={(e) => setGatewaySettings(prev => ({ ...prev, serverKey: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-mono text-slate-800 tracking-wider focus:outline-hidden focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Notification Webhook Endpoint URL</label>
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="text"
                          value={gatewaySettings.webhookUrl}
                          readOnly
                          className="flex-1 rounded-xl border border-slate-100 bg-slate-100 p-3 font-mono text-slate-500 focus:outline-hidden text-[10px] select-all cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(gatewaySettings.webhookUrl);
                            alert('Copied secure webhook endpoint to clipboard.');
                          }}
                          className="px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-bold tracking-wide text-[10px] transition-all cursor-pointer select-none"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">Paste this URL inside your Midtrans Map Dashboard callbacks configuration.</p>
                    </div>

                    {/* Checkbox triggers for specific payment methods */}
                    <div className="space-y-3.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">ACTIVE GATEWAY PAYMENT INSTRUMENTS</span>
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {[
                          { key: 'qris', name: 'QRIS (Gopay, OVO, ShopeePay)', desc: 'Instant QR code barcode check' },
                          { key: 'bca_va', name: 'BCA Virtual Account', desc: 'Secure transfer on BCA' },
                          { key: 'bni_va', name: 'BNI Virtual Account', desc: 'State-bank transfer check' },
                          { key: 'mandiri_va', name: 'Mandiri Bill VA', desc: 'Mandiri e-payment bill' },
                          { key: 'cc', name: 'Credit / Debit Card', desc: 'Visa & Master Card secured' },
                        ].map((m) => (
                          <label key={m.key} className="flex items-start space-x-3 p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-100/30 transition-all cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(gatewaySettings.activeMethods as any)[m.key]}
                              onChange={(e) => setGatewaySettings(prev => ({
                                ...prev,
                                activeMethods: {
                                  ...prev.activeMethods,
                                  [m.key]: e.target.checked
                                }
                              }))}
                              className="h-4 w-4 accent-cyan-500 rounded-md shrink-0 mt-0.5 cursor-pointer"
                            />
                            <div>
                              <p className="font-sans font-extrabold text-slate-800 text-[11px] leading-tight">{m.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{m.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-5 py-3 transition-colors cursor-pointer"
                      >
                        Save Credentials
                      </button>
                    </div>
                  </form>
                )}

                {/* Sub Tab 3: Mock Webhook API Simulator */}
                {paymentSubTab === 'simulator' && (
                  <div className="grid gap-6 md:grid-cols-5 text-xs text-slate-650">
                    
                    {/* Control Panel Forms */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4 shadow-xs">
                        <div>
                          <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">WEBHOOK DISPATCH SIMULATOR</h4>
                          <p className="mt-1 text-[10px] text-slate-400">Trigger simulated HTTP notifications from Midtrans into the local application database state.</p>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Target Registration / Invoice</label>
                          <select
                            value={simulatorRegId}
                            onChange={(e) => setSimulatorRegId(e.target.value)}
                            className="w-full rounded-xl border border-slate-150 bg-slate-50 p-3 font-semibold text-slate-800 focus:outline-hidden"
                          >
                            <option value="">-- Choose Target Transaction --</option>
                            {registrations.map(r => (
                              <option key={r.id} value={r.id}>
                                [{r.paymentInfo.status.toUpperCase()}] {r.personalInfo.firstName} {r.personalInfo.lastName} ({r.id})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-3 grid-cols-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Notice Type</label>
                            <select
                              value={simulatorStatus}
                              onChange={(e) => setSimulatorStatus(e.target.value as any)}
                              className="w-full rounded-xl border border-slate-150 bg-slate-50 p-2.5 font-bold text-slate-800 focus:outline-hidden"
                            >
                              <option value="settlement">Settlement (Paid)</option>
                              <option value="pending">Pending</option>
                              <option value="expire">Expire</option>
                              <option value="cancel">Cancel</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Instrument</label>
                            <select
                              value={simulatorMethod}
                              onChange={(e) => setSimulatorMethod(e.target.value as any)}
                              className="w-full rounded-xl border border-slate-150 bg-slate-50 p-2.5 font-bold text-slate-800 focus:outline-hidden"
                            >
                              <option value="qris">QRIS</option>
                              <option value="bca_va">BCA VA</option>
                              <option value="bni_va">BNI VA</option>
                              <option value="mandiri_va">Mandiri VA</option>
                              <option value="cc">Credit Card</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!simulatorRegId}
                          onClick={() => {
                            const reg = registrations.find(r => r.id === simulatorRegId);
                            if (!reg) return;

                            const grossStr = `${reg.paymentInfo.finalAmount}.00`;
                            const statusCode = simulatorStatus === 'settlement' ? '200' : simulatorStatus === 'pending' ? '201' : '407';
                            const fakeSignature = `sim_sha512_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

                            const mockPayload = {
                              transaction_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                              transaction_status: simulatorStatus,
                              status_code: statusCode,
                              gross_amount: grossStr,
                              payment_type: simulatorMethod,
                              transaction_id: `txn-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                              order_id: reg.id,
                              signature_key: fakeSignature,
                              merchant_id: gatewaySettings.merchantId
                            };

                            const newLog = {
                              id: `hook-log-${Date.now()}`,
                              timestamp: new Date().toLocaleString('id-ID'),
                              status: simulatorStatus,
                              orderId: reg.id,
                              amount: reg.paymentInfo.finalAmount,
                              provider: 'Midtrans Webhook Simulator',
                              payload: mockPayload,
                              headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'Midtrans-Webhook-Dispatcher/2.0',
                                'X-Signature-Key-Computed': fakeSignature,
                                'Authorization': `Basic ${btoa(gatewaySettings.serverKey).substring(0, 20)}...`
                              }
                            };

                            setHookLogs(prev => [newLog, ...prev]);
                            setSelectedLog(newLog);

                            const targetStatus = simulatorStatus === 'settlement' ? 'paid' : simulatorStatus === 'pending' ? 'pending' : simulatorStatus === 'expire' ? 'expired' : 'cancelled';
                            updatePaymentStatus(reg.id, targetStatus);
                          }}
                          className={`w-full text-center flex items-center justify-center space-x-2 rounded-xl text-white font-sans font-bold py-3.5 px-4 cursor-pointer transition-all ${
                            simulatorRegId 
                              ? 'bg-slate-900 hover:bg-slate-800' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Play className="h-4 w-4 shrink-0" />
                          <span>Dispatch Mock Webhook</span>
                        </button>
                      </div>

                      {/* Log brief list ledger */}
                      <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <h5 className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">CALLBACK HISTORY</h5>
                          <button
                            type="button"
                            onClick={() => { setHookLogs([]); setSelectedLog(null); }}
                            className="text-slate-400 hover:text-slate-600 font-bold text-[9px] uppercase tracking-wide cursor-pointer"
                          >
                            Clear Logs
                          </button>
                        </div>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {hookLogs.length === 0 ? (
                            <p className="text-[11px] text-slate-400 py-6 text-center italic font-semibold">No telemetry packets recorded yet.</p>
                          ) : (
                            hookLogs.map(l => (
                              <button
                                key={l.id}
                                onClick={() => setSelectedLog(l)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                                  selectedLog?.id === l.id
                                    ? 'border-cyan-200 bg-cyan-50/20'
                                    : 'border-slate-50 bg-slate-50/40 hover:bg-slate-50/80'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center space-x-1.5">
                                    <p className="font-mono text-[10px] font-bold text-slate-800">{l.orderId}</p>
                                    <span className="text-[9px] rounded-md bg-white border px-1.5 py-0.2 font-extrabold font-mono uppercase text-[8px]">
                                      {l.payload.payment_type.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 mt-1">{l.timestamp}</p>
                                </div>
                                <span className={`inline-flex rounded px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${
                                  l.status === 'settlement' ? 'bg-emerald-50 text-emerald-700' :
                                  l.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                  'bg-red-50 text-red-700'
                                }`}>
                                  {l.status}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Code block editor detailing callback JSON payload received */}
                    <div className="md:col-span-3">
                      {selectedLog ? (
                        <div className="rounded-2xl border border-slate-950 bg-slate-950 p-5 text-xs text-slate-300 font-mono shadow-md h-full flex flex-col min-h-[380px]">
                          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 flex-none">
                            <div className="flex items-center space-x-2">
                              <Terminal className="h-4 w-4 text-cyan-400 shrink-0" />
                              <span className="font-bold text-[10px] text-slate-400 lowercase tracking-wide">POST webhook_endpoint HTTP/1.1</span>
                            </div>
                            <span className="text-emerald-400 font-extrabold text-[10px] font-sans">HTTP/1.1 200 OK</span>
                          </div>

                          <div className="py-4 border-b border-slate-900 overflow-x-auto flex-none">
                            <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2">Request Headers:</span>
                            <div className="space-y-1 text-[10px] text-slate-400">
                              {Object.entries(selectedLog.headers).map(([key, val]) => (
                                <p key={key}>
                                  <span className="text-pink-400 font-bold">{key}:</span> <span className="text-slate-300">{val as string}</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 flex-1 overflow-y-auto max-h-[320px]">
                            <span className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-2">JSON Body Payload:</span>
                            <pre className="text-cyan-300 text-[10.5px] leading-relaxed select-all overflow-x-auto">
                              {JSON.stringify(selectedLog.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 h-full flex flex-col items-center justify-center text-center">
                          <Terminal className="h-10 w-10 text-slate-300 mx-auto" />
                          <p className="mt-3 text-xs font-extrabold text-slate-500">API Terminal Console</p>
                          <p className="mt-1 text-[11px] text-slate-400 max-w-[240px] mx-auto font-medium">Select or trigger a simulated midtrans webhook notification callback payload above to preview packet payloads.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* 4. ANNOUNCEMENTS BROADCAST SYSTEM */}
            {activeMenu === 'broadcast' && (
              <>
                <form onSubmit={handleBroadcastAnnouncementSubmit} className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 space-y-6 text-xs text-slate-650 shadow-xs">
                  <div>
                    <h3 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">BROADCAST BULLETINS</h3>
                    <p className="mt-1 text-[11px] text-slate-400">Post system alarms, policy updates, calendar shifts to headers.</p>
                  </div>

                  {annSuccessMsg && (
                    <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/50 text-cyan-800 font-bold">
                      {annSuccessMsg}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bulletin Heading</label>
                      <input
                        type="text"
                        placeholder="e.g. Schedule adjustments notice"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        required
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Role Reach</label>
                      <select
                        value={annTarget}
                        onChange={(e) => setAnnTarget(e.target.value as any)}
                        className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-bold text-slate-800"
                      >
                        <option value="all">Global (All readers)</option>
                        <option value="organizer">Organizers Hub only</option>
                        <option value="participant">Participants only</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Content summary details</label>
                    <textarea
                      rows={4}
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-semibold text-slate-800 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-5 py-3"
                    >
                      {editingAnnouncement ? 'Update Broadcast' : 'Broadcast Bulletin'}
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <h4 className="font-sans text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">ACTIVE BULLETINS / SYSTEM BROADCASTS</h4>
                  
                  {announcements.map((ann) => (
                    <div key={ann.id} className="rounded-2xl border border-slate-100 bg-white p-4.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-sans font-bold text-slate-800">{ann.title}</span>
                          <span className="rounded-md bg-cyan-100 border border-cyan-200 px-2 py-0.5 text-[9px] font-extrabold uppercase text-cyan-800 tracking-wider">
                            {ann.targetRole.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{ann.message}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Date: {ann.date}</p>
                      </div>

                      <div className="flex items-center space-x-1 border border-slate-50 rounded-lg p-0.5 shrink-0 bg-slate-50/20">
                        <button 
                          onClick={() => handleStartEditAnnouncement(ann)}
                          className="text-cyan-600 hover:text-cyan-700 rounded-lg p-2 hover:bg-slate-50"
                          title="Edit bulletin"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="text-red-500 hover:text-red-600 rounded-lg p-2 hover:bg-slate-50"
                          title="Revoke bulletin broadcast"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 5. GENERAL PLATFORM SYSTEM CONFIGS */}
            {activeMenu === 'settings' && (
              <form onSubmit={handleSaveSettings} className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 space-y-6 text-xs text-slate-650 shadow-xs">
                <div>
                  <h3 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">PLATFORM SYSTEM SETTINGS</h3>
                  <p className="mt-1 text-[11px] text-slate-400">Superintend transaction margins, communications endpoints.</p>
                </div>

                {settingsSuccessMsg && (
                  <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/50 text-cyan-800 font-bold">
                    {settingsSuccessMsg}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tenant Brand Name</label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-bold text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Transaction margin Fee (%)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={feePct}
                      onChange={(e) => setFeePct(Number(e.target.value))}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 p-3 font-bold text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Toggle Sliders representing Notification Triggers requested */}
                <div className="space-y-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">MANDATORY TRIGGER CHANNELS</span>
                  
                  <div className="flex items-center justify-between p-3 border border-slate-50 rounded-xl bg-slate-50/50">
                    <div>
                      <p className="font-sans text-xs font-bold text-slate-900 leading-none">WhatsApp API (Fonnte API Trigger)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Dispatches interactive SMS alert on payment completion.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={waEnabled}
                      onChange={(e) => setWaEnabled(e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-cyan-500" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-50 rounded-xl bg-slate-50/50">
                    <div>
                      <p className="font-sans text-xs font-bold text-slate-900 leading-none">Email API (Resend Engine Trigger)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Sends detailed invoice logs with downloadable bar-tickets.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-cyan-500" 
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-5 py-3"
                    id="save-settings-btn"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            )}

            {/* 6. CMS SPORTING EVENTS MANAGEMENTS */}
            {activeMenu === 'cms_events' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">INDONESIAN SPORTING CATALOG CMS</h3>
                    <p className="text-xs text-slate-500 mt-1">Add, update, publish and decommission race activities dynamically.</p>
                  </div>
                  {cmsCurrentEvent === null && (
                    <button
                      type="button"
                      onClick={() => {
                        setCmsCurrentEvent({
                          id: 'new',
                          title: '',
                          slug: '',
                          description: '',
                          category: 'Running',
                          date: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
                          regCloseDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split('T')[0],
                          location: '',
                          address: '',
                          province: 'DKI Jakarta',
                          city: 'Jakarta Selatan',
                          bannerImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
                          mapEmbedUrl: 'https://maps.google.com/maps?q=-6.2228,106.8245&t=&z=13&ie=UTF8&iwloc=&output=embed',
                          coords: { lat: -6.2228, lng: 106.8245 },
                          categories: [
                            { id: `cat-5k-${Date.now()}`, name: '5K Fun Run Class', price: 150000, quota: 1000, registeredCount: 0, hasJersey: true, hasMedal: true, hasRacepack: true }
                          ],
                          rules: [
                            "Display your physical BIB clearly at the front of your outer layer.",
                            "Follow all directions and instructions given by marshals."
                          ],
                          sponsors: ['AeroSport', 'Aqua', 'Fitbar']
                        });
                      }}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-4 py-2.5 flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Sporting Event</span>
                    </button>
                  )}
                </div>

                {cmsEventSuccessMsg && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800 flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-sans text-xs font-semibold">{cmsEventSuccessMsg}</span>
                  </div>
                )}

                {/* EVENT EDITOR / CREATOR FORM */}
                {cmsCurrentEvent !== null ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!cmsCurrentEvent.title.trim()) {
                        alert("Title is required.");
                        return;
                      }
                      const eventSlug = cmsCurrentEvent.slug.trim() || cmsCurrentEvent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      
                      // Format category fields
                      const parsedRules = Array.isArray(cmsCurrentEvent.rules) 
                        ? cmsCurrentEvent.rules 
                        : (typeof cmsCurrentEvent.rules === 'string' ? (cmsCurrentEvent.rules as string).split('\n').map(r => r.trim()).filter(Boolean) : []);
                      const parsedSponsors = Array.isArray(cmsCurrentEvent.sponsors)
                        ? cmsCurrentEvent.sponsors
                        : (typeof cmsCurrentEvent.sponsors === 'string' ? (cmsCurrentEvent.sponsors as string).split(',').map(s => s.trim()).filter(Boolean) : []);

                      const finalEvent = {
                        ...cmsCurrentEvent,
                        slug: eventSlug,
                        rules: parsedRules,
                        sponsors: parsedSponsors,
                      };

                      if (cmsCurrentEvent.id === 'new') {
                        addEvent(finalEvent);
                        setCmsEventSuccessMsg("Successfully published new sporting event to Marketplace!");
                      } else {
                        updateEvent(finalEvent);
                        setCmsEventSuccessMsg("Successfully updated event content catalog details!");
                      }

                      setTimeout(() => {
                        setCmsEventSuccessMsg('');
                        setCmsCurrentEvent(null);
                      }, 1200);
                    }}
                    className="space-y-6 bg-white border border-slate-100 p-6 rounded-3xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">
                        {cmsCurrentEvent.id === 'new' ? '⚡️ NEW SPORTING EVENT' : `🔧 EDITING: ${cmsCurrentEvent.title}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCmsCurrentEvent(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Cancel & Return
                      </button>
                    </div>

                    {/* Section 1: Basic Copy */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Section A: Basic Metadata</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Event Title / Nama Turnamen</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.title}
                            onChange={(e) => setCmsCurrentEvent({
                              ...cmsCurrentEvent,
                              title: e.target.value,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                            })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="e.g. Borobudur International Run 2026"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Access URL Slug</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.slug}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="e.g. borobudur-international-run-2026"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sport Category Classification</label>
                          <select
                            value={cmsCurrentEvent.category}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, category: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                          >
                            <option value="Running">Running (Marathon/Fun Run)</option>
                            <option value="Trail Run">Trail Run (Mountain Obstacle)</option>
                            <option value="Cycling">Cycling (Roadbike/MTB Cup)</option>
                            <option value="Triathlon">Triathlon (Multi-discipline)</option>
                            <option value="Festival">Festival (Entertainment Sport)</option>
                            <option value="Seminar">Seminar (Interactive Athletic Summit)</option>
                            <option value="Community">Community (Lari Bersama Kawan)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Hero Cover Image URL</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.bannerImage}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, bannerImage: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="Banner image HTTPS link"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Official Event Description / Deskripsi Turnamen</label>
                        <textarea
                          rows={4}
                          required
                          value={cmsCurrentEvent.description}
                          onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, description: e.target.value })}
                          className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                          placeholder="Provide a comprehensive introduction to this sporting challenge..."
                        />
                      </div>
                    </div>

                    {/* Section 2: Timeline */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Section B: Timeline Scheduler</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Race Flag-Off Date / Hari Pelaksanaan</label>
                          <input
                            type="date"
                            required
                            value={cmsCurrentEvent.date}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, date: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Registration Closure Deadline</label>
                          <input
                            type="date"
                            required
                            value={cmsCurrentEvent.regCloseDate}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, regCloseDate: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Venue, Maps and Coordinates */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Section C: Geographical Coordinates & Venue Assets</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Location Venue Title / Nama Lokasi</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.location}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, location: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="e.g. Borobudur Temple Grounds"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Postal Address / Alamat Lengkap</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.address}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, address: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="Full address of the start line..."
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">City / Kabupaten</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.city}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, city: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="e.g. Magelang"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Province / Provinsi di Indonesia</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.province}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, province: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="e.g. Jawa Tengah"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lat (Decimal Map Coord)</label>
                          <input
                            type="number"
                            step="0.000001"
                            required
                            value={cmsCurrentEvent.coords?.lat || 0}
                            onChange={(e) => setCmsCurrentEvent({
                              ...cmsCurrentEvent,
                              coords: { ...cmsCurrentEvent.coords, lat: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="-6.2228"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lng (Decimal Map Coord)</label>
                          <input
                            type="number"
                            step="0.000001"
                            required
                            value={cmsCurrentEvent.coords?.lng || 0}
                            onChange={(e) => setCmsCurrentEvent({
                              ...cmsCurrentEvent,
                              coords: { ...cmsCurrentEvent.coords, lng: parseFloat(e.target.value) || 0 }
                            })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="106.8245"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Maps Embed URL</label>
                          <input
                            type="text"
                            required
                            value={cmsCurrentEvent.mapEmbedUrl}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, mapEmbedUrl: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Activities Classes */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Section D: Distance Level Divisions / Kategori Kelas</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newSub = {
                              id: `cat-${Date.now()}`,
                              name: '10K Challenge Run',
                              price: 250000,
                              quota: 500,
                              registeredCount: 0,
                              hasJersey: true,
                              hasMedal: true,
                              hasRacepack: true
                            };
                            setCmsCurrentEvent({
                              ...cmsCurrentEvent,
                              categories: [...cmsCurrentEvent.categories, newSub]
                            });
                          }}
                          className="text-[10px] font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add activities level category</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {cmsCurrentEvent.categories.map((cat: any, index: number) => (
                          <div key={cat.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/30 grid gap-3 sm:grid-cols-12 items-center">
                            <div className="sm:col-span-3">
                              <label className="text-[9px] font-semibold text-slate-400 block uppercase">Division Identifier</label>
                              <input
                                type="text"
                                required
                                value={cat.name}
                                onChange={(e) => {
                                  const list = [...cmsCurrentEvent.categories];
                                  list[index] = { ...list[index], name: e.target.value };
                                  setCmsCurrentEvent({ ...cmsCurrentEvent, categories: list });
                                }}
                                className="w-full border-b border-dashed border-slate-200 bg-transparent py-1 text-xs font-bold focus:outline-hidden"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[9px] font-semibold text-slate-400 block uppercase">Price Tag (IDR)</label>
                              <input
                                type="number"
                                required
                                value={cat.price}
                                onChange={(e) => {
                                  const list = [...cmsCurrentEvent.categories];
                                  list[index] = { ...list[index], price: Number(e.target.value) || 0 };
                                  setCmsCurrentEvent({ ...cmsCurrentEvent, categories: list });
                                }}
                                className="w-full border-b border-dashed border-slate-200 bg-transparent py-1 text-xs font-bold focus:outline-hidden"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[9px] font-semibold text-slate-400 block uppercase">Total Quotas</label>
                              <input
                                type="number"
                                required
                                value={cat.quota}
                                onChange={(e) => {
                                  const list = [...cmsCurrentEvent.categories];
                                  list[index] = { ...list[index], quota: Number(e.target.value) || 0 };
                                  setCmsCurrentEvent({ ...cmsCurrentEvent, categories: list });
                                }}
                                className="w-full border-b border-dashed border-slate-200 bg-transparent py-1 text-xs font-bold focus:outline-hidden"
                              />
                            </div>

                            {/* Inclusions checkboxes */}
                            <div className="sm:col-span-4 flex items-center justify-around flex-wrap gap-2">
                              <label className="flex items-center space-x-1 text-[10px] font-sans font-bold text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={cat.hasJersey}
                                  onChange={(e) => {
                                    const list = [...cmsCurrentEvent.categories];
                                    list[index] = { ...list[index], hasJersey: e.target.checked };
                                    setCmsCurrentEvent({ ...cmsCurrentEvent, categories: list });
                                  }}
                                  className="h-3 w-3 accent-cyan-500 rounded-sm"
                                />
                                <span>Jersey</span>
                              </label>

                              <label className="flex items-center space-x-1 text-[10px] font-sans font-bold text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={cat.hasMedal}
                                  onChange={(e) => {
                                    const list = [...cmsCurrentEvent.categories];
                                    list[index] = { ...list[index], hasMedal: e.target.checked };
                                    setCmsCurrentEvent({ ...cmsCurrentEvent, categories: list });
                                  }}
                                  className="h-3 w-3 accent-cyan-500 rounded-sm"
                                />
                                <span>Medal</span>
                              </label>

                              <label className="flex items-center space-x-1 text-[10px] font-sans font-bold text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={cat.hasRacepack}
                                  onChange={(e) => {
                                    const list = [...cmsCurrentEvent.categories];
                                    list[index] = { ...list[index], hasRacepack: e.target.checked };
                                    setCmsCurrentEvent({ ...cmsCurrentEvent, categories: list });
                                  }}
                                  className="h-3 w-3 accent-cyan-500 rounded-sm"
                                />
                                <span>Racepack</span>
                              </label>
                            </div>

                            <div className="sm:col-span-1 text-center">
                              {cmsCurrentEvent.categories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = cmsCurrentEvent.categories.filter((_: any, idx: number) => idx !== index);
                                    setCmsCurrentEvent({ ...cmsCurrentEvent, categories: list });
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                  title="Delete Activity Category"
                                >
                                  <Trash className="h-4 w-4 mx-auto" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 5: Rules Bullet list & sponsors string conversion */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Section E: Regulations, Rules & Collaborations</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Official Guidelines & Rules (One rule per line)</label>
                          <textarea
                            rows={3}
                            value={Array.isArray(cmsCurrentEvent.rules) ? cmsCurrentEvent.rules.join('\n') : cmsCurrentEvent.rules}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, rules: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="Rule #1&#10;Rule #2&#10;Rule #3"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Platform Sponsors (Comma separated list)</label>
                          <textarea
                            rows={3}
                            value={Array.isArray(cmsCurrentEvent.sponsors) ? cmsCurrentEvent.sponsors.join(', ') : cmsCurrentEvent.sponsors}
                            onChange={(e) => setCmsCurrentEvent({ ...cmsCurrentEvent, sponsors: e.target.value })}
                            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-semibold focus:outline-hidden"
                            placeholder="Aqua, Pocari, Adidas"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Commit Action Panel */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setCmsCurrentEvent(null)}
                        className="rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 font-sans text-xs font-bold px-5 py-3 cursor-pointer"
                      >
                        Cancel Changes
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-5 py-3 cursor-pointer"
                      >
                        Deploy Live Content Catalog
                      </button>
                    </div>
                  </form>
                ) : (
                  // SPORTING EVENTS CATALOG DATAGRID LISTING
                  <div className="space-y-4">
                    {/* Catalog Query filter tool */}
                    <div className="flex bg-white border border-slate-100 p-3.5 rounded-2xl items-center space-x-2">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="Search tournament copy title, location, province, city..."
                        className="w-full border-none bg-transparent text-xs font-semibold focus:outline-hidden text-slate-800"
                      />
                    </div>

                    {/* Events list display columns */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {events.filter(e => {
                        if (!eventSearch.trim()) return true;
                        const src = eventSearch.toLowerCase();
                        return e.title.toLowerCase().includes(src) || 
                               e.location.toLowerCase().includes(src) || 
                               e.province.toLowerCase().includes(src) ||
                               e.city.toLowerCase().includes(src);
                      }).map((e) => (
                        <div key={e.id} className="rounded-3xl border border-slate-100 bg-white p-4.5 flex flex-col justify-between hover:shadow-sm transition-all">
                          <div className="space-y-3">
                            <div className="relative h-28 rounded-2xl overflow-hidden bg-slate-100">
                              <img src={e.bannerImage} className="w-full h-full object-cover" alt={e.title} referrerPolicy="no-referrer" />
                              <div className="absolute top-2.5 left-2.5 rounded-lg bg-slate-900/85 backdrop-blur-xs px-2 py-1 text-[9px] font-bold text-white uppercase tracking-wider">
                                {e.category}
                              </div>
                            </div>

                            <div>
                              <p className="font-sans text-xs font-extrabold text-slate-900 line-clamp-1 leading-snug">{e.title}</p>
                              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                                <MapPin className="h-3 w-3 inline-block shrink-0" />
                                <span className="line-clamp-1">{e.location}, {e.city}, {e.province}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-2.5 rounded-xl text-[10px] font-semibold text-slate-600">
                              <div className="space-x-1.5 flex items-center">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 inline-block shrink-0" />
                                <span>{e.date}</span>
                              </div>
                              <div className="space-x-1.5 flex items-center">
                                <Users className="h-3.5 w-3.5 text-slate-400 inline-block shrink-0" />
                                <span>{e.registeredParticipantsCount} Regs</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-4 mt-3 border-t border-slate-50">
                            <button
                              type="button"
                              onClick={() => {
                                setCmsCurrentEvent({
                                  ...e,
                                  rules: Array.isArray(e.rules) ? e.rules : [],
                                  sponsors: Array.isArray(e.sponsors) ? e.sponsors : []
                                });
                              }}
                              className="rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 p-2.5 text-xs font-bold leading-none cursor-pointer flex items-center space-x-1.5"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you absolutely certain you wish to permanently remove the event "${e.title}" from the platform? This cannot be undone.`)) {
                                  deleteEvent(e.id);
                                  setCmsEventSuccessMsg(`Properly decommissioned event "${e.title}".`);
                                  setTimeout(() => setCmsEventSuccessMsg(''), 2000);
                                }
                              }}
                              className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 p-2.5 text-xs font-bold leading-none cursor-pointer"
                              title="Decommission Turnamen"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. CMS LANDING PAGE FAQS PORTAL */}
            {activeMenu === 'cms_faqs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">LANDING PAGE FAQS MANAGEMENT CMS</h3>
                  <p className="text-xs text-slate-500 mt-1">Author and refine FAQ information in both Indonesian and English instantly.</p>
                </div>

                {faqSuccessMsg && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800 flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-sans text-xs font-semibold">{faqSuccessMsg}</span>
                  </div>
                )}

                {/* Big Language Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs">
                  <button
                    type="button"
                    onClick={() => setFaqLang('id')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      faqLang === 'id' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Indonesian Language FAQs
                  </button>
                  <button
                    type="button"
                    onClick={() => setFaqLang('en')}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      faqLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    English Language FAQs
                  </button>
                </div>

                {/* FAQ Cards List */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">
                      {faqLang === 'id' ? '🇮🇩 FAQ Kategori Bahasa Indonesia' : '🇬🇧 FAQ Category English Language'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem = {
                          id: `custom-faq-${Date.now()}`,
                          question: faqLang === 'id' ? 'Pertanyaan Baru?' : 'New Question?',
                          answer: faqLang === 'id' ? 'Isi dengan jawaban penjelasan baru...' : 'Provide details instructions answer here...',
                          category: 'Participant' as 'All' | 'Participant' | 'Organizer'
                        };
                        if (faqLang === 'id') {
                          setCustomFaqsId([...customFaqsId, newItem]);
                        } else {
                          setCustomFaqsEn([...customFaqsEn, newItem]);
                        }
                      }}
                      className="text-xs font-bold text-cyan-600 hover:text-cyan-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add item block</span>
                    </button>
                  </div>

                  {faqLang === 'id' ? (
                    <div className="space-y-4">
                      {customFaqsId.length === 0 ? (
                        <p className="text-center py-10 text-xs font-semibold text-slate-400">Tidak ada item FAQ bahasa Indonesia.</p>
                      ) : (
                        customFaqsId.map((item, index) => (
                          <div key={item.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3 relative group">
                            <div className="grid gap-3 sm:grid-cols-12">
                              <div className="sm:col-span-8">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Pertanyaan (Question)</label>
                                <input
                                  type="text"
                                  required
                                  value={item.question}
                                  onChange={(e) => {
                                    const next = [...customFaqsId];
                                    next[index] = { ...next[index], question: e.target.value };
                                    setCustomFaqsId(next);
                                  }}
                                  className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Target Khalayak</label>
                                <select
                                  value={item.category}
                                  onChange={(e) => {
                                    const next = [...customFaqsId];
                                    next[index] = { ...next[index], category: e.target.value };
                                    setCustomFaqsId(next);
                                  }}
                                  className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden"
                                >
                                  <option value="Participant">Participant / Atlet</option>
                                  <option value="Organizer">Organizer / Penyelenggara</option>
                                </select>
                              </div>

                              <div className="sm:col-span-1 flex items-center justify-center pt-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomFaqsId(customFaqsId.filter((_, idx) => idx !== index));
                                  }}
                                  className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 p-2 cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block uppercase">Jawaban (Answer)</label>
                              <textarea
                                rows={2}
                                required
                                value={item.answer}
                                onChange={(e) => {
                                  const next = [...customFaqsId];
                                  next[index] = { ...next[index], answer: e.target.value };
                                  setCustomFaqsId(next);
                                }}
                                className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customFaqsEn.length === 0 ? (
                        <p className="text-center py-10 text-xs font-semibold text-slate-400">No English FAQ items declared.</p>
                      ) : (
                        customFaqsEn.map((item, index) => (
                          <div key={item.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3 relative group">
                            <div className="grid gap-3 sm:grid-cols-12">
                              <div className="sm:col-span-8">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Question Input</label>
                                <input
                                  type="text"
                                  required
                                  value={item.question}
                                  onChange={(e) => {
                                    const next = [...customFaqsEn];
                                    next[index] = { ...next[index], question: e.target.value };
                                    setCustomFaqsEn(next);
                                  }}
                                  className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="text-[9px] font-bold text-slate-400 block uppercase">Audience Scope</label>
                                <select
                                  value={item.category}
                                  onChange={(e) => {
                                    const next = [...customFaqsEn];
                                    next[index] = { ...next[index], category: e.target.value };
                                    setCustomFaqsEn(next);
                                  }}
                                  className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden"
                                >
                                  <option value="Participant">Participant / Runner</option>
                                  <option value="Organizer">Organizer Account</option>
                                </select>
                              </div>

                              <div className="sm:col-span-1 flex items-center justify-center pt-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomFaqsEn(customFaqsEn.filter((_, idx) => idx !== index));
                                  }}
                                  className="rounded-lg bg-red-50 hover:bg-red-100 text-red-600 p-2 cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[9px] font-bold text-slate-400 block uppercase">Detailed Answer Description</label>
                              <textarea
                                rows={2}
                                required
                                value={item.answer}
                                onChange={(e) => {
                                  const next = [...customFaqsEn];
                                  next[index] = { ...next[index], answer: e.target.value };
                                  setCustomFaqsEn(next);
                                }}
                                className="w-full bg-white border border-slate-100 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Commit action layout */}
                  <div className="pt-4 border-t border-slate-150 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Reset defaults
                        localStorage.removeItem('eh_custom_faqs_en');
                        localStorage.removeItem('eh_custom_faqs_id');
                        window.location.reload();
                      }}
                      className="rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-400 font-sans text-xs font-bold px-4 py-3 cursor-pointer"
                      title="Kembalikan FAQ standar"
                    >
                      Reset Defaults
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('eh_custom_faqs_en', JSON.stringify(customFaqsEn));
                        localStorage.setItem('eh_custom_faqs_id', JSON.stringify(customFaqsId));
                        setFaqSuccessMsg("Successfully deployed updated FAQ items live across the English and Indonesian screens!");
                        setTimeout(() => setFaqSuccessMsg(''), 3000);
                      }}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold px-5 py-3 cursor-pointer"
                    >
                      Deploy FAQs Live
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. AUDITING & COMPLIANCE SYSTEM EXPORTS */}
            {activeMenu === 'auditing' && (
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 space-y-6 text-xs text-slate-655 shadow-xs">
                  <div>
                    <h3 className="font-sans text-sm font-extrabold text-slate-900 uppercase tracking-widest leading-none">REGULATORY AUDITING & COMPLIANCE DATA</h3>
                    <p className="mt-1.5 text-[11px] text-slate-400">Download formatted snapshots of active databases, user pools, and transaction ledgers engineered for seamless auditing inside Excel or Google Sheets.</p>
                  </div>

                  {/* Operational Stats Grid */}
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 pt-1">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Audited Users</span>
                      <strong className="text-sm font-extrabold text-slate-800 font-mono mt-1 block">
                        {getAllPlatformUsers().length} Accounts
                      </strong>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Race Catalogs Staged</span>
                      <strong className="text-sm font-extrabold text-slate-800 font-mono mt-1 block">
                        {events.length} Sport Events
                      </strong>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Receipts Audited</span>
                      <strong className="text-sm font-extrabold text-slate-800 font-mono mt-1 block">
                        {registrations.length} Invoices
                      </strong>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Turnover Cleared</span>
                      <strong className="text-sm font-extrabold text-slate-900 font-mono mt-1 block">
                        Rp {registrations.filter(r => r.paymentInfo?.status === 'paid').reduce((sum, r) => sum + (r.paymentInfo?.finalAmount || 0), 0).toLocaleString('id-ID')}
                      </strong>
                    </div>
                  </div>

                  {/* Immediate CSV Actions */}
                  <div className="space-y-3.5 pt-3">
                    <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">INSTANT ON-DEMAND EXPORTS</span>
                    <div className="grid gap-4 sm:grid-cols-3">
                      
                      {/* CARD 1: USER REGISTRY */}
                      <div className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white shadow-xs flex flex-col justify-between h-48 transition-all">
                        <div>
                          <div className="flex items-center">
                            <span className="p-1 px-2 text-[9px] font-bold uppercase rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono leading-none">Spreadsheet CSV</span>
                          </div>
                          <h4 className="font-sans font-extrabold text-slate-900 text-sm mt-3.5">User Identity Log</h4>
                          <p className="text-[10.5px] text-slate-400 mt-1 lines-clamp-3 leading-relaxed font-semibold">Consolidate pre-seeded administrative profiles with all athlete accounts generated during interactive checkouts.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleExportUsers}
                          className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-2.5 px-4 cursor-pointer shadow-xs active:scale-95 transition-all outline-hidden"
                        >
                          <Download className="h-4 w-4 shrink-0" />
                          <span>Download User CSV</span>
                        </button>
                      </div>

                      {/* CARD 2: SPORT EVEN CATALOGS */}
                      <div className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white shadow-xs flex flex-col justify-between h-48 transition-all">
                        <div>
                          <div className="flex items-center">
                            <span className="p-1 px-2 text-[9px] font-bold uppercase rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100 font-mono leading-none">Spreadsheet CSV</span>
                          </div>
                          <h4 className="font-sans font-extrabold text-slate-900 text-sm mt-3.5">Sporting Tournament List</h4>
                          <p className="text-[10.5px] text-slate-400 mt-1 lines-clamp-3 leading-relaxed font-semibold">Extract complete sports event properties including distances, price charts, organizers, locations, and total earnings.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleExportEvents}
                          className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-2.5 px-4 cursor-pointer shadow-xs active:scale-95 transition-all outline-hidden"
                        >
                          <Download className="h-4 w-4 shrink-0" />
                          <span>Download Events CSV</span>
                        </button>
                      </div>

                      {/* CARD 3: LEDGER INVOICE ENTRIES */}
                      <div className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white shadow-xs flex flex-col justify-between h-48 transition-all">
                        <div>
                          <div className="flex items-center">
                            <span className="p-1 px-2 text-[9px] font-bold uppercase rounded-lg bg-amber-50 text-amber-700 border border-amber-100 font-mono leading-none">Spreadsheet CSV</span>
                          </div>
                          <h4 className="font-sans font-extrabold text-slate-900 text-sm mt-3.5">Transaction Ledger Log</h4>
                          <p className="text-[10.5px] text-slate-400 mt-1 lines-clamp-3 leading-relaxed font-semibold">Track individual booking transactions, coupon values, BIB number assignments, and on-site checkout compliance.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleExportTransactions}
                          className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold py-2.5 px-4 cursor-pointer shadow-xs active:scale-95 transition-all outline-hidden"
                        >
                          <Download className="h-4 w-4 shrink-0" />
                          <span>Download Ledger CSV</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Interactive Live Preview Table Console */}
                  <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">REAL-TIME DATA AUDITING PREVIEW</h4>
                      <p className="mt-1 text-[11px] text-slate-400">Review, query, and balance platform datasets. Select a context directory tab below to preview live rows instantly.</p>
                    </div>

                    {/* Filter and Tab Controller Controls wrapper */}
                    <div className="bg-slate-50 p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100 shadow-2xs">
                      
                      {/* Sub-directories */}
                      <div className="flex bg-white p-1 rounded-xl border border-slate-150 w-full md:w-auto">
                        {[
                          { id: 'users', name: 'Users Directory' },
                          { id: 'events', name: 'Sport Catalogs' },
                          { id: 'transactions', name: 'Ledger Logs' }
                        ].map(sub => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => { setAuditPreviewTab(sub.id as any); setAuditSearchQuery(''); }}
                            className={`flex-1 md:flex-none text-center px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                              auditPreviewTab === sub.id ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 font-semibold'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>

                      {/* Filter Search Input */}
                      <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder={`Search ${auditPreviewTab}...`}
                          value={auditSearchQuery}
                          onChange={(e) => setAuditSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-slate-150 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden"
                        />
                      </div>

                    </div>

                    {/* Responsive Matrix grid output */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white max-h-[380px] scrollbar-thin">
                      
                      {auditPreviewTab === 'users' && (() => {
                        const list = getAllPlatformUsers().filter((u: any) => {
                          const query = auditSearchQuery.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            u.id.toLowerCase().includes(query) ||
                            u.name.toLowerCase().includes(query) ||
                            u.email.toLowerCase().includes(query) ||
                            u.whatsapp.toLowerCase().includes(query) ||
                            u.role.toLowerCase().includes(query)
                          );
                        });

                        return (
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">User ID</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Full Name</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Email Address</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">WhatsApp</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">System Role</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Registered</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-right">Sum paid</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Compliance Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-705">
                              {list.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="p-10 text-center italic text-slate-400 font-medium">No system users found matching search query parameters.</td>
                                </tr>
                              ) : (
                                list.map((user: any) => (
                                  <tr key={user.id} className="hover:bg-slate-50/40">
                                    <td className="p-3 font-mono text-[10px] text-slate-400">{user.id}</td>
                                    <td className="p-3 font-extrabold text-slate-900">{user.name}</td>
                                    <td className="p-3 font-mono text-slate-500">{user.email}</td>
                                    <td className="p-3 font-mono text-slate-500">{user.whatsapp}</td>
                                    <td className="p-3 text-center">
                                      <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                        user.role === 'super_admin' ? 'bg-red-50 text-red-700 border border-red-100' :
                                        user.role === 'organizer' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                        'bg-slate-50 text-slate-600'
                                      }`}>
                                        {user.role}
                                      </span>
                                    </td>
                                    <td className="p-3 text-center font-mono">{user.totalRegs} regs</td>
                                    <td className="p-3 text-right font-mono text-slate-900">Rp {user.totalSpent.toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-center">
                                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                        user.status.includes('Finisher') ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                        user.status.includes('Attending') ? 'bg-cyan-50 text-cyan-800 border border-cyan-100' :
                                        'bg-slate-50 text-slate-500 border border-slate-150'
                                      }`}>
                                        {user.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        );
                      })()}

                      {auditPreviewTab === 'events' && (() => {
                        const list = events.filter((e) => {
                          const query = auditSearchQuery.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            e.id.toLowerCase().includes(query) ||
                            e.title.toLowerCase().includes(query) ||
                            e.category.toLowerCase().includes(query) ||
                            e.location.toLowerCase().includes(query) ||
                            e.city.toLowerCase().includes(query) ||
                            e.province.toLowerCase().includes(query) ||
                            e.organizerName.toLowerCase().includes(query)
                          );
                        });

                        return (
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Event ID</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Tournament Title</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Category</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Organizer Identity</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Scheduled Date</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Staging Area</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Max Quota</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Registered</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-right">Sum Turnover</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-705">
                              {list.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-10 text-center italic text-slate-400 font-medium">No sporting catalogs found matching query criteria.</td>
                                </tr>
                              ) : (
                                list.map((e) => {
                                  const rev = registrations
                                    .filter(r => r.eventId === e.id && r.paymentInfo?.status === 'paid')
                                    .reduce((sum, r) => sum + (r.paymentInfo?.finalAmount || 0), 0);
                                  return (
                                    <tr key={e.id} className="hover:bg-slate-50/40">
                                      <td className="p-3 font-mono text-[10px] text-slate-400">{e.id}</td>
                                      <td className="p-3 font-extrabold text-slate-900 max-w-xs truncate">{e.title}</td>
                                      <td className="p-3 text-cyan-700 bg-cyan-50/10 font-bold">{e.category}</td>
                                      <td className="p-3 italic text-slate-500 font-semibold">{e.organizerName}</td>
                                      <td className="p-3 font-mono">{e.date}</td>
                                      <td className="p-3">{e.city}, {e.province}</td>
                                      <td className="p-3 text-center font-mono">{e.quota}</td>
                                      <td className="p-3 text-center font-mono text-slate-900">{e.registeredParticipantsCount}</td>
                                      <td className="p-3 text-right font-mono text-emerald-600 font-bold">Rp {rev.toLocaleString('id-ID')}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        );
                      })()}

                      {auditPreviewTab === 'transactions' && (() => {
                        const list = registrations.filter((r) => {
                          const query = auditSearchQuery.toLowerCase().trim();
                          if (!query) return true;
                          return (
                            r.id.toLowerCase().includes(query) ||
                            r.ticketNumber.toLowerCase().includes(query) ||
                            (r.bibNumber && r.bibNumber.toLowerCase().includes(query)) ||
                            r.eventTitle.toLowerCase().includes(query) ||
                            r.categoryName.toLowerCase().includes(query) ||
                            `${r.personalInfo?.firstName || ''} ${r.personalInfo?.lastName || ''}`.toLowerCase().includes(query) ||
                            r.personalInfo?.email?.toLowerCase().includes(query) ||
                            r.personalInfo?.whatsApp?.toLowerCase().includes(query)
                          );
                        });

                        return (
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400">
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Invoice ID</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Ticket Code</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">BIB Racer Code</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Tournament Title</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Distance Class</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Athlete Details</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-right">Receipt Final</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Payment Status</th>
                                <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Attendance Compliance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-705">
                              {list.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-10 text-center italic text-slate-400 font-medium">No ledger transaction logs matching criteria.</td>
                                </tr>
                              ) : (
                                list.map((r) => {
                                  const isPaid = r.paymentInfo?.status === 'paid';
                                  return (
                                    <tr key={r.id} className="hover:bg-slate-50/40">
                                      <td className="p-3 font-mono text-[10px] text-cyan-700 font-bold">{r.id}</td>
                                      <td className="p-3 font-mono text-[10px] text-slate-500">{r.ticketNumber}</td>
                                      <td className="p-3 font-mono text-[10px] text-slate-500">{r.bibNumber || 'TBA'}</td>
                                      <td className="p-3 font-extrabold text-slate-900 max-w-[140px] truncate">{r.eventTitle}</td>
                                      <td className="p-3 text-slate-500">{r.categoryName}</td>
                                      <td className="p-3">
                                        <p className="font-extrabold text-slate-900 leading-tight">{r.personalInfo?.firstName || ''} {r.personalInfo?.lastName || ''}</p>
                                        <p className="text-[9px] text-slate-400 leading-none">{r.personalInfo?.email || '-'}</p>
                                      </td>
                                      <td className="p-3 text-right font-mono font-bold text-slate-900">Rp {r.paymentInfo?.finalAmount?.toLocaleString('id-ID')}</td>
                                      <td className="p-3 text-center">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                          isPaid ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'
                                        }`}>
                                          {r.paymentInfo?.status}
                                        </span>
                                      </td>
                                      <td className="p-3 text-center">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                          r.checkInStatus === 'finished' ? 'bg-teal-50 text-teal-800 border border-teal-100' :
                                          r.checkInStatus === 'checked_in' ? 'bg-cyan-50 text-cyan-805 border border-cyan-100' :
                                          'bg-slate-50 text-slate-500 border border-slate-150'
                                        }`}>
                                          {r.checkInStatus}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        );
                      })()}

                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
