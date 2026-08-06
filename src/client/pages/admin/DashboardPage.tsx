import React, { useState } from "react";
import { useQuery } from "wasp/client/operations";
import { logout, useAuth } from "wasp/client/auth";
import {
  getAppointments,
  getDashboardStats,
  getBarbers,
} from "wasp/client/operations";
import {
  updateAppointmentStatus,
  verifyPaymentStatus,
} from "wasp/client/operations";
import {
  Scissors,
  LogOut,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Users,
  DollarSign,
  Filter,
} from "lucide-react";

export function DashboardPage() {
  const { data: user } = useAuth();
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
  const { data: barbers } = useQuery(getBarbers);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
                Logged in as <span className="text-amber-400 font-semibold">{user?.displayName || user?.username}</span> ({user?.role})
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {actionError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

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

        {/* Filters & Controls */}
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

          {/* Appointments Table */}
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
      </main>
    </div>
  );
}

export default DashboardPage;
