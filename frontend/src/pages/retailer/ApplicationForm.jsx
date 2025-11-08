

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getServiceOptionDetail, createSubmission, getWalletBalance } from "../../api/retailer";
import { uploadSingle } from "../../api/upload";
import Swal from "sweetalert2";
import { Loader2, Upload, File, Wallet, X, AlertCircle, CreditCard, Trash2, CheckCircle2, ArrowLeft } from "lucide-react";

const FieldRenderer = ({ field, register, errors, watch, setValue }) => {
    const fieldName = field.name;
    const errorMessage = errors[fieldName]?.message;
    const fileList = watch(fieldName);
    const selectedFile = fileList?.[0];
    if (field.type === "file") {
        return (
            <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
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
                    <div className={`relative px-6 py-10 border-2 border-dashed rounded-xl transition-all cursor-pointer ${errorMessage ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50"}`}>
                        <input type="file" id={fieldName} className="sr-only" accept={field.accept || "*"} {...register(fieldName, { required: field.required ? `${field.label} is required` : false })} />
                        <label htmlFor={fieldName} className="flex flex-col items-center gap-2 cursor-pointer">
                            <div className="p-3 bg-blue-100 rounded-full">
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
                    <div className="mt-2 flex items-center gap-1.5 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
            </div>
        );
    }
    if (field.type === "textarea") {
        return (
            <div className="sm:col-span-2">
                <label htmlFor={fieldName} className="block text-sm font-semibold text-gray-800 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea id={fieldName} {...register(fieldName, { required: field.required ? `${field.label} is required` : false })} rows={4} className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none font-medium ${errorMessage ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}`} placeholder={field.placeholder} />
                {errorMessage && (
                    <div className="mt-2 flex items-center gap-1.5 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="sm:col-span-1">
            <label htmlFor={fieldName} className="block text-sm font-semibold text-gray-800 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input type={field.type} id={fieldName} {...register(fieldName, { required: field.required ? `${field.label} is required` : false })} className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none font-medium ${errorMessage ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}`} placeholder={field.placeholder} />
            {errorMessage && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errorMessage}</p>
                </div>
            )}
        </div>
    );
};
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
                const errorMessage = error.response?.data?.message || "Failed to load service details.";
                // Show alert and navigate back
                Swal.fire({
                    title: "Not Available",
                    text: errorMessage,
                    icon: "warning",
                    confirmButtonText: "Go Back to Services",
                    allowOutsideClick: false,
                }).then(() => {
                    navigate("/retailer/services");
                });
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
        Swal.fire({
            title: 'Submitting Application...',
            text: 'Please wait while we process your submission.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

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
                Swal.update({
                    title: 'Uploading Files...',
                    text: 'This might take a moment.'
                });
                await Promise.all(fileUploadPromises);
            }

            Swal.update({ title: 'Finalizing Submission...' });

            const payload = {
                optionId: option._id,
                data: processedData,
                paymentMethod,
            };

            const { data: responseData } = await createSubmission(payload);

            if (responseData.paymentFailed) {
                await Swal.fire({
                    title: "Insufficient Funds",
                    text: "Your application has been submitted, but the payment failed due to insufficient wallet balance. You can retry the payment from your submission history.",
                    icon: "warning",
                    confirmButtonText: "OK",
                    customClass: { popup: "rounded-2xl", confirmButton: "rounded-lg bg-orange-500 hover:bg-orange-600" },
                });
                refreshUser();
                navigate("/retailer/submission-history");

            } else if (paymentMethod === 'online' && responseData.payment_url) {
                Swal.update({ title: 'Redirecting to Payment...', text: 'You will be redirected to complete the payment.' });
                window.location.href = responseData.payment_url;

            } else {
                await Swal.fire({
                    title: "Success!",
                    text: "Your application has been submitted successfully.",
                    icon: "success",
                    confirmButtonText: "OK",
                    allowOutsideClick: false,
                    customClass: { popup: "rounded-2xl", confirmButton: "rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" },
                });
                refreshUser();
                navigate("/retailer/submission-history");
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "An unexpected error occurred";
            await Swal.fire({
                title: "Submission Failed",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Try Again",
                customClass: { popup: "rounded-2xl", confirmButton: "rounded-lg bg-red-600 hover:bg-red-700" },
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-gray-600 font-medium">Loading service details...</p>
                </div>
            </div>
        );
    }

    if (!option) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">{option.name}</h1>
                                <p className="text-sm text-gray-500">Complete the form to submit your application</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                        {/* Left Section - Form Fields */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                                    <p className="text-gray-500 mt-1">Please provide the following information accurately.</p>
                                </div>

                                {option.formFields?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                        {option.formFields.map((field) => (
                                            <FieldRenderer key={field._id} field={field} register={register} errors={errors} watch={watch} setValue={setValue} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                        <p className="text-gray-700 font-medium">No additional information required.</p>
                                        <p className="text-sm text-gray-500">You can proceed to payment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar - Payment Info */}
                        <div className="lg:col-span-1 mt-8 lg:mt-0">
                            <div className="lg:sticky lg:top-24 space-y-6">
                                {/* Order Summary Card */}
                                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Summary</h3>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Service Cost</span>
                                        <span className="font-medium text-gray-900">₹{option.price.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-dashed pt-4 flex justify-between items-center text-lg">
                                        <span className="font-bold text-gray-900">Total Amount</span>
                                        <span className="font-extrabold text-blue-600">₹{option.price.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Method Card */}
                                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                                    {/* Wallet Option */}
                                    <div onClick={() => setPaymentMethod("wallet")} className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${paymentMethod === "wallet" ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 bg-white hover:border-blue-400"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Wallet className={`w-6 h-6 ${paymentMethod === "wallet" ? "text-blue-600" : "text-gray-600"}`} />
                                                <div>
                                                    <p className="font-bold text-gray-900">Wallet</p>
                                                    <p className={`text-sm font-semibold ${hasSufficientFunds ? "text-green-600" : "text-red-600"}`}>
                                                        Balance: ₹{walletBalance !== null ? walletBalance.toFixed(2) : "..."}
                                                    </p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'wallet' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                        </div>
                                        {paymentMethod === "wallet" && !hasSufficientFunds && walletBalance !== null && (
                                            <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2 rounded-md border border-red-200">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                <span>Insufficient balance. Form will be submitted and payment will be marked as failed.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Online Payment Option */}
                                    <div onClick={() => setPaymentMethod("online")} className={`p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${paymentMethod === "online" ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200" : "border-gray-200 bg-white hover:border-blue-400"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <CreditCard className={`w-6 h-6 ${paymentMethod === "online" ? "text-blue-600" : "text-gray-600"}`} />
                                                <div>
                                                    <p className="font-bold text-gray-900">Online Payment</p>
                                                    <p className="text-sm text-gray-500">UPI, Cards, Netbanking</p>
                                                </div>
                                            </div>
                                            {paymentMethod === 'online' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-6">
                                    <button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="w-full px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30">
                                        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                        {isSubmitting ? 'Processing...' : (paymentMethod === "wallet" ? "Pay & Submit" : "Proceed to Pay")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ApplicationForm;