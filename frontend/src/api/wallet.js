import api from "./axios";

export const getWalletBalance = () => api.get("/wallet/wallet-balance");
export const getTransactions = () => api.get("/wallet/transactions");
export const getRecentTransactions = () => api.get("/wallet/recent-transactions");
export const createPaymentOrderForWallet = (payload) => api.post("/wallet/create-order", payload);
export const checkOrderStatus = (payload) => api.post("/wallet/check-order-status", payload);

