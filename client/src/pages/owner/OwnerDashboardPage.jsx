import { useEffect, useState } from "react";
import * as dashboardService from "../../services/dashboardService";
import * as reportService from "../../services/reportService";
import StatCard from "../../components/dashboard/StatCard";
import { RoomIcon, UsersIcon, MoneyIcon, AlertIcon, ChatIcon } from "../../components/dashboard/icons";
import RevenueChart from "../../components/dashboard/RevenueChart";
import OccupancyChart from "../../components/dashboard/OccupancyChart";
import PaymentStatusChart from "../../components/dashboard/PaymentStatusChart";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/format";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [dashRes, revRes, payRes] = await Promise.all([
        dashboardService.getOwnerDashboard(),
        reportService.getRevenueReport(6),
        reportService.getPaymentStatusReport(),
      ]);
      setStats(dashRes.data.data);
      setRevenue(revRes.data.data);
      setPaymentStatus(payRes.data.data);
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
        <p className="text-sm text-gray-500">
          Selamat datang kembali, {user?.name?.split(" ")[0]}. Berikut ringkasan kost kamu hari ini.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard
            label="Total Rooms"
            value={stats.total}
            sublabel={`${stats.occupied} terisi · ${stats.available} kosong`}
            icon={<RoomIcon />}
            progress={stats.occupancyRate}
            progressLabel={`${stats.occupancyRate}% occupancy rate`}
          />
          <StatCard
            variant="accent"
            label="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            sublabel="Pendapatan bulan berjalan"
            icon={<MoneyIcon />}
          />
          <StatCard
            variant="soft"
            label="Total Tenants"
            value={stats.totalTenants}
            sublabel="Penghuni aktif saat ini"
            icon={<UsersIcon />}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <OccupancyChart occupied={stats.occupied} available={stats.available} maintenance={stats.maintenance} />
        <div className="lg:col-span-2">
          <PaymentStatusChart data={paymentStatus} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <StatCard
          label="Outstanding Bills"
          value={stats.outstandingBills}
          sublabel="Belum lunas / menunggu verifikasi"
          icon={<AlertIcon />}
          iconTone="warm"
        />
        <StatCard
          label="Active Complaints"
          value={stats.activeComplaints}
          sublabel="Open + In Progress"
          icon={<ChatIcon />}
          iconTone="warm"
        />
      </div>
    </div>
  );
}
