import api from "./axios";

export const getWalletBalance = () => api.get("/wallet/wallet-balance");
// Get services
export const getServices = () => api.get("/services");
