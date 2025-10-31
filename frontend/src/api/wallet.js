import api from "./axios";

export const getWalletBalance = () => api.get("/wallet/wallet-balance");
