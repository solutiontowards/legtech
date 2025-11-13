import asyncHandler from 'express-async-handler';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { createAndSendOtp, resendOtp, verifyOtp } from '../utils/otp.js';
import { signToken, verifyToken } from '../utils/jwt.js';

const WA_API_URL = 'https://wbapi.in/api/send-text';
const WA_API_KEY = process.env.WBAPI_KEY; // Using the new API key from .env file

// Helper function for sending WhatsApp message via wbapi.in API
async function sendWhatsApp(mobile, code) {
  const msg = `Dear User,
Your One-Time Password (OTP) for login is ${code}.
For your security, please do not share this code with anyone.
If you did not request this OTP, kindly contact Legtech Support immediately at 7029-9595-52.
Thank you,
Legtech Team`;  // The new API requires a generic message sending function.
  // We will call it and throw an error if it fails, so the OTP process is halted.
  await sendGenericWhatsAppMessage(mobile, msg, true);
}

// Helper function for sending a generic WhatsApp message
export async function sendGenericWhatsAppMessage(mobile, msg, throwOnError = false) {
  const number = mobile.startsWith("91") ? mobile : `91${mobile.replace("+", "")}`;

  // Ensure the API key is available before making a request
  if (!WA_API_KEY) {
    const errorMessage = "WhatsApp API Key (WBAPI_KEY) is not configured.";
    console.error(`❌ ${errorMessage}`);
    if (throwOnError) {
      throw new Error(errorMessage);
    }
    return; // Stop if key is missing
  }

  try {
    const response = await axios.get(WA_API_URL, {
      params: {
        api_key: WA_API_KEY,
        number,
        msg,
      },
    });

    // The API returns `status: true` on success
    if (response.data.status === false) {
      const apiErrorMessage = response.data.message || "Failed to send message!";
      console.error("❌ Failed to send WhatsApp message (API Error):", apiErrorMessage);
      if (throwOnError) {
        throw new Error(apiErrorMessage);
      }
    } else {
      console.log(`✅ Message queued for ${number}. Task ID: ${response.data.taskId}`);
    }
  } catch (err) {
    const requestErrorMessage = err.response?.data?.message || err.message || "Failed to send message. Please try again later.";
    console.error("❌ Failed to send WhatsApp message (Request Error):", requestErrorMessage);
    // Re-throw the error if the calling function needs to handle it (like for OTP)
    if (throwOnError) {
      throw new Error(requestErrorMessage);
    }
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
    isKycVerified: false,
  });

  await user.setPassword(password);
  await user.save();

  // Create wallet for the user
  const wallet = await Wallet.create({ retailerId: user._id, balance: 0 });
  user.walletId = wallet._id;
  await user.save();

  // Send a welcome message to the newly registered retailer
const welcomeMessage = `Hello ${name},

Thank you for registering with Legtech! 🎉  
Your account has been successfully created.

Please log in at https://legtech.in/login and complete your KYC verification to activate your account and access all services.

If you need any assistance, feel free to contact our support team.

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
    user: { id: user._id, mobile: user.mobile, isKycVerified: user.isKycVerified },
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

  // Create a token that expires in 12 hours
  const token = signToken({ id: user._id, role: user.role }, '12h');
  // Save the token to the user document
  user.accessToken = token;
  await user.save();

  res.json({
    ok: true,
    message: 'Retailer login successful',
    token,
    user: { id: user._id, name: user.name, role: user.role, isKycVerified: user.isKycVerified },
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

  // Create a token that expires in 12 hours
  const token = signToken({ id: user._id, role: user.role }, '12h');
  // Save the token to the user document
  user.accessToken = token;
  await user.save();

  res.json({
    ok: true,
    message: 'Admin login successful',
    token,
    user: { id: user._id, name: user.name, role: user.role },
  });
});


// Logout
export const logout = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    // Even if no token is provided, we can send a success response
    // as the user is effectively logged out on the client-side.
    return res.status(200).json({ ok: true, message: 'No session to log out from.' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user) {
      user.accessToken = null; // Invalidate the token on the server side
      await user.save();
    }
    res.status(200).json({ ok: true, message: 'Logged out successfully' });
  } catch (error) {
    // If token is invalid/expired, the user is already effectively logged out.
    res.status(200).json({ ok: true, message: 'Session already expired.' });
  }
});

// Get Authenticated User
export const me = asyncHandler(async (req, res) => {
  // req.user is populated by the auth middleware. We can add an extra check
  // to ensure the token in the DB matches the one being used.
  const token = req.headers.authorization?.split(' ')[1];
  if (!req.user?._id) {
    return res.status(401).json({ ok: false, message: 'Authentication error. Please log in again.' });
  }
  const user = await User.findById(req.user._id);

  if (!user || user.accessToken !== token) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired session. Please log in again.' });
  }

  res.json({ ok: true, user });
});