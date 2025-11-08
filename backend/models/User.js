import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    mobile: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "retailer"], default: "retailer" },
    isVerified: { type: Boolean, default: false },
    isOtpVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    accessToken: { type: String, default: null },
  },
  { timestamps: true }
);

// If user role is admin, auto-activate user
userSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.isVerified = true;
  }
  next();
});

// Method to set password
userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

// Optional method to check password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
