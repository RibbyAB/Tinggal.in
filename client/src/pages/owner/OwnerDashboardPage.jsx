import { useEffect, useState } from "react";
import * as dashboardService from "../../services/dashboardService";
import * as reportService from "../../services/reportService";
import StatCard from "../../components/dashboard/StatCard";
import RevenueChart from "../../components/dashboard/RevenueChart";
import OccupancyChart from "../../components/dashboard/OccupancyChart";
import PaymentStatusChart from "../../components/dashboard/PaymentStatusChart";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import { formatCurrency } from "../../utils/format";

export default function OwnerDashboardPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Owner Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of the entire kost operation.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Rooms" value={stats.total} accent="primary" />
        <StatCard label="Occupied Rooms" value={stats.occupied} accent="primary" />
        <StatCard label="Available Rooms" value={stats.available} accent="emerald" />
        <StatCard label="Occupancy Rate" value={`${stats.occupancyRate}%`} accent="primary" />
        <StatCard label="Total Tenants" value={stats.totalTenants} accent="primary" />
        <StatCard label="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} accent="emerald" />
        <StatCard label="Outstanding Bills" value={stats.outstandingBills} accent="amber" />
        <StatCard label="Active Complaints" value={stats.activeComplaints} accent="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>
        <OccupancyChart occupied={stats.occupied} available={stats.available} maintenance={stats.maintenance} />
      </div>

      <PaymentStatusChart data={paymentStatus} />
    </div>
  );
}
