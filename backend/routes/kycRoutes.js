import express from 'express';
import { submitKyc, getMyKycDetails } from '../controllers/kycController.js';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();

// Apply authentication to all routes in this file
router.use(auth);

// @route   POST /api/kyc
// @desc    Submit or update KYC details for the logged-in retailer
// @access  Private (Retailer only)
router.post('/', authorize('retailer'), submitKyc);

// @route   GET /api/kyc
// @desc    Get KYC details for the logged-in retailer
// @access  Private (Retailer only)
router.get('/', authorize('retailer'), getMyKycDetails);

export default router;