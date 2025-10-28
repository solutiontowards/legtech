import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SubServiceSchema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
    image: String,
    imageMeta: Schema.Types.Mixed,
    options: [{ type: Schema.Types.ObjectId, ref: "Option" }],
  },
  { timestamps: true }
);

const SubService =
  mongoose.models.SubService || mongoose.model("SubService", SubServiceSchema);
export default SubService;
