import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as dashboardService from "../../services/dashboardService";
import StatCard from "../../components/dashboard/StatCard";
import Panel from "../../components/dashboard/Panel";
import { RoomIcon, MoneyIcon, CalendarIcon, ChatIcon } from "../../components/dashboard/icons";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDate, MONTH_NAMES } from "../../utils/format";

export default function TenantDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await dashboardService.getTenantDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { rental, currentBill, recentPayments, complaints } = data;

  if (!rental) {
    return <EmptyState title="No active rental" description="You currently do not have an active room rental." />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500">
          Halo, {user?.name?.split(" ")[0]}. Berikut ringkasan kamar dan tagihan kamu.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-primary-700 bg-gradient-to-br from-primary-600 to-primary-800 p-6 shadow-sm shadow-primary-900/10 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white/70">Current Bill</p>
              {currentBill ? (
                <>
                  <p className="mt-1 text-xs text-white/60">
                    {MONTH_NAMES[currentBill.billMonth - 1]} {currentBill.billYear}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    {formatCurrency(currentBill.amount)}
                  </p>
                  <p className="mt-1 text-sm text-white/70">Jatuh tempo {formatDate(currentBill.dueDate)}</p>
                </>
              ) : (
                <p className="mt-3 text-sm text-white/70">Belum ada tagihan untuk sewa ini.</p>
              )}
            </div>

            {currentBill && (
              <div className="flex flex-col items-end gap-3">
                <StatusBadge status={currentBill.status} />
                {currentBill.status === "UNPAID" && (
                  <Link
                    to="/tenant/payments"
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                  >
                    Pay Now
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard
            label="Room"
            value={rental.room.roomNumber}
            sublabel={`${rental.room.type} · Lantai ${rental.room.floor}`}
            icon={<RoomIcon />}
          />
          <StatCard
            variant="soft"
            label="Monthly Price"
            value={formatCurrency(rental.monthlyPrice)}
            sublabel="Harga sewa per bulan"
            icon={<MoneyIcon />}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <StatCard
          label="Tenant Since"
          value={formatDate(rental.startDate)}
          sublabel="Tanggal mulai sewa"
          icon={<CalendarIcon />}
        />

        <Panel title="Recent Payments" subtitle="Riwayat pembayaran terakhir">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-400">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-gray-600">{formatDate(p.paidAt)}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Complaint Status"
          subtitle="Keluhan yang kamu ajukan"
          action={
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <ChatIcon />
            </div>
          }
        >
          {complaints.length === 0 ? (
            <p className="text-sm text-gray-400">No complaints submitted.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {complaints.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="truncate text-gray-600">{c.title}</span>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
