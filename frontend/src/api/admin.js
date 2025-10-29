import api from './axios';

export const getPendingRetailers =()=>api.get('/admin/pending-retailers');
export const verifyRetailer = (retailerId, verified) => api.post('/admin/verify-retailer', { retailerId, verified });
export const getRetailers = () => api.get('/admin/retailers');
export const getAdmins = () => api.get('/admin/admins');
export const updateUser = (payload) => api.put('/admin/user', payload);
export const getServiceById = (id) => api.get(`/admin/service/id/${id}`);
export const createService = (payload) => api.post('/admin/service', payload);
export const updateService = (id, payload) => api.put(`/admin/service/${id}`, payload);
export const getServiceBySlug = (slug) => api.get(`/admin/service/slug/${slug}`);
export const createSubService = (payload) => api.post('/admin/sub-service', payload);
export const updateSubService = (id, payload) => api.put(`/admin/sub-service/${id}`, payload);
export const getSubServiceBySlug = (serviceSlug, subServiceSlug) => api.get(`/admin/sub-service/slug/${serviceSlug}/${subServiceSlug}`);
export const getOptionBySlug = (serviceSlug, subServiceSlug, optionSlug) => api.get(`/admin/option/slug/${serviceSlug}/${subServiceSlug}/${optionSlug}`);
export const createOption = (payload) => api.post('/admin/option', payload);
export const updateOption = (id, payload) => api.put(`/admin/option/${id}`, payload);
export const createFormField = (payload) => api.post('/admin/form-field', payload);
export const getServiceCount = () => api.get('/admin/service-count');
export const getPendingRetailerCount = () => api.get('/admin/pending-retailer-count');
export const getRetailerCount = () => api.get('/admin/retailer-count');

export const createUser = (payload) => api.post('/admin/user', payload);

// Submission Management
export const adminListSubmissions = () => api.get('/admin/submissions');
export const getSubmissionById = (id) => api.get(`/admin/submission/${id}`);
export const updateSubmissionStatus = (id, payload) => api.put(`/admin/submission/${id}/status`, payload);
