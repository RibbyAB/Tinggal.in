import api from "./api";

export const getRentals = (params) => api.get("/rentals", { params });
export const createRental = (data) => api.post("/rentals", data);
export const checkoutRental = (id) => api.post(`/rentals/${id}/checkout`);
