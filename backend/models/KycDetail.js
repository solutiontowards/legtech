import mongoose from "mongoose";
const Schema = mongoose.Schema;

const kycDetailSchema = new Schema(
  {
    retailerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    aadhaarNumber: { type: String, required: true },
    panNumber: { type: String, required: true },
    aadhaarFront: { type: String, required: true }, // URL to image
    aadhaarBack: { type: String, required: true }, // URL to image
    panCardImage: { type: String, required: true }, // URL to image
    photo: { type: String, required: true }, // URL to user's photo
    bankDocument: { type: String, required: true }, // URL to cheque/passbook
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

const KycDetail = mongoose.models.KycDetail || mongoose.model("KycDetail", kycDetailSchema);
export default KycDetail;