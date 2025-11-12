import mongoose from "mongoose";
const Schema = mongoose.Schema;

const WishesSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Wishes = mongoose.models.Wishes || mongoose.model("Wishes", WishesSchema);
export default Wishes;