import api from "./api";

export const getRevenueReport = (months) => api.get("/reports/revenue", { params: { months } });
export const getOccupancyReport = () => api.get("/reports/occupancy");
export const getPaymentStatusReport = () => api.get("/reports/payments");
