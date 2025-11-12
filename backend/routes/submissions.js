import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';
import * as submission from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', auth, submission.createSubmission);
router.put('/:submissionId/retry-payment', auth, submission.retrySubmissionPayment);
router.get('/me', auth, submission.listRetailerSubmissions);
router.get('/:submissionId', auth, submission.getRetailerSubmissionById);
router.put('/:submissionId/re-upload', auth, submission.reUploadDocuments);
router.get('/admin', auth, authorize('admin'), submission.adminListSubmissions);
router.put('/:submissionId/status', auth, authorize('admin'), submission.updateSubmissionStatus);
router.get('/stats/dashboard', auth, submission.getRetailerDashboardStats);
router.get('/stats/application-status', auth, submission.getApplicationStatusStats);
router.get('/stats/total-orders', auth, submission.getTotalOrdersStats);
router.get('/stats/weekly-orders', auth, submission.getWeeklyOrdersStats);
router.get('/stats/daily-orders', auth, submission.getDailyOrdersStats);
router.get('/stats/status-cards', auth, submission.getStatusCardStats);

// Profit and Revenue Stats
router.get('/stats/profit/monthly', auth, submission.getMonthlyProfitStats);
router.get('/stats/profit/weekly', auth, submission.getWeeklyProfitStats);
router.get('/stats/profit/daily', auth, submission.getDailyProfitStats);
router.get('/stats/revenue', auth, submission.getTotalRevenue);

export default router;
