import asyncHandler from 'express-async-handler';
import KycDetail from '../models/KycDetail.js';
import User from '../models/User.js';

// @desc    Submit or update KYC details for a retailer
// @route   POST /api/kyc
// @access  Private (Retailer)
export const submitKyc = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const { aadhaarNumber, panNumber, aadhaarFront, aadhaarBack, panCardImage, photo, bankDocument } = req.body;

  if (!aadhaarNumber || !panNumber || !aadhaarFront || !aadhaarBack || !panCardImage || !photo || !bankDocument) {
    return res.status(400).json({ message: 'All KYC fields are required.' });
  }

  let kycDetails = await KycDetail.findOne({ retailerId });

  if (kycDetails) {
    // Update existing KYC details
    kycDetails.set({ ...req.body, status: 'pending', rejectionReason: null });
  } else {
    // Create new KYC details
    kycDetails = new KycDetail({ retailerId, ...req.body });
  }

  await kycDetails.save();

  // Link KYC details to user if not already linked
  const user = await User.findById(retailerId);
  if (!user.kycDetails) {
    user.kycDetails = kycDetails._id;
    await user.save();
  }

  res.status(201).json({ message: 'KYC details submitted successfully. Awaiting admin review.', kycDetails });
});

// @desc    Get KYC details for the logged-in retailer
// @route   GET /api/kyc
// @access  Private (Retailer)
export const getMyKycDetails = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const kycDetails = await KycDetail.findOne({ retailerId });

  if (!kycDetails) {
    // Return a specific status or message if KYC has not been submitted yet
    return res.status(200).json({ kycStatus: 'not_submitted' });
  }

  res.json({ kycStatus: kycDetails.status, details: kycDetails });
});