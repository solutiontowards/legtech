import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSubmissionById,
  updateSubmissionStatus,
} from "../../api/admin";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Download,
  FileText,
  User,
  Tag,
  Calendar,
  MessageSquare,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="bg-green-50 p-2 rounded-md">
      <Icon className="w-5 h-5 text-green-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-base text-gray-800 font-semibold">{value}</p>
    </div>
  </div>
);

const isImage = (url = "") => /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
const isPdf = (url = "") => /\.pdf$/i.test(url);
const isFileUrl = (value) => {
  return typeof value === 'string' && value.startsWith('http');
};

const AdminViewSubmission = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const { data } = await getSubmissionById(id);
      setSubmission(data.submission);
      setStatus(data.submission.status);
      setAdminRemarks(data.submission.adminRemarks || "");
    } catch (err) {
      toast.error("Failed to load submission details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateSubmissionStatus(id, { status, adminRemarks });
      toast.success("Submission updated successfully!");
      loadSubmission();
    } catch {
      toast.error("Failed to update submission.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading submission details...
      </div>
    );

  if (!submission)
    return (
      <div className="p-6 text-center text-red-500">
        Submission not found.
      </div>
    );

  // Separate form data into regular fields and file attachments
  const formDataItems = Object.entries(submission.data).filter(
    ([key, value]) => !isFileUrl(value)
  );
  const attachedFiles = Object.entries(submission.data).filter(
    ([key, value]) => isFileUrl(value)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Navigation */}
      <Link
        to="/admin/service-requests"
        className="inline-flex items-center text-green-700 font-medium hover:underline"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Service Requests
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
              Submission Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <DetailItem
                icon={User}
                label="Retailer"
                value={submission.retailerId.name}
              />
              <DetailItem
                icon={Tag}
                label="Service"
                value={`${submission.serviceId?.name || 'N/A'} - ${submission.optionId?.subServiceId?.name || 'N/A'} - ${submission.optionId?.name || 'N/A'}`}
              />
              <DetailItem
                icon={DollarSign}
                label="Amount Paid"
                value={`₹${submission.amount.toFixed(2)}`}
              />
              <DetailItem
                icon={Calendar}
                label="Submitted On"
                value={new Date(submission.createdAt).toLocaleString()}
              />
              <DetailItem
                icon={
                  submission.paymentStatus === "paid"
                    ? CheckCircle
                    : XCircle
                }
                label="Payment Status"
                value={
                  submission.paymentStatus === "paid"
                    ? "Paid"
                    : "Pending"
                }
              />
              {submission.adminRemarks && (
                <DetailItem
                  icon={MessageSquare}
                  label="Admin Remarks"
                  value={submission.adminRemarks}
                />
              )}
            </div>
          </div>

          {/* Form Data */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Submitted Form Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {formDataItems.length > 0 ? (
                formDataItems.map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                >
                  <p className="text-gray-500 font-medium">{key}</p>
                  <p className="text-gray-800 break-words">{String(value)}</p>
                </div>
              ))
              ) : (
                <p className="text-sm text-gray-500 col-span-2">No text data was submitted.</p>
              )}
            </div>
          </div>

          {/* Attached Files */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Attached Files
            </h3>
            {attachedFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {attachedFiles.map(([fileName, fileUrl], index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="h-48 flex items-center justify-center bg-gray-50">
                      {isImage(fileUrl) ? (
                        <img
                          src={fileUrl}
                          alt={fileName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-center text-gray-600">
                          <FileText
                            className={`w-12 h-12 ${
                              isPdf(fileUrl)
                                ? "text-red-500"
                                : "text-gray-400"
                            }`}
                          />
                          <p className="text-xs mt-2">
                            {isPdf(fileUrl)
                              ? "PDF Document"
                              : "Other File"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p
                        className="text-sm font-medium text-gray-800 truncate"
                        title={fileName}
                      >
                        {fileName}
                      </p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-xs text-green-700 font-medium mt-1 hover:underline"
                      >
                        <Download size={14} className="mr-1" />
                        View / Download File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No files were attached.</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit sticky top-20">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
            Manage Status
          </h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="submitted">Submitted</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="adminRemarks"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admin Remarks
              </label>
              <textarea
                id="adminRemarks"
                rows="4"
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Add remarks for the retailer (optional)"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminViewSubmission;
