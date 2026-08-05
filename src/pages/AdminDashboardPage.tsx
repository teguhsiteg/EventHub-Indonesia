import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import {
  getAllEventsForAdmin,
  getEventsByOrganizer,
  createEvent,
  updateEvent,
  deleteEvent,
  createCategory,
} from "../services/eventService";
import {
  getAllRegistrationsAdmin,
  getRegistrationsByEventIds,
  getAllParticipantsAdmin,
  updateCheckInStatusAdmin,
} from "../services/registrationService";
import {
  getAllPaymentsAdmin,
  verifyPaymentByAdmin,
  getPaymentsByRegistrationIds,
  deletePaymentAdmin,
  updatePaymentAdmin,
} from "../services/paymentService";
import {
  getAllPayoutsAdmin,
  approvePayout,
  getPayoutsByOrganizer,
} from "../services/payoutService";
import {
  submitOrUpdateRaceResult,
  getPublicRaceResults,
  deleteRaceResult,
} from "../services/resultService";
import {
  updateUserRoleBySuperAdmin,
  banUserBySuperAdmin,
} from "../services/authService";
import { updateSystemSettings } from "../services/settingsService";
import { getEventRequests } from "../services/requestService";
import {
  EventItem,
  Registration,
  Payment,
  EventCategory,
  UserRole,
  PayoutRequest,
  EventRequest,
  RaceResult,
  UserProfile,
  Participant,
} from "../types";
import { db } from "../config/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { CreateEventModal } from "../components/admin/CreateEventModal";
import { PaymentActionModal } from "../components/admin/PaymentActionModal";
import { FooterSettings } from "../components/admin/FooterSettings";
import { PageSettings } from "../components/admin/PageSettings";
import { SponsorSettings } from "../components/admin/SponsorSettings";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
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
  ClipboardList,
  Download,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { settings, reloadSettings, addNotification } = useSettings();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab =
    (queryParams.get("tab") as
      | "stats"
      | "events"
      | "requests"
      | "payments"
      | "payouts"
      | "results"
      | "participants"
      | "users"
      | "settings") || "stats";
  // Data States
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / Forms
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalMode, setPaymentModalMode] = useState<"VIEW" | "EDIT">(
    "VIEW",
  );
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDanger: false,
    onConfirm: () => {},
  });

  // Result Form
  const [resParticipantId, setResParticipantId] = useState("");
  const [resBib, setResBib] = useState("");
  const [resEventId, setResEventId] = useState("");
  const [resName, setResName] = useState("");
  const [resChipTime, setResChipTime] = useState("03:45:12");
  const [resGunTime, setResGunTime] = useState("03:46:00");
  const [resRank, setResRank] = useState(1);

  // Payout Form
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutEventId, setPayoutEventId] = useState("");
  const [payoutBank, setPayoutBank] = useState("");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [payoutHolder, setPayoutHolder] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Event search/filter
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");

  // Settings Tab internal state
  const [activeSettingsTab, setActiveSettingsTab] = useState<
    "system" | "payment" | "pages" | "footer" | "sponsors"
  >("system");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      if (isSuperAdmin) {
        const results = await Promise.allSettled([
          getAllEventsForAdmin(),
          getAllRegistrationsAdmin(),
          getAllPaymentsAdmin(),
          getAllPayoutsAdmin(),
          fetch("/api/admin/users").then((res) => res.json()),
          getDocs(query(collection(db, "audit_logs"), limit(50))),
          getEventRequests(),
          getPublicRaceResults(),
          getAllParticipantsAdmin(),
        ]);

        if (results[0].status === "fulfilled") setEvents(results[0].value);
        if (results[1].status === "fulfilled")
          setRegistrations(results[1].value);
        if (results[2].status === "fulfilled") setPayments(results[2].value);
        if (results[3].status === "fulfilled") setPayouts(results[3].value);
        if (results[8].status === "fulfilled")
          setParticipants(results[8].value);

        if (
          results[4].status === "fulfilled" &&
          Array.isArray(results[4].value)
        ) {
          setUsersList(results[4].value as UserProfile[]);
        } else {
          console.error(
            "Failed to load users:",
            results[4].status === "rejected"
              ? results[4].reason
              : "Invalid data format",
          );
        }

        if (results[5].status === "fulfilled") {
          setAuditLogs(
            results[5].value.docs.map(
              (d) => ({ id: d.id, ...d.data() }) as any,
            ),
          );
        } else {
          console.error("Failed to load audit logs:", results[5].reason);
        }

        if (results[6].status === "fulfilled") {
          setEventRequests(results[6].value);
        }

        if (results[7] && results[7].status === "fulfilled") {
          setRaceResults(results[7].value);
        }
      } else if (user?.role === "ORGANIZER") {
        const organizerEvents = await getEventsByOrganizer(user.uid);
        setEvents(organizerEvents);

        const eventIds = organizerEvents.map((e) => e.id);
        const [organizerRegs, organizerPayouts, results] = await Promise.all([
          getRegistrationsByEventIds(eventIds),
          getPayoutsByOrganizer(user.uid),
          getPublicRaceResults(), // Optional: Might want to filter this by eventIds as well in the future
        ]);

        setRegistrations(organizerRegs);
        setPayouts(organizerPayouts);
        setRaceResults(results);

        const regIds = organizerRegs.map((r) => r.id);
        const organizerPayments = await getPaymentsByRegistrationIds(regIds);
        setPayments(organizerPayments);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (
    title: string,
    message: string,
    isDanger: boolean,
    onConfirm: () => void,
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      isDanger,
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        await onConfirm();
      },
    });
  };

  const handleVerifyPayment = async (
    paymentId: string,
    regId: string,
    status: "APPROVE" | "REJECT",
  ) => {
    if (!user) return;
    try {
      setLoading(true);
      await verifyPaymentByAdmin(
        paymentId,
        regId,
        "",
        status,
        user.uid,
        user.email || "",
      );
      addNotification(
        "success",
        "Status Diperbarui",
        `Pembayaran telah di-${status.toLowerCase()}.`,
      );
      loadAdminData();
    } catch (err: any) {
      addNotification("error", "Gagal Verifikasi", err.message);
    }
    setLoading(false);
  };

  const handleSyncMidtransPayment = async (
    paymentId: string,
    regId: string,
  ) => {
    if (!user) return;
    try {
      setLoading(true);
      // Simulasi panggilan ke API Midtrans mengunakan Server Key
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulasi sukses
      await verifyPaymentByAdmin(
        paymentId,
        regId,
        "",
        "APPROVE",
        user.uid,
        user.email || "",
      );
      addNotification(
        "success",
        "Sinkronisasi Berhasil",
        "Status pembayaran dari Midtrans adalah PAID.",
      );
      loadAdminData();
    } catch (err: any) {
      addNotification("error", "Gagal Sinkronisasi", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await submitOrUpdateRaceResult(
        {
          participantId: resParticipantId || `part_${Date.now()}`,
          bibNumber: resBib,
          eventId: resEventId || events[0]?.id || "event-1",
          categoryId: "cat-1",
          participantName: resName,
          gender: "MALE",
          gunTime: resGunTime,
          chipTime: resChipTime,
          pace: "05:30 /km",
          rank: resRank,
          genderRank: resRank,
          categoryRank: resRank,
          status: "FINISH",
        },
        user.uid,
        user.email,
      );

      addNotification(
        "success",
        "Hasil Lomba Tersimpan",
        `Hasil finisher ${resName} (BIB: ${resBib}) berhasil dipublikasikan.`,
      );
      setResParticipantId("");
      setResBib("");
      setResName("");
      loadAdminData();
    } catch (err: any) {
      addNotification("error", "Gagal", err.message);
    }
  };

  const handleEditResult = (r: RaceResult) => {
    setResParticipantId(r.participantId);
    setResBib(r.bibNumber);
    setResEventId(r.eventId);
    setResName(r.participantName);
    setResChipTime(r.chipTime || "");
    setResGunTime(r.gunTime || "");
    setResRank(r.rank || 1);
  };

  const handleDeleteResult = (resultId: string) => {
    confirmAction(
      "Hapus Hasil",
      "Yakin ingin menghapus hasil ini?",
      true,
      async () => {
        if (!user) return;
        try {
          await deleteRaceResult(resultId, user.uid, user.email || "");
          addNotification("success", "Berhasil", "Hasil berhasil dihapus.");
          loadAdminData();
        } catch (err: any) {
          addNotification("error", "Gagal", err.message);
        }
      },
    );
  };

  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    if (!user || !isSuperAdmin) return;
    try {
      await updateUserRoleBySuperAdmin(
        user.uid,
        user.email,
        targetUid,
        newRole,
      );
      addNotification(
        "success",
        "Role Diperbarui",
        `Role pengguna telah diubah menjadi ${newRole}.`,
      );
      loadAdminData();
    } catch (err: any) {
      addNotification("error", "Gagal", err.message);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      await updateSystemSettings({
        maintenanceMode: !settings.maintenanceMode,
      });
      await reloadSettings();
      addNotification(
        "info",
        "Status Maintenance",
        `Maintenance Mode sekarang: ${!settings.maintenanceMode ? "AKTIF" : "NONAKTIF"}`,
      );
    } catch (err: any) {
      addNotification("error", "Gagal Update", err.message);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalRevenue = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPaymentsCount = payments.filter(
    (p) => p.status === "PENDING",
  ).length;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      PUBLISHED: "bg-emerald-500/10 text-red-600  border-emerald-500/30",
      DRAFT: "bg-slate-500/10 text-slate-600   border-slate-500/30",
      CANCELLED: "bg-red-500/10 text-red-600  border-red-500/30",
      PENDING: "bg-yellow-500/10 text-red-600  border-yellow-500/30",
      PAID: "bg-emerald-500/10 text-red-600  border-emerald-500/30",
      REJECTED: "bg-red-500/10 text-red-600  border-red-500/30",
      APPROVED: "bg-red-500/10 text-red-600  border-red-500/30",
      ACTIVE: "bg-emerald-500/10 text-red-600  border-emerald-500/30",
    };
    return (
      map[status] || "bg-slate-500/10 text-slate-600   border-slate-500/30"
    );
  };

  const statCards = [
    {
      label: "Total Event",
      value: events.length,
      icon: Calendar,
      accent: "border-l-red-500",
      iconBg: "bg-red-500/10 text-red-600 ",
      gradient: "from-red-500/5 to-transparent",
    },
    {
      label: "Total Pendaftaran",
      value: registrations.length,
      icon: Users,
      accent: "border-l-emerald-500",
      iconBg: "bg-emerald-500/10 text-red-600 ",
      gradient: "from-emerald-500/5 to-transparent",
    },
    {
      label: "Pembayaran Pending",
      value: pendingPaymentsCount,
      icon: Clock,
      accent: "border-l-yellow-500",
      iconBg: "bg-yellow-500/10 text-red-600 ",
      gradient: "from-yellow-500/5 to-transparent",
    },
    {
      label: "Total Revenue",
      value: formatRupiah(totalRevenue),
      icon: TrendingUp,
      isCurrency: true,
      accent: "border-l-red-500",
      iconBg: "bg-red-500/10 text-red-600 ",
      gradient: "from-red-500/5 to-transparent",
    },
  ];
  const handleToggleParticipantCheckIn = async (
    participantId: string,
    currentStatus: boolean,
  ) => {
    try {
      await updateCheckInStatusAdmin(participantId, !currentStatus);
      addNotification('success', 'Status RPC', 'Status RPC peserta berhasil diperbarui.');
      await loadAdminData();
    } catch (e) {
      console.error(e);
      addNotification('error', 'Gagal', 'Gagal mengupdate status RPC peserta');
    }
  };

  const handleExportPaymentsCsv = () => {
    let csvContent =
      "No,ID Pembayaran,Nomor Registrasi,Nama Peserta,Nominal,Status,Metode\n";
    payments.forEach((pay, index) => {
      const reg = registrations.find((r) => r.id === pay.registrationId);
      const participantName = reg
        ? usersList.find((u) => u.uid === reg.userId)?.displayName ||
          "Peserta tidak dikenal"
        : "Peserta tidak dikenal";
      const regNumber = reg?.registrationNumber || "-";

      const row = [
        index + 1,
        pay.id,
        regNumber,
        `"${participantName}"`,
        pay.amount,
        pay.status,
        pay.paymentMethod,
      ].join(",");

      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Laporan_Pembayaran_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeletePayment = (paymentId: string, registrationId: string) => {
    if (!user) return;
    setConfirmState({
      isOpen: true,
      title: "Hapus Pembayaran",
      message:
        "Apakah Anda yakin ingin menghapus pembayaran ini? Status registrasi akan dikembalikan ke WAITING_PAYMENT.",
      isDanger: true,
      onConfirm: async () => {
        try {
          await deletePaymentAdmin(
            paymentId,
            registrationId,
            user.uid,
            user.email || "",
          );
          setPayments((prev) => prev.filter((p) => p.id !== paymentId));
          addNotification(
            "success",
            "Berhasil",
            "Pembayaran berhasil dihapus.",
          );
        } catch (err: any) {
          addNotification(
            "error",
            "Gagal",
            err.message || "Gagal menghapus pembayaran.",
          );
        }
      },
    });
  };

  return (
    <div className="text-slate-900  w-full">
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900  uppercase tracking-tight">
              EventHub by Guwigo Management
            </h1>
            <p className="text-sm text-slate-600   mt-1">
              Pengelolaan real-time event, pendaftaran, pembayaran, dan hasil
              lomba.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Memuat data...
                </span>
              </div>
            </div>
          )}

          {/* TAB: STATS */}
          {activeTab === "stats" && !loading && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={i}
                      className={`relative overflow-hidden bg-white  backdrop-blur-xl border border-slate-200  ${card.accent} border-l-[3px] rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 group`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`}
                      />
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {card.label}
                          </span>
                          <span
                            className={`block font-black mt-1.5 ${card.isCurrency ? "text-xl" : "text-3xl"} text-slate-900 `}
                          >
                            {card.value}
                          </span>
                        </div>
                        <div
                          className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}
                        >
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Event Baru</span>
                </button>
                <Link
                  to="/admin/check-in"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100  hover:bg-slate-200  text-white font-bold text-xs uppercase tracking-wider border border-slate-200  transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>EventHub by Guwigo QR Check-In Scanner</span>
                </Link>
              </div>

              {/* Audit Logs Table */}
              <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200  flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-red-600 " />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                        Audit Logs
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        Aktivitas sistem terbaru
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {auditLogs.length} entri
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200  text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Waktu</th>
                        <th className="py-3 px-6">Aktor</th>
                        <th className="py-3 px-6">Tindakan</th>
                        <th className="py-3 px-6">Resource ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {auditLogs.slice(0, 10).map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-6 text-xs text-slate-500 font-mono">
                            {new Date(log.createdAt).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-6 text-xs text-slate-700 ">
                            {log.actorEmail}
                          </td>
                          <td className="py-3 px-6">
                            <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600  text-[10px] font-bold uppercase border border-red-500/20">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-xs text-slate-500 font-mono">
                            {log.resourceId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EVENTS */}
          {activeTab === "events" && !loading && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200  flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-red-600 " />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                        Manajemen Event
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {events.length} event terdaftar
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setShowEventModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Event</span>
                  </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="px-6 py-3 border-b border-slate-200  flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Cari nama event atau lokasi..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="flex-1 min-w-[180px] bg-slate-100  border border-slate-200  rounded-xl px-4 py-2 text-xs text-slate-800  focus:border-red-500/50 outline-none placeholder:text-slate-600"
                  />
                  <select
                    value={eventStatusFilter}
                    onChange={(e) => setEventStatusFilter(e.target.value)}
                    className="bg-slate-100  border border-slate-200  rounded-xl px-3 py-2 text-xs text-slate-700  focus:border-red-500/50 outline-none"
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
                      <tr className="border-b border-slate-200  text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Nama Event</th>
                        <th className="py-3 px-6">Lokasi</th>
                        <th className="py-3 px-6">Tanggal Start</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {events
                        .filter((ev) => {
                          const matchSearch =
                            ev.name
                              .toLowerCase()
                              .includes(eventSearch.toLowerCase()) ||
                            (ev.location || "")
                              .toLowerCase()
                              .includes(eventSearch.toLowerCase());
                          const matchStatus =
                            eventStatusFilter === "ALL" ||
                            ev.status === eventStatusFilter;
                          return matchSearch && matchStatus;
                        })
                        .map((ev) => (
                          <tr
                            key={ev.id}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <p className="text-xs font-bold text-slate-900 ">
                                {ev.name}
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5 text-xs text-slate-600  ">
                                <MapPin className="w-3 h-3 text-slate-600" />
                                {ev.location}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-600  ">
                              {new Date(ev.startDate).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusBadge(ev.status)}`}
                              >
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
                                  className="p-2 rounded-lg text-slate-600   hover:text-red-600  hover:bg-red-500/10 transition-all"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (user) {
                                      confirmAction(
                                        "Hapus Event",
                                        `Anda yakin ingin menghapus event ${ev.name}? Aksi ini tidak dapat dibatalkan.`,
                                        true,
                                        async () => {
                                          await deleteEvent(
                                            ev.id,
                                            user.uid,
                                            user.email || "",
                                          );
                                          loadAdminData();
                                        },
                                      );
                                    }
                                  }}
                                  className="p-2 rounded-lg text-slate-600   hover:text-red-600  hover:bg-red-500/10 transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {events.filter((ev) => {
                        const matchSearch =
                          ev.name
                            .toLowerCase()
                            .includes(eventSearch.toLowerCase()) ||
                          (ev.location || "")
                            .toLowerCase()
                            .includes(eventSearch.toLowerCase());
                        const matchStatus =
                          eventStatusFilter === "ALL" ||
                          ev.status === eventStatusFilter;
                        return matchSearch && matchStatus;
                      }).length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-16 text-center text-slate-500"
                          >
                            <Calendar className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                            <p className="text-xs font-semibold">
                              {events.length === 0
                                ? "Belum ada event"
                                : "Tidak ada event yang cocok"}
                            </p>
                            <p className="text-[10px] mt-1">
                              {events.length === 0
                                ? 'Klik "Tambah Event" untuk membuat event baru.'
                                : "Coba ubah kata kunci atau filter status."}
                            </p>
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
          {activeTab === "requests" && !loading && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200  flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-red-600 " />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                      Permohonan Event
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {eventRequests.length} permohonan
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200  text-[10px] text-slate-500 font-bold uppercase tracking-wider">
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
                          <td
                            colSpan={6}
                            className="py-16 text-center text-slate-500"
                          >
                            <ClipboardList className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                            <p className="text-xs font-semibold">
                              Belum ada permohonan event
                            </p>
                          </td>
                        </tr>
                      ) : (
                        eventRequests.map((req) => (
                          <tr
                            key={req.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-4 px-6">
                              <p className="text-xs font-bold text-slate-900 ">
                                {req.eventName}
                              </p>
                              <p className="text-[10px] font-mono text-slate-500">
                                {req.eventType}
                              </p>
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-700 ">
                              {new Date(req.plannedDate).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-xs font-bold text-slate-900 ">
                                {req.eoName}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {req.picName}
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-xs text-slate-700 ">
                                {req.picPhone}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {req.picEmail}
                              </p>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                                  req.status === "PENDING"
                                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    : req.status === "REVIEWED"
                                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                                      : req.status === "APPROVED"
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button className="text-[10px] font-bold text-red-500 hover:text-red-600  uppercase tracking-wider">
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
          {activeTab === "payments" && !loading && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200  flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-yellow-600 " />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                        Data Pembayaran
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {payments.length} transaksi
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200  :bg-slate-700 text-xs font-bold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={handleExportPaymentsCsv}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200  :bg-emerald-900/50 text-emerald-700  text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Excel (CSV)</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200  text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-6 w-16">No.</th>
                        <th className="py-3 px-6">Peserta / Invoice</th>
                        <th className="py-3 px-6">Nominal</th>
                        <th className="py-3 px-6">Bukti Upload</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {payments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-16 text-center text-slate-500"
                          >
                            <Receipt className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                            <p className="text-xs font-semibold">
                              Belum ada pembayaran
                            </p>
                          </td>
                        </tr>
                      ) : (
                        payments.map((pay, index) => (
                          <tr
                            key={pay.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                              {index + 1}
                            </td>
                            <td className="py-4 px-6">
                              {(() => {
                                const reg = registrations.find(
                                  (r) => r.id === pay.registrationId,
                                );
                                return (
                                  <div>
                                    <p className="text-xs font-bold text-slate-900 ">
                                      {reg
                                        ? usersList.find(
                                            (u) => u.uid === reg.userId,
                                          )?.displayName ||
                                          reg.registrationNumber
                                        : "Peserta tidak dikenal"}
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-500">
                                      {pay.invoiceId}
                                    </p>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-xs font-bold text-red-600 ">
                                {formatRupiah(pay.amount)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {pay.proofUrl ? (
                                <a
                                  href={pay.proofUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-red-600  hover:text-red-300 font-semibold transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  Lihat Bukti
                                </a>
                              ) : (
                                <span className="text-xs text-slate-600">
                                  Belum Upload
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusBadge(pay.status)}`}
                              >
                                {pay.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-2">
                                {settings.paymentGatewayConfigured ? (
                                  <button
                                    onClick={() =>
                                      handleSyncMidtransPayment(
                                        pay.id,
                                        pay.registrationId,
                                      )
                                    }
                                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600  font-bold text-[10px] uppercase tracking-wider border border-red-500/20 transition-all"
                                  >
                                    Cek Gateway
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleVerifyPayment(
                                          pay.id,
                                          pay.registrationId,
                                          "APPROVE",
                                        )
                                      }
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-red-600  font-bold text-[10px] uppercase tracking-wider border border-emerald-500/20 transition-all"
                                    >
                                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                      Setujui
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleVerifyPayment(
                                          pay.id,
                                          pay.registrationId,
                                          "REJECT",
                                        )
                                      }
                                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600  font-bold text-[10px] uppercase tracking-wider border border-red-500/20 transition-all"
                                    >
                                      <XCircle className="w-3 h-3 inline mr-1" />
                                      Tolak
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => {
                                    setSelectedPayment(pay);
                                    setPaymentModalMode("VIEW");
                                    setShowPaymentModal(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-500/10  :bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Detail Pembayaran"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedPayment(pay);
                                    setPaymentModalMode("EDIT");
                                    setShowPaymentModal(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-500/10  :bg-orange-500/20 text-slate-400 hover:text-orange-500 transition-colors"
                                  title="Edit Pembayaran"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeletePayment(
                                      pay.id,
                                      pay.registrationId,
                                    )
                                  }
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-500/10  :bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                                  title="Hapus Pembayaran"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
          {activeTab === "payouts" && !loading && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200  flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-red-600 " />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                        Pencairan Dana
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {payouts.length} permintaan
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPayoutForm((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajukan Pencairan</span>
                  </button>
                </div>

                {/* Inline Payout Form */}
                {showPayoutForm && (
                  <div className="border-b border-slate-200  p-6 bg-slate-100 ">
                    <h4 className="text-xs font-black text-slate-900  uppercase tracking-wider mb-4">
                      Form Pengajuan Pencairan Dana
                    </h4>
                    <form
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!user) return;
                        setPayoutLoading(true);
                        try {
                          const { requestPayout } =
                            await import("../services/payoutService");
                          await requestPayout(
                            payoutEventId,
                            user.uid,
                            Number(payoutAmount),
                            payoutBank,
                            payoutAccount,
                            payoutHolder,
                          );
                          addNotification(
                            "success",
                            "Berhasil",
                            "Permintaan pencairan dana telah diajukan.",
                          );
                          setShowPayoutForm(false);
                          setPayoutEventId("");
                          setPayoutBank("");
                          setPayoutAccount("");
                          setPayoutHolder("");
                          setPayoutAmount("");
                          loadAdminData();
                        } catch (err: any) {
                          addNotification("error", "Gagal", err.message);
                        } finally {
                          setPayoutLoading(false);
                        }
                      }}
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600   uppercase tracking-wider mb-1.5">
                          Pilih Event
                        </label>
                        <select
                          required
                          value={payoutEventId}
                          onChange={(e) => setPayoutEventId(e.target.value)}
                          className="w-full bg-white  border border-white/[0.08] rounded-xl p-3 text-slate-800  text-xs focus:border-red-500/50 outline-none"
                        >
                          <option value="">-- Pilih Event --</option>
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600   uppercase tracking-wider mb-1.5">
                          Nominal (Rp)
                        </label>
                        <input
                          required
                          type="number"
                          min="1"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="1000000"
                          className="w-full bg-white  border border-white/[0.08] rounded-xl p-3 text-slate-800  text-xs focus:border-red-500/50 outline-none placeholder:text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600   uppercase tracking-wider mb-1.5">
                          Nama Bank
                        </label>
                        <input
                          required
                          value={payoutBank}
                          onChange={(e) => setPayoutBank(e.target.value)}
                          placeholder="BCA, Mandiri, BNI..."
                          className="w-full bg-white  border border-white/[0.08] rounded-xl p-3 text-slate-800  text-xs focus:border-red-500/50 outline-none placeholder:text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600   uppercase tracking-wider mb-1.5">
                          Nomor Rekening
                        </label>
                        <input
                          required
                          value={payoutAccount}
                          onChange={(e) => setPayoutAccount(e.target.value)}
                          placeholder="1234567890"
                          className="w-full bg-white  border border-white/[0.08] rounded-xl p-3 text-slate-800  text-xs font-mono focus:border-red-500/50 outline-none placeholder:text-slate-600"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600   uppercase tracking-wider mb-1.5">
                          Nama Pemilik Rekening
                        </label>
                        <input
                          required
                          value={payoutHolder}
                          onChange={(e) => setPayoutHolder(e.target.value)}
                          placeholder="Budi Santoso"
                          className="w-full bg-white  border border-white/[0.08] rounded-xl p-3 text-slate-800  text-xs focus:border-red-500/50 outline-none placeholder:text-slate-600"
                        />
                      </div>
                      <div className="sm:col-span-2 flex gap-3">
                        <button
                          type="submit"
                          disabled={payoutLoading}
                          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
                        >
                          {payoutLoading
                            ? "Mengajukan..."
                            : "Kirim Permintaan Pencairan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPayoutForm(false)}
                          className="px-6 py-3 rounded-xl bg-slate-200  hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
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
                    <p className="text-xs font-semibold">
                      Belum ada permintaan pencairan dana.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200  text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-6">Tanggal</th>
                          <th className="py-3 px-6">Event ID</th>
                          <th className="py-3 px-6">Bank &amp; Rekening</th>
                          <th className="py-3 px-6">Nominal</th>
                          <th className="py-3 px-6">Status</th>
                          <th className="py-3 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {payouts.map((payout) => (
                          <tr
                            key={payout.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-4 px-6 text-xs font-mono text-slate-700 ">
                              {new Date(payout.requestedAt).toLocaleDateString(
                                "id-ID",
                              )}
                            </td>
                            <td className="py-4 px-6 text-xs text-slate-600   font-mono truncate max-w-[150px]">
                              {payout.eventId}
                            </td>
                            <td className="py-4 px-6">
                              <p className="text-xs font-semibold text-slate-700 ">
                                {payout.bankName} — {payout.accountNumber}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {payout.accountHolderName}
                              </p>
                            </td>
                            <td className="py-4 px-6 text-xs font-bold text-red-600 ">
                              {formatRupiah(payout.amount)}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusBadge(payout.status)}`}
                              >
                                {payout.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-2">
                                {payout.status === "PENDING" && isSuperAdmin ? (
                                  <>
                                    <button
                                      onClick={async () => {
                                        const url = prompt(
                                          "Masukkan URL bukti transfer (opsional):",
                                        );
                                        if (url !== null) {
                                          try {
                                            await approvePayout(
                                              payout.id,
                                              "PAID",
                                              url,
                                              "",
                                              user!.uid,
                                              user!.email!,
                                            );
                                            addNotification(
                                              "success",
                                              "Sukses",
                                              "Pencairan dana disetujui dan dibayar.",
                                            );
                                            loadAdminData();
                                          } catch (e: any) {
                                            addNotification(
                                              "error",
                                              "Gagal",
                                              e.message,
                                            );
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-red-600  font-bold text-[10px] uppercase tracking-wider border border-emerald-500/20 transition-all"
                                    >
                                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                      Selesai (Paid)
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const notes =
                                          prompt("Alasan penolakan:");
                                        if (notes) {
                                          try {
                                            await approvePayout(
                                              payout.id,
                                              "REJECTED",
                                              "",
                                              notes,
                                              user!.uid,
                                              user!.email!,
                                            );
                                            addNotification(
                                              "info",
                                              "Ditolak",
                                              "Permintaan ditolak.",
                                            );
                                            loadAdminData();
                                          } catch (e: any) {
                                            addNotification(
                                              "error",
                                              "Gagal",
                                              e.message,
                                            );
                                          }
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600  font-bold text-[10px] uppercase tracking-wider border border-red-500/20 transition-all"
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
                                      className="flex items-center gap-1.5 text-xs text-red-600  hover:text-emerald-300 font-semibold transition-colors"
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
          {activeTab === "results" && !loading && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl max-w-xl mx-auto">
                <div className="px-6 py-4 border-b border-slate-200  flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-red-600 " />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                      Input Hasil Lomba
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Input / Update Waktu Finisher
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <form
                    onSubmit={handleSubmitResult}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-slate-600   font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                        Pilih Event
                      </label>
                      <select
                        value={resEventId}
                        onChange={(e) => setResEventId(e.target.value)}
                        className="w-full bg-slate-100  border border-slate-200  rounded-xl p-3 text-slate-800  text-xs focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                      >
                        {events.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600   font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                          Nomor BIB
                        </label>
                        <input
                          type="text"
                          required
                          value={resBib}
                          onChange={(e) => setResBib(e.target.value)}
                          placeholder="TR50-0001"
                          className="w-full bg-slate-100  border border-slate-200  rounded-xl p-3 text-slate-800  text-xs font-mono focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder:text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600   font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                          Nama Peserta
                        </label>
                        <input
                          type="text"
                          required
                          value={resName}
                          onChange={(e) => setResName(e.target.value)}
                          placeholder="Budi Santoso"
                          className="w-full bg-slate-100  border border-slate-200  rounded-xl p-3 text-slate-800  text-xs focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600   font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                          Chip Time
                        </label>
                        <input
                          type="text"
                          required
                          value={resChipTime}
                          onChange={(e) => setResChipTime(e.target.value)}
                          className="w-full bg-slate-100  border border-slate-200  rounded-xl p-3 text-slate-800  text-xs font-mono focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600   font-bold uppercase tracking-wider mb-1.5 text-[10px]">
                          Rank Finisher
                        </label>
                        <input
                          type="number"
                          required
                          value={resRank}
                          onChange={(e) => setResRank(Number(e.target.value))}
                          className="w-full bg-slate-100  border border-slate-200  rounded-xl p-3 text-slate-800  text-xs focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all"
                    >
                      Publikasikan Hasil Finisher
                    </button>
                  </form>
                </div>
              </div>

              {/* Table for Race Results */}
              <div className="mt-8 bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
                <div className="px-6 py-4 border-b border-slate-200  flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                      Daftar Hasil Lomba
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Menampilkan {raceResults.length} hasil
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50  border-b border-slate-200 ">
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Event
                        </th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          BIB
                        </th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Peserta
                        </th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Waktu (Chip)
                        </th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">
                          Rank
                        </th>
                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 ">
                      {raceResults.map((r) => {
                        const eventName =
                          events.find((e) => e.id === r.eventId)?.name ||
                          r.eventId;
                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-slate-50 :bg-white/[0.02] transition-colors"
                          >
                            <td className="p-4 text-xs text-slate-700  font-medium">
                              {eventName}
                            </td>
                            <td className="p-4 text-xs font-mono text-red-600  font-bold">
                              {r.bibNumber}
                            </td>
                            <td className="p-4 text-xs text-slate-700 ">
                              {r.participantName}
                            </td>
                            <td className="p-4 text-xs font-mono text-slate-700 ">
                              {r.chipTime || "-"}
                            </td>
                            <td className="p-4 text-xs text-center font-bold text-slate-700 ">
                              {r.rank || "-"}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => handleEditResult(r)}
                                className="p-1.5 rounded-lg bg-red-100  text-red-600  hover:bg-red-200 :bg-red-500/20 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResult(r.id)}
                                className="p-1.5 rounded-lg bg-red-100  text-red-600  hover:bg-red-200 :bg-red-500/20 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {raceResults.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-slate-500 text-xs"
                          >
                            Belum ada hasil lomba yang diinput.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* TAB: DATA PESERTA */}
          {activeTab === "participants" && !loading && (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-elegant">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Data Peserta
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Daftar semua peserta event
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4 text-red-500" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Nama Peserta & BIB
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Event
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Kategori
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">
                        Status RPC
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {participants.map((part) => {
                      const evt = events.find((e) => e.id === part.eventId);
                      const cat =
                        evt?.categories?.find((c) => c === part.categoryId) ||
                        part.categoryId; // Just displaying ID or string
                      return (
                        <tr
                          key={part.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-slate-900">
                              {part.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              BIB: {part.bibNumber || "-"}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {part.email}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-xs font-bold text-slate-700 max-w-[200px] truncate">
                              {evt?.name || "-"}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                              {cat || "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {part.checkInStatus ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                  <CheckCircle2 className="w-3 h-3" /> Race Pack Collected
                                </span>
                                {part.checkInTime && (
                                  <span className="text-[9px] text-slate-400 mt-1 font-medium">
                                    {new Date(part.checkInTime).toLocaleString(
                                      "id-ID",
                                      {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      },
                                    )}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                Belum Diambil
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() =>
                                handleToggleParticipantCheckIn(
                                  part.id,
                                  part.checkInStatus,
                                )
                              }
                              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm ${
                                part.checkInStatus
                                  ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                              }`}
                            >
                              {part.checkInStatus
                                ? "Batal RPC"
                                : "Set RPC (Collected)"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {participants.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-slate-500 text-sm font-medium"
                        >
                          Belum ada data peserta.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: USERS LIST */}
          {activeTab === "users" && !loading && isSuperAdmin && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-200  flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900  uppercase tracking-wider">
                      Manajemen Pengguna
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {usersList.length} pengguna terdaftar
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200  text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-6">Email Pengguna</th>
                        <th className="py-3 px-6">Role Saat Ini</th>
                        <th className="py-3 px-6">Ubah Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {usersList.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-4 px-6">
                            <p className="text-xs font-bold text-slate-900 ">
                              {u.email}
                            </p>
                            {u.banned && (
                              <span className="text-[9px] text-red-600  font-bold uppercase tracking-wider">
                                BANNED
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                u.role === "SUPER_ADMIN"
                                  ? "bg-purple-500/10 text-purple-600  border-purple-500/20"
                                  : u.role === "ADMIN"
                                    ? "bg-rose-500/10 text-rose-600  border-rose-500/20"
                                    : u.role === "ORGANIZER"
                                      ? "bg-red-500/10 text-red-600  border-red-500/20"
                                      : "bg-slate-500/10 text-slate-600  border-slate-500/20"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handleRoleChange(u.id, "ADMIN")}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600  font-bold text-[10px] uppercase tracking-wider border border-rose-500/20 transition-all"
                              >
                                <Shield className="w-3 h-3 inline mr-1" />
                                ADMIN
                              </button>
                              <button
                                onClick={() =>
                                  handleRoleChange(u.id, "ORGANIZER")
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600  font-bold text-[10px] uppercase tracking-wider border border-red-500/20 transition-all"
                              >
                                <UserCheck className="w-3 h-3 inline mr-1" />
                                ORGANIZER
                              </button>
                              <button
                                onClick={() =>
                                  handleRoleChange(u.id, "PARTICIPANT")
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-600  font-bold text-[10px] uppercase tracking-wider border border-slate-500/20 transition-all"
                              >
                                PARTICIPANT
                              </button>
                              <button
                                onClick={() => {
                                  if (user) {
                                    confirmAction(
                                      u.banned
                                        ? "Buka Blokir Pengguna"
                                        : "Blokir Pengguna",
                                      `Anda yakin ingin ${u.banned ? "membuka blokir" : "memblokir"} pengguna ${u.email}?`,
                                      !u.banned,
                                      async () => {
                                        await banUserBySuperAdmin(
                                          user.uid,
                                          user.email || "",
                                          u.id,
                                          !u.banned,
                                        );
                                        loadAdminData();
                                      },
                                    );
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all ${
                                  u.banned
                                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600  border-emerald-500/20"
                                    : "bg-red-500/10 hover:bg-red-500/20 text-red-600  border-red-500/20"
                                }`}
                              >
                                <Ban className="w-3 h-3 inline mr-1" />
                                {u.banned ? "UNBAN" : "BAN"}
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
          {activeTab === "users" && !loading && !isSuperAdmin && (
            <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl p-12 text-center shadow-xl">
              <Shield className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-sm font-bold text-slate-600  ">
                Akses Terbatas
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Hanya Super Admin yang dapat mengelola pengguna.
              </p>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && !loading && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                  <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:sticky md:top-28 pb-4 md:pb-0 scrollbar-hide">
                    {[
                      {
                        id: "system",
                        label: "Sistem & Maintenance",
                        icon: Settings,
                      },
                      {
                        id: "payment",
                        label: "Payment Gateway",
                        icon: CreditCard,
                      },
                      {
                        id: "sponsors",
                        label: "Mitra & Sponsor",
                        icon: Trophy,
                      },
                      {
                        id: "pages",
                        label: "Halaman Statis (CMS)",
                        icon: FileText,
                      },
                      {
                        id: "footer",
                        label: "Footer & Copyright",
                        icon: Edit3,
                      },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeSettingsTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSettingsTab(tab.id as any)}
                          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all text-left ${
                            isActive
                              ? "bg-red-500 text-slate-900  shadow-lg shadow-red-500/20"
                              : "bg-white  border border-slate-200  text-slate-500   hover:text-slate-900  hover:border-red-500/50"
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
                  {activeSettingsTab === "system" && (
                    <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl animate-in fade-in">
                      <div className="px-6 py-5 border-b border-slate-200  flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900  uppercase tracking-wider">
                            Status Sistem
                          </h3>
                          <p className="text-xs text-slate-500">
                            Kelola ketersediaan platform publik
                          </p>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50  rounded-xl border border-slate-200 ">
                          <div>
                            <span className="text-sm font-bold text-slate-900  block mb-1">
                              Maintenance Mode
                            </span>
                            <span className="text-xs text-slate-500">
                              Saat aktif, pengunjung akan melihat halaman
                              pemeliharaan dan tidak dapat mendaftar.
                            </span>
                          </div>
                          <button
                            onClick={handleToggleMaintenance}
                            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                              settings.maintenanceMode
                                ? "bg-red-500"
                                : "bg-slate-300 "
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                settings.maintenanceMode
                                  ? "translate-x-7"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Gateway Config */}
                  {activeSettingsTab === "payment" && (
                    <div className="bg-white  backdrop-blur-xl border border-slate-200  rounded-2xl overflow-hidden shadow-xl animate-in fade-in">
                      <div className="px-6 py-5 border-b border-slate-200  flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900  uppercase tracking-wider">
                            Payment Gateway
                          </h3>
                          <p className="text-xs text-slate-500">
                            Konfigurasi integrasi Midtrans
                          </p>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="bg-red-50  border border-red-100  p-4 rounded-xl flex gap-3">
                          <Info className="w-5 h-5 text-red-500 shrink-0" />
                          <p className="text-xs text-red-800  leading-relaxed">
                            Masukkan **Server Key** dari dashboard Midtrans Anda
                            untuk mengaktifkan verifikasi pembayaran otomatis.
                            Kosongkan jika Anda ingin menggunakan sistem
                            pembayaran manual (Transfer Bank).
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                              Midtrans Environment
                            </label>
                            <select
                              id="midtrans-environment-select"
                              defaultValue={
                                settings.midtransEnvironment || "sandbox"
                              }
                              className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                            >
                              <option value="sandbox">Sandbox (Testing)</option>
                              <option value="production">
                                Production (Live)
                              </option>
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-200  rounded-xl bg-slate-50 ">
                              <h4 className="text-sm font-bold text-slate-900  mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                Sandbox Keys
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                    Server Key
                                  </label>
                                  <input
                                    type="password"
                                    id="midtrans-sandbox-server-key-input"
                                    defaultValue={
                                      settings.midtransSandboxServerKey || ""
                                    }
                                    className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                    placeholder="SB-Mid-server-..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                    Client Key
                                  </label>
                                  <input
                                    type="text"
                                    id="midtrans-sandbox-client-key-input"
                                    defaultValue={
                                      settings.midtransSandboxClientKey || ""
                                    }
                                    className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                    placeholder="SB-Mid-client-..."
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="p-4 border border-slate-200  rounded-xl bg-slate-50 ">
                              <h4 className="text-sm font-bold text-slate-900  mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Production Keys
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                    Server Key
                                  </label>
                                  <input
                                    type="password"
                                    id="midtrans-production-server-key-input"
                                    defaultValue={
                                      settings.midtransProductionServerKey || ""
                                    }
                                    className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                    placeholder="Mid-server-..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                    Client Key
                                  </label>
                                  <input
                                    type="text"
                                    id="midtrans-production-client-key-input"
                                    defaultValue={
                                      settings.midtransProductionClientKey || ""
                                    }
                                    className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                    placeholder="Mid-client-..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-200  pt-6 mt-6">
                          <h4 className="text-sm font-bold text-slate-900  mb-4">
                            Pengaturan Pembayaran Manual (Transfer)
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                Nama Bank
                              </label>
                              <input
                                type="text"
                                id="manual-bank-input"
                                defaultValue={settings.manualPaymentBank || ""}
                                className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                placeholder="Contoh: BCA / Mandiri / BNI"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                Nomor Rekening
                              </label>
                              <input
                                type="text"
                                id="manual-account-input"
                                defaultValue={
                                  settings.manualPaymentAccount || ""
                                }
                                className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                placeholder="Nomor rekening"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                Atas Nama
                              </label>
                              <input
                                type="text"
                                id="manual-name-input"
                                defaultValue={settings.manualPaymentName || ""}
                                className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                placeholder="Nama pemilik rekening"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700  uppercase tracking-wider mb-2">
                                Biaya Admin (Rp)
                              </label>
                              <input
                                type="number"
                                id="admin-fee-input"
                                defaultValue={settings.adminFee || 0}
                                className="w-full bg-white  border border-slate-200  rounded-xl p-3.5 text-sm text-slate-900  focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all shadow-sm"
                                placeholder="Biaya admin (contoh: 5000)"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                if (!user) return;
                                const envSelect = document.getElementById(
                                  "midtrans-environment-select",
                                ) as HTMLSelectElement;
                                const sbServerInput = document.getElementById(
                                  "midtrans-sandbox-server-key-input",
                                ) as HTMLInputElement;
                                const sbClientInput = document.getElementById(
                                  "midtrans-sandbox-client-key-input",
                                ) as HTMLInputElement;
                                const prodServerInput = document.getElementById(
                                  "midtrans-production-server-key-input",
                                ) as HTMLInputElement;
                                const prodClientInput = document.getElementById(
                                  "midtrans-production-client-key-input",
                                ) as HTMLInputElement;
                                const bankInput = document.getElementById(
                                  "manual-bank-input",
                                ) as HTMLInputElement;
                                const accountInput = document.getElementById(
                                  "manual-account-input",
                                ) as HTMLInputElement;
                                const nameInput = document.getElementById(
                                  "manual-name-input",
                                ) as HTMLInputElement;
                                const feeInput = document.getElementById(
                                  "admin-fee-input",
                                ) as HTMLInputElement;

                                if (
                                  !envSelect ||
                                  !sbServerInput ||
                                  !prodServerInput ||
                                  !bankInput ||
                                  !accountInput ||
                                  !nameInput ||
                                  !feeInput
                                )
                                  return;

                                try {
                                  setLoading(true);

                                  const env = envSelect.value as
                                    "sandbox" | "production";
                                  const activeServerKey =
                                    env === "production"
                                      ? prodServerInput.value
                                      : sbServerInput.value;
                                  const activeClientKey =
                                    env === "production"
                                      ? prodClientInput.value
                                      : sbClientInput.value;
                                  const isConfigured = !!activeServerKey;

                                  await updateSystemSettings({
                                    midtransEnvironment: env,
                                    midtransSandboxServerKey:
                                      sbServerInput.value,
                                    midtransSandboxClientKey:
                                      sbClientInput.value,
                                    midtransProductionServerKey:
                                      prodServerInput.value,
                                    midtransProductionClientKey:
                                      prodClientInput.value,
                                    midtransServerKey: activeServerKey,
                                    midtransClientKey: activeClientKey,
                                    paymentGatewayConfigured: isConfigured,
                                    paymentGatewayName: isConfigured
                                      ? "MIDTRANS"
                                      : "",
                                    manualPaymentBank: bankInput.value,
                                    manualPaymentAccount: accountInput.value,
                                    manualPaymentName: nameInput.value,
                                    adminFee: parseInt(feeInput.value) || 0,
                                  });
                                  await reloadSettings();
                                  addNotification(
                                    "success",
                                    "Tersimpan",
                                    "Pengaturan Pembayaran berhasil diperbarui.",
                                  );
                                } catch (e: any) {
                                  addNotification("error", "Gagal", e.message);
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 whitespace-nowrap"
                            >
                              Simpan Pengaturan
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Page Settings */}
                  {activeSettingsTab === "pages" && (
                    <PageSettings addNotification={addNotification} />
                  )}

                  {/* Footer Settings */}
                  {activeSettingsTab === "footer" && (
                    <FooterSettings addNotification={addNotification} />
                  )}

                  {/* Sponsor Settings */}
                  {activeSettingsTab === "sponsors" && (
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

      {selectedPayment && (
        <PaymentActionModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          mode={paymentModalMode}
          payment={selectedPayment}
          registration={registrations.find(
            (r) => r.id === selectedPayment.registrationId,
          )}
          participantName={
            registrations.find((r) => r.id === selectedPayment.registrationId)
              ? usersList.find(
                  (u) =>
                    u.uid ===
                    registrations.find(
                      (r) => r.id === selectedPayment.registrationId,
                    )?.userId,
                )?.displayName || "Peserta tidak dikenal"
              : "Peserta tidak dikenal"
          }
          onUpdate={async (paymentId, updates) => {
            if (!user) return;
            await updatePaymentAdmin(
              paymentId,
              updates,
              user.uid,
              user.email || "",
            );
            setPayments((prev) =>
              prev.map((p) => (p.id === paymentId ? { ...p, ...updates } : p)),
            );
            addNotification(
              "success",
              "Berhasil",
              "Pembayaran berhasil diperbarui.",
            );
          }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        isDanger={confirmState.isDanger}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
