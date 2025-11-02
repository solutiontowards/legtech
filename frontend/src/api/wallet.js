import api from "./axios";

export const getWalletBalance = () => api.get("/wallet/wallet-balance");
export const getTransactions = () => api.get("/wallet/transactions");

