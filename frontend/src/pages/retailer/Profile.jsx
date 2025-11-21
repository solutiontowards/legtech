import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getProfile } from "../../api/auth";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`py-4 px-2 ${className}`}>
    <p className="text-sm text-gray-500 font-medium tracking-wide">{label}</p>
    <div className="flex items-center gap-3 mt-1">
      <Icon className="w-5 h-5 text-gray-400" />
      <p className="text-base text-gray-900 font-semibold break-words">
        {value || "Not Provided"}
      </p>
    </div>
  </div>
);

const CardWrapper = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 mb-6"
  >
    <h2 className="text-xl font-bold text-gray-800 pb-4 mb-4 border-b tracking-wide">
      {title}
    </h2>
    {children}
  </motion.div>
);

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        if (data.ok) {
          setProfile(data.profile);
        } else {
          toast.error(data.message || "Failed to fetch profile.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "An error occurred while fetching your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-10 text-red-500 font-medium">
        Could not load your profile. Please try again later.
      </div>
    );
  }

  const kyc = profile.kycDetails;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="w-full mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold text-gray-800 mb-6 tracking-wide"
        >
          My Profile
        </motion.h1>

        {/* Personal Info */}
        <CardWrapper title="Personal Information">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <DetailItem icon={User} label="Full Name" value={profile.name} />
            <DetailItem icon={Mail} label="Email Address" value={profile.email} className="md:pl-6" />
            <DetailItem icon={Phone} label="Mobile Number" value={profile.mobile} />

            <div className="py-4 px-2 md:pl-6">
              <p className="text-sm text-gray-500 font-medium tracking-wide">KYC Status</p>
              <div className="flex items-center gap-3 mt-1">
                {profile.isKycVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                )}
                <p
                  className={`text-base font-semibold ${
                    profile.isKycVerified
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {profile.isKycVerified
                    ? "Verified"
                    : kyc?.status
                    ? kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)
                    : "Not Submitted"}
                </p>
              </div>
            </div>
          </div>
        </CardWrapper>

        {/* KYC Details */}
        {kyc ? (
          <CardWrapper title="KYC & Outlet Information">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <DetailItem icon={Building} label="Outlet Name" value={kyc.outletName} />
              <DetailItem icon={FileText} label="Aadhaar Number" value={kyc.aadhaarNumber} className="md:pl-6" />
              <DetailItem icon={FileText} label="PAN Number" value={kyc.panNumber} />
              <DetailItem icon={MapPin} label="State" value={kyc.state} className="md:pl-6" />
              <DetailItem icon={MapPin} label="District" value={kyc.district} />
              <DetailItem icon={MapPin} label="Post Office" value={kyc.postOffice} className="md:pl-6" />
              <DetailItem icon={MapPin} label="PIN Code" value={kyc.pinCode} />
              <DetailItem icon={MapPin} label="Full Address" value={kyc.address} className="md:pl-6" />
              <div className="md:col-span-2 pt-4">
                <DetailItem icon={MapPin} label="Live Location (Lat, Long)" value={kyc.plusCode} />
              </div>
            </div>
          </CardWrapper>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-5 rounded-xl flex items-start gap-4 shadow-sm"
          >
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <p className="font-bold text-lg">KYC Not Submitted</p>
              <p className="text-sm mt-1 tracking-wide">
                You haven't submitted your KYC details yet. Please complete your KYC to access all features.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;