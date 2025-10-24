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

// ✅ Helper function for sending WhatsApp message via Panmitra API
async function sendWhatsApp(mobile, code) {
  const number = mobile.startsWith('+') ? mobile.replace('+', '') : `91${mobile}`;
  const message = `Your verification code is ${code}. It expires in ${process.env.OTP_TTL_MINUTES || 5} minutes.`;

  try {
    await axios.post(WA_API_URL, {
      api_key: WA_API_KEY,
      sender: WA_SENDER,
      number,
      message,
    });
    console.log(`✅ OTP sent to ${number}`);
  } catch (err) {
    console.error('❌ Failed to send WhatsApp OTP:', err.response?.data || err.message);
    throw new Error('Failed to send OTP. Please try again later.');
  }
}

// ✅ Send OTP for Register or Login
export const sendOtp = asyncHandler(async (req, res) => {
  const { mobile, purpose } = req.body;
  if (!mobile || !purpose) return res.status(400).json({ error: 'Mobile and purpose required' });
  if (!['register', 'login'].includes(purpose)) return res.status(400).json({ error: 'Invalid purpose' });

  if (purpose === 'register') {
    const exists = await User.findOne({ mobile });
    if (exists) return res.status(400).json({ error: 'Mobile already registered' });
  }

  const otp = await createAndSendOtp(mobile, purpose, (m, code) => sendWhatsApp(m, code));
  res.json({ ok: true, message: 'OTP sent successfully', expiresAt: otp.expiresAt });
});

// ✅ Resend OTP
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

// ✅ Verify Register OTP & Create Retailer
export const verifyRegisterOtp = asyncHandler(async (req, res) => {
  const { mobile, code, name, email, password } = req.body;
  if (!mobile || !code || !password) return res.status(400).json({ error: 'Required fields missing' });

  try {
    await verifyOtp(mobile, code, 'register');
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const existing = await User.findOne({ mobile });
  if (existing) return res.status(400).json({ error: 'Already registered' });

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

  const wallet = await Wallet.create({ retailerId: user._id, balance: 0 });
  user.walletId = wallet._id;
  await user.save();

  res.json({
    ok: true,
    message: 'Registration successful. Await admin verification.',
    user: { id: user._id, mobile: user.mobile, isVerified: user.isVerified },
  });
});

// ✅ Login Step 1 – Verify Password & Send OTP
export const loginInit = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });

  const user = await User.findOne({ mobile });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const otp = await createAndSendOtp(mobile, 'login', (m, code) => sendWhatsApp(m, code));
  res.json({ ok: true, message: 'OTP sent for login', expiresAt: otp.expiresAt });
});

// ✅ Login Step 2 – Verify OTP & Issue Token
export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { mobile, code } = req.body;
  if (!mobile || !code) return res.status(400).json({ error: 'Mobile and code required' });

  try {
    await verifyOtp(mobile, code, 'login');
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const user = await User.findOne({ mobile });
  if (!user) return res.status(400).json({ error: 'User not found' });

  const token = signToken({ id: user._id, role: user.role });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    ok: true,
    message: 'Login successful',
    user: { id: user._id, role: user.role, isVerified: user.isVerified },
  });
});

// ✅ Logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true, message: 'Logged out successfully' });
});

// ✅ Get Authenticated User
export const me = asyncHandler(async (req, res) => {
  res.json({ ok: true, user: req.user });
});
