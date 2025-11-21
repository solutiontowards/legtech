import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  findDocumentByApplicationNumber,
  processDocumentDownloadPayment,
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


export default router;