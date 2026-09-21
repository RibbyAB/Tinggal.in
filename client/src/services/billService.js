import api from "./api";

export const getBills = (params) => api.get("/bills", { params });
export const getBill = (id) => api.get(`/bills/${id}`);
export const generateBill = (data) => api.post("/bills/generate", data);
