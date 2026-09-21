import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/rooms", label: "Rooms" },
  { to: "/admin/tenants", label: "Tenants" },
  { to: "/admin/rentals", label: "Rentals" },
  { to: "/admin/bills", label: "Bills" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/complaints", label: "Complaints" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-bg flex min-h-screen">
      <Sidebar title="Admin" links={links} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
