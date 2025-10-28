import api from './axios';

export const listServices = () => api.get('/services');
export const getServiceDetail = (serviceSlug, subServiceSlug) =>
  api.get(`/services/${serviceSlug}${subServiceSlug ? '/' + subServiceSlug : ''}`);
