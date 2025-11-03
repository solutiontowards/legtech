import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Option from '../models/Option.js';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET });

export const createSubmission = asyncHandler(async (req,res)=>{
  const { optionId, data, files, paymentMethod } = req.body;
  const option = await Option.findById(optionId).populate({ path: 'subServiceId', select: 'serviceId' });
  if (!option) return res.status(404).json({ error: 'Option not found' });
  const amount = option.price || 0;

  if (paymentMethod === 'wallet') {
    const wallet = await Wallet.findOne({ retailerId: req.user._id });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ error: 'Insufficient wallet balance' });
    wallet.balance -= amount; await wallet.save();
    const tx = await Transaction.create({ walletId: wallet._id, type: 'debit', amount, meta: { reason: 'service purchase', optionId } });
    wallet.transactions.push(tx._id); await wallet.save();
    const submission = await Submission.create({ 
      retailerId: req.user._id, optionId, serviceId: option.subServiceId.serviceId, subServiceId: option.subServiceId._id, data, files, amount, paymentMethod, paymentStatus: 'paid', status: 'Submitted',
      statusHistory: [{
        status: 'Submitted',
        remarks: 'Application submitted by retailer.',
        updatedBy: req.user._id
      }]
    });
    return res.json({ ok:true, submission });
  }

  // online payment
  const order = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `sub_${req.user._id}_${Date.now()}` });
  const submission = await Submission.create({ 
    retailerId: req.user._id, optionId, serviceId: option.subServiceId.serviceId, subServiceId: option.subServiceId._id, data, files, amount, paymentMethod, paymentStatus: 'pending', status: 'Submitted',
    statusHistory: [{
      status: 'Submitted',
      remarks: 'Application submitted by retailer.',
      updatedBy: req.user._id
    }]
  });
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
    .populate('serviceId', 'name')
    .populate({
      path: 'optionId',
      select: 'name subServiceId',
      populate: {
        path: 'subServiceId',
        select: 'name'
      }
    })
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

export const getRetailerSubmissionById = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const submission = await Submission.findOne({ _id: submissionId, retailerId: req.user._id })
    .populate('retailerId', 'name email')
    .populate('serviceId', 'name')
    .populate({
      path: 'optionId',
      select: 'name subServiceId',
      populate: {
        path: 'subServiceId',
        select: 'name',
      }
    })
    .populate({
      path: 'statusHistory.updatedBy', select: 'name role' 
    });

  if (!submission) return res.status(404).json({ error: 'Submission not found or access denied' });
  res.json({ ok: true, submission });
});

export const getSubmissionById = asyncHandler(async (req,res)=>{
  const { submissionId } = req.params;
  const submission = await Submission.findById(submissionId)
    .populate('retailerId', 'name email')
    .populate('serviceId', 'name')
    .populate({
      path: 'optionId',
      select: 'name subServiceId',
      populate: {
        path: 'subServiceId',
        select: 'name',
      }
    })
    .populate({
      path: 'statusHistory.updatedBy', select: 'name role' 
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
  submission.adminRemarks = adminRemarks || submission.adminRemarks; // Update main remarks

  // Add to history
  submission.statusHistory.push({
    status: status,
    remarks: adminRemarks,
    updatedBy: req.user._id
  });

  await submission.save();
  res.json({ ok:true, submission });
});

export const reUploadDocuments = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { files } = req.body;

  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: "No files were provided for re-upload." });
  }

  const submission = await Submission.findOne({ _id: submissionId, retailerId: req.user._id });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found or you do not have permission." });
  }

  submission.reUploadedFiles.push(...files);
  submission.status = 'Document Re-uploaded';
  submission.statusHistory.push({
    status: 'Document Re-uploaded',
    remarks: 'Retailer re-uploaded the required documents.',
    updatedBy: req.user._id,
  });

  await submission.save();
  res.json({ ok: true, submission });
});
