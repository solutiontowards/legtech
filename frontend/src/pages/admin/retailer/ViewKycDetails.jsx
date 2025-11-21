import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKycDetailsByRetailerId } from '../../../api/admin';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, User, Mail, Phone, Calendar, FileText, Download, Building, MapPin } from 'lucide-react';

// Reusable component for displaying details
const DetailItem = ({ icon: Icon, label, value }) => (
  <div>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <div className="flex items-center gap-2 mt-1">
      <Icon className="w-5 h-5 text-gray-400" />
      <p className="text-base text-gray-800 font-semibold">{value || '-'}</p>
    </div>
  </div>
);

// Reusable component for displaying documents
const DocumentViewer = ({ label, url }) => {
  if (!url) {
    return (
      <div className="border border-gray-200 rounded-xl flex items-center justify-center h-56 bg-gray-50">
        <p className="text-sm text-gray-500">Not Provided</p>
      </div>
    );
  }

  return (
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
};

const ViewKycDetails = () => {
  const { retailerId } = useParams();
  const navigate = useNavigate();
  const [kycDetails, setKycDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await getKycDetailsByRetailerId(retailerId);
        setKycDetails(data.details);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load KYC details.");
        setKycDetails(null); // Ensure no data is shown on error
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [retailerId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  }

  const { retailer, details } = kycDetails || {};

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6">
          <ArrowLeft size={18} /> Back to Retailers
        </button>

        {kycDetails && retailer && details ? (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-8">
            {/* Retailer Info */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Retailer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem icon={User} label="Name" value={retailer.name} />
                <DetailItem icon={Mail} label="Email" value={retailer.email} />
                <DetailItem icon={Phone} label="Mobile" value={retailer.mobile} />
                <DetailItem icon={Calendar} label="Registered On" value={new Date(retailer.createdAt).toLocaleDateString()} />
                <DetailItem icon={User} label="KYC Status" value={details.status} />
              </div>
            </section>

            {/* KYC Details */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">Submitted KYC Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                <DetailItem icon={Building} label="Outlet Name" value={details.outletName} />
                <DetailItem icon={FileText} label="Aadhaar Number" value={details.aadhaarNumber} />
                <DetailItem icon={FileText} label="PAN Number" value={details.panNumber} />
                <DetailItem icon={MapPin} label="State" value={details.state} />
                <DetailItem icon={MapPin} label="District" value={details.district} />
                <DetailItem icon={MapPin} label="Post Office" value={details.postOffice} />
                <DetailItem icon={MapPin} label="PIN Code" value={details.pinCode} />
                <DetailItem icon={MapPin} label="Full Address" value={details.address} />
                <DetailItem icon={MapPin} label="Live Location (Lat, Long)" value={details.plusCode} />
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
                {details.bankDocument && (
                  <DocumentViewer label="Bank Document (Optional)" url={details.bankDocument} />
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">No KYC Details Found</h2>
            <p className="text-gray-500 mt-2">This retailer has not submitted any KYC documents yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewKycDetails;