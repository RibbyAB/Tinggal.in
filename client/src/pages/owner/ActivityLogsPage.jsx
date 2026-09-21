import { useEffect, useState } from "react";
import * as activityLogService from "../../services/activityLogService";
import DataTable from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import ErrorState from "../../components/common/ErrorState";
import { formatDate } from "../../utils/format";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const res = await activityLogService.getActivityLogs({ page, limit: 15 });
      setLogs(res.data.data.logs);
      setMeta(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  const columns = [
    { key: "action", header: "Action", render: (l) => l.action.replace(/_/g, " ") },
    { key: "entity", header: "Entity", render: (l) => `${l.entity}${l.entityId ? ` #${l.entityId}` : ""}` },
    { key: "details", header: "Details" },
    { key: "user", header: "By", render: (l) => l.user?.name || "System" },
    { key: "createdAt", header: "When", render: (l) => formatDate(l.createdAt) },
  ];

  if (error) return <ErrorState message={error} onRetry={() => load(1)} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Activity Logs</h1>
        <p className="text-sm text-gray-500">Full audit trail of actions across the system.</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <DataTable columns={columns} rows={logs} loading={loading} emptyText="No activity yet." />
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
      </div>
    </div>
  );
}
