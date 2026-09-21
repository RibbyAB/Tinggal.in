import { useEffect, useState } from "react";
import * as billService from "../../services/billService";
import * as rentalService from "../../services/rentalService";
import DataTable from "../../components/tables/DataTable";
import FilterBar from "../../components/tables/FilterBar";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate, MONTH_NAMES } from "../../utils/format";

export default function BillsPage() {
  const { showToast } = useToast();
  const [bills, setBills] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", month: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeRentals, setActiveRentals] = useState([]);
  const [form, setForm] = useState({ rentalId: "", billMonth: "", billYear: new Date().getFullYear(), dueDate: "" });
  const [formError, setFormError] = useState("");

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const res = await billService.getBills({ ...filters, page, limit: 8 });
      setBills(res.data.data.bills);
      setMeta(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bills.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, [filters]);

  async function openCreate() {
    setForm({ rentalId: "", billMonth: String(new Date().getMonth() + 1), billYear: new Date().getFullYear(), dueDate: "" });
    setFormError("");
    try {
      const res = await rentalService.getRentals({ status: "ACTIVE", limit: 100 });
      setActiveRentals(res.data.data.rentals);
      setModalOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load active rentals.", "error");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    try {
      await billService.generateBill(form);
      showToast("Bill generated successfully.");
      setModalOpen(false);
      load(1);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to generate bill.");
    }
  }

  const columns = [
    { key: "tenant", header: "Tenant", render: (b) => b.rental.tenant.user.name },
    { key: "room", header: "Room", render: (b) => b.rental.room.roomNumber },
    { key: "period", header: "Period", render: (b) => `${MONTH_NAMES[b.billMonth - 1]} ${b.billYear}` },
    { key: "amount", header: "Amount", render: (b) => formatCurrency(b.amount) },
    { key: "dueDate", header: "Due Date", render: (b) => formatDate(b.dueDate) },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
  ];

  const isTenantView = window.location.pathname.startsWith("/tenant");

  if (error) return <ErrorState message={error} onRetry={() => load(1)} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{isTenantView ? "My Bills" : "Bills"}</h1>
          <p className="text-sm text-gray-500">
            {isTenantView ? "View your monthly bills and payment status." : "Generate and track monthly bills."}
          </p>
        </div>
        {!isTenantView && (
          <button onClick={openCreate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            + Generate Bill
          </button>
        )}
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
                { value: "UNPAID", label: "Unpaid" },
                { value: "PENDING_VERIFICATION", label: "Pending Verification" },
                { value: "PAID", label: "Paid" },
                { value: "OVERDUE", label: "Overdue" },
              ],
            },
            {
              key: "month",
              label: "All Months",
              options: MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m })),
            },
          ]}
        />
        <DataTable columns={columns} rows={bills} loading={loading} emptyText="No bills found." />
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate Bill"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button form="bill-form" type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Generate
            </button>
          </>
        }
      >
        <form id="bill-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rental (Active)</label>
            <select required value={form.rentalId} onChange={(e) => setForm({ ...form, rentalId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select rental</option>
              {activeRentals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.tenant.user.name} - Room {r.room.roomNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Month</label>
              <select required value={form.billMonth} onChange={(e) => setForm({ ...form, billMonth: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
              <input required type="number" value={form.billYear} onChange={(e) => setForm({ ...form, billYear: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
            <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}
