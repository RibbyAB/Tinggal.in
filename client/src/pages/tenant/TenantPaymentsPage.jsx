import { useEffect, useState } from "react";
import * as paymentService from "../../services/paymentService";
import * as billService from "../../services/billService";
import DataTable from "../../components/tables/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate, MONTH_NAMES } from "../../utils/format";

export default function TenantPaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [form, setForm] = useState({ billId: "", amount: "", method: "BANK_TRANSFER" });
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");

  const [receipt, setReceipt] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await paymentService.getPayments({ limit: 20 });
      setPayments(res.data.data.payments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openUpload() {
    setFormError("");
    setFile(null);
    const res = await billService.getBills({ status: "UNPAID", limit: 20 });
    setUnpaidBills(res.data.data.bills);
    setForm({ billId: "", amount: "", method: "BANK_TRANSFER" });
    setUploadOpen(true);
  }

  function handleBillChange(billId) {
    const bill = unpaidBills.find((b) => String(b.id) === billId);
    setForm({ ...form, billId, amount: bill ? bill.amount : "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!file) {
      setFormError("Please attach a payment proof image (JPEG, PNG, or WEBP).");
      return;
    }
    const fd = new FormData();
    fd.append("billId", form.billId);
    fd.append("amount", form.amount);
    fd.append("method", form.method);
    fd.append("proof", file);

    try {
      await paymentService.createPayment(fd);
      showToast("Payment proof submitted for verification.");
      setUploadOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit payment.");
    }
  }

  const columns = [
    { key: "paidAt", header: "Date", render: (p) => formatDate(p.paidAt) },
    { key: "amount", header: "Amount", render: (p) => formatCurrency(p.amount) },
    { key: "method", header: "Method", render: (p) => p.method.replace("_", " ") },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      header: "Receipt",
      render: (p) =>
        p.status === "APPROVED" ? (
          <button onClick={() => setReceipt(p)} className="text-primary-600 hover:underline">
            View / Print
          </button>
        ) : (
          "-"
        ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500">Upload proof for unpaid bills and track verification status.</p>
        </div>
        <button onClick={openUpload} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Upload Payment
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <DataTable columns={columns} rows={payments} loading={loading} emptyText="No payments yet." />
      </div>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Payment Proof"
        footer={
          <>
            <button onClick={() => setUploadOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button form="payment-form" type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Submit
            </button>
          </>
        }
      >
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bill</label>
            <select required value={form.billId} onChange={(e) => handleBillChange(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select an unpaid bill</option>
              {unpaidBills.map((b) => (
                <option key={b.id} value={b.id}>
                  {MONTH_NAMES[b.billMonth - 1]} {b.billYear} - {formatCurrency(b.amount)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Amount</label>
            <input required type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Payment Method</label>
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="E_WALLET">E-Wallet</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Proof of Payment (JPEG/PNG/WEBP, max 5MB)</label>
            <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0])} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Payment Receipt">
        {receipt && (
          <div id="receipt-print" className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Receipt #</span> {receipt.id}
            </p>
            <p>
              <span className="text-gray-500">Amount</span> {formatCurrency(receipt.amount)}
            </p>
            <p>
              <span className="text-gray-500">Method</span> {receipt.method.replace("_", " ")}
            </p>
            <p>
              <span className="text-gray-500">Verified At</span> {formatDate(receipt.verifiedAt)}
            </p>
            <p>
              <span className="text-gray-500">Status</span> <StatusBadge status={receipt.status} />
            </p>
            <button onClick={() => window.print()} className="mt-3 w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Print Receipt
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
