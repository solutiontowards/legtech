import express from 'express';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';
import * as submission from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', auth, submission.createSubmission);
router.post('/verify-payment', submission.verifyRazorpayPayment);
router.get('/me', auth, submission.listRetailerSubmissions);
router.get('/admin', auth, authorize('admin'), submission.adminListSubmissions);
router.put('/:submissionId/status', auth, authorize('admin'), submission.updateSubmissionStatus);

export default router;
