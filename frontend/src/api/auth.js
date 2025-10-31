import api from "./axios";

// Logout 
export const logout = () => api.post("/auth/logout");