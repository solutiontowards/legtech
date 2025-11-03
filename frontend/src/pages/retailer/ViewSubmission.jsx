import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRetailerSubmissionById } from "../../api/retailer";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Download,
  FileText,
  Tag,
  Calendar,
  MessageSquare,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  Wallet,
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

const ViewSubmission = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubmission = async () => {
      try {
        setLoading(true);
        const { data } = await getRetailerSubmissionById(id);
        setSubmission(data.submission);
      } catch (err) {
        toast.error("Failed to load submission details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSubmission();
  }, [id]);

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
        Submission not found or you do not have permission to view it.
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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header Navigation */}
      <div className="max-w-6xl mx-auto">
        <Link
          to="/retailer/submission-history"
          className="inline-flex items-center text-green-700 font-medium hover:underline mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Submission History
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
            Submission Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                submission.paymentStatus.charAt(0).toUpperCase() + submission.paymentStatus.slice(1)
              }
            />
            <DetailItem
              icon={Info}
              label="Current Status"
              value={
                submission.status.charAt(0).toUpperCase() + submission.status.slice(1)
              }
            />
            <DetailItem
              icon={Wallet}
              label="Payment Method"
              value={
                submission.paymentMethod.charAt(0).toUpperCase() + submission.paymentMethod.slice(1)
              }
            />
            <DetailItem
              icon={MessageSquare}
              label="Admin Remarks"
              value={submission.adminRemarks || "-"}
            />
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
    </div>
  );
};

export default ViewSubmission;