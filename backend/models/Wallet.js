import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const WalletSchema = new Schema({
  retailerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }]
}, { timestamps: true });

const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
export default Wallet;