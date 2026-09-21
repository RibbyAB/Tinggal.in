import { useEffect, useState } from "react";
import * as complaintService from "../../services/complaintService";
import DataTable from "../../components/tables/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/format";

export default function TenantComplaintsPage() {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "OTHER", priority: "MEDIUM" });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");

  const [detail, setDetail] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await complaintService.getComplaints({ limit: 20 });
      setComplaints(res.data.data.complaints);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({ title: "", description: "", category: "OTHER", priority: "MEDIUM" });
    setFile(null);
    setFormError("");
    setModalOpen(true);
  }

  async function openDetail(row) {
    try {
      const res = await complaintService.getComplaint(row.id);
      setDetail(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to open complaint detail.", "error");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("priority", form.priority);
    if (file) fd.append("image", file);

    try {
      await complaintService.createComplaint(fd);
      showToast("Complaint submitted successfully.");
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit complaint.");
    }
  }

  const columns = [
    { key: "title", header: "Title" },
    { key: "category", header: "Category" },
    { key: "priority", header: "Priority", render: (c) => <StatusBadge status={c.priority} /> },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "createdAt", header: "Submitted", render: (c) => formatDate(c.createdAt) },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <button onClick={() => openDetail(c)} className="text-primary-600 hover:underline">
          View
        </button>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Complaints</h1>
          <p className="text-sm text-gray-500">Report an issue and track its resolution status.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Submit Complaint
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <DataTable columns={columns} rows={complaints} loading={loading} emptyText="No complaints submitted yet." />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Complaint"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button form="complaint-form" type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Submit
            </button>
          </>
        }
      >
        <form id="complaint-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {["ELECTRICITY", "WATER", "FACILITY", "CLEANLINESS", "SECURITY", "OTHER"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Photo (optional)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0])} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title}>
        {detail && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">{detail.description}</p>
            <div className="flex gap-2">
              <StatusBadge status={detail.category} />
              <StatusBadge status={detail.priority} />
              <StatusBadge status={detail.status} />
            </div>
            {detail.updates?.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Handling History</p>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
