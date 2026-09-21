import { useEffect, useState } from "react";
import * as dashboardService from "../../services/dashboardService";
import StatCard from "../../components/dashboard/StatCard";
import Panel from "../../components/dashboard/Panel";
import { RoomIcon, UsersIcon, ReceiptIcon, ChatIcon } from "../../components/dashboard/icons";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/format";

export default function AdminDashboardPage() {
  const { user } = useAuth();
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500">Halo, {user?.name?.split(" ")[0]}. Ini tugas operasional hari ini.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard variant="accent" label="Pending Verification" value={stats.pendingPayments} sublabel="Menunggu persetujuan Owner" icon={<ReceiptIcon />} />
        <StatCard variant="soft" label="Total Tenants" value={stats.totalTenants} sublabel="Penghuni aktif" icon={<UsersIcon />} />
        <StatCard label="Available Rooms" value={stats.availableRooms} sublabel="Siap disewakan" icon={<RoomIcon />} />
        <StatCard label="Active Complaints" value={stats.activeComplaints} sublabel="Open + In Progress" icon={<ChatIcon />} iconTone="warm" />
      </div>

      <Panel title="Recent Activity" subtitle="Aktivitas terbaru pada sistem">
        {stats.recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {stats.recentActivity.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <ReceiptIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">{log.action.replace(/_/g, " ")}</p>
                    <p className="truncate text-xs text-gray-400">{log.details}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-gray-600">{log.user?.name || "System"}</p>
                  <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
