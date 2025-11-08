import asyncHandler from "express-async-handler";
import Wallet from "../models/Wallet.js";
import Submission from "../models/Submission.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import axios from "axios";

/**
 * 📘 Get Wallet Info (with transactions)
 */
export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ retailerId: req.user._id })
    .populate({
      path: "transactions",
      options: { sort: { createdAt: -1 } },
    });

  if (!wallet)
    return res.status(404).json({ ok: false, message: "Wallet not found" });

  res.json({ ok: true, wallet });
});

/**
 * 💳 Create Payment Order via AllAPI
 */
export const createPaymentOrderForWallet = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ ok: false, message: "Invalid amount" });
  }

  const ALLAPI_TOKEN = process.env.ALLAPI_TOKEN;
  const ALLAPI_URL = process.env.ALLAPI_URL;
  const ALLAPI_REDIRECT_URL = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/retailer/wallet` : "http://localhost:5173/retailer/wallet";

  const order_id = `WALLET_${req.user._id}_${Date.now()}`;
  const payload = {
    token: ALLAPI_TOKEN,
    order_id,
    txn_amount: amount,
    txn_note: `Wallet Recharge for ${req.user.name}`,
    product_name: "Wallet Recharge",
    customer_name: req.user.name,
    customer_mobile: req.user.mobile,
    customer_email: req.user.email,
    redirect_url: ALLAPI_REDIRECT_URL,
  };

  try {
    console.log(`🟦 Creating wallet payment order for user ${req.user._id}`);

    const response = await axios.post(ALLAPI_URL, payload);
    const result = response?.data;

    if (result?.status === true && result?.results?.payment_url) {
      console.log(`✅ Payment order created successfully: ${order_id}`);
      return res.json({
        ok: true,
        payment_url: result.results.payment_url,
        order_id,
      });
    }

    console.error(`⚠️ Failed to create order: ${result?.message}`);
    return res.status(400).json({
      ok: false,
      message: result?.message || "Failed to create payment order",
    });
  } catch (error) {
    console.error("❌ AllAPI Order Error:", error.message);
    return res.status(500).json({
      ok: false,
      message: "Error creating payment order with AllAPI",
    });
  }
});

/**
 * 🧾 Verify Payment & Credit Wallet
 */
export const checkOrderStatus = asyncHandler(async (req, res) => {
  const { order_id } = req.body;
  const ALLAPI_TOKEN = process.env.ALLAPI_TOKEN;
  const ALLAPI_STATUS_URL = process.env.ALLAPI_STATUS_URL;

  if (!order_id) {
    return res.status(400).json({ ok: false, message: "Missing order_id" });
  }

  try {
    console.log(`🔍 Checking status for order: ${order_id}`);

    const response = await axios.post(ALLAPI_STATUS_URL, {
      token: ALLAPI_TOKEN,
      order_id,
    });

    const result = response?.data;
    const order = result?.results;

    if (!result?.status || !order) {
      console.error("⚠️ Invalid AllAPI response:", result);
      return res.status(400).json({
        ok: false,
        message: result?.message || "Unable to verify payment",
      });
    }

    // ✅ If payment success, credit wallet
    if (order.status === "Success") {
      if (order.order_id.startsWith("WALLET_")) {
        const parts = order.order_id.split("_");
        const retailerId = parts[1];

        if (!retailerId || !mongoose.Types.ObjectId.isValid(retailerId)) {
          console.error("❌ Invalid WALLET order_id format:", order.order_id);
        } else {
          const retailerObjectId = new mongoose.Types.ObjectId(retailerId);
          let wallet = await Wallet.findOne({ retailerId: retailerObjectId });
          if (!wallet) {
            wallet = await Wallet.create({ retailerId: retailerObjectId });
            console.log(`🆕 New wallet created for retailer: ${retailerId}`);
          }

          const alreadyCredited = await Transaction.findOne({ walletId: wallet._id, meta: order.order_id });

          if (alreadyCredited) {
            console.log(`⚠️ Wallet transaction already credited: ${order.order_id}`);
          } else {
            const txnAmount = Number(order.txn_amount) || 0;
            const transaction = await Transaction.create({
              walletId: wallet._id,
              type: "credit",
              amount: txnAmount,
              meta: order.order_id,
            });
            wallet.balance += txnAmount;
            wallet.transactions.push(transaction._id);
            await wallet.save();
            console.log(`✅ Wallet credited for retailer ${retailerId}: ₹${txnAmount}`);
          }
        }
      } else if (order.order_id.startsWith("SUBMISSION_")) {
        const parts = order.order_id.split("_");
        const submissionId = parts[1];

        if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
          console.error("❌ Invalid SUBMISSION order_id format:", order.order_id);
        } else {
          const submission = await Submission.findById(submissionId);
          if (submission && submission.paymentStatus !== 'paid') {
            submission.paymentStatus = 'paid';
            submission.paymentOrderId = order.order_id; // Save the order ID
            submission.statusHistory.push({
              status: 'Payment Successful',
              remarks: `Online payment completed successfully. Order ID: ${order.order_id}`,
              updatedBy: submission.retailerId, // System/User action
            });
            await submission.save();
            console.log(`✅ Payment status updated to 'paid' for submission ${submissionId}`);
          } else if (submission) {
            console.log(`⚠️ Submission ${submissionId} payment was already marked as paid.`);
          } else {
            console.error(`❌ Submission with ID ${submissionId} not found for order ${order.order_id}`);
          }
        }
      } else {
        console.error(`❌ Unrecognized order_id prefix: ${order.order_id}`);
      }
    } else {
      console.log(`❌ Payment failed for ${order.order_id}: ${order.status}`);
    }

    return res.json({
      ok: true,
      order,
      message:
        order.status === "Success" 
          ? "Payment verified successfully"
          : "Payment not successful",
    });
  } catch (error) {
    console.error("❌ Error in checkOrderStatus:", error.message);
    return res.status(500).json({
      ok: false,
      message: "Server error while checking order status",
    });
  }
});

/**
 * 💵 Manual Admin Credit
 */
export const creditWallet = asyncHandler(async (req, res) => {
  const { walletId, amount, meta } = req.body;

  const wallet = await Wallet.findById(walletId);
  if (!wallet)
    return res.status(404).json({ ok: false, message: "Wallet not found" });

  const tx = await Transaction.create({
    walletId: wallet._id,
    type: "credit",
    amount,
    meta: { reason: meta }, // Store the reason in a structured object
  });

  wallet.balance += amount;
  wallet.transactions.push(tx._id);
  await wallet.save();

  res.json({ ok: true, wallet });
});

/**
 * 💰 Get Wallet Balance
 */
export const getWalletBalance = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ retailerId: req.user._id });
  if (!wallet)
    return res.status(404).json({ ok: false, message: "Wallet not found" });

  res.json({ ok: true, balance: wallet.balance });
});

/**
 * 📜 Get Transactions
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ retailerId: req.user._id });
  if (!wallet)
    return res.status(404).json({ ok: false, message: "Wallet not found" });

  const transactions = await Transaction.find({ walletId: wallet._id }).sort({
    createdAt: -1,
  });

  res.json({ ok: true, transactions });
});


// ✅ Get last 10 recent transactions
export const getRecentTransactions = asyncHandler(async (req, res) => {
  // Find wallet for the logged-in retailer
  const wallet = await Wallet.findOne({ retailerId: req.user._id });

  if (!wallet) {
    return res.status(404).json({ ok: false, message: "Wallet not found" });
  }

  // Fetch only the 10 most recent transactions
  const transactions = await Transaction.find({ walletId: wallet._id })
    .sort({ createdAt: -1 })
    .limit(10);

  // Send response
  res.status(200).json({
    ok: true,
    transactions,
  });
});
