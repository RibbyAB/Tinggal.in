import { useEffect, useState } from "react";
import * as complaintService from "../../services/complaintService";
import DataTable from "../../components/tables/DataTable";
import FilterBar from "../../components/tables/FilterBar";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/format";

const STATUS_FLOW = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function ComplaintsPage() {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "", category: "" });

  const [detail, setDetail] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const res = await complaintService.getComplaints({ ...filters, page, limit: 8 });
      setComplaints(res.data.data.complaints);
      setMeta(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function openDetail(row) {
    const res = await complaintService.getComplaint(row.id);
    setDetail(res.data.data);
    setNewStatus(row.status);
    setNote("");
  }

  async function handleUpdateStatus(e) {
    e.preventDefault();
    try {
      await complaintService.updateComplaintStatus(detail.id, newStatus, note);
      showToast("Complaint status updated.");
      setDetail(null);
      load(meta.page);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status.", "error");
    }
  }

  const columns = [
    { key: "title", header: "Title" },
    { key: "tenant", header: "Tenant", render: (c) => c.tenant.user.name },
    { key: "category", header: "Category" },
    { key: "priority", header: "Priority", render: (c) => <StatusBadge status={c.priority} /> },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "createdAt", header: "Submitted", render: (c) => formatDate(c.createdAt) },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <button onClick={() => openDetail(c)} className="text-primary-600 hover:underline">
          View / Manage
        </button>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={() => load(1)} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Complaints</h1>
        <p className="text-sm text-gray-500">Track and resolve tenant complaints.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <FilterBar
          values={filters}
          onFilterChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          filters={[
            {
              key: "status",
              label: "All Status",
              options: STATUS_FLOW.map((s) => ({ value: s, label: s.replace("_", " ") })),
            },
            {
              key: "priority",
              label: "All Priority",
              options: [
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
              ],
            },
            {
              key: "category",
              label: "All Category",
              options: ["ELECTRICITY", "WATER", "FACILITY", "CLEANLINESS", "SECURITY", "OTHER"].map((c) => ({
                value: c,
                label: c,
              })),
            },
          ]}
        />
        <DataTable columns={columns} rows={complaints} loading={loading} emptyText="No complaints found." />
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title}>
        {detail && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tenant</p>
              <p className="text-sm font-medium text-gray-900">{detail.tenant.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm text-gray-700">{detail.description}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={detail.category} />
              <StatusBadge status={detail.priority} />
              <StatusBadge status={detail.status} />
            </div>

            {detail.updates?.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">History</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {detail.updates.map((u) => (
                    <li key={u.id} className="rounded-lg bg-gray-50 px-3 py-2">
                      <span className="font-medium">{u.status.replace("_", " ")}</span> by {u.updatedBy.name}
                      {u.note && ` - "${u.note}"`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-3 border-t border-gray-100 pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Update Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Save Update
              </button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
