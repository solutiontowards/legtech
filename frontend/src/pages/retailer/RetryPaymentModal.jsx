
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getWalletBalance, retrySubmissionPayment, verifyRazorpayPayment } from "../../api/retailer";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Wallet, X, AlertCircle, CreditCard } from "lucide-react";
import Swal from "sweetalert2";
import { useRazorpay } from "react-razorpay";

const RetryPaymentModal = ({ submission, onClose, onSuccess }) => {
  const { user, refreshUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const Razorpay = useRazorpay();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await getWalletBalance();
        setWalletBalance(data.balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
        setWalletBalance(user?.wallet?.balance ?? null);
      }
    };
    fetchBalance();
  }, [user?.wallet?.balance]);

  const hasSufficientFunds = walletBalance != null && submission?.amount != null && walletBalance >= submission.amount;

  const handleWalletPayment = async () => {
    if (!hasSufficientFunds) {
      toast.error("Insufficient wallet balance. Please add funds.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing wallet payment...");

    try {
      await retrySubmissionPayment(submission._id, { paymentMethod: "wallet" });
      toast.success("Payment successful!", { id: toastId });
      await Swal.fire("Success!", "Payment completed successfully.", "success");
      refreshUser();
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Payment failed. Please try again.";
      toast.error(errorMessage, { id: toastId });
      await Swal.fire("Payment Failed", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnlinePayment = async () => {
    setIsSubmitting(true);
    const toastId = toast.loading("Initializing online payment...");

    try {
      const { data } = await retrySubmissionPayment(submission._id, { paymentMethod: "online" });
      toast.dismiss(toastId);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "Legtech",
        description: `Payment for Submission #${submission._id.slice(-6)}`,
        order_id: data.order.id,
        handler: async (response) => {
          const verificationToast = toast.loading("Verifying payment...");
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              submissionId: submission._id,
            });
            toast.success("Payment successful!", { id: verificationToast });
            await Swal.fire("Success!", "Payment completed successfully.", "success");
            onSuccess();
          } catch (err) {
            toast.error("Payment verification failed.", { id: verificationToast });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#2A2185",
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment was not completed.");
          },
        },
      };
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to initialize payment.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === "wallet") {
      handleWalletPayment();
    } else {
      handleOnlinePayment();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-5 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-gray-800">Retry Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-600">Amount to Pay</p>
            <p className="text-3xl font-bold text-blue-600">₹{submission.amount.toFixed(2)}</p>
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-3">Select Payment Method</h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "wallet" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className={`w-6 h-6 ${paymentMethod === "wallet" ? "text-blue-600" : "text-gray-600"}`} />
                  <div>
                    <p className="font-bold text-gray-900">Wallet</p>
                    <p className={`text-sm font-semibold ${hasSufficientFunds ? "text-green-600" : "text-red-600"}`}>
                      Balance: ₹{walletBalance !== null ? walletBalance.toFixed(2) : "..."}
                    </p>
                  </div>
                </div>
                {paymentMethod === "wallet" && !hasSufficientFunds && walletBalance !== null && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Insufficient balance. Please add funds.</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "online" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className={`w-6 h-6 ${paymentMethod === "online" ? "text-blue-600" : "text-gray-600"}`} />
                  <div>
                    <p className="font-bold text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-600">UPI, Cards, Netbanking</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (paymentMethod === "wallet" && !hasSufficientFunds)}
            className="px-8 py-2.5 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetryPaymentModal;