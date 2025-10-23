import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SubmissionSchema = new Schema(
  {
    retailerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    subServiceId: { type: Schema.Types.ObjectId, ref: "SubService" },
    optionId: { type: Schema.Types.ObjectId, ref: "Option" },
    data: Schema.Types.Mixed, // fieldName -> value (text or uploaded file URL)
    files: [Schema.Types.Mixed], // array of { url, originalname, mimetype }
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
      enum: ["submitted", "reviewing", "processing", "rejected", "completed"],
      default: "submitted",
    },
    adminRemarks: String,
  },
  { timestamps: true }
);

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
export default Submission;
