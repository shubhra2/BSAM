import React, { useState } from "react";
import { useQuery } from "wasp/client/operations";
import { logout, useAuth } from "wasp/client/auth";
import {
  getAppointments,
  getDashboardStats,
  getBarbers,
  getServices,
  getShopInfo,
} from "wasp/client/operations";
import {
  updateAppointmentStatus,
  verifyPaymentStatus,
  createService,
  updateService,
  createBarber,
  toggleBarberActive,
  updateShopSettings,
} from "wasp/client/operations";
import {
  Scissors,
  LogOut,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Users,
  DollarSign,
  Filter,
  Plus,
  Settings,
  Grid,
  MapPin,
  Phone,
  QrCode,
} from "lucide-react";

export function DashboardPage() {
  const { data: user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appointments" | "services" | "barbers" | "settings">("appointments");

  // Appointments Tab state
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionError, setActionError] = useState<string | null>(null);

  // Queries
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useQuery(getAppointments, {
    date: selectedDate || undefined,
    status: statusFilter,
  });

  const { data: stats, refetch: refetchStats } = useQuery(getDashboardStats);
  const { data: barbers, refetch: refetchBarbers } = useQuery(getBarbers);
  const { data: services, refetch: refetchServices } = useQuery(getServices);
  const { data: shopInfo, refetch: refetchShopInfo } = useQuery(getShopInfo);

  // Modals / Forms state
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("300");
  const [newServiceToken, setNewServiceToken] = useState("50");
  const [newServiceDuration, setNewServiceDuration] = useState("30");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  const [showAddBarber, setShowAddBarber] = useState(false);
  const [newBarberUsername, setNewBarberUsername] = useState("");
  const [newBarberPassword, setNewBarberPassword] = useState("");
  const [newBarberName, setNewBarberName] = useState("");
  const [newBarberPhone, setNewBarberPhone] = useState("");

  // Settings form state
  const [shopNameInput, setShopNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [openTimeInput, setOpenTimeInput] = useState("");
  const [closeTimeInput, setCloseTimeInput] = useState("");

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const handleStatusChange = async (
    appointmentId: number,
    newStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  ) => {
    setActionError(null);
    try {
      await updateAppointmentStatus({ id: appointmentId, status: newStatus });
      await Promise.all([refetchAppointments(), refetchStats()]);
    } catch (err: any) {
      setActionError(err.message || "Failed to update appointment status");
    }
  };

  const handleBarberAssign = async (
    appointmentId: number,
    currentStatus: any,
    barberIdStr: string
  ) => {
    setActionError(null);
    try {
      const barberId = barberIdStr ? parseInt(barberIdStr, 10) : null;
      await updateAppointmentStatus({
        id: appointmentId,
        status: currentStatus,
        assignedBarberId: barberId,
      });
      await refetchAppointments();
    } catch (err: any) {
      setActionError(err.message || "Failed to assign barber");
    }
  };

  const handlePaymentToggle = async (
    appointmentId: number,
    currentPaymentStatus: string
  ) => {
    setActionError(null);
    const newStatus =
      currentPaymentStatus === "VERIFIED" ? "UNPAID" : "VERIFIED";
    try {
      await verifyPaymentStatus({ id: appointmentId, paymentStatus: newStatus });
      await Promise.all([refetchAppointments(), refetchStats()]);
    } catch (err: any) {
      setActionError(err.message || "Failed to update payment status");
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createService({
        name: newServiceName,
        description: newServiceDesc,
        imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400",
        durationMinutes: parseInt(newServiceDuration, 10),
        price: Math.round(parseFloat(newServicePrice) * 100),
        tokenAmount: Math.round(parseFloat(newServiceToken) * 100),
      });
      setShowAddService(false);
      setNewServiceName("");
      setNewServiceDesc("");
      await refetchServices();
    } catch (err: any) {
      setActionError(err.message || "Failed to create service");
    }
  };

  const handleCreateBarber = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createBarber({
        username: newBarberUsername,
        password: newBarberPassword,
        displayName: newBarberName,
        phone: newBarberPhone,
      });
      setShowAddBarber(false);
      setNewBarberUsername("");
      setNewBarberPassword("");
      setNewBarberName("");
      setNewBarberPhone("");
      await refetchBarbers();
    } catch (err: any) {
      setActionError(err.message || "Failed to create barber account");
    }
  };

  const handleToggleBarber = async (id: number, currentActive: boolean) => {
    setActionError(null);
    try {
      await toggleBarberActive({ id, isActive: !currentActive });
      await refetchBarbers();
    } catch (err: any) {
      setActionError(err.message || "Failed to update barber status");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await updateShopSettings({
        shopName: shopNameInput || shopInfo?.shopName,
        address: addressInput || shopInfo?.address,
        phone: phoneInput || shopInfo?.phone,
        openTime: openTimeInput || shopInfo?.openTime,
        closeTime: closeTimeInput || shopInfo?.closeTime,
      });
      await refetchShopInfo();
    } catch (err: any) {
      setActionError(err.message || "Failed to save settings");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base">BSAM Dashboard</h1>
              <p className="text-[11px] text-slate-400">
                Logged in as{" "}
                <span className="text-amber-400 font-semibold">
                  {user?.displayName || user?.username}
                </span>{" "}
                ({user?.role})
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="px-3.5 py-1.5 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "appointments"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments</span>
          </button>

          {user?.role === "ADMIN" && (
            <>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "services"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Services</span>
              </button>

              <button
                onClick={() => setActiveTab("barbers")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "barbers"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Barbers</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "settings"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Shop Settings</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {actionError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* TAB 1: Appointments */}
        {activeTab === "appointments" && (
          <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400">Today's Appointments</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalToday ?? 0}</p>
                </div>
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400">Completed Today</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats?.completedToday ?? 0}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400">Pending Payments</p>
                  <p className="text-2xl font-bold text-amber-400">{stats?.pendingPayments ?? 0}</p>
                </div>
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-400">Completed Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {formatINR(stats?.totalRevenuePaise ?? 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filters & Appointments Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-500" />
                  <h2 className="font-bold text-white text-lg">Appointments List</h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {appointmentsLoading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-slate-800/40 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-3">Customer</th>
                        <th className="py-3 px-3">Service</th>
                        <th className="py-3 px-3">Date & Time</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Assigned Barber</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {appointments.map((app) => {
                        const isCompleted = app.status === "COMPLETED";
                        const isCancelled = app.status === "CANCELLED";

                        return (
                          <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="font-semibold text-white">{app.customerName}</div>
                              <div className="text-[11px] text-slate-400">{app.customerPhone}</div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="font-medium text-slate-200">{app.service?.name}</div>
                              <div className="text-[11px] font-semibold text-amber-400">
                                {app.service ? formatINR(app.service.price) : ""}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="text-white font-medium">
                                {new Date(app.date).toLocaleDateString("en-IN")}
                              </div>
                              <div className="text-[11px] text-emerald-400 font-semibold">
                                {app.startTime}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    app.paymentStatus === "VERIFIED"
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                  }`}
                                >
                                  {app.paymentStatus}
                                </span>

                                <button
                                  onClick={() => handlePaymentToggle(app.id, app.paymentStatus)}
                                  className="text-[11px] text-slate-400 hover:text-white underline"
                                >
                                  Toggle
                                </button>
                              </div>
                              {app.paymentProof && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Ref: {app.paymentProof}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-3">
                              {user?.role === "ADMIN" ? (
                                <select
                                  value={app.assignedBarberId || ""}
                                  onChange={(e) =>
                                    handleBarberAssign(app.id, app.status, e.target.value)
                                  }
                                  className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none"
                                >
                                  <option value="">-- Unassigned --</option>
                                  {barbers?.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.displayName || b.username}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-slate-300 font-medium">
                                  {app.assignedBarber?.displayName || "Unassigned"}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  isCompleted
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : isCancelled
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {app.status !== "CONFIRMED" && !isCompleted && !isCancelled && (
                                  <button
                                    onClick={() => handleStatusChange(app.id, "CONFIRMED")}
                                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg font-semibold text-[11px]"
                                  >
                                    Confirm
                                  </button>
                                )}

                                {!isCompleted && !isCancelled && (
                                  <button
                                    onClick={() => handleStatusChange(app.id, "COMPLETED")}
                                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold text-[11px]"
                                  >
                                    Complete
                                  </button>
                                )}

                                {!isCancelled && !isCompleted && (
                                  <button
                                    onClick={() => handleStatusChange(app.id, "CANCELLED")}
                                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg font-semibold text-[11px]"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  No appointments found for the selected criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Services Management */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Services Menu Management</h2>
                <p className="text-xs text-slate-400">Add or deactivate grooming treatments</p>
              </div>

              <button
                onClick={() => setShowAddService(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            {showAddService && (
              <form
                onSubmit={handleCreateService}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs"
              >
                <h3 className="font-bold text-white text-sm">Create New Service</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Service Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Beard Shaping"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Duration (Minutes)</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Full Price (₹)</label>
                    <input
                      type="number"
                      placeholder="300"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Token Deposit (₹)</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={newServiceToken}
                      onChange={(e) => setNewServiceToken(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400">Description</label>
                  <input
                    type="text"
                    placeholder="Short description of the service"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddService(false)}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                  >
                    Save Service
                  </button>
                </div>
              </form>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services?.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{svc.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{svc.description}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs rounded-full">
                      {formatINR(svc.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <span>Duration: {svc.durationMinutes}m</span>
                    <span>Token: {formatINR(svc.tokenAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Barbers Management */}
        {activeTab === "barbers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Barber Staff Accounts</h2>
                <p className="text-xs text-slate-400">Manage shop barbers and logins</p>
              </div>

              <button
                onClick={() => setShowAddBarber(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Barber Account</span>
              </button>
            </div>

            {showAddBarber && (
              <form
                onSubmit={handleCreateBarber}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs"
              >
                <h3 className="font-bold text-white text-sm">Add Barber Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Barber"
                      value={newBarberName}
                      onChange={(e) => setNewBarberName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 9876543211"
                      value={newBarberPhone}
                      onChange={(e) => setNewBarberPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Login Username</label>
                    <input
                      type="text"
                      placeholder="barber1"
                      value={newBarberUsername}
                      onChange={(e) => setNewBarberUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newBarberPassword}
                      onChange={(e) => setNewBarberPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBarber(false)}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers?.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">{b.displayName || b.username}</h4>
                    <p className="text-xs text-slate-400">Username: {b.username}</p>
                    <span className="inline-block px-2 py-0.5 bg-slate-950 text-amber-400 text-[10px] font-bold rounded-md">
                      Role: {b.role}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleBarber(b.id, b.isActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      b.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {b.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Shop Settings */}
        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-6 text-xs"
          >
            <div>
              <h2 className="text-xl font-bold text-white">Shop Settings & Configuration</h2>
              <p className="text-xs text-slate-400">Configure operating hours and shop profile</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Shop Name</label>
                <input
                  type="text"
                  defaultValue={shopInfo?.shopName || "Royal Cut Barber Shop"}
                  onChange={(e) => setShopNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Shop Address</label>
                <input
                  type="text"
                  defaultValue={shopInfo?.address || "123 Main St, HSR Layout, Bengaluru"}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Contact Phone Number</label>
                <input
                  type="text"
                  defaultValue={shopInfo?.phone || "+91 9876543210"}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Opening Time</label>
                  <input
                    type="time"
                    defaultValue={shopInfo?.openTime || "09:00"}
                    onChange={(e) => setOpenTimeInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Closing Time</label>
                  <input
                    type="time"
                    defaultValue={shopInfo?.closeTime || "20:00"}
                    onChange={(e) => setCloseTimeInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Save Shop Settings
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
