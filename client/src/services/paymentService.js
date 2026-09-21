import api from "./api";

export const getPayments = (params) => api.get("/payments", { params });

export const createPayment = (formData) =>
  api.post("/payments", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const approvePayment = (id) => api.patch(`/payments/${id}/approve`);
export const rejectPayment = (id, note) => api.patch(`/payments/${id}/reject`, { note });
