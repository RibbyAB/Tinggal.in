import api from "./api";

export const getComplaints = (params) => api.get("/complaints", { params });
export const getComplaint = (id) => api.get(`/complaints/${id}`);

export const createComplaint = (formData) =>
  api.post("/complaints", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const updateComplaintStatus = (id, status, note) =>
  api.patch(`/complaints/${id}/status`, { status, note });
