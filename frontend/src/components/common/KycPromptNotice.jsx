import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const KycPromptNotice = () => {
  const navigate = useNavigate();

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
            <button onClick={() => navigate('/retailer/dashboard')} className="px-5 py-2 text-sm rounded-md text-orange-700 font-semibold border border-orange-500 hover:bg-orange-100 transition-all">Later</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycPromptNotice;