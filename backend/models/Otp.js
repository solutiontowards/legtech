import mongoose from "mongoose";

const Schema = mongoose.Schema;

const otpSchema = new Schema(
  {
    mobile: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["register", "login"], required: true },
    attempts: { type: Number, default: 0 }, // wrong attempts
    resendCount: { type: Number, default: 0 }, // resend count
    maxResend: {
      type: Number,
      default: parseInt(process.env.OTP_MAX_RESEND || 3),
    },
    used: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);


// TTL index: Mongo will remove when expiresAt passes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export default Otp;