import asyncHandler from 'express-async-handler';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { createAndSendOtp, resendOtp, verifyOtp } from '../utils/otp.js';
import { signToken } from '../utils/jwt.js';

const WA_API_URL = 'https://wa.panmitra.in/send-message';
const WA_API_KEY = 'CwoPN5UEKt3hoqReQP8KGTN23lfZsX';
const WA_SENDER = '917872652252'; 

// Helper function for sending WhatsApp message via Panmitra API
async function sendWhatsApp(mobile, code) {
  const number = mobile.startsWith('+') ? mobile.replace('+', '') : `91${mobile}`;
  const message = `Your verification code is ${code}. It expires in ${process.env.OTP_TTL_MINUTES || 5} minutes.`;

  try {
    const response = await axios.post(WA_API_URL, {
      api_key: WA_API_KEY,
      sender: WA_SENDER,
      number,
      message,
    });

    // The Panmitra API might return a success status code (200) but an error in the body
    if (response.data.status === false) {
      console.error('❌ Failed to send WhatsApp OTP (API Error):', response.data.msg);
      throw new Error(response.data.msg || 'Failed to send message!');
    }

    console.log(`✅ OTP sent to ${number}`);
  } catch (err) {
    console.error('❌ Failed to send WhatsApp OTP (Request Error):', err.response?.data || err.message);
    // Re-throw the original error or a more specific one to be caught by the calling function
    throw new Error(err.response?.data?.msg || err.message || 'Failed to send OTP. Please try again later.');
  }
}

// Helper function for sending a generic WhatsApp message
export async function sendGenericWhatsAppMessage(mobile, message) {
  const number = mobile.startsWith('+') ? mobile.replace('+', '') : `91${mobile}`;

  try {
    const response = await axios.post(WA_API_URL, {
      api_key: WA_API_KEY,
      sender: WA_SENDER,
      number,
      message,
    });

    if (response.data.status === false) {
      // Log the error but don't throw, so the main operation doesn't fail
      console.error('❌ Failed to send generic WhatsApp message (API Error):', response.data.msg);
    } else {
      console.log(`✅ Generic message sent to ${number}`);
    }
  } catch (err) {
    // Log the error but don't throw
    console.error('❌ Failed to send generic WhatsApp message (Request Error):', err.response?.data || err.message);
  }
}

// Send OTP for Register or Login
export const sendOtp = asyncHandler(async (req, res) => {
  const { mobile, purpose } = req.body;
  if (!mobile || !purpose) return res.status(400).json({ error: 'Mobile and purpose required' });
  if (!['register', 'login'].includes(purpose)) return res.status(400).json({ error: 'Invalid purpose' });

  if (purpose === 'register') {
    const exists = await User.findOne({ mobile });
    if (exists) return res.status(400).json({ error: 'Mobile already registered' });
  }

  try {
    const otp = await createAndSendOtp(mobile, purpose, (m, code) => sendWhatsApp(m, code));
    res.json({ ok: true, message: 'OTP sent successfully', expiresAt: otp.expiresAt });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to send OTP.' });
  }
});

// Resend OTP
export const resendOtpController = asyncHandler(async (req, res) => {
  const { mobile, purpose } = req.body;
  if (!mobile || !purpose) return res.status(400).json({ error: 'Mobile and purpose required' });

  try {
    const otp = await resendOtp(mobile, purpose, (m, code) => sendWhatsApp(m, code));
    res.json({ ok: true, message: 'OTP resent successfully', resendCount: otp.resendCount });
  } catch (err) {
    res.status(429).json({ error: err.message });
  }
});

// Verify OTP
export const verifyOtpController = asyncHandler(async (req, res) => {
  const { mobile, code, purpose } = req.body;
  if (!mobile || !code || !purpose) return res.status(400).json({ error: 'Mobile, code, and purpose required' });
  if (!['register', 'login'].includes(purpose)) return res.status(400).json({ error: 'Invalid purpose' });

  try {
    await verifyOtp(mobile, code, purpose);
    res.json({ ok: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register User (assumes OTP is already verified)
export const verifyRegisterOtp = asyncHandler(async (req, res) => {
  const { mobile, name, email, password } = req.body;

  if (!mobile || !name || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Check if mobile is already registered
  const existingMobile = await User.findOne({ mobile });
  if (existingMobile) {
    return res.status(400).json({ error: 'Mobile number already registered' });
  }

  // Check if email is already registered
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Create new retailer user
  const user = new User({
    name,
    email,
    mobile,
    role: 'retailer',
    isOtpVerified: true,
    isVerified: false,
  });

  await user.setPassword(password);
  await user.save();

  // Create wallet for the user
  const wallet = await Wallet.create({ retailerId: user._id, balance: 0 });
  user.walletId = wallet._id;
  await user.save();

  // Send a welcome message to the newly registered retailer
const welcomeMessage = `Hello ${name},

Welcome to Legtech! 🎉  
Your retailer account has been successfully created.

You can log in anytime at https://legtech.in/login to access your dashboard and manage your profile.

Please note that your account is currently pending verification by our admin team.  
Once verified, you’ll gain full access to all Legtech services and features.

💡 To expedite the approval process, we recommend adding a minimum balance to your wallet.

Thank you for choosing Legtech — empowering retailers with smart technology.

Best regards,  
The Legtech Team`;

  try {
    sendGenericWhatsAppMessage(mobile, welcomeMessage);
  } catch (error) {
    // Log the error if sending the welcome message fails
    console.error("❌ Failed to send welcome message:", error);
  }

  res.json({
    ok: true,
    message: 'Registration successful. Await admin verification.',
    user: { id: user._id, mobile: user.mobile, isVerified: user.isVerified },
  });
});
// Retailer Login Step 1 – Verify Password & Send OTP
export const retailerLoginInit = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });
  

  const user = await User.findOne({ mobile });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

if (!user.isActive) {
  return res.status(403).json({
    success: false,
    message: "User is not active. Please contact Admin for more information.",
  });
}

  if (user.role !== 'retailer') {
    return res.status(403).json({ error: 'Access denied: Retailer login required' });
  }

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  try {
    const otp = await createAndSendOtp(mobile, 'login', (m, code) => sendWhatsApp(m, code));
    res.json({ ok: true, message: 'OTP sent for retailer login', expiresAt: otp.expiresAt });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to send OTP.' });
  }
});

// Admin Login Step 1 – Verify Password & Send OTP
export const adminLoginInit = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });

  const user = await User.findOne({ mobile });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

if (!user.isActive) {
  return res.status(403).json({
    success: false,
    message: "User is not active. Please contact support.",
  });
}

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin login required' });
  }

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  try {
    const otp = await createAndSendOtp(mobile, 'login', (m, code) => sendWhatsApp(m, code));
    res.json({ ok: true, message: 'OTP sent for admin login', expiresAt: otp.expiresAt });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to send OTP.' });
  }
});

// Retailer OTP Verification
export const retailerVerifyLoginOtp = asyncHandler(async (req, res) => {
  const { mobile, code } = req.body;
  if (!mobile || !code) return res.status(400).json({ error: 'Mobile and code required' });

  const user = await User.findOne({ mobile });
  if (!user || user.role !== 'retailer') {
    return res.status(403).json({ error: 'Access denied: Retailer login required' });
  }

  try {
    await verifyOtp(mobile, code, 'login');
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const token = signToken({ id: user._id, role: user.role });
  // res.cookie('token', token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict',
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

  res.cookie('token', token, {
  httpOnly: true,
  secure: true, // required for HTTPS
  sameSite: 'none', // allow cookie to be sent cross-site
  domain: '.legtech.in', // works for both legtech.in and api.legtech.in
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});


  res.json({
    ok: true,
    message: 'Retailer login successful',
    user: { id: user._id, role: user.role, isVerified: user.isVerified },
  });
});

// Admin OTP Verification
export const adminVerifyLoginOtp = asyncHandler(async (req, res) => {
  const { mobile, code } = req.body;
  if (!mobile || !code) return res.status(400).json({ error: 'Mobile and code required' });

  const user = await User.findOne({ mobile });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin login required' });
  }

  try {
    await verifyOtp(mobile, code, 'login');
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const token = signToken({ id: user._id, role: user.role });
  // res.cookie('token', token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === 'production',
  //   sameSite: 'strict',
  //   maxAge: 7 * 24 * 60 * 60 * 1000,
  // });

  res.cookie('token', token, {
  httpOnly: true,
  secure: true, // required for HTTPS
  sameSite: 'none', // allow cookie to be sent cross-site
  domain: '.legtech.in', // works for both legtech.in and api.legtech.in
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});


  res.json({
    ok: true,
    message: 'Admin login successful',
    user: { id: user._id, role: user.role, isVerified: user.isVerified },
  });
});


// Logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true, message: 'Logged out successfully' });
});

// Get Authenticated User
export const me = asyncHandler(async (req, res) => {
  res.json({ ok: true, user: req.user });
});