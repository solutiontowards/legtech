import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRetailerSubmissionById, reUploadDocuments } from "../../api/retailer";
import { uploadSingle } from "../../api/upload";
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
  History,
  UploadCloud,
  Hash,
  X,
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

const ActivityItem = ({ item }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="p-2 bg-gray-200 rounded-full"><History size={16} className="text-gray-600" /></div>
      <div className="flex-1 w-px bg-gray-300 my-1"></div>
    </div>
    <div>
      <p className="font-semibold text-gray-800">{item.status}</p>
      <p className="text-sm text-gray-600">{item.remarks}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(item.updatedAt).toLocaleString()} by         {item.updatedBy?.role && <span className="capitalize font-medium"> {item.updatedBy.role}</span>}

      </p>
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
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  useEffect(() => {
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
  const reUploadedFiles = submission.reUploadedFiles || [];
  const sortedHistory = (submission.statusHistory || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const handleReUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    try {
      // We are only uploading a single file
      const { data: uploadedFile } = await uploadSingle(files[0]);
      if (uploadedFile) {
        // reUploadDocuments expects an array of files
        await reUploadDocuments(id, { files: [uploadedFile] });
        toast.success("Document uploaded successfully!");
        setFiles([]); // Clear files after upload
        loadSubmission(); // Refresh data
      }
    } catch (error) {
      toast.error("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/retailer/submission-history"
          className="inline-flex items-center text-green-700 font-medium hover:underline mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Submission History
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">
            Submission Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <DetailItem
              icon={Hash}
              label="Application No"
              value={submission.applicationNumber || 'N/A'}
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

          {/* Form Data */}
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

          {/* Attached Files */}
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
                          className={`w-12 h-12 ${isPdf(fileUrl)
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

          {/* Re-uploaded Files */}
          {reUploadedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-600 border-b border-orange-200 pb-2 mb-3">
                Re-uploaded Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {reUploadedFiles.map((file, index) => (
                  <div key={index} className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                    <div className="h-48 flex items-center justify-center bg-gray-50">
                      {isImage(file.url) ? (
                        <img src={file.url} alt={file.originalname} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center text-center text-gray-600">
                          <FileText className={`w-12 h-12 ${isPdf(file.url) ? "text-red-500" : "text-gray-400"}`} />
                          <p className="text-xs mt-2">{isPdf(file.url) ? "PDF Document" : "Other File"}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-800 truncate" title={file.originalname}>{file.originalname}</p>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-green-700 font-medium mt-1 hover:underline">
                        <Download size={14} className="mr-1" />
                        View / Download File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {submission.status === 'Document Required' && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-orange-600 mb-3">Action Required: Upload Documents</h3>
              <div className="space-y-4">
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected file:</p>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {file.type.startsWith('image/') && (
                              <img src={URL.createObjectURL(file)} alt="preview" className="w-8 h-8 rounded object-cover" />
                            )}
                            <span className="truncate text-gray-800" title={file.name}>{file.name}</span>
                          </div>
                          <button onClick={() => removeFile(index)} className="p-1 rounded-full hover:bg-red-100 text-red-500">
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button onClick={handleReUpload} disabled={isUploading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400">
                  {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><UploadCloud size={16} /> Upload & Submit</>}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Activity & Remarks
            </h3>
            <div className="space-y-4">
              {sortedHistory.length > 0 ? (
                sortedHistory.map((item, index) => (
                  <ActivityItem key={index} item={item} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No activity history found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmission;