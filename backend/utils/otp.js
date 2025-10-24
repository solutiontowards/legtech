import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";

const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || "5", 10);
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10);
const MAX_RESEND = parseInt(process.env.OTP_MAX_RESEND || "3", 10);

// Generate a 6-digit OTP
export function generateOtp(length = 6) {
  let s = "";
  for (let i = 0; i < length; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export async function createAndSendOtp(mobile, purpose, sendFn) {
  // remove previous unused OTPs for same mobile/purpose
  await Otp.deleteMany({ mobile, purpose, used: false });

  const plain = generateOtp(6);
  const codeHash = await bcrypt.hash(plain, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  const otp = await Otp.create({
    mobile,
    codeHash,
    purpose,
    attempts: 0,
    resendCount: 0,
    maxResend: MAX_RESEND,
    used: false,
    locked: false,
    expiresAt,
  });

  // sendFn(mobile, plain) => actual provider (Twilio/SMS)
  if (sendFn) {
    try {
      await sendFn(mobile, plain);
    } catch (err) {
      console.error("OTP send error", err);
    }
  } else {
    console.log(`OTP for ${mobile} = ${plain}`);
  }
  return otp;
}

export async function resendOtp(mobile, purpose, sendFn) {
  const otp = await Otp.findOne({
    mobile,
    purpose,
    used: false,
    locked: false,
  }).sort({ createdAt: -1 });
  if (!otp) {
    return createAndSendOtp(mobile, purpose, sendFn);
  }
  if (otp.resendCount >= otp.maxResend) throw new Error("Resend limit reached");
  const plain = generateOtp(6);
  otp.codeHash = await bcrypt.hash(plain, 10);
  otp.resendCount += 1;
  otp.attempts = 0;
  otp.expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await otp.save();
  if (sendFn) await sendFn(mobile, plain);
  else console.log(`Resent OTP for ${mobile} = ${plain}`);
  return otp;
}

export async function verifyOtp(mobile, code, purpose) {
  const otp = await Otp.findOne({ mobile, purpose }).sort({ createdAt: -1 });
  if (!otp || otp.used) throw new Error("OTP not found or already used");
  if (otp.locked) throw new Error("OTP locked due to too many wrong attempts");
  if (otp.expiresAt < new Date()) throw new Error("OTP expired");
  const ok = await bcrypt.compare(code, otp.codeHash);
  if (!ok) {
    otp.attempts += 1;
    if (otp.attempts >= MAX_ATTEMPTS) {
      otp.locked = true;
      otp.used = true;
    }
    await otp.save();
    const left = Math.max(0, MAX_ATTEMPTS - otp.attempts);
    throw new Error(`Invalid OTP. attemptsLeft=${left}`);
  }
  otp.used = true;
  await otp.save();
  return true;
}
