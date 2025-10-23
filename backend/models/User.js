const mongoose = require("mongoose");
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
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
  },
  { timestamps: true }
);

// If user role admin to auto active user don't need to revarify user
userSchema.pre("save", function (next) {
  if (this.role === "admin") {
    this.isActive = true;
  }
  next();
});

userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

this.passwordHash = await bcrypt.hash(password, 10);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
