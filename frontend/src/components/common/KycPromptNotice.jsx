import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';

const KycPromptNotice = ({ kycData }) => {
  const navigate = useNavigate();

  // KYC status is 'pending'
  if (kycData?.kycStatus === 'pending') {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-5 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <Info className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800">KYC Under Review</h3>
            <p className="text-sm text-blue-700 mt-1">
              Your documents are being reviewed by our team. We will notify you once the process is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // KYC status is 'rejected'
  if (kycData?.kycStatus === 'rejected') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm mb-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">KYC Application Rejected</h3>
            <p className="text-sm text-red-700 mt-1">
              Your previous submission was rejected. Reason: <span className="font-semibold">{kycData.details?.rejectionReason || 'Not specified'}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/retailer/kyc" className="px-5 py-2 text-sm rounded-md text-white font-semibold bg-red-600 hover:bg-red-700 transition-all">Re-submit Application</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default case: KYC not submitted yet (original UI)
  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-5 shadow-sm mb-6">
      <div className="flex items-start gap-4">
        <ShieldAlert className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-orange-800">Account Activation Required</h3>
          <p className="text-sm text-orange-700 mt-1">
            Your account is not yet active. To unlock all services and features, please complete your KYC verification.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => navigate('/retailer/kyc')} className="px-5 py-2 text-sm rounded-md text-white font-semibold bg-orange-600 hover:bg-orange-700 transition-all">Complete KYC Now</button>
            <button onClick={() => { /* Can be used to hide the notice temporarily */ }} className="px-5 py-2 text-sm rounded-md text-orange-700 font-semibold border border-orange-500 hover:bg-orange-100 transition-all">Later</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycPromptNotice;