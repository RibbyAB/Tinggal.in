import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as dashboardService from "../../services/dashboardService";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate, MONTH_NAMES } from "../../utils/format";

export default function TenantDashboardPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500">Room {rental.room.roomNumber} · {rental.room.type}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Current Room</h3>
          <p className="text-sm text-gray-500">Room Number</p>
          <p className="mb-2 font-medium text-gray-900">{rental.room.roomNumber} (Floor {rental.room.floor})</p>
          <p className="text-sm text-gray-500">Monthly Price</p>
          <p className="font-medium text-gray-900">{formatCurrency(rental.monthlyPrice)}</p>
          <p className="mt-2 text-sm text-gray-500">Start Date</p>
          <p className="font-medium text-gray-900">{formatDate(rental.startDate)}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Current Bill</h3>
          {currentBill ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  {MONTH_NAMES[currentBill.billMonth - 1]} {currentBill.billYear}
                </p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(currentBill.amount)}</p>
                <p className="text-sm text-gray-500">Due {formatDate(currentBill.dueDate)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={currentBill.status} />
                {currentBill.status === "UNPAID" && (
                  <Link
                    to="/tenant/bills"
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                  >
                    Pay Now
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No bill generated yet for this rental.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Recent Payments</h3>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-400">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-600">{formatDate(p.paidAt)}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(p.amount)}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Complaint Status</h3>
          {complaints.length === 0 ? (
            <p className="text-sm text-gray-400">No complaints submitted.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {complaints.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-600">{c.title}</span>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
