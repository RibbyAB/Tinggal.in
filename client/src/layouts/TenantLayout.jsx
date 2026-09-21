import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

const links = [
  { to: "/tenant", label: "Dashboard", end: true },
  { to: "/tenant/bills", label: "My Bills" },
  { to: "/tenant/payments", label: "Payment History" },
  { to: "/tenant/complaints", label: "Complaints" },
  { to: "/tenant/profile", label: "Profile" },
];

export default function TenantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-bg flex min-h-screen">
      <Sidebar title="Tenant" links={links} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
