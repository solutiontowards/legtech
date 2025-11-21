import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  findDocumentByApplicationNumber,
  processDocumentDownloadPayment,
  raiseComplaint,
} from '../controllers/submissionController.js';

const router = express.Router();

// @route   GET /api/retailer/find-document/:applicationNumber
// @desc    Find a submission's final document by application number for the logged-in retailer
// @access  Private (Retailer)
router.get('/find-document/:applicationNumber', auth, findDocumentByApplicationNumber);

// @route   POST /api/retailer/download-payment/:submissionId
// @desc    Process the payment for downloading the final document
// @access  Private (Retailer)
router.post('/download-payment/:submissionId', auth, processDocumentDownloadPayment);

// @route   POST /api/retailer/submissions/:submissionId/complaint
// @desc    Raise a complaint for a specific submission
// @access  Private (Retailer)
router.post('/submissions/:submissionId/complaint', auth, raiseComplaint);

export default router;