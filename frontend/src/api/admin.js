import api from './axios';

export const getPendingRetailers =()=>api.get('/admin/pending-retailers');
export const verifyRetailer = (retailerId, verified) => api.post('/admin/verify-retailer', { retailerId, verified });
export const getRetailers = () => api.get('/admin/retailers');
export const getServiceById = (id) => api.get(`/admin/service/id/${id}`);
export const createService = (payload) => api.post('/admin/service', payload);
export const updateService = (id, payload) => api.put(`/admin/service/${id}`, payload);
export const getServiceBySlug = (slug) => api.get(`/admin/service/slug/${slug}`);
export const createSubService = (payload) => api.post('/admin/sub-service', payload);
export const updateSubService = (id, payload) => api.put(`/admin/sub-service/${id}`, payload);
export const createOption = (payload) => api.post('/admin/option', payload);
export const updateOption = (id, payload) => api.put(`/admin/option/${id}`, payload);
export const createFormField = (payload) => api.post('/admin/form-field', payload);
