import api from './axios';

export const getPendingRetailers =()=>api.get('/admin/pending-retailers');
export const verifyRetailer = (retailerId, verified) => api.post('/admin/verify-retailer', { retailerId, verified });
