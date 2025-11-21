import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet" },
    type: { type: String, enum: ["debit", "credit", "failed"] },
    amount: Number,
    meta: Schema.Types.Mixed,
    previousBalance: { type: Number, default: 0 },
    updatedBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
export default Transaction;
