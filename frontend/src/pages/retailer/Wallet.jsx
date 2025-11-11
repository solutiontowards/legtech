import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getWalletBalance,
  getTransactions,
  createPaymentOrderForWallet,
  checkOrderStatus,
  getRecentTransactions,
} from "../../api/wallet";
import {
  Wallet as WalletIcon,
  IndianRupee,
  Loader2,
  AlertCircle,
  Receipt,
  ArrowUpCircle,
  ArrowDownCircle,
  PlusCircle,
  XCircle, // Import the XCircle icon for failed transactions
} from "lucide-react";
import Swal from "sweetalert2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);

  /* --------------------------------------------
     🔹 Fetch Wallet Data
  ---------------------------------------------*/
  const fetchWalletBalance = async () => {
    try {
      const { data } = await getWalletBalance();
      if (data.ok) setBalance(data.balance);
    } catch (err) {
      console.error("Balance Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      const { data } = await getRecentTransactions();
      if (data.ok) setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Transaction Fetch Error:", err);
    }
  };

  /* --------------------------------------------
     🔹 Verify Payment Redirect
  ---------------------------------------------*/
  const verifyPaymentRedirect = async (orderId) => {
    if (verifying || !orderId) return;
    setVerifying(true);
    navigate("/retailer/wallet", { replace: true }); // Clean URL immediately

    Swal.fire({
      title: "Verifying Payment...",
      html: "Please wait while we confirm your payment.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const { data } = await checkOrderStatus({ order_id: orderId });
      Swal.close();

      if (data.ok && data.order.status === "Success") { // Check for string "Success"
        Swal.fire({
          title: "Wallet Recharged! 🎉",
          text: `₹${data.order.txn_amount} has been added to your wallet.`,
          icon: "success",
          confirmButtonColor: "#2563EB",
        });
        await Promise.all([fetchWalletBalance(), fetchWalletTransactions()]);
      } else if (data.ok && data.order.status !== "Success") { // Check for any non-success status
        Swal.fire("Payment Failed", "Your payment could not be completed.", "error");
      } else {
        Swal.fire("Payment Pending", "Your transaction is still processing.", "info");
      }
    } catch (error) {
      Swal.close();
      console.error("Payment Verification Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to verify payment. Please contact support if the issue persists.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setVerifying(false);
    }
  };

  /* --------------------------------------------
     🔹 Handle Add Money
  ---------------------------------------------*/
  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount < 1) {
      Swal.fire("Invalid Amount", "Please enter a minimum amount of ₹1 to add.", "warning");
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await createPaymentOrderForWallet({ amount });
      if (data.ok && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.message || "Failed to create payment order.");
      }
    } catch (error) {
      console.error("Create Order Error:", error);
      Swal.fire("Error", error.message || "Could not initiate payment. Please try again.", "error");
      setIsProcessing(false);
    }
  };

  /* --------------------------------------------
     🔹 On Component Mount
  ---------------------------------------------*/
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(location.search);
      if (params.has("order_id")) {
        // A payment redirect has occurred, verify it.
        verifyPaymentRedirect(params.get("order_id"));
      } else {
        // This is a normal page load, fetch wallet data.
        fetchWalletBalance();
        fetchWalletTransactions();
      }
    }
  }, [user, location.search]);

  /* --------------------------------------------
     🔹 Transaction Description Helper
  ---------------------------------------------*/
  const getTransactionDescription = (meta) => {
    // For backward compatibility with old string-based meta
    if (typeof meta === "string") {
      if (meta.startsWith("WALLET_")) return "Wallet Recharge";
      return "Transaction";
    }
    if (meta?.reason === "service purchase") return `Wallet Payment for Service`;
    if (meta?.reason === "Online Service Payment") return `Online Payment for Service`;
    if (meta?.reason?.startsWith("Payment Failed")) return `Failed: ${meta.reason}`;
    if (meta?.reason === "service purchase retry") return "Retry Payment for Submission";
    if (meta?.reason) return `Manual Credit: ${meta.reason}`;
    return "Transaction";
  };

  const handleAmountChange = (e) => {
    const { value } = e.target;
    // Prevent non-numeric values, multiple dots, and negative signs.
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setRechargeAmount(value);
    }
  };

  const isValidAmount = parseFloat(rechargeAmount) >= 1;
  /* --------------------------------------------
     💎 UI
  ---------------------------------------------*/
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 💰 Wallet Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex justify-between items-center">
              <span className="text-sm opacity-80">Wallet Balance</span>
              <WalletIcon className="w-8 h-8 opacity-80" />
            </div>

            {loading ? (
              <div className="flex justify-center mt-10">
                <Loader2 className="animate-spin w-10 h-10 text-white" />
              </div>
            ) : (
              <h1 className="text-5xl font-bold mt-6 tracking-tight">
                ₹{balance.toFixed(2)}
              </h1>
            )}

            {!loading && balance < 99 && (
              <div className="mt-6 flex items-center gap-2 bg-yellow-400/20 text-yellow-200 px-3 py-2 rounded-lg text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                Low Balance — Top up soon
              </div>
            )}
          </div>

          {/* Add Money Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-blue-600" />
              Add Money
            </h2>
            <p className="text-gray-500 mb-6">
              Choose or enter an amount to recharge your wallet securely.
            </p>

            <form onSubmit={handleAddMoney} className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {[100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRechargeAmount(val.toString())}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all border ${
                      rechargeAmount === val.toString()
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={rechargeAmount}
                  onChange={handleAmountChange}
                  placeholder="Or enter custom amount"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isProcessing || verifying || !isValidAmount}
                className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
              >
                {isProcessing ? (
                  <span className="flex justify-center items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" /> Processing...
                  </span>
                ) : isValidAmount ? (
                  `Add ₹${rechargeAmount} to Wallet`
                ) : (
                  'Add to Wallet'
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* 🧾 Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 overflow-x-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
            </div>
            <Link
              to="/retailer/transaction"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading...</div>
          ) : transactions.length > 0 ? (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-600 text-xs uppercase tracking-wide">
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {tx.type === "credit" ? (
                          <ArrowDownCircle className="text-green-600 w-5 h-5" />
                        ) : tx.type === 'debit' ? (
                          <ArrowUpCircle className="text-red-600 w-5 h-5" />
                        ) : (
                          <XCircle className="text-gray-500 w-5 h-5" />
                        )}
                        <div>
                          <p className="text-gray-900 font-medium">
                            {getTransactionDescription(tx.meta)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-semibold ${
                        tx.type === "credit" ? "text-green-600" : tx.type === 'debit' ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : tx.type === 'debit' ? "-" : ""}₹{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center text-gray-500 text-sm">
              No recent transactions found.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Wallet;
