import { useEffect, useState } from "react";
import * as rentalService from "../../services/rentalService";
import * as tenantService from "../../services/tenantService";
import * as roomService from "../../services/roomService";
import DataTable from "../../components/tables/DataTable";
import FilterBar from "../../components/tables/FilterBar";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate } from "../../utils/format";

export default function RentalsPage() {
  const { showToast } = useToast();
  const [rentals, setRentals] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [form, setForm] = useState({ tenantId: "", roomId: "", startDate: "", notes: "" });
  const [formError, setFormError] = useState("");

  const [checkoutTarget, setCheckoutTarget] = useState(null);

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const res = await rentalService.getRentals({ ...filters, page, limit: 8 });
      setRentals(res.data.data.rentals);
      setMeta(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rentals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, [filters]);

  async function openCreate() {
    setForm({ tenantId: "", roomId: "", startDate: new Date().toISOString().slice(0, 10), notes: "" });
    setFormError("");
    try {
      const [tenantsRes, roomsRes] = await Promise.all([
        tenantService.getTenants({ limit: 100 }),
        roomService.getRooms({ status: "AVAILABLE", limit: 100 }),
      ]);
      setAvailableTenants(tenantsRes.data.data.tenants);
      setAvailableRooms(roomsRes.data.data.rooms);
      setModalOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load form data.", "error");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    try {
      await rentalService.createRental(form);
      showToast("Tenant checked in successfully.");
      setModalOpen(false);
      load(1);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create rental.");
    }
  }

  async function handleCheckout() {
    try {
      await rentalService.checkoutRental(checkoutTarget.id);
      showToast("Tenant checked out successfully.");
      setCheckoutTarget(null);
      load(meta.page);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to check out.", "error");
      setCheckoutTarget(null);
    }
  }

  const columns = [
    { key: "tenant", header: "Tenant", render: (r) => r.tenant.user.name },
    { key: "room", header: "Room", render: (r) => r.room.roomNumber },
    { key: "price", header: "Monthly Price", render: (r) => formatCurrency(r.monthlyPrice) },
    { key: "startDate", header: "Start Date", render: (r) => formatDate(r.startDate) },
    { key: "endDate", header: "End Date", render: (r) => formatDate(r.endDate) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) =>
        r.status === "ACTIVE" ? (
          <button onClick={() => setCheckoutTarget(r)} className="text-red-600 hover:underline">
            Check Out
          </button>
        ) : (
          "-"
        ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={() => load(1)} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Rentals</h1>
          <p className="text-sm text-gray-500">Check tenants in and out of rooms.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + New Check-In
        </button>
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
                { value: "ACTIVE", label: "Active" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ],
            },
          ]}
        />
        <DataTable columns={columns} rows={rentals} loading={loading} emptyText="No rentals found." />
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Check-In"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button form="rental-form" type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Check In
            </button>
          </>
        }
      >
        <form id="rental-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tenant</label>
            <select required value={form.tenantId} onChange={(e) => setForm({ ...form, tenantId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select tenant</option>
              {availableTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name} ({t.user.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Room</label>
            <select required value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Select available room</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} - {r.type} - {formatCurrency(r.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
            <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={2} />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!checkoutTarget}
        title="Check Out Tenant"
        message={checkoutTarget ? `Check out ${checkoutTarget.tenant.user.name} from room ${checkoutTarget.room.roomNumber}?` : ""}
        onConfirm={handleCheckout}
        onCancel={() => setCheckoutTarget(null)}
        danger
      />
    </div>
  );
}
