import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import ForbiddenPage from "./pages/auth/ForbiddenPage";

import OwnerLayout from "./layouts/OwnerLayout";
import AdminLayout from "./layouts/AdminLayout";
import TenantLayout from "./layouts/TenantLayout";

import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import ReportsPage from "./pages/owner/ReportsPage";
import ActivityLogsPage from "./pages/owner/ActivityLogsPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

import TenantDashboardPage from "./pages/tenant/TenantDashboardPage";
import TenantPaymentsPage from "./pages/tenant/TenantPaymentsPage";
import TenantComplaintsPage from "./pages/tenant/TenantComplaintsPage";
import TenantProfilePage from "./pages/tenant/TenantProfilePage";

import RoomsPage from "./pages/shared/RoomsPage";
import TenantsPage from "./pages/shared/TenantsPage";
import RentalsPage from "./pages/shared/RentalsPage";
import BillsPage from "./pages/shared/BillsPage";
import PaymentsPage from "./pages/shared/PaymentsPage";
import ComplaintsPage from "./pages/shared/ComplaintsPage";

// App.jsx stays a pure router: every page lives in its own file under
// src/pages, grouped by role, per the required project structure.
export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        <Route element={<ProtectedRoute allowedRoles={["OWNER"]} />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<OwnerDashboardPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="rentals" element={<RentalsPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="activity-logs" element={<ActivityLogsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="rentals" element={<RentalsPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["TENANT"]} />}>
          <Route path="/tenant" element={<TenantLayout />}>
            <Route index element={<TenantDashboardPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="payments" element={<TenantPaymentsPage />} />
            <Route path="complaints" element={<TenantComplaintsPage />} />
            <Route path="profile" element={<TenantProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ToastProvider>
  );
}
