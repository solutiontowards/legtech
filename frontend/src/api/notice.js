import api from "./axios";

// For Retailers
export const getActiveNotices = () => api.get("/notices");

// For Admins
export const getAllNotices = () => api.get("/notices/all");

export const createNotice = (payload) => api.post("/notices", payload);

export const updateNotice = (id, payload) => api.put(`/notices/${id}`, payload);

export const deleteNotice = (id) => api.delete(`/notices/${id}`);