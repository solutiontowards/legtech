import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSubmissionById,
  updateSubmissionStatus,
  uploadFinalDocument,
  updateComplaintStatus,
} from "../../api/admin";
import { uploadSingle } from "../../api/upload";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  UploadCloud,
  ArrowLeft,
  Download,
  Eye,
  FileText,
  User,
  Tag,
  Calendar,
  MessageSquare,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  History,
  Hash,
  X,
  MessageCircle,
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

const ComplaintStatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
      status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
      status === 'Viewed' ? 'bg-blue-100 text-blue-800' :
      status === 'Closed' ? 'bg-green-100 text-green-800' :
      'bg-gray-100 text-gray-800'
    }`}
  >
    {status}
  </span>
);

const ActivityItem = ({ item }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="p-2 bg-gray-200 rounded-full"><History size={16} className="text-gray-600" /></div>
      <div className="flex-1 w-px bg-gray-300 my-1"></div>
    </div>
    <div>
      <p className="font-semibold text-gray-800">{item.status}</p>
      <p className="text-sm text-gray-600">{item.remarks}</p>
      <p className="text-xs text-gray-400 mt-1">        {new Date(item.updatedAt).toLocaleString()} by         {item.updatedBy?.role && <span className="capitalize font-medium"> {item.updatedBy.role}</span>}
      </p>
    </div>
  </div>
);




const isImage = (url = "") => /\.(jpeg|jpg|gif|png|webp|svg|avif|bmp)$/i.test(url);
const isPdf = (url = "") => /\.pdf$/i.test(url);
const isFileUrl = (value) => {
  return typeof value === 'string' && value.startsWith('http');
};

// New component for displaying files with preview and download
const FileCard = ({ fileName, fileUrl }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePreview = () => {
    if (isImage(fileUrl)) {
      Swal.fire({
        imageUrl: fileUrl,
        imageAlt: fileName,
        showConfirmButton: false,
        customClass: {
          popup: 'p-0 rounded-lg',
          image: 'm-0 rounded-lg',
        },
        backdrop: `rgba(0,0,0,0.8)`,
      });
    } else {
      // For PDFs and other files, open in a new tab
      window.open(fileUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    toast.loading('Starting download...');
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('Download complete!');
    } catch (error) {
      toast.dismiss();
      toast.error('Download failed. Please try again.');
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="h-48 flex items-center justify-center bg-gray-50 cursor-pointer" onClick={handlePreview}>
        {isImage(fileUrl) ? (
          <img src={fileUrl} alt={fileName} className="w-full h-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-center text-gray-600">
            <FileText className={`w-12 h-12 ${isPdf(fileUrl) ? "text-red-500" : "text-gray-400"}`} />
            <p className="text-xs mt-2">{isPdf(fileUrl) ? "PDF Document" : "Other File"}</p>
          </div>
        )}
      </div>
      <div className="p-4 bg-gray-50/50">
        <p className="text-sm font-medium text-gray-800 truncate" title={fileName}>{fileName}</p>
        <div className="flex items-center justify-between mt-3">
          <button onClick={handlePreview} className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:underline">
            <Eye size={14} /> Preview
          </button>
          <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-1.5 text-xs text-green-700 font-semibold hover:underline disabled:opacity-50">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminViewSubmission = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [finalPdf, setFinalPdf] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [complaintStatus, setComplaintStatus] = useState("");
  const [complaintRemarks, setComplaintRemarks] = useState("");
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState(false);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const { data } = await getSubmissionById(id);
      setSubmission(data.submission);
      setStatus(data.submission.status);
      setAdminRemarks(data.submission.adminRemarks || "");
      if (data.submission.complaint) {
        setComplaintStatus(data.submission.complaint.status);
        setComplaintRemarks(data.submission.complaint.adminRemarks || "");
      }
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFinalPdf(e.target.files[0]);
    }
  };

  const handleFinalUpload = async () => {
    if (!finalPdf) {
      toast.error("Please select a PDF file to upload.");
      return;
    }
    setIsUploading(true);
    try {
      // This assumes you have an 'uploadSingle' function in your API utils
      // that handles file uploads and returns a URL.
      const { data: uploadedFile } = await uploadSingle(finalPdf);
      await uploadFinalDocument(id, { finalDocumentUrl: uploadedFile.url });
      toast.success("Final document uploaded successfully!");
      setFinalPdf(null); // Clear file input
      loadSubmission(); // Refresh data to show the new document
    } catch (error) {
      toast.error("Failed to upload final document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplaintUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingComplaint(true);
    try {
      await updateComplaintStatus(id, { status: complaintStatus, adminRemarks: complaintRemarks });
      toast.success("Complaint status updated successfully!");
      loadSubmission();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update complaint status.");
    } finally {
      setIsUpdatingComplaint(false);
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
  const reUploadedFiles = submission.reUploadedFiles || [];

  const sortedHistory = (submission.statusHistory || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="p-6 space-y-6">
      {/* Header Navigation */}
      <Link
        to="/st-admin/service-requests"
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
                icon={Hash}
                label="Application No"
                value={submission.applicationNumber || 'N/A'}
              />
              <DetailItem
                icon={User}
                label="Retailer"
                value={submission.retailerId.name}
              />
              <DetailItem
                icon={Tag}
                label="Service Name"
                value={submission.serviceId?.name || 'N/A'}
              />
              <DetailItem
                icon={Tag}
                label="Sub-Service Name"
                value={submission.optionId?.subServiceId?.name || 'N/A'}
              />
              <DetailItem
                icon={Tag}
                label="Option Name"
                value={submission.optionId?.name || 'N/A'}
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
                {attachedFiles.map(([fileName, fileUrl], index) => <FileCard key={index} fileName={fileName} fileUrl={fileUrl} />)}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No files were attached.</p>
            )}
          </div>

          {/* Re-uploaded Files */}
          {reUploadedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-600 border-b border-orange-200 pb-2 mb-3">
                Re-uploaded Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {reUploadedFiles.map((file, index) => <FileCard key={index} fileName={file.originalname} fileUrl={file.url} />)}
              </div>
            </div>
          )}

          {/* Final Document Display */}
          {submission.finalDocument && (
            <div>
              <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2 mb-3">
                Final Document
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-700" />
                  <span className="font-medium text-blue-800">
                    Final document is available.
                  </span>
                </div>
                <a
                  href={submission.finalDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  <Download size={14} /> Download
                </a>
              </div>
            </div>
          )}

          {/* Complaint Details */}
          {submission.complaints && submission.complaints.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-600 border-b border-red-200 pb-2 mb-4 flex items-center gap-2">
                <MessageCircle size={20} /> Complaint Details
              </h3>
              <div className="space-y-4">
                {submission.complaints.slice().reverse().map((complaint, index) => (
                  <div key={complaint._id || index} className="p-4 rounded-lg bg-red-50/50 border border-red-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-800">Complaint on {new Date(complaint.createdAt).toLocaleDateString()}</p>
                      <ComplaintStatusBadge status={complaint.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Retailer's Message:</span> "{complaint.text}"
                    </p>
                    {complaint.adminRemarks && <p className="text-xs text-gray-500 pt-2 border-t border-dashed">Your Response: <span className="text-gray-700 font-medium">"{complaint.adminRemarks}"</span></p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Activity & Remarks
            </h3>
            <div className="space-y-4">
              {sortedHistory.length > 0 ? (
                sortedHistory.map((item, index) => (
                  <ActivityItem key={index} item={item} />
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No activity history found.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Right: Actions */}
        <div className="space-y-6 h-fit sticky top-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
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
                  <option value="Applied">Applied</option>
                  <option value="Verified">Verified</option>
                  <option value="Reject | Failed">Reject | Failed</option>
                  <option value="On Process">On Process</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Success">Success</option>
                  <option value="Objection">Objection</option>
                  <option value="Hold for Customer">Hold for Customer</option>
                  <option value="Document Required">Document Required</option>
                  <option value="Document Re-uploaded" disabled>Document Re-uploaded</option>
                  <option value="Completed">Completed</option>
                  <option value="Payment Failed">Payment Failed</option>

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

          {/* Complaint Management Section */}
          {submission.complaints && submission.complaints.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
                Manage Complaint
              </h2>
              <form onSubmit={handleComplaintUpdate} className="space-y-4">
                <div>
                  <label htmlFor="complaintStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Complaint Status
                  </label>
                  <select
                    id="complaintStatus"
                    value={complaintStatus}
                    onChange={(e) => setComplaintStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="complaintRemarks" className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks for Complaint
                  </label>
                  <textarea
                    id="complaintRemarks"
                    rows="3"
                    value={complaintRemarks}
                    onChange={(e) => setComplaintRemarks(e.target.value)}
                    placeholder="Add remarks for the retailer's complaint"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingComplaint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400"
                >
                  {isUpdatingComplaint ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                  ) : (
                    "Update Complaint"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Final PDF Upload Section */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
              Upload Final Document
            </h2>
            <div className="space-y-4">
              <input
                type="file"
                accept=".pdf, image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {finalPdf && (
                <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
                  <span className="truncate text-gray-800" title={finalPdf.name}>{finalPdf.name}</span>
                  <button onClick={() => setFinalPdf(null)} className="p-1 rounded-full hover:bg-red-100 text-red-500">
                    <X size={14} />
                  </button>
                </div>
              )}

              <button onClick={handleFinalUpload} disabled={isUploading || !finalPdf} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400">
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><UploadCloud size={16} /> Upload Document</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewSubmission;
