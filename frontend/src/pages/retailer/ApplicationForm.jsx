"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getServiceOptionDetail, createSubmission, getWalletBalance } from "../../api/retailer";
import { uploadSingle } from "../../api/upload";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Upload, File, Wallet, X, AlertCircle, CreditCard, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

// Field Renderer Component (copied from ApplicationFormModal)
const FieldRenderer = ({ field, register, errors, watch, setValue }) => {
    const fieldName = field.name;
    const errorMessage = errors[fieldName]?.message;
    const fileList = watch(fieldName);
    const selectedFile = fileList?.[0];

    if (field.type === "file") {
        return (
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {selectedFile ? (
                    <div className="relative p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors">
                        <div className="flex items-center gap-3">
                            {selectedFile.type.startsWith("image/") ? (
                                <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-14 h-14 rounded-lg object-cover shadow-sm" />
                            ) : (
                                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                                    <File className="w-6 h-6 text-blue-600" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                                <p className="text-xs text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <button type="button" onClick={() => setValue(fieldName, null, { shouldValidate: true })} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`relative px-6 py-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${errorMessage ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}`}>
                        <input type="file" id={fieldName} className="sr-only" accept={field.accept || "*"} {...register(fieldName, { required: field.required ? `${field.label} is required` : false })} />
                        <label htmlFor={fieldName} className="flex flex-col items-center gap-2 cursor-pointer">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-900">Click to upload</p>
                                <p className="text-xs text-gray-600">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{field.placeholder || "Max file size: 10MB"}</p>
                        </label>
                    </div>
                )}
                {errorMessage && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
            </div>
        );
    }

    if (field.type === "textarea") {
        return (
            <div className="col-span-1 sm:col-span-2">
                <label htmlFor={fieldName} className="block text-sm font-semibold text-gray-900 mb-3">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea id={fieldName} {...register(fieldName, { required: field.required ? `${field.label} is required` : false })} rows={4} className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none font-medium ${errorMessage ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} placeholder={field.placeholder} />
                {errorMessage && (
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="col-span-1">
            <label htmlFor={fieldName} className="block text-sm font-semibold text-gray-900 mb-3">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input type={field.type} id={fieldName} {...register(fieldName, { required: field.required ? `${field.label} is required` : false })} className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none font-medium ${errorMessage ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} placeholder={field.placeholder} />
            {errorMessage && (
                <div className="mt-2 flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

// Main Page Component
const ApplicationForm = () => {
    const { serviceSlug, subServiceSlug, optionSlug } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [option, setOption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("wallet");
    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({ mode: "onBlur" });

    useEffect(() => {
        const fetchOption = async () => {
            setLoading(true);
            try {
                const { data } = await getServiceOptionDetail(serviceSlug, subServiceSlug, optionSlug);
                setOption(data.option);
                if (data.option.formFields) {
                    reset();
                }
            } catch (error) {
                toast.error("Failed to load service details");
                console.error(error);
                navigate("/retailer/services");
            } finally {
                setLoading(false);
            }
        };

        const fetchBalance = async () => {
            try {
                const { data } = await getWalletBalance();
                setWalletBalance(data.balance);
            } catch (error) {
                console.error("Failed to fetch wallet balance:", error);
                setWalletBalance(user?.wallet?.balance ?? null);
            }
        };

        fetchOption();
        fetchBalance();
    }, [serviceSlug, subServiceSlug, optionSlug, navigate, reset, user?.wallet?.balance]);

    const hasSufficientFunds = walletBalance != null && option?.price != null && walletBalance >= option.price;

    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        const toastId = toast.loading("Submitting application...");

        try {
            const processedData = { ...formData };
            const fileUploadPromises = [];

            option.formFields.forEach((field) => {
                if (field.type === "file" && processedData[field.name]?.[0]) {
                    const file = processedData[field.name][0];
                    const uploadPromise = uploadSingle(file).then((res) => {
                        processedData[field.name] = res.data.url;
                    });
                    fileUploadPromises.push(uploadPromise);
                }
            });

            if (fileUploadPromises.length > 0) {
                toast.loading("Uploading files...", { id: toastId });
                await Promise.all(fileUploadPromises);
            }

            toast.loading("Finalizing submission...", { id: toastId });

            const payload = {
                optionId: option._id,
                data: processedData,
                paymentMethod,
            };

            const { data: responseData } = await createSubmission(payload);

            if (responseData.paymentFailed) {
                toast.dismiss(toastId);
                await Swal.fire({
                    title: "Insufficient Funds",
                    text: "Your application has been submitted, but the payment failed due to insufficient wallet balance. You can retry the payment from your submission history.",
                    icon: "warning",
                    confirmButtonText: "OK",
                    customClass: { popup: "rounded-2xl", confirmButton: "rounded-lg bg-orange-500 hover:bg-orange-600" },
                });
            } else {
                toast.success("Application submitted successfully!", { id: toastId });
                await Swal.fire({
                    title: "Success!",
                    text: "Your application has been submitted successfully.",
                    icon: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: false,
                    customClass: { popup: "rounded-2xl", confirmButton: "rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" },
                });
            }

            refreshUser();
            navigate("/retailer/submission-history");

        } catch (error) {
            toast.error("Submission failed. Please try again.", { id: toastId });
            const errorMessage = error.response?.data?.message || "An unexpected error occurred";
            await Swal.fire({
                title: "Submission Failed",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Try Again",
                customClass: { popup: "rounded-2xl", confirmButton: "rounded-lg bg-red-600 hover:bg-red-700" },
            });
            console.error("Submission Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Toaster position="top-center" />
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-gray-600 font-medium">Loading service details...</p>
                </div>
            </div>
        );
    }

    if (!option) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
                <Toaster position="top-center" />
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Service Not Found</h2>
                    <p className="text-gray-600 mb-6">The service you're looking for is no longer available.</p>
                    <button onClick={() => navigate("/retailer/services")} className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all">
                        Back to Services
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />
            <div className="bg-white shadow-md">
                {/* Header */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{option.name}</h1>
                            <p className="text-gray-600 mt-1">Complete the form below to submit your application</p>
                        </div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Form Content */}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col lg:flex-row">
                        {/* Left Sidebar - Payment Info */}
                        <div className="w-full lg:w-80 xl:w-96 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-8">
                            <div className="space-y-8 sticky top-8">
                                {/* Price Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                                    <div className="bg-white rounded-xl p-4 space-y-3 border-2 border-gray-200">
                                        <div className="flex justify-between items-center text-gray-700">
                                            <span className="font-medium">Service Cost</span>
                                            <span className="font-bold text-gray-900">₹{option.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-700">
                                            <span className="font-medium">Platform Fee</span>
                                            <span className="font-bold text-gray-900">₹0.00</span>
                                        </div>
                                        <div className="border-t-2 border-gray-200 pt-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900">Total Amount</span>
                                                <span className="text-2xl font-bold text-blue-600">₹{option.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                                    <div className="space-y-3">
                                        {/* Wallet Option */}
                                        <button type="button" onClick={() => setPaymentMethod("wallet")} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "wallet" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}>
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
                                                    <span>Insufficient balance. Form will be submitted and payment will be marked as failed.</span>
                                                </div>
                                            )}
                                        </button>

                                        {/* Online Payment Option */}
                                        <button type="button" onClick={() => setPaymentMethod("online")} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "online" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}>
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
                        </div>

                        {/* Right Section - Form Fields */}
                        <div className="flex-1 p-8">
                            <div className="max-w-3xl">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Details</h2>
                                <p className="text-gray-600 mb-8">Please provide the following information</p>

                                {option.formFields?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
                                        {option.formFields.map((field) => (
                                            <FieldRenderer key={field._id} field={field} register={register} errors={errors} watch={watch} setValue={setValue} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium">No additional information required for this service</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 flex justify-end gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-semibold text-gray-900 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                            Cancel
                        </button>
                        <button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {paymentMethod === "wallet" ? "Pay & Submit" : "Proceed to Pay"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationForm;