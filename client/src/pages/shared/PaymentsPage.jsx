import { useEffect, useState } from "react";
import * as paymentService from "../../services/paymentService";
import DataTable from "../../components/tables/DataTable";
import FilterBar from "../../components/tables/FilterBar";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate } from "../../utils/format";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

export default function PaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "" });

  const [proofPayment, setProofPayment] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [approveTarget, setApproveTarget] = useState(null);

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const res = await paymentService.getPayments({ ...filters, page, limit: 8 });
      setPayments(res.data.data.payments);
      setMeta(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function handleApprove() {
    try {
      await paymentService.approvePayment(approveTarget.id);
      showToast("Payment approved successfully.");
      setApproveTarget(null);
      load(meta.page);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve payment.", "error");
      setApproveTarget(null);
    }
  }

  async function handleReject() {
    try {
      await paymentService.rejectPayment(rejectTarget.id, rejectNote);
      showToast("Payment rejected.");
      setRejectTarget(null);
      setRejectNote("");
      load(meta.page);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject payment.", "error");
      setRejectTarget(null);
    }
  }

  const columns = [
    { key: "tenant", header: "Tenant", render: (p) => p.bill.rental.tenant.user.name },
    { key: "room", header: "Room", render: (p) => p.bill.rental.room.roomNumber },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount) },
    { key: "method", header: "Method", render: (p) => p.method.replace("_", " ") },
    { key: "paidAt", header: "Paid At", render: (p) => formatDate(p.paidAt) },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <button onClick={() => setProofPayment(p)} className="text-primary-600 hover:underline">
            View Proof
          </button>
          {p.status === "PENDING" && (
            <>
              <button onClick={() => setApproveTarget(p)} className="text-emerald-600 hover:underline">
                Approve
              </button>
              <button onClick={() => setRejectTarget(p)} className="text-red-600 hover:underline">
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={() => load(1)} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">Review and verify tenant payment proofs.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <FilterBar
          values={filters}
          onFilterChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          filters={[
            {
              key: "status",
              label: "All Status",
              options: [
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ],
            },
          ]}
        />
        <DataTable columns={columns} rows={payments} loading={loading} emptyText="No payments found." />
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
      </div>

      <Modal open={!!proofPayment} onClose={() => setProofPayment(null)} title="Payment Proof">
        {proofPayment && (
          <img
            src={`${API_ORIGIN}${proofPayment.proofFilePath}`}
            alt="Payment proof"
            className="w-full rounded-lg border border-gray-100"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Payment"
        message="This will mark the payment as approved and the bill as paid. This cannot be undone."
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Payment"
        footer={
          <>
            <button onClick={() => setRejectTarget(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleReject} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Reject
            </button>
          </>
        }
      >
        <label className="mb-1 block text-sm font-medium text-gray-700">Reason (optional)</label>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          rows={3}
          placeholder="e.g. Proof image is unclear"
        />
      </Modal>
    </div>
  );
}
