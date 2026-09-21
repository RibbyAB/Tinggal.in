import api from "./api";

export const getOwnerDashboard = () => api.get("/dashboard/owner");
export const getAdminDashboard = () => api.get("/dashboard/admin");
export const getTenantDashboard = () => api.get("/dashboard/tenant");
