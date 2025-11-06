import express from 'express';
import { 
  sendOtp, 
  resendOtpController, 
  verifyOtpController, 
  verifyRegisterOtp, 
  logout, 
  me,
  retailerLoginInit,
  retailerVerifyLoginOtp,
  adminLoginInit,
  adminVerifyLoginOtp
} from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

// OTP routes
router.post('/send-otp', authLimiter, sendOtp);
router.post('/resend-otp', authLimiter, resendOtpController);
router.post('/verify-otp', authLimiter, verifyOtpController);
router.post('/verify-register-otp', authLimiter, verifyRegisterOtp);

// Retailer login routes
router.post('/retailerlogin', authLimiter, retailerLoginInit);
router.post('/verify-retailerlogin-otp', authLimiter, retailerVerifyLoginOtp);

// Admin login routes
router.post('/adminlogin', authLimiter, adminLoginInit);
router.post('/verify-adminlogin-otp', authLimiter, adminVerifyLoginOtp);

// Authenticated routes
router.post('/logout', auth, logout);
router.get('/me', me);



export default router;
