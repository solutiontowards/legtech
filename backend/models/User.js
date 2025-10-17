const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ["retailer", "admin"],
      default: "retailer",
    },
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    wallet: { type: Number, default: 0 },
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

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
