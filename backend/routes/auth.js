import express from 'express';
import { sendOtp, resendOtpController, verifyRegisterOtp, loginInit, verifyLoginOtp, logout, me } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.post('/send-otp', authLimiter, sendOtp);
router.post('/resend-otp', authLimiter, resendOtpController);
router.post('/verify-register-otp', authLimiter, verifyRegisterOtp);
router.post('/login', authLimiter, loginInit);
router.post('/verify-login-otp', authLimiter, verifyLoginOtp);
router.post('/logout', auth, logout);
router.get('/me', auth, me);

export default router;
