import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Option from '../models/Option.js';
import axios from 'axios';

export const createSubmission = asyncHandler(async (req,res)=>{
  const { optionId, data, files, paymentMethod } = req.body;
  const option = await Option.findById(optionId).populate({ path: 'subServiceId', select: 'serviceId' });
  if (!option) return res.status(404).json({ error: 'Option not found' });
  const amount = option.price || 0;

  if (paymentMethod === 'wallet') {
    const wallet = await Wallet.findOne({ retailerId: req.user._id });
    const hasSufficientFunds = wallet && wallet.balance >= amount;

    if (hasSufficientFunds) {
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
    } else {
      // Insufficient funds, create submission with failed payment status
      const submission = await Submission.create({ 
        retailerId: req.user._id, optionId, serviceId: option.subServiceId.serviceId, subServiceId: option.subServiceId._id, data, files, amount, paymentMethod: 'wallet', paymentStatus: 'failed', status: 'Payment Failed',
        statusHistory: [{
          status: 'Payment Failed',
          remarks: 'Submission created but payment failed due to insufficient wallet balance.',
          updatedBy: req.user._id
        }]
      });
      return res.status(201).json({ ok: true, submission, paymentFailed: true, message: 'Insufficient wallet balance. Submission created with failed payment status.' });
    }
  }
  
  // For online payment, first create the submission record
  const submission = await Submission.create({
    retailerId: req.user._id, optionId, serviceId: option.subServiceId.serviceId, subServiceId: option.subServiceId._id, data, files, amount, paymentMethod, paymentStatus: 'pending', status: 'Submitted',
    statusHistory: [{
      status: 'Submitted',
      remarks: 'Application submitted by retailer.',
      updatedBy: req.user._id
    }]
  });

  // Then, create the payment order with AllAPI
  const ALLAPI_TOKEN = process.env.ALLAPI_TOKEN;
  const ALLAPI_URL = process.env.ALLAPI_URL;
  // Redirect to submission history page after payment
  const ALLAPI_REDIRECT_URL = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/retailer/submission-history` : "http://localhost:5173/retailer/submission-history";

  const order_id = `SUBMISSION_${submission._id}_${Date.now()}`;
  const payload = {
    token: ALLAPI_TOKEN,
    order_id,
    txn_amount: amount,
    txn_note: `Payment for service: ${option.name}`,
    product_name: `Service: ${option.name}`,
    customer_name: req.user.name,
    customer_mobile: req.user.mobile,
    customer_email: req.user.email,
    redirect_url: ALLAPI_REDIRECT_URL,
  };

  try {
    console.log(`🟦 Creating submission payment order for submission ${submission._id}`);
    const response = await axios.post(ALLAPI_URL, payload);
    const result = response?.data;

    if (result?.status === true && result?.results?.payment_url) {
      console.log(`✅ Payment order created successfully: ${order_id}`);
      // Associate the AllAPI order_id with the submission
      submission.paymentOrderId = order_id;
      await submission.save();

      return res.json({
        ok: true,
        payment_url: result.results.payment_url,
        order_id,
        submission,
      });
    }

    // If order creation fails, update submission to reflect payment failure
    console.error(`⚠️ Failed to create order: ${result?.message}`);
    submission.paymentStatus = 'failed';
    submission.status = 'Payment Failed';
    submission.statusHistory.push({
      status: 'Payment Failed',
      remarks: `Failed to initialize online payment: ${result?.message || 'Unknown error'}`,
      updatedBy: req.user._id
    });
    await submission.save();
    return res.status(400).json({ ok: false, message: result?.message || "Failed to create payment order", paymentFailed: true });

  } catch (error) {
    console.error("❌ AllAPI Order Error:", error.message);
    submission.paymentStatus = 'failed';
    submission.status = 'Payment Failed';
    submission.statusHistory.push({
      status: 'Payment Failed',
      remarks: `Server error during payment initialization: ${error.message}`,
      updatedBy: req.user._id
    });
    await submission.save();
    return res.status(500).json({ ok: false, message: "Error creating payment order with AllAPI", paymentFailed: true });
  }
});

export const retrySubmissionPayment = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { paymentMethod } = req.body;

  const submission = await Submission.findById(submissionId);
  if (!submission || submission.retailerId.toString() !== req.user._id.toString()) {
    return res.status(404).json({ error: 'Submission not found or access denied' });
  }

  if (submission.paymentStatus === 'paid') {
    return res.status(400).json({ error: 'Payment has already been made for this submission.' });
  }

  const amount = submission.amount || 0;

  if (paymentMethod === 'wallet') {
    const wallet = await Wallet.findOne({ retailerId: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }
    wallet.balance -= amount;
    const tx = await Transaction.create({ walletId: wallet._id, type: 'debit', amount, meta: { reason: 'service purchase retry', submissionId: submission._id } });
    wallet.transactions.push(tx._id);
    await wallet.save();
    submission.paymentStatus = 'paid';
    submission.paymentMethod = 'wallet';
    await submission.save();
    return res.json({ ok: true, submission });
  }

  // For online payment, create a new AllAPI order
  const ALLAPI_TOKEN = process.env.ALLAPI_TOKEN;
  const ALLAPI_URL = process.env.ALLAPI_URL;
  const ALLAPI_REDIRECT_URL = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/retailer/submission-history` : "http://localhost:5173/retailer/submission-history";

  const order_id = `SUBMISSION_${submission._id}_${Date.now()}`;
  const payload = {
    token: ALLAPI_TOKEN,
    order_id,
    txn_amount: amount,
    txn_note: `Retry payment for submission`,
    product_name: `Service Submission Retry`,
    customer_name: req.user.name,
    customer_mobile: req.user.mobile,
    customer_email: req.user.email,
    redirect_url: ALLAPI_REDIRECT_URL,
  };

  try {
    const response = await axios.post(ALLAPI_URL, payload);
    const result = response?.data;

    if (result?.status === true && result?.results?.payment_url) {
      submission.paymentMethod = 'online';
      submission.paymentOrderId = order_id; // Store the new order ID
      await submission.save();
      return res.json({ ok: true, payment_url: result.results.payment_url, order_id });
    }

    return res.status(400).json({ ok: false, message: result?.message || "Failed to create payment order" });

  } catch (error) {
    console.error("❌ AllAPI Order Error:", error.message);
    return res.status(500).json({ ok: false, message: "Error creating payment order with AllAPI" });
  }
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

export const getRetailerDashboardStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;

  // 1. Get stats for the current month
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 2. Get count of paid applications this month
  const monthlyApplicationsCount = await Submission.countDocuments({
    retailerId,
    paymentStatus: 'paid',
    createdAt: { $gte: startDate, $lt: endDate },
  });

  // 3. Get service usage data for the chart (top 5 services this month)
  const serviceUsage = await Submission.aggregate([
    // Match submissions for the current retailer in the current month
    { $match: { retailerId, createdAt: { $gte: startDate, $lt: endDate } } },
    // Join with the services collection to get the service name
    { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
    // Deconstruct the service array
    { $unwind: '$service' },
    // Group by service name and count applications
    { $group: { _id: '$service.name', applications: { $sum: 1 } } },
    // Sort by count in descending order
    { $sort: { applications: -1 } },
    // Limit to the top 5
    { $limit: 5 },
    // Reshape the output
    { $project: { _id: 0, name: '$_id', applications: '$applications' } },
  ]);

  res.json({
    ok: true,
    monthlyApplicationsCount,
    serviceUsage,
  });
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
