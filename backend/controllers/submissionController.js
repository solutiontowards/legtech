import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Option from '../models/Option.js';
import axios from 'axios';

// Helper function to generate a unique application number
async function generateUniqueApplicationNumber() {
  let applicationNumber;
  let isUnique = false;
  while (!isUnique) {
    // Generate an 8-digit random number
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    applicationNumber = `SRI${randomNumber}`;
    
    // Check if it already exists
    const existingSubmission = await Submission.findOne({ applicationNumber });
    if (!existingSubmission) {
      isUnique = true;
    }
  }
  return applicationNumber;
}

export const createSubmission = asyncHandler(async (req,res)=>{
  const { optionId, data, files, paymentMethod } = req.body;
  const option = await Option.findById(optionId).populate({ 
    path: 'subServiceId', 
    populate: {
      path: 'serviceId',
      select: 'name'
    } 
  });
  if (!option) return res.status(404).json({ error: 'Option not found' });
  const amount = option.retailerPrice || 0;

  if (paymentMethod === 'wallet') {
    const wallet = await Wallet.findOne({ retailerId: req.user._id });
    const hasSufficientFunds = wallet && wallet.balance >= amount;

    if (hasSufficientFunds) {
      const previousBalance = wallet.balance;
      wallet.balance -= amount;
      const updatedBalance = wallet.balance;
      await wallet.save();
      const serviceName = option.subServiceId?.serviceId?.name || option.name;

      const tx = await Transaction.create({
        walletId: wallet._id,
        type: 'debit',
        amount,
        meta: { reason: 'service purchase', optionId, serviceName: serviceName },
        previousBalance,
        updatedBalance,
      });

      const applicationNumber = await generateUniqueApplicationNumber();
      wallet.transactions.push(tx._id); await wallet.save();
      const submission = await Submission.create({ applicationNumber,
        retailerId: req.user._id, optionId, serviceId: option.subServiceId.serviceId, subServiceId: option.subServiceId._id, data, files, amount, paymentMethod, paymentStatus: 'paid', status: 'Applied',
        statusHistory: [{
          status: 'Applied',
          remarks: 'Application submitted by retailer.',
          updatedBy: req.user._id
        }]
      });
      return res.json({ ok:true, submission });
    } else {
      // **THE FIX**: Insufficient funds. Create submission and explicitly set both paymentStatus and status to 'failed'.
      const applicationNumber = await generateUniqueApplicationNumber();
      const submission = await Submission.create({ applicationNumber,
        retailerId: req.user._id, optionId, serviceId: option.subServiceId.serviceId, subServiceId: option.subServiceId._id, data, files, amount, paymentMethod: 'wallet', paymentStatus: 'failed', status: 'Payment Failed',
        statusHistory: [{
          status: 'Payment Failed',
          remarks: 'Submission created but payment failed due to insufficient wallet balance.',
          updatedBy: req.user._id,
        }]
      });
      return res.status(201).json({ ok: true, submission, paymentFailed: true, message: 'Insufficient wallet balance. Submission created with failed payment status.' });
    }
  }
  
  // For online payment, first create the submission record
  const applicationNumber = await generateUniqueApplicationNumber();
  const submission = await Submission.create({ applicationNumber,
    retailerId: req.user._id, optionId, serviceId: option.subServiceId.serviceId, subServiceId: option.subServiceId._id, data, files, amount, paymentMethod, paymentStatus: 'failed', status: 'Payment Failed',
    statusHistory: [{
      status: 'Payment Failed',
      remarks: 'Submission created but payment failed due to Payment Not Intilized.',
      updatedBy: req.user._id
    }]
  });

  // Then, create the payment order with AllAPI
  const ALLAPI_TOKEN = process.env.ALLAPI_TOKEN;
  const ALLAPI_URL = process.env.ALLAPI_URL;

  // **THE FIX:** The redirect URL is now a dedicated backend endpoint.
  const ALLAPI_REDIRECT_URL = `${process.env.API_URL || 'http://localhost:4000'}/api/payment/callback`;

  // **THE FIX:** Include retailerId in the order_id for transaction logging.
  const order_id = `SUBMISSION_${submission._id}_${req.user._id}_${Date.now()}`;
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

    // **THE FIX**: If online order creation fails, update submission to reflect payment failure in both statuses.
    console.error(`⚠️ Failed to create order: ${result?.message}`);
    submission.paymentStatus = 'failed';
    submission.status = 'Payment Failed';
    submission.statusHistory.push({
      status: 'Payment Failed',
      remarks: `Failed to initialize online payment: ${result?.message || 'Could not connect to payment gateway.'}`,
      updatedBy: req.user._id
    });
    await submission.save();
    return res.status(400).json({ ok: false, message: result?.message || "Failed to create payment order", paymentFailed: true });

  } catch (error) {
    console.error("❌ AllAPI Order Error:", error.message);
    // **THE FIX**: If there's a server error during the API call, also mark the submission as failed.
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
    const previousBalance = wallet.balance;
    wallet.balance -= amount;
    const updatedBalance = wallet.balance;

    const option = await Option.findById(submission.optionId).populate({
      path: 'subServiceId',
      populate: { path: 'serviceId', select: 'name' }
    });
    const serviceName = option?.subServiceId?.serviceId?.name || option?.name || 'a service';

    const tx = await Transaction.create({
      walletId: wallet._id,
      type: 'debit',
      amount,
      meta: { reason: 'service purchase retry', submissionId: submission._id, serviceName },
      previousBalance,
      updatedBalance,
    });
    wallet.transactions.push(tx._id);
    await wallet.save();

    // **THE FIX**: Update both paymentStatus and the main application status.
    submission.paymentStatus = 'paid';
    submission.paymentMethod = 'wallet';
    submission.status = 'Applied'; // Reset status to Submitted
    submission.statusHistory.push({
      status: 'Applied',
      remarks: 'Payment retry successful via wallet. Application has been re-submitted.',
      updatedBy: req.user._id
    });
    await submission.save();
    return res.json({ ok: true, submission });
  }

  // For online payment, create a new AllAPI order
  const ALLAPI_TOKEN = process.env.ALLAPI_TOKEN;
  const ALLAPI_URL = process.env.ALLAPI_URL;

  // **THE FIX:** The redirect URL is now a dedicated backend endpoint.
  const ALLAPI_REDIRECT_URL = `${process.env.API_URL || 'http://localhost:4000'}/api/payment/callback`;

  // **THE FIX:** Include retailerId in the order_id for transaction logging.
  const order_id = `SUBMISSION_${submission._id}_${req.user._id}_${Date.now()}`;
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
    .populate('retailerId', 'name mobile')
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
    .populate('retailerId', 'name mobile')
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
  const submission = await Submission.findById(submissionId).populate([
    { path: 'optionId', select: 'name' },
    { path: 'serviceId', select: 'name' }
  ]);

  if (!submission) return res.status(404).json({ error: 'Not found' });

  // --- REFUND LOGIC ---
  // If status is being updated to 'Reject | Failed' and the submission was paid for but not yet refunded
  if (status === 'Reject | Failed' && submission.paymentStatus === 'paid' && !submission.isRefunded) {
    const wallet = await Wallet.findOne({ retailerId: submission.retailerId });

    if (wallet) {
      const previousBalance = wallet.balance;
      wallet.balance += submission.amount; // Add the amount back to the wallet
      const updatedBalance = wallet.balance;

      // Create a credit transaction for the refund
      const refundTransaction = await Transaction.create({
        walletId: wallet._id,
        type: 'credit',
        amount: submission.amount,
        meta: {
          reason: 'Refund for cancelled service',
          serviceName: submission.serviceId?.name || submission.optionId?.name || 'N/A',
          submissionId: submission._id,
        },
        previousBalance,
        updatedBalance,
      });

      wallet.transactions.push(refundTransaction._id);
      await wallet.save();
      submission.isRefunded = true; // Mark as refunded
    }
  }

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
    {
      $match: {
        retailerId,
        paymentStatus: 'paid', // Ensure only paid submissions are counted
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
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

export const getApplicationStatusStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;

  // Define the specific statuses to be included in the stats
  const includedStatuses = [
    "Applied",
    "On Process",
    "Completed",
    "Reject | Failed",
    "On Hold",
  ];

  const stats = await Submission.aggregate([
    // Stage 1: Match only submissions for the logged-in retailer and with specific statuses
    {
      $match: {
        retailerId: retailerId,
        status: { $in: includedStatuses }, // Filter by the allowed statuses
      },
    },
    // Stage 2: Group documents by the 'status' field and count them
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    // Stage 3: Rename '_id' to 'status' for a cleaner output
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: "$count",
      },
    },
  ]);

  res.json({ ok: true, stats });
});

// =========================================================
// Profit & Revenue Statistics
// =========================================================

/**
 * Helper function to calculate profit over a given period.
 * Profit = customerPrice - retailerPrice
 */
const calculateProfitForPeriod = async (retailerId, startDate, endDate) => {
  const result = await Submission.aggregate([
    // Match paid submissions for the retailer within the date range
    {
      $match: {
        retailerId,
        paymentStatus: 'paid',
        createdAt: { $gte: startDate, $lt: endDate },
      },
    },
    // Join with options to get pricing
    {
      $lookup: {
        from: 'options',
        localField: 'optionId',
        foreignField: '_id',
        as: 'option',
      },
    },
    { $unwind: '$option' },
    // Calculate profit for each submission
    {
      $project: {
        profit: { $subtract: ['$option.customerPrice', '$option.retailerPrice'] },
      },
    },
    // Sum up the profit
    {
      $group: {
        _id: null,
        totalProfit: { $sum: '$profit' },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalProfit : 0;
};

/**
 * Helper function to calculate percentage change
 */
const calculateChange = (current, previous) => {
  if (previous > 0) {
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }
  return current > 0 ? 100 : 0;
};

export const getMonthlyProfitStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const now = new Date();

  // Current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const currentProfit = await calculateProfitForPeriod(retailerId, currentMonthStart, currentMonthEnd);

  // Previous month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousProfit = await calculateProfitForPeriod(retailerId, lastMonthStart, lastMonthEnd);

  const percentageChange = calculateChange(currentProfit, previousProfit);

  res.json({ ok: true, stats: { total: currentProfit, percentageChange } });
});

export const getWeeklyProfitStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const now = new Date();

  // Current week (starts on Sunday)
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 7);
  const currentProfit = await calculateProfitForPeriod(retailerId, currentWeekStart, currentWeekEnd);

  // Previous week
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  const lastWeekEnd = currentWeekStart;
  const previousProfit = await calculateProfitForPeriod(retailerId, lastWeekStart, lastWeekEnd);

  const percentageChange = calculateChange(currentProfit, previousProfit);

  res.json({ ok: true, stats: { total: currentProfit, percentageChange } });
});

export const getDailyProfitStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const now = new Date();

  // Today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const currentProfit = await calculateProfitForPeriod(retailerId, todayStart, new Date(todayEnd.getTime() + 1));

  // Yesterday
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayEnd);
  yesterdayEnd.setDate(todayEnd.getDate() - 1);
  const previousProfit = await calculateProfitForPeriod(retailerId, yesterdayStart, new Date(yesterdayEnd.getTime() + 1));

  const percentageChange = calculateChange(currentProfit, previousProfit);

  res.json({ ok: true, stats: { total: currentProfit, percentageChange } });
});

export const getTotalRevenue = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;

  const result = await Submission.aggregate([
    // Match all paid submissions for the retailer
    {
      $match: {
        retailerId,
        paymentStatus: 'paid',
      },
    },
    // Join with options to get pricing
    {
      $lookup: {
        from: 'options',
        localField: 'optionId',
        foreignField: '_id',
        as: 'option',
      },
    },
    { $unwind: '$option' },
    // Calculate profit for each submission
    {
      $project: {
        profit: { $subtract: ['$option.customerPrice', '$option.retailerPrice'] },
      },
    },
    // Sum up the total profit
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$profit' },
      },
    },
  ]);

  const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

  res.json({ ok: true, totalRevenue });
});

export const getTotalOrdersStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const now = new Date();

  // 1. Current Month's Stats (from the start of the month to now)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalOrdersThisMonth = await Submission.countDocuments({
    retailerId,
    paymentStatus: 'paid', // Only count paid submissions
    createdAt: { $gte: currentMonthStart },
  });

  // 2. Previous Month's Stats
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const totalOrdersLastMonth = await Submission.countDocuments({
    retailerId,
    paymentStatus: 'paid', // Only count paid submissions
    createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
  });

  // 3. Calculate Percentage Change
  let percentageChange = 0;
  if (totalOrdersLastMonth > 0) {
    percentageChange =
      ((totalOrdersThisMonth - totalOrdersLastMonth) / totalOrdersLastMonth) * 100;
  } else if (totalOrdersThisMonth > 0) {
    // If last month had 0 orders, any orders this month is infinite growth, so we show 100%
    percentageChange = 100;
  }

  res.json({
    ok: true,
    stats: {
      totalOrdersThisMonth,
      percentageChange: parseFloat(percentageChange.toFixed(1)), // Return as a number
    },
  });
});

export const getWeeklyOrdersStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const now = new Date();

  // Helper to get the start of the week (Sunday)
  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  // 1. Current Week's Stats (from Sunday to now)
  const startOfThisWeek = getStartOfWeek(now);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const totalOrdersThisWeek = await Submission.countDocuments({
    retailerId,
    paymentStatus: 'paid',
    createdAt: { $gte: startOfThisWeek },
  });

  // 2. Previous Week's Stats (from previous Sunday to Saturday)
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);

  const totalOrdersLastWeek = await Submission.countDocuments({
    retailerId,
    paymentStatus: 'paid',
    createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek },
  });

  // 3. Calculate Percentage Change
  let percentageChange = 0;
  if (totalOrdersLastWeek > 0) {
    percentageChange = ((totalOrdersThisWeek - totalOrdersLastWeek) / totalOrdersLastWeek) * 100;
  } else if (totalOrdersThisWeek > 0) {
    percentageChange = 100;
  }

  res.json({ ok: true, stats: { totalOrdersThisWeek, percentageChange: parseFloat(percentageChange.toFixed(1)) } });
});

export const getDailyOrdersStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const now = new Date();

  // 1. Today's Stats
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const totalOrdersToday = await Submission.countDocuments({
    retailerId,
    paymentStatus: 'paid',
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  // 2. Yesterday's Stats
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayEnd);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  const totalOrdersYesterday = await Submission.countDocuments({
    retailerId,
    paymentStatus: 'paid',
    createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
  });

  // 3. Calculate Percentage Change
  const percentageChange = calculateChange(totalOrdersToday, totalOrdersYesterday);

  res.json({
    ok: true,
    stats: {
      totalOrdersToday,
      percentageChange,
    },
  });
});

export const getStatusCardStats = asyncHandler(async (req, res) => {
  const retailerId = req.user._id;
  const now = new Date();

  // --- Date Ranges ---
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // --- Helper Function for Percentage Change ---
  const calculateChange = (current, previous) => {
    if (previous > 0) {
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    }
    return current > 0 ? 100 : 0;
  };

  // --- Database Queries (Concurrent) ---
  const [
    completedCurrentMonth,
    completedLastMonth,
    pendingTotal,
    cancelledCurrentMonth,
    cancelledLastMonth,
  ] = await Promise.all([
    // Completed Orders
    Submission.countDocuments({ retailerId, status: 'Completed', createdAt: { $gte: currentMonthStart } }),
    Submission.countDocuments({ retailerId, status: 'Completed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
    // Pending Orders (total count of 'Applied' status)
    Submission.countDocuments({ retailerId, status: 'Applied' }),
    // Cancelled Orders
    Submission.countDocuments({ retailerId, status: 'Reject | Failed', createdAt: { $gte: currentMonthStart } }),
    Submission.countDocuments({ retailerId, status: 'Reject | Failed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
  ]);

  // --- Calculate Percentages ---
  const completedChange = calculateChange(completedCurrentMonth, completedLastMonth);
  const cancelledChange = calculateChange(cancelledCurrentMonth, cancelledLastMonth);

  // --- Final Stats Object ---
  const stats = {
    completed: {
      total: await Submission.countDocuments({ retailerId, status: 'Completed' }),
      percentageChange: completedChange,
    },
    pending: {
      total: pendingTotal,
    },
    cancelled: {
      total: await Submission.countDocuments({ retailerId, status: 'Reject | Failed' }),
      percentageChange: cancelledChange,
    },
  };

  res.json({ ok: true, stats });
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


export const findDocumentByApplicationNumber = asyncHandler(async (req, res) => {
  const { applicationNumber } = req.params;
  const retailerId = req.user._id;

  const submission = await Submission.findOne({
    applicationNumber: applicationNumber.trim(),
    retailerId: retailerId,
  }).populate('serviceId', 'name');

  if (!submission) {
    return res.status(404).json({ message: "No submission found with this application number for your account." });
  }

  if (!submission.finalDocument) {
    return res.status(404).json({ message: "The final document for this application has not been uploaded by the admin yet." });
  }

  res.json({ ok: true, submission });
});

export const processDocumentDownloadPayment = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const retailerId = req.user._id;
  const downloadFee = 1; // The fee is ₹1

  const submission = await Submission.findOne({ _id: submissionId, retailerId });

  if (!submission) {
    return res.status(404).json({ message: "Submission not found." });
  }

  // If already paid, just return success
  if (submission.isFinalDocumentDownloaded) {
    return res.json({ ok: true, message: "Already paid. You can download the document." });
  }

  const wallet = await Wallet.findOne({ retailerId });
  if (!wallet || wallet.balance < downloadFee) {
    return res.status(400).json({ message: "Insufficient wallet balance. Please add funds to download." });
  }

  // Deduct fee and create transaction
  const previousBalance = wallet.balance;
  wallet.balance -= downloadFee;
  const updatedBalance = wallet.balance;

  await Transaction.create({
    walletId: wallet._id,
    type: 'debit',
    amount: downloadFee,
    meta: { reason: 'Fee for final document download', applicationNumber: submission.applicationNumber },
    previousBalance,
    updatedBalance,
  });

  submission.isFinalDocumentDownloaded = true;
  await submission.save();
  await wallet.save();

  res.json({ ok: true, message: "Payment successful. Document is now available for download." });
});
