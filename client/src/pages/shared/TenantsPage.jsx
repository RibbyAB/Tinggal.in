import { useEffect, useState } from "react";
import * as tenantService from "../../services/tenantService";
import DataTable from "../../components/tables/DataTable";
import FilterBar from "../../components/tables/FilterBar";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", ktpNumber: "", emergencyContact: "", address: "" };

export default function TenantsPage() {
  const { showToast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ rentalStatus: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const res = await tenantService.getTenants({ search, ...filters, page, limit: 8 });
      setTenants(res.data.data.tenants);
      setMeta(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tenants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, [search, filters]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    try {
      await tenantService.createTenant(form);
      showToast("Tenant account created successfully.");
      setModalOpen(false);
      load(1);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create tenant.");
    }
  }

  const columns = [
    { key: "name", header: "Name", render: (t) => t.user.name },
    { key: "email", header: "Email", render: (t) => t.user.email },
    { key: "phone", header: "Phone", render: (t) => t.user.phone || "-" },
    {
      key: "room",
      header: "Current Room",
      render: (t) => (t.rentals?.[0] ? t.rentals[0].room.roomNumber : "-"),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => (t.rentals?.[0] ? <StatusBadge status="ACTIVE" /> : <StatusBadge status="COMPLETED" />),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={() => load(1)} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500">Owner/Admin-controlled tenant account creation.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Add Tenant
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, phone..."
          values={filters}
          onFilterChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          filters={[
            {
              key: "rentalStatus",
              label: "All Rental Status",
              options: [
                { value: "ACTIVE", label: "Active" },
                { value: "COMPLETED", label: "Completed" },
              ],
            },
          ]}
        />
        <DataTable columns={columns} rows={tenants} loading={loading} emptyText="No tenants found." />
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Tenant"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button form="tenant-form" type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Create
            </button>
          </>
        }
      >
        <form id="tenant-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Initial Password</label>
            <input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">KTP Number</label>
            <input value={form.ktpNumber} onChange={(e) => setForm({ ...form, ktpNumber: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Emergency Contact</label>
            <input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={2} />
          </div>
          {formError && <p className="col-span-2 text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}
