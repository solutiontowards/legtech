import api from "./axios";

export const getWalletBalance = () => api.get("/wallet/wallet-balance");

// List all parent services
export const listServices = () => api.get("/services");

// Get details of a service, its sub-services, or its options
export const getServiceDetail = (serviceSlug, subServiceSlug) =>
  api.get(`/services/${serviceSlug}${subServiceSlug ? `/${subServiceSlug}` : ''}`);
