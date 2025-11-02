import asyncHandler from 'express-async-handler';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET });

export const getWallet = asyncHandler(async (req,res)=>{
  const wallet = await Wallet.findOne({ retailerId: req.user._id }).populate('transactions');
  res.json({ ok:true, wallet });
});

export const createRazorpayOrderForWallet = asyncHandler(async (req,res)=>{
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const order = await razorpay.orders.create({ amount: Math.round(amount*100), currency: 'INR', receipt: `wallet_${req.user._id}_${Date.now()}` });
  res.json({ ok:true, order });
});

export const creditWallet = asyncHandler(async (req,res)=>{
  const { walletId, amount, meta } = req.body;
  const wallet = await Wallet.findById(walletId);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  wallet.balance += amount; await wallet.save();
  const tx = await Transaction.create({ walletId: wallet._id, type: 'credit', amount, meta });
  wallet.transactions.push(tx._id); await wallet.save();
  res.json({ ok:true, wallet });
});


// Get Wallet Balance
export const getWalletBalance = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ retailerId: req.user._id });
  if (!wallet) {
    return res.status(404).json({ error: "Wallet not found" });
  }
  res.json({ ok: true, balance: wallet.balance });
});

// Get all transactions for the logged-in user's wallet
export const getTransactions = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ retailerId: req.user._id });
  if (!wallet) {
    return res.status(404).json({ ok: false, message: "Wallet not found" });
  }
  const transactions = await Transaction.find({ walletId: wallet._id }).sort({ createdAt: -1 });
  res.json({ ok: true, transactions });
});