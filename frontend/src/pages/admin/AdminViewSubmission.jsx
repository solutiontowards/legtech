import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSubmissionById, updateSubmissionStatus } from "../../api/admin";
import toast from "react-hot-toast";
import { ArrowLeft, Download, FileText, User, Tag, Calendar, MessageSquare, DollarSign, CheckCircle, XCircle } from "lucide-react";

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start">
    <Icon className="w-5 h-5 text-gray-500 mr-3 mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-base text-gray-800">{value}</p>
    </div>
  </div>
);

// Helper to check file type from URL
const isImage = (url = '') => /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
const isPdf = (url = '') => /\.pdf$/i.test(url);

const AdminViewSubmission = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  async function loadSubmission() {
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
  }

  console.log(submission)

  useEffect(() => {
    loadSubmission();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateSubmissionStatus(id, { status, adminRemarks });
      toast.success("Submission updated successfully!");
      loadSubmission(); // Refresh data
    } catch (err) {
      toast.error("Failed to update submission.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading submission details...</div>;
  }

  if (!submission) {
    return <div className="p-6 text-center text-red-500">Submission not found.</div>;
  }

  return (
    <div className="p-6">
      <Link to="/admin/service-requests" className="flex items-center text-green-600 hover:underline mb-6">
        <ArrowLeft size={18} className="mr-2" />
        Back to Service Requests
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 border-b pb-3">Submission Details</h2>
          <div className="space-y-4">
            <DetailItem icon={User} label="Retailer" value={submission.retailerId.name} />
            <DetailItem icon={Tag} label="Service" value={`${submission.serviceId.name}-${submission.optionId.subServiceId.name} - ${submission.optionId.name}`} />
            <DetailItem icon={DollarSign} label="Amount Paid" value={`₹${submission.amount.toFixed(2)}`} />
            <DetailItem icon={Calendar} label="Submitted On" value={new Date(submission.createdAt).toLocaleString()} />
            <DetailItem icon={submission.paymentStatus === 'paid' ? CheckCircle : XCircle} label="Payment Status" value={submission.paymentStatus} />
            {submission.adminRemarks && <DetailItem icon={MessageSquare} label="Admin Remarks" value={submission.adminRemarks} />}
          </div>

          {/* Submitted Data */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Submitted Form Data</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(submission.data).map(([key, value]) => (
                <p key={key}><strong className="font-medium text-gray-600">{key}:</strong> {String(value)}</p>
              ))}
            </div>
          </div>

          {/* Attached Files */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Attached Files</h3>
            {submission.files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {submission.files.map((file, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-gray-100 flex-grow flex items-center justify-center h-48">
                      {isImage(file.fileUrl) ? (
                        <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-contain" />
                      ) : isPdf(file.fileUrl) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                           <FileText className="w-12 h-12 text-red-500" />
                           <p className="text-xs mt-2 text-gray-600">PDF Document</p>
                        </div>
                      ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                           <FileText className="w-12 h-12 text-gray-500" />
                           <p className="text-xs mt-2 text-gray-600">Other File</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-gray-800 truncate" title={file.fileName}>{file.fileName}</p>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-green-600 hover:underline mt-1">
                        <Download size={14} className="mr-1" />
                        View/Download
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

        {/* Right Column: Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4 border-b pb-3">Manage Status</h2>
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="submitted">Submitted</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="adminRemarks" className="block text-sm font-medium text-gray-700 mb-1">Admin Remarks</label>
              <textarea
                id="adminRemarks"
                rows="4"
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Add remarks for the retailer (optional)"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminViewSubmission;