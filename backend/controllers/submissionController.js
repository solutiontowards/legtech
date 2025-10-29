import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Option from '../models/Option.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET });

export const createSubmission = asyncHandler(async (req,res)=>{
  const { optionId, serviceId, subServiceId, data, files, paymentMethod } = req.body;
  const option = await Option.findById(optionId);
  if (!option) return res.status(404).json({ error: 'Option not found' });
  const amount = option.price || 0;

  if (paymentMethod === 'wallet') {
    const wallet = await Wallet.findOne({ retailerId: req.user._id });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ error: 'Insufficient wallet balance' });
    wallet.balance -= amount; await wallet.save();
    const tx = await Transaction.create({ walletId: wallet._id, type: 'debit', amount, meta: { reason: 'service purchase', optionId } });
    wallet.transactions.push(tx._id); await wallet.save();
    const submission = await Submission.create({ retailerId: req.user._id, optionId, serviceId, subServiceId, data, files, amount, paymentMethod, paymentStatus: 'paid', status: 'submitted' });
    return res.json({ ok:true, submission });
  }

  // online payment
  const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `sub_${req.user._id}_${Date.now()}` });
  const submission = await Submission.create({ retailerId: req.user._id, optionId, serviceId, subServiceId, data, files, amount, paymentMethod, paymentStatus: 'pending', status: 'submitted' });
  res.json({ ok:true, order, submission });
});

export const verifyRazorpayPayment = asyncHandler(async (req,res)=>{
  // Implement signature verification here for production
  const { submissionId } = req.body;
  const submission = await Submission.findById(submissionId);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  submission.paymentStatus = 'paid';
  await submission.save();
  res.json({ ok:true, submission });
});

export const listRetailerSubmissions = asyncHandler(async (req,res)=>{
  const subs = await Submission.find({ retailerId: req.user._id })
    .populate('optionId', 'name')
    .populate('serviceId', 'name')
    .sort({ createdAt: -1 });
  res.json({ ok:true, subs });
});

export const adminListSubmissions = asyncHandler(async (req,res)=>{
  const subs = await Submission.find()
    .populate('retailerId', 'name')
    .populate('serviceId', 'name')
    .populate({
      path: 'optionId',
      select: 'name',
      populate: {
        path: 'subServiceId',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 });
  res.json({ ok:true, subs });
});

export const getSubmissionById = asyncHandler(async (req,res)=>{
  const { submissionId } = req.params;
  const submission = await Submission.findById(submissionId)
    .populate('retailerId', 'name email')
    .populate('serviceId', 'name')
    .populate({
      path: 'optionId',
      populate: {
        path: 'subServiceId',
        select: 'name',
      }


      
    });
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  res.json({ ok:true, submission });
});

export const updateSubmissionStatus = asyncHandler(async (req,res)=>{
  const { submissionId } = req.params;
  const { status, adminRemarks } = req.body;
  const submission = await Submission.findById(submissionId);
  if (!submission) return res.status(404).json({ error: 'Not found' });
  submission.status = status || submission.status;
  if (adminRemarks) submission.adminRemarks = adminRemarks;
  await submission.save();
  res.json({ ok:true, submission });
});
