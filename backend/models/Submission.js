import mongoose from "mongoose";
const Schema = mongoose.Schema;

const StatusHistorySchema = new Schema({
  status: { type: String, required: true },
  remarks: String,
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now }
});

const SubmissionSchema = new Schema(
  {
    applicationNumber: { type: String, unique: true, sparse: true },
    retailerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    subServiceId: { type: Schema.Types.ObjectId, ref: "SubService" },
    optionId: { type: Schema.Types.ObjectId, ref: "Option" },
    data: Schema.Types.Mixed, // fieldName -> value (text or uploaded file URL)
    files: [Schema.Types.Mixed], // Initial files
    reUploadedFiles: [Schema.Types.Mixed], // Files re-uploaded by retailer
    amount: Number,
    paymentMethod: {
      type: String,
      enum: ["wallet", "online"],
      default: "wallet",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: [
        "Applied",
        "Verified",
        "Reject | Failed",
        "On Process",
        "On Hold",
        "Success",
        "Objection",
        "Hold for Customer",
        "Document Required",
        "Document Re-uploaded",
        "Completed",
        "Payment Failed",
      ],
      default: "Applied",
    },
    adminRemarks: String,
    finalDocument: { type: String }, // URL to the final PDF uploaded by admin
    isFinalDocumentDownloaded: { type: Boolean, default: false },
    statusHistory: [StatusHistorySchema],
  },
  { timestamps: true }
);

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
export default Submission;
