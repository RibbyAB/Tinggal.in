import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Frontend route protection: user-experience only. The REAL security
// boundary is enforced by the backend's authenticateToken/authorizeRoles
// middleware (spec section 5/6) - this just avoids flashing pages the
// user isn't allowed to see and redirects appropriately.
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
