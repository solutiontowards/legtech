import mongoose from "mongoose";
const Schema = mongoose.Schema;

const kycDetailSchema = new Schema(
  {
    retailerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    aadhaarNumber: { type: String, required: true },
    panNumber: { type: String, required: true, uppercase: true },
    outletName: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    postOffice: { type: String, required: true },
    address: { type: String, required: true },
    pinCode: { type: String, required: true },
    plusCode: { type: String, required: true }, // For Lat/Long

    aadhaarFront: { type: String, required: true }, // URL to image
    aadhaarBack: { type: String, required: true }, // URL to image
    panCardImage: { type: String, required: true }, // URL to image
    photo: { type: String, required: true }, // URL to user's photo
    bankDocument: { type: String, required: false }, // URL to cheque/passbook (Optional)
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