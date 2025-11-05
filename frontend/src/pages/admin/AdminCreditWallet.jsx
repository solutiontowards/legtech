import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { getRetailers, creditWallet } from "../../api/admin";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Select from "react-select";
import { Wallet, IndianRupee, MessageSquare, Loader2 } from "lucide-react";

const AdminCreditWallet = () => {
  const [retailers, setRetailers] = useState([]);
  const [loadingRetailers, setLoadingRetailers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const { data } = await getRetailers();
        if (data.ok) {
          const options = data.retailers.map((r) => ({
            value: r.walletId,
            label: `${r.name} (${r.mobile})`,
          }));
          setRetailers(options);
        }
      } catch (error) {
        toast.error("Failed to load retailers.");
        console.error(error);
      } finally {
        setLoadingRetailers(false);
      }
    };
    fetchRetailers();
  }, []);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        walletId: formData.retailer.value,
        amount: parseFloat(formData.amount),
        meta: formData.meta, // This will be the reason string
      };

      await creditWallet(payload);

      Swal.fire({
        title: "Success!",
        text: `₹${payload.amount.toFixed(2)} has been credited to the selected retailer's wallet.`,
        icon: "success",
        confirmButtonText: "OK",
        customClass: { popup: "rounded-2xl" },
      });

      reset(); // Clear the form
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Try Again",
        customClass: { popup: "rounded-2xl" },
      });
      console.error("Credit Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Credit Wallet Manually</h1>
        </div>
        <p className="text-gray-500 mb-8">
          Select a retailer and enter the amount to credit their wallet.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Retailer
            </label>
            <Controller
              name="retailer"
              control={control}
              rules={{ required: "Please select a retailer." }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={retailers}
                  isLoading={loadingRetailers}
                  placeholder="Search for a retailer by name or mobile..."
                  isClearable
                  classNamePrefix="react-select"
                />
              )}
            />
            {errors.retailer && <p className="text-red-500 text-xs mt-1">{errors.retailer.message}</p>}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount to Credit
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { required: "Amount is required.", valueAsNumber: true, min: { value: 1, message: "Amount must be at least ₹1." } })}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., 500"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label htmlFor="meta" className="block text-sm font-semibold text-gray-700 mb-2">
              Reason / Remarks
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3.5 text-gray-400" />
              <textarea
                id="meta"
                {...register("meta", { required: "A reason for the credit is required." })}
                rows="3"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="e.g., Refund for failed transaction, Bonus credit, etc."
              />
            </div>
            {errors.meta && <p className="text-red-500 text-xs mt-1">{errors.meta.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Processing..." : "Credit Wallet"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreditWallet;