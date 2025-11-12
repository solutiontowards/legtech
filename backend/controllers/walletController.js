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

  // **THE FIX:** The redirect URL is now a dedicated backend endpoint.
  // This endpoint will handle the POST data from the payment gateway.
  const ALLAPI_REDIRECT_URL = `${process.env.API_URL || 'http://localhost:4000'}/api/payment/callback`;

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
 * 🔄 Handle Payment Gateway Callback
 * This receives the POST request from the payment gateway and redirects the user
 * to the appropriate frontend page with a clean GET request.
 */

/**
 * 🔄 Handle Payment Gateway Callback
 * This receives the POST request from the payment gateway and redirects the user
 * to the appropriate frontend page with a clean GET request.
 */
export const paymentCallback = asyncHandler(async (req, res) => {
  const { order_id, status } = req.body;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  console.log(`↩️ Received payment callback for order: ${order_id} with status: ${status}`);

  if (order_id) {
    let redirectPath = "/"; // Default fallback
    if (order_id.startsWith("WALLET_")) {
      redirectPath = "/retailer/wallet";
    } else if (order_id.startsWith("SUBMISSION_")) {
      redirectPath = "/retailer/submission-history";
    }
    res.redirect(`${clientUrl}${redirectPath}?order_id=${order_id}`);
  } else {
    // If for some reason there's no order_id, redirect to the client's root.
    res.redirect(`${clientUrl}/`);
  }
});

/**
 * 헬퍼 함수: 지갑에 금액을 추가하고 트랜잭션을 생성합니다.
 * @param {string} retailerId - 소매업자 ID
 * @param {number} amount - 추가할 금액
 * @param {string} orderId - 주문 ID (메타데이터용)
 */
const creditWalletAndLogTransaction = async (retailerId, amount, orderId) => {
  if (!retailerId || !mongoose.Types.ObjectId.isValid(retailerId)) {
    console.error("❌ Invalid retailerId for wallet credit:", retailerId);
    return;
  }

  const retailerObjectId = new mongoose.Types.ObjectId(retailerId);
  let wallet = await Wallet.findOne({ retailerId: retailerObjectId });

  if (!wallet) {
    wallet = await Wallet.create({ retailerId: retailerObjectId });
    console.log(`🆕 New wallet created for retailer: ${retailerId}`);
  }

  const alreadyCredited = await Transaction.findOne({ walletId: wallet._id, meta: orderId });

  if (alreadyCredited) {
    console.log(`⚠️ Wallet transaction already credited: ${orderId}`);
  } else {
    const txnAmount = Number(amount) || 0;
    const transaction = await Transaction.create({
      walletId: wallet._id, type: "credit", amount: txnAmount, meta: orderId,
    });
    wallet.balance += txnAmount;
    wallet.transactions.push(transaction._id);
    await wallet.save();
    console.log(`✅ Wallet credited for retailer ${retailerId}: ₹${txnAmount}`);
  }
};

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
      order_id:order_id,
    });

    const result = response?.data;
    const order = result?.results;

    // **THE FIX: The API can return `status: false` even with valid `results`.
    // We only fail if the `results` object itself is missing or empty.
    if (!order || (Array.isArray(order) && order.length === 0)) {
      console.error("⚠️ Invalid AllAPI response:", result);
      return res.status(400).json({
        ok: false,
        // Use the API's message, but provide a fallback for true "not found" cases.
        message: result?.message || "Order ID not found or invalid.",
      });
    }

    // --- Main Payment Verification Logic ---
    if (order.status === "Success") {
      if (order.order_id.startsWith("WALLET_")) {
        const parts = order.order_id.split("_");
        const retailerId = parts[1];
        await creditWalletAndLogTransaction(retailerId, order.txn_amount, order.order_id);
      } else if (order.order_id.startsWith("SUBMISSION_")) {
        const parts = order.order_id.split("_");
        const submissionId = parts[1];

        if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
          console.error("❌ Invalid SUBMISSION order_id format:", order.order_id);
        } else {
          // **THE FIX: Create a debit transaction for successful online service payments**
          const retailerId = order.order_id.split("_")[2]; // Format: SUBMISSION_submissionId_retailerId_timestamp
          const retailerObjectId = new mongoose.Types.ObjectId(retailerId);
          const wallet = await Wallet.findOne({ retailerId: retailerObjectId });

          if (wallet) {
            // Check if debit already logged to prevent duplicates
            const alreadyDebited = await Transaction.findOne({ 'meta.orderId': order.order_id });
            if (!alreadyDebited) {
              await Transaction.create({
                walletId: wallet._id,
                type: 'debit',
                amount: Number(order.txn_amount) || 0,
                meta: { reason: 'Online Service Payment', orderId: order.order_id, submissionId: submissionId },
              });
              console.log(`✅ Created debit transaction for online payment: ${order.order_id}`);
            }
          }

          const submission = await Submission.findById(submissionId);
          if (submission && submission.paymentStatus !== 'paid') {
            submission.paymentStatus = 'paid';
            // **THE FIX**: If the status was 'Payment Failed', reset it to 'Submitted'.
            if (submission.status === 'Payment Failed') {
              submission.status = 'Applied';
            }
            submission.paymentOrderId = order.order_id; // Save the order ID
            submission.statusHistory.push({
              // Use a more descriptive status if it was a retry
              status: submission.status === 'Applied' ? 'Applied' : 'Payment Successful',
              remarks: `Online payment completed successfully (Order ID: ${order.order_id}). Application has been submitted.`,
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
      console.log(`❌ Payment failed or pending for ${order.order_id}: ${order.status}`);
      // **THE FIX: Create a 'failed' transaction record for auditing and get correct retailerId**
      let retailerId;
      const parts = order.order_id.split("_");
      if (order.order_id.startsWith("WALLET_")) {
        retailerId = parts[1];
      } else if (order.order_id.startsWith("SUBMISSION_")) {
        retailerId = parts[2]; // For SUBMISSION_, retailerId is the 3rd part
      }
      if (retailerId && mongoose.Types.ObjectId.isValid(retailerId)) {
        const retailerObjectId = new mongoose.Types.ObjectId(retailerId);
        const wallet = await Wallet.findOne({ retailerId: retailerObjectId });
        if (wallet) {
          await Transaction.create({
            walletId: wallet._id,
            type: 'failed', // A new type for failed transactions
            amount: Number(order.txn_amount) || 0,
            meta: {
              reason: `Payment${order.status}`,
              orderId: order.order_id,
            },
          });
          console.log(`🔶 Created 'failed' transaction record for order: ${order.order_id}`);
        }
      }
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
    .limit(5);

  // Send response
  res.status(200).json({
    ok: true,
    transactions,
  });
});
