import api from "./axios";

export const getDashboardStats = () => api.get("/submissions/stats/dashboard");

export const getWalletBalance = () => api.get("/wallet/wallet-balance");

// List all parent services
export const listServices = () => api.get("/services");

// Get details of a service, its sub-services, or its options
export const getServiceDetail = (serviceSlug, subServiceSlug) =>
  api.get(`/services/${serviceSlug}${subServiceSlug ? `/${subServiceSlug}` : ''}`);

// Get details for a specific service option, including form fields
export const getServiceOptionDetail = (serviceSlug, subServiceSlug, optionSlug) =>
  api.get(`/services/${serviceSlug}/${subServiceSlug}/${optionSlug}`);

// Create a new service submission
export const createSubmission = (payload) => api.post('/submissions', payload);

// Get all submissions for the logged-in retailer
export const listRetailerSubmissions = () => api.get('/submissions/me');

// Get a single submission by ID for the logged-in retailer
export const getRetailerSubmissionById = (id) => api.get(`/submissions/${id}`); // This path is correct based on the new routes

// Re-upload documents for a submission
export const reUploadDocuments = (id, payload) => api.put(`/submissions/${id}/re-upload`, payload);

export const findDocument = (applicationNumber) =>
  api.get(`/retailer/find-document/${applicationNumber}`);
export const processDownloadPayment = (submissionId) =>
  api.post(`/retailer/download-payment/${submissionId}`);

// Raise a complaint for a submission
export const raiseComplaint = (submissionId, payload) => api.post(`/retailer/submissions/${submissionId}/complaint`, payload);


// retrySubmissionPayment
export const retrySubmissionPayment = (id, payload) => api.put(`/submissions/${id}/retry-payment`, payload);

// Get total service count
export const getServiceCount = () => api.get('/services/count');

// Get commission chart data
export const getCommissionChart = () => api.get('/services/commission-chart');

// getApplicationStatusStats
export const getApplicationStatusStats = () => api.get('/submissions/stats/application-status');

// Get Total Orders statistics
export const getTotalOrdersStats = () => api.get('/submissions/stats/total-orders');

// Get Weekly Orders statistics
export const getWeeklyOrdersStats = () => api.get('/submissions/stats/weekly-orders');

// Get Daily Orders statistics
export const getDailyOrdersStats = () => api.get('/submissions/stats/daily-orders');

// Get statistics for the main status cards
export const getStatusCardStats = () => api.get('/submissions/stats/status-cards');

// Get Profit and Revenue statistics
export const getMonthlyProfitStats = () => api.get('/submissions/stats/profit/monthly');
export const getWeeklyProfitStats = () => api.get('/submissions/stats/profit/weekly');
export const getDailyProfitStats = () => api.get('/submissions/stats/profit/daily');
export const getTotalRevenue = () => api.get('/submissions/stats/revenue');

// Get active global wishes for the dashboard
export const getActiveWishes = () => api.get('/wishes');
export const submitKyc = (payload) => api.post('/kyc', payload);
export const getMyKycDetails = () => api.get('/kyc');

// findDocumentByApplicationNumber
export const findDocumentByApplicationNumber = (applicationNumber) => api.get(`/retailer/find-document/${applicationNumber}`);