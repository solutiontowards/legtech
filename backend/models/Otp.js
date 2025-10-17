import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["register", "login"], required: true },
    attemts: { type: Number, default: 0 },
    expairesAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model("Otp", otpSchema);
