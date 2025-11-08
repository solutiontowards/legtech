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
} from "lucide-react";
import Swal from "sweetalert2";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

  /**
   * 🔹 Fetch wallet balance
   */
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

  /**
   * 🔹 Fetch transactions
   */
  const fetchWalletTransactions = async () => {
    try {
      const { data } = await getRecentTransactions();
      if (data.ok) setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Transaction Fetch Error:", err);
    }
  };

  /**
   * 🔹 Verify payment redirect from AllAPI
   * This runs once when the component loads if there's an order_id in the URL.
   */
  const verifyPaymentRedirect = async (orderId) => {
    const params = new URLSearchParams(location.search);
    // Avoid re-verifying if already in process
    if (verifying || !orderId) return;

    setVerifying(true);

    // Show a loading Swal
    const progress = Swal.fire({
      title: "Verifying Payment...",
      html: "Please wait while we confirm your payment.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Call backend to check the order status
      const { data } = await checkOrderStatus({ order_id: orderId });
      Swal.close();

      if (data.ok && data.order.status === "Success") {
        // Success!
        Swal.fire({
          title: "Payment Successful 🎉",
          text: `₹${data.order.txn_amount} has been added to your wallet.`,
          icon: "success",
          confirmButtonColor: "#2563EB",
        });
        // Refresh wallet data and clear the URL params
        await Promise.all([fetchWalletBalance(), fetchWalletTransactions()]);
        navigate("/retailer/wallet", { replace: true });
      } else if (data.ok && data.order.status === "Failed") {
        // Failed
        Swal.fire("Payment Failed", "Your payment could not be completed.", "error");
        navigate("/retailer/wallet", { replace: true });
      } else {
        // Pending or other status
        Swal.fire("Payment Pending", "Your transaction is still processing.", "info");
      }
    } catch (error) {
      Swal.close();
      console.error("Payment Verification Error:", error);
      Swal.fire("Error", "Failed to verify payment. Try again later.", "error");
    } finally {
      setVerifying(false);
    }
  };

  /**
   * 🔹 Handle Add Money action
   */
  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);

    if (isNaN(amount) || amount <= 0) {
      Swal.fire("Invalid Amount", "Please enter a valid amount to add.", "warning");
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await createPaymentOrderForWallet({ amount });
      if (data.ok && data.payment_url) {
        // Redirect user to the payment gateway
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

  /**
   * 🔹 Initial Load
   */
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(location.search);
      const orderId = params.get("order_id");

      // If there's an order_id, verify it. Otherwise, just load data.
      if (orderId) {
        verifyPaymentRedirect(orderId);
      } else {
        fetchWalletBalance();
        fetchWalletTransactions();
      }
    }
  }, [user, location.search]); // Depend on location.search to re-trigger on redirect

  const getTransactionDescription = (meta) => {
    if (typeof meta === 'string' && meta.startsWith('WALLET_')) return `Wallet Recharge`;
    if (meta?.reason === "service purchase") return `Payment for ${meta.optionId?.name || 'a service'}`;
    if (meta?.reason === "service purchase retry") return `Retry payment for submission`;
    if (meta?.reason) return `Manual Credit: ${meta.reason}`;
    return "General Transaction";
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 💰 Wallet Balance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Balance Display */}
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Available Balance</span>
              <WalletIcon className="w-8 h-8 opacity-60" />
            </div>

            {loading ? (
              <div className="flex justify-center mt-8">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            ) : (
              <p className="text-5xl font-bold mt-4 tracking-tight">
                ₹{balance.toFixed(2)}
              </p>
            )}

            {!loading && balance < 99 && (
              <div className="flex items-center gap-2 mt-6 bg-yellow-400/10 text-yellow-200 text-xs font-semibold px-3 py-1 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span>Low balance warning</span>
              </div>
            )}
          </div>

          {/* Right Side: Add Money */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleAddMoney}>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Add Money to Wallet</h2>
              <p className="text-gray-500 mb-6">
                Select or enter an amount to recharge your wallet.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {[100, 200, 500, 1000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setRechargeAmount(val.toString())}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${rechargeAmount === val.toString()
                        ? "bg-blue-600 text-white ring-2 ring-blue-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              <div className="relative mb-4">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Or enter a custom amount"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || verifying}
                className="w-full py-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" /> Processing...
                  </span>
                ) : (
                  `Proceed to Add ₹${parseFloat(rechargeAmount) || 0}`
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 🧾 Transaction History */}
        <div className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
              <div className="flex justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
            </div>
            <Link to="/retailer/transactions" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
          </div>
          {loading ? (
            <div className="text-gray-500 text-sm py-6 text-center">Loading transactions...</div>
          ) : transactions.length > 0 ? (
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction Details</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {tx.type === "credit" ? (
                            <ArrowDownCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowUpCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 font-medium whitespace-no-wrap">
                            {getTransactionDescription(tx.meta)}
                          </p>
                          <p className="text-gray-600 text-xs whitespace-no-wrap">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-5 py-4 border-b border-gray-200 text-sm font-semibold text-right ${tx.type === "credit" ? "text-green-600" : "text-red-600"
                        } `}
                    >
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500 text-sm py-10 text-center">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
