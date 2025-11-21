import asyncHandler from 'express-async-handler';
import KycDetail from '../models/KycDetail.js';
import User from '../models/User.js';
import { sendGenericWhatsAppMessage } from './authController.js';

// @desc    Submit or update KYC details for a retailer
// @route   POST /api/kyc
// @access  Private (Retailer)
export const submitKyc = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const { 
    aadhaarNumber, panNumber, outletName, state, district, postOffice, address, pinCode, plusCode,
    aadhaarFront, aadhaarBack, panCardImage, photo 
  } = req.body;

  // All fields are required except bankDocument
  const requiredFields = {
    aadhaarNumber, panNumber, outletName, state, district, postOffice, address, pinCode, plusCode,
    aadhaarFront, aadhaarBack, panCardImage, photo
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      // Convert camelCase to Title Case for user-friendly error message
      const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return res.status(400).json({
        message: `${fieldName} is required.`
      });
    }
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

  // Send a WhatsApp notification to the retailer
  const kycSubmissionMessage = `Hello ${req.user.name},

Thank you for submitting your KYC documents. Your application is now under review by our team.

We will notify you once the verification process is complete. This usually takes 24-48 hours.

Best regards,
The Legtech Team`;

  try {
    await sendGenericWhatsAppMessage(req.user.mobile, kycSubmissionMessage);
  } catch (error) {
    console.error("❌ Failed to send KYC submission confirmation message:", error);
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