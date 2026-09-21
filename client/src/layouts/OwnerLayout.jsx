import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

const links = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/rooms", label: "Rooms" },
  { to: "/owner/tenants", label: "Tenants" },
  { to: "/owner/rentals", label: "Rentals" },
  { to: "/owner/bills", label: "Bills" },
  { to: "/owner/payments", label: "Payments" },
  { to: "/owner/complaints", label: "Complaints" },
  { to: "/owner/reports", label: "Reports" },
  { to: "/owner/activity-logs", label: "Activity Logs" },
];

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar title="Owner" links={links} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
