import { useEffect, useState } from "react";
import * as dashboardService from "../../services/dashboardService";
import StatCard from "../../components/dashboard/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { formatDate } from "../../utils/format";

// Owner-only financial analytics are intentionally never fetched or shown
// here (spec section 14 - Admin dashboard must not expose revenue data).
export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await dashboardService.getAdminDashboard();
      setStats(res.data.data);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Day-to-day operations overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tenants" value={stats.totalTenants} accent="primary" />
        <StatCard label="Available Rooms" value={stats.availableRooms} accent="emerald" />
        <StatCard label="Pending Payment Verification" value={stats.pendingPayments} accent="amber" />
        <StatCard label="Active Complaints" value={stats.activeComplaints} accent="red" />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Recent Activity</h3>
        <ul className="divide-y divide-gray-100">
          {stats.recentActivity.length === 0 && <p className="text-sm text-gray-400">No recent activity.</p>}
          {stats.recentActivity.map((log) => (
            <li key={log.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium text-gray-700">{log.action.replace(/_/g, " ")}</p>
                <p className="text-xs text-gray-400">{log.details}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{log.user?.name || "System"}</p>
                <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
