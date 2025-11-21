import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import {
    Search,
    FileSearch,
    Send,
    Loader2,
    AlertCircle,
    Hash,
    Tag,
    Calendar,
    Info,
    MessageSquare,
    History
} from 'lucide-react';

import {
    findDocumentByApplicationNumber,
    raiseComplaint
} from '../../api/retailer';


// -------------------- Detail Item --------------------
const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="bg-gray-100 p-2 rounded-md">
            <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-base text-gray-800 font-semibold">{value}</p>
        </div>
    </div>
);


// -------------------- Complaint History Item --------------------
const ComplaintHistoryItem = ({ complaint, isLast }) => (
    <div
        className={`p-4 rounded-lg border ${
            isLast ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
        }`}
    >
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-800">
                Complaint on {new Date(complaint.createdAt).toLocaleDateString()}
            </p>

            <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full capitalize ${
                    complaint.status === 'Closed'
                        ? 'bg-green-100 text-green-800'
                        : complaint.status === 'Viewed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}
            >
                {complaint.status}
            </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">"{complaint.text}"</p>

        {complaint.adminRemarks && (
            <div className="mt-2 pt-2 border-t border-dashed">
                <p className="text-xs font-semibold text-gray-500">
                    Admin Response:
                </p>
                <p className="text-sm text-gray-700">
                    "{complaint.adminRemarks}"
                </p>
            </div>
        )}
    </div>
);


// -------------------- Main Component --------------------
const RaiseComplaint = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const [submission, setSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [complaintText, setComplaintText] = useState("");


    // -------------------- Search --------------------
    const onSearch = async ({ applicationNumber }) => {
        setIsLoading(true);
        setSubmission(null);

        try {
            const { data } = await findDocumentByApplicationNumber(applicationNumber);
            setSubmission(data.submission);
        } catch (error) {
            Swal.fire({
                title: 'Not Found',
                text: error.response?.data?.message || "No application found.",
                icon: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };


    // -------------------- Submit Complaint --------------------
    const handleRaiseComplaint = async () => {
        if (!complaintText.trim()) {
            return Swal.fire('Error', 'Complaint message cannot be empty.', 'error');
        }

        if (!submission) return;

        setIsSubmitting(true);

        try {
            await raiseComplaint(submission._id, { text: complaintText });

            Swal.fire({
                title: 'Complaint Submitted!',
                text: 'Your complaint has been successfully registered.',
                icon: 'success',
            });

            setSubmission(null);
            setComplaintText("");
        } catch (error) {
            Swal.fire({
                title: 'Submission Failed',
                text: error.response?.data?.message || 'Unable to submit complaint.',
                icon: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <FileSearch className="mx-auto h-16 w-16 text-red-600" />
                    <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
                        Raise a Complaint
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Find your application and tell us what went wrong.
                    </p>
                </div>


                {/* Search Form */}
                <form
                    onSubmit={handleSubmit(onSearch)}
                    className="flex items-start gap-3 mb-10"
                >
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                        <input
                            {...register('applicationNumber', {
                                required: 'Application number is required'
                            })}
                            type="text"
                            placeholder="Enter Application Number (e.g., SRI12345678)"
                            className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-lg font-medium transition-all ${
                                errors.applicationNumber
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                            }`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:bg-blue-400 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Find'}
                    </button>
                </form>

                {errors.applicationNumber && (
                    <p className="text-center text-red-600 -mt-6 mb-6">
                        {errors.applicationNumber.message}
                    </p>
                )}


                {/* Submission Section */}
                {submission && (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">

                        {/* Submission Details */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Submission Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem icon={Hash} label="Application No" value={submission.applicationNumber} />
                                <DetailItem icon={Tag} label="Service Name" value={submission.serviceId.name} />
                                <DetailItem icon={Calendar} label="Submitted On" value={new Date(submission.createdAt).toLocaleString()} />
                                <DetailItem icon={Info} label="Current Status" value={submission.status} />

                                {submission.adminRemarks && (
                                    <div className="md:col-span-2">
                                        <DetailItem icon={MessageSquare} label="Admin Remarks" value={submission.adminRemarks} />
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Complaint History */}
                        {submission.complaints?.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <History size={24} /> Complaint History
                                </h2>

                                <div className="space-y-4">
                                    {submission.complaints
                                        .slice()
                                        .reverse()
                                        .map((c, i) => (
                                            <ComplaintHistoryItem
                                                key={c._id}
                                                complaint={c}
                                                isLast={i === 0}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}


                        {/* Complaint Form */}
                        {submission.complaints?.some(c => c.status !== "Closed") ? (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                                    <AlertCircle size={20} /> Open Complaint Exists
                                </h3>
                                <p className="text-yellow-700 mt-1">
                                    You cannot raise a new complaint until the current one is closed.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Describe Your Issue
                                </h2>

                                <textarea
                                    value={complaintText}
                                    onChange={(e) => setComplaintText(e.target.value)}
                                    rows="5"
                                    placeholder="Please describe the issue in detail..."
                                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />

                                <button
                                    onClick={handleRaiseComplaint}
                                    disabled={isSubmitting}
                                    className="w-full mt-6 flex items-center justify-center gap-3 py-4 px-6 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl disabled:bg-red-400"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                    Submit Complaint
                                </button>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default RaiseComplaint;
