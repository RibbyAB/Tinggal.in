import { useEffect, useState } from "react";
import * as reportService from "../../services/reportService";
import RevenueChart from "../../components/dashboard/RevenueChart";
import OccupancyChart from "../../components/dashboard/OccupancyChart";
import PaymentStatusChart from "../../components/dashboard/PaymentStatusChart";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";

export default function ReportsPage() {
  const [revenue, setRevenue] = useState([]);
  const [occupancy, setOccupancy] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [revRes, occRes, payRes] = await Promise.all([
        reportService.getRevenueReport(12),
        reportService.getOccupancyReport(),
        reportService.getPaymentStatusReport(),
      ]);
      setRevenue(revRes.data.data);
      setOccupancy(occRes.data.data);
      setPaymentStatus(payRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports.");
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
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Financial and operational analytics (Owner only).</p>
      </div>

      <RevenueChart data={revenue} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OccupancyChart occupied={occupancy.occupied} available={occupancy.available} maintenance={occupancy.maintenance} />
        <PaymentStatusChart data={paymentStatus} />
      </div>
    </div>
  );
}
