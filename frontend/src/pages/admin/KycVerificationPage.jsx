import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKycRequestById, updateKycStatus } from '../../api/admin';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Loader2, ArrowLeft, User, Mail, Phone, Calendar, CheckCircle, XCircle, Download, FileText } from 'lucide-react';

// Reusable component for displaying details
const DetailItem = ({ icon: Icon, label, value }) => (
  <div>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <div className="flex items-center gap-2 mt-1">
      <Icon className="w-5 h-5 text-gray-400" />
      <p className="text-base text-gray-800 font-semibold">{value}</p>
    </div>
  </div>
);

// Reusable component for displaying documents
const DocumentViewer = ({ label, url }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden group transition-all hover:shadow-xl hover:border-blue-400">
    <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-50 text-center">
      <img src={url} alt={label} className="h-48 w-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src="/path/to/fallback-image.png" }} />
    </a>
    <div className="p-4 bg-white">
      <p className="font-semibold text-gray-800 text-sm">{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1 mt-1">
        <Download size={12} /> View Full Document
      </a>
    </div>
  </div>
);

const KycVerificationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data } = await getKycRequestById(id);
        setRequest(data.request);
      } catch (error) {
        toast.error("Failed to load KYC request.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleUpdate = async (status) => {
    let payload = { status };

    if (status === 'rejected') {
      const { value: reason } = await Swal.fire({
        title: 'Rejection Reason',
        input: 'textarea',
        inputPlaceholder: 'Provide a clear reason for rejecting this KYC application...',
        inputAttributes: { 'aria-label': 'Type your message here' },
        showCancelButton: true,
        confirmButtonText: 'Submit Rejection',
        confirmButtonColor: '#d33',
        inputValidator: (value) => {
          if (!value) {
            return 'You need to provide a reason!';
          }
        }
      });

      if (!reason) return; // User cancelled
      payload.rejectionReason = reason;
    }

    setIsUpdating(true);
    try {
      await updateKycStatus(id, payload);
      toast.success(`KYC has been ${status}.`);
      navigate('/st-admin/kyc-requests');
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  }

  if (!request) {
    return <div className="text-center p-10 text-red-500">KYC Request not found.</div>;
  }

  const { retailerId, ...details } = request;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6">
          <ArrowLeft size={18} /> Back to List
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-8">
            {/* Retailer Info */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Retailer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem icon={User} label="Name" value={retailerId.name} />
                <DetailItem icon={Mail} label="Email" value={retailerId.email} />
                <DetailItem icon={Phone} label="Mobile" value={retailerId.mobile} />
                <DetailItem icon={Calendar} label="Registered On" value={new Date(retailerId.createdAt).toLocaleDateString()} />
              </div>
            </section>

            {/* KYC Details */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Submitted KYC Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem icon={FileText} label="Aadhaar Number" value={details.aadhaarNumber} />
                <DetailItem icon={FileText} label="PAN Number" value={details.panNumber} />
              </div>
            </section>

            {/* Documents */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Uploaded Documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <DocumentViewer label="Aadhaar Front" url={details.aadhaarFront} />
                <DocumentViewer label="Aadhaar Back" url={details.aadhaarBack} />
                <DocumentViewer label="PAN Card" url={details.panCardImage} />
                <DocumentViewer label="Retailer Photo" url={details.photo} />
                <DocumentViewer label="Bank Document" url={details.bankDocument} />
              </div>
            </section>
          </div>

          {/* Right Column: Actions */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Verification Actions</h2>
              <div className="space-y-4">
                <button
                  onClick={() => handleUpdate('approved')}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:bg-green-400"
                >
                  {isUpdating ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
                  Approve KYC
                </button>
                <button
                  onClick={() => handleUpdate('rejected')}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all disabled:bg-red-400"
                >
                  {isUpdating ? <Loader2 className="animate-spin" /> : <XCircle size={18} />}
                  Reject KYC
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycVerificationPage;
