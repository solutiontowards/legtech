import mongoose from "mongoose";
const Schema = mongoose.Schema;

const NoticeSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Notice = mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
export default Notice;