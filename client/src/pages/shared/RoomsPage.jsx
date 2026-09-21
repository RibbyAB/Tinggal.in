import { useEffect, useState } from "react";
import * as roomService from "../../services/roomService";
import DataTable from "../../components/tables/DataTable";
import FilterBar from "../../components/tables/FilterBar";
import Pagination from "../../components/tables/Pagination";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import ErrorState from "../../components/common/ErrorState";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/format";

const EMPTY_FORM = { roomNumber: "", floor: "", type: "STANDARD", price: "", capacity: 1, facilities: "", description: "" };

export default function RoomsPage() {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", type: "", floor: "" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  async function load(page = 1) {
    setLoading(true);
    setError("");
    try {
      const res = await roomService.getRooms({ search, ...filters, page, limit: 8 });
      setRooms(res.data.data.rooms);
      setMeta(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, [search, filters]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(room) {
    setEditingId(room.id);
    setForm({
      roomNumber: room.roomNumber,
      floor: room.floor,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      facilities: room.facilities || "",
      description: room.description || "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await roomService.updateRoom(editingId, form);
        showToast("Room updated successfully.");
      } else {
        await roomService.createRoom(form);
        showToast("Room created successfully.");
      }
      setModalOpen(false);
      load(meta.page);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save room.");
    }
  }

  async function handleStatusChange(room, status) {
    try {
      await roomService.updateRoomStatus(room.id, status);
      showToast("Room status updated.");
      load(meta.page);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status.", "error");
    }
  }

  const columns = [
    { key: "roomNumber", header: "Room" },
    { key: "floor", header: "Floor" },
    { key: "type", header: "Type" },
    { key: "price", header: "Price", render: (r) => formatCurrency(r.price) },
    { key: "capacity", header: "Capacity" },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(r)} className="text-primary-600 hover:underline">
            Edit
          </button>
          {r.status === "AVAILABLE" && (
            <button onClick={() => handleStatusChange(r, "MAINTENANCE")} className="text-amber-600 hover:underline">
              Maintenance
            </button>
          )}
          {r.status === "MAINTENANCE" && (
            <button onClick={() => handleStatusChange(r, "AVAILABLE")} className="text-primary-600 hover:underline">
              Set Available
            </button>
          )}
          {r.status === "OCCUPIED" && <span className="text-gray-400">Dihuni</span>}
        </div>
      ),
    },
  ];

  if (error) return <ErrorState message={error} onRetry={() => load(1)} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Rooms</h1>
          <p className="text-sm text-gray-500">Manage room inventory, pricing, and availability.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Add Room
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search room number..."
          values={filters}
          onFilterChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
          filters={[
            {
              key: "status",
              label: "All Status",
              options: [
                { value: "AVAILABLE", label: "Available" },
                { value: "OCCUPIED", label: "Occupied" },
                { value: "MAINTENANCE", label: "Maintenance" },
              ],
            },
            {
              key: "type",
              label: "All Types",
              options: [
                { value: "STANDARD", label: "Standard" },
                { value: "DELUXE", label: "Deluxe" },
                { value: "VIP", label: "VIP" },
              ],
            },
          ]}
        />
        <DataTable columns={columns} rows={rooms} loading={loading} emptyText="No rooms found." />
        <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Room" : "Add Room"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button form="room-form" type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Save
            </button>
          </>
        }
      >
        <form id="room-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Room Number</label>
            <input required value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Floor</label>
            <input required type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="STANDARD">Standard</option>
              <option value="DELUXE">Deluxe</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Price (Rp/month)</label>
            <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Capacity</label>
            <input required type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Facilities</label>
            <input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="AC, WiFi, Kamar Mandi Dalam" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={2} />
          </div>
          {formError && <p className="col-span-2 text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}