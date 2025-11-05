import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getWalletBalance,
  getTransactions,
  createRechargeOrder,
  checkOrderStatus,
} from "../../api/wallet";
import {
  Wallet as WalletIcon,
  IndianRupee,
  Loader2,
  AlertCircle,
  Receipt,
} from "lucide-react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);

  /**
   * 🔹 Fetch wallet balance
   */
  const fetchWalletBalance = async () => {
    try {
      const { data } = await getWalletBalance();
      if (data.ok) setBalance(data.balance);
      else Swal.fire("Error", "Failed to load wallet balance.", "error");
    } catch (err) {
      console.error("Balance Error:", err);
      Swal.fire("Error", "Unable to fetch wallet balance.", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🔹 Fetch transactions
   */
  const fetchWalletTransactions = async () => {
    try {
      const { data } = await getTransactions();
      if (data.ok) setTransactions(data.transactions);
    } catch (err) {
      console.error("Transaction Fetch Error:", err);
    }
  };

  /**
   * 🔹 Verify payment redirect from AllAPI
   */
  const verifyPaymentRedirect = async () => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("order_id");
    if (!orderId) return;

    // Avoid verifying multiple times
    if (verifying) return;
    setVerifying(true);

    const progress = Swal.fire({
      title: "Verifying Payment...",
      html: "Please wait while we confirm your payment.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const { data } = await checkOrderStatus({ order_id: orderId });
      Swal.close();

      if (data.ok && data.order.status === "Success") {
        Swal.fire({
          title: "Payment Successful 🎉",
          text: `₹${data.order.txn_amount} has been added to your wallet.`,
          icon: "success",
          confirmButtonColor: "#2563EB",
        });
        await Promise.all([fetchWalletBalance(), fetchWalletTransactions()]);
        navigate("/retailer/wallet", { replace: true });
      } else if (data.ok && data.order.status === "Failed") {
        Swal.fire("Payment Failed", "Your payment could not be completed.", "error");
      } else {
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
  const handleAddMoney = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0)
      return Swal.fire("Invalid Amount", "Please enter a valid amount.", "error");

    setIsProcessing(true);
    try {
      const { data } = await createRechargeOrder({ amount: numericAmount });
      if (data.ok && data.payment_url) {
        window.location.href = data.payment_url; // Redirect to payment gateway
      } else {
        Swal.fire("Error", data.message || "Failed to create payment order.", "error");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      Swal.fire("Error", "Something went wrong while starting payment.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 🔹 Initial Load
   */
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchWalletTransactions();
      verifyPaymentRedirect();
    }
  }, [user]);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 💰 Wallet Balance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Balance Display */}
          <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl">
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Add Money to Wallet</h2>
            <p className="text-gray-500 mb-6">
              Select or enter an amount to recharge your wallet.
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              {[100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    amount === val.toString()
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Or enter a custom amount"
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <button
              onClick={handleAddMoney}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg font-bold text-white transition-transform ${
                isProcessing
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" /> Processing...
                </span>
              ) : (
                "Proceed to Add Money"
              )}
            </button>
          </div>
        </div>

        {/* 🧾 Transaction History */}
        <div className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
          </div>

          {transactions.length > 0 ? (
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-5 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-5 py-3 border-b text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 border-b text-sm capitalize">
                      {tx.type}
                    </td>
                    <td
                      className={`px-5 py-4 border-b text-sm font-semibold ${
                        tx.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 border-b text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500 text-sm py-6 text-center">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
