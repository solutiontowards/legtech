import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronRight,
  Package,
  Lock,
  IndianRupee,
  ArrowRight,
  FileText,
  CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { listServices, getServiceDetail, getMyKycDetails } from "../../api/retailer";
import { useAuth } from "../../context/AuthContext";
import KycPromptNotice from "../../components/common/KycPromptNotice";

/* -------------------------------------------------------------------
 🧩 Reusable Card Component (for both Service & Option cards)
------------------------------------------------------------------- */
const DashboardCard = ({
  image,
  name,
  retailerPrice,
  onClick,
  isKycVerified,
  showPrice = false,
}) => {
  return (
    <motion.div
      onClick={isKycVerified ? onClick : undefined}
      className={`
        group relative overflow-hidden rounded-2xl border 
        bg-white shadow-md transition-all duration-300
        ${isKycVerified ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : "cursor-not-allowed opacity-90"}
      `}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={isKycVerified ? { scale: 1.015 } : {}}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <motion.img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-700 
            ${isKycVerified ? "group-hover:scale-110" : ""}
          `}
        />

        {/* KYC Required Overlay */}
        {!isKycVerified && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
            <Lock size={36} />
            <p className="mt-2 text-sm font-medium">KYC Required</p>
          </div>
        )}

        {/* Gradient Overlay */}
        {isKycVerified && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        )}
      </div>

      {/* Bottom Section */}
      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-4 shadow-inner">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold leading-snug text-white">
            {name}
          </h3>

          <ArrowRight
            size={18}
            className={`transition-transform ${
              isKycVerified
                ? "text-white opacity-90 group-hover:translate-x-1"
                : "text-gray-300"
            }`}
          />
        </div>

        {showPrice && (
          <div className="flex items-center justify-between">
            {/* Price */}
            <div
              className={`flex items-center gap-1 text-lg font-bold ${
                isKycVerified ? "text-white" : "text-gray-300"
              }`}
            >
              <IndianRupee size={16} />
              {(retailerPrice || 0).toFixed(2)}
            </div>

            {/* Button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                if (isKycVerified) onClick(e);
              }}
              whileHover={isKycVerified ? { scale: 1.05 } : {}}
              whileTap={isKycVerified ? { scale: 0.95 } : {}}
              disabled={!isKycVerified}
              className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-md transition-all
                ${
                  isKycVerified
                    ? "bg-white text-blue-700 hover:bg-gray-100"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Apply Now
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------
 🧩 Required Documents Card Component
------------------------------------------------------------------- */
const RequiredDocumentsCard = ({ serviceName, documents, isVisible }) => {
  if (!isVisible || !documents || documents.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-br from-blue-50 to-amber-100 text-black rounded-3xl p-8 sticky top-24 shadow-2xl shadow-gray-900/20"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="bg-white/10 p-3 rounded-xl">
          <FileText size={35} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">
            Required Documents
          </h3>
          <p className="text-sm text-gray-700">For <span className="font-semibold text-blue-600">{serviceName}</span></p>
        </div>
      </div>
      <p className="text-sm text-gray-900 mb-6">Please keep the following documents ready for a smooth application process:</p>
      <ul className="space-y-4">
        {documents.map((doc, index) => (
          <li key={index} className="flex items-center gap-4 text-base font-medium text-gray-900">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <span>{doc}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

/* -------------------------------------------------------------------
 🚀 Main Services Page Component
------------------------------------------------------------------- */
const Services = () => {
  const { serviceSlug, subServiceSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("All Services");
  const [kycData, setKycData] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (subServiceSlug) {
          response = await getServiceDetail(serviceSlug, subServiceSlug);
          setTitle(response.data.subService.name);
          setBreadcrumbs([
            { name: "Services", path: "/retailer/services" },
            {
              name: response.data.service.name,
              path: `/retailer/services/${serviceSlug}`,
            },
            { name: response.data.subService.name },
          ]);
        } else if (serviceSlug) {
          response = await getServiceDetail(serviceSlug);
          setTitle(response.data.service.name);
          setBreadcrumbs([
            { name: "Services", path: "/retailer/services" },
            { name: response.data.service.name },
          ]);
        } else {
          response = await listServices();
          setTitle("All Services");
          setBreadcrumbs([{ name: "Services" }]);
        }
        setData(response.data);
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          "Failed to fetch services. Please try again.";
        Swal.fire({
          title: "Not Available",
          text: msg,
          icon: "warning",
          confirmButtonText: "Go Back",
        }).then(() => navigate("/retailer/services"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceSlug, subServiceSlug]);

  useEffect(() => {
    const fetchKycData = async () => {
      if (user && !user.isKycVerified) {
        try {
          const { data } = await getMyKycDetails();
          setKycData(data);
        } catch (error) {
          console.error("Failed to fetch KYC status on services page.");
        }
      }
    };

    fetchKycData();
  }, [user, navigate]);

  useEffect(() => {
    if (user && !user.isKycVerified && kycData) {
      if (kycData.kycStatus === 'pending') {
        Swal.fire({
          title: 'KYC Under Review',
          text: 'Your documents are being reviewed by our team. We will notify you once the process is complete.',
          icon: 'info',
          confirmButtonText: 'OK',
        });
      } else if (kycData.kycStatus === 'rejected') {
        Swal.fire({
          title: 'KYC Application Rejected',
          html: `Your previous submission was rejected. <br><b>Reason:</b> ${kycData.details?.rejectionReason || 'Not specified'}`,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Re-submit KYC',
          cancelButtonText: 'Later',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/retailer/kyc');
          }
        });
      } else { // Not submitted yet
        Swal.fire({
          title: 'KYC Verification Required',
          text: 'Please complete your KYC to access all our services.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Complete KYC Now',
          cancelButtonText: 'Later',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/retailer/kyc');
          }
        });
      }
    }
  }, [user, kycData, navigate]);

  const handleApplyClick = (option) => {
    if (user?.isKycVerified) {
      navigate(`/retailer/apply/${serviceSlug}/${subServiceSlug}/${option.slug}`);
    }
  };

  const showDocumentsCard = !!serviceSlug && data?.service?.requiredDocuments?.length > 0;

  /* -------------------------------------------------------------------
   🎨 Render Dynamic Cards
  ------------------------------------------------------------------- */
  const renderContent = () => {
    if (loading)
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      );

    if (!data)
      return <div className="text-center text-gray-500">No data found.</div>;

    let items = [];
    let showPrice = false;

    if (subServiceSlug) {
      items = data.subService?.options || [];
      showPrice = true;
    } else if (serviceSlug) {
      items = data.service?.subServices || [];
    } else {
      items = data.services || [];
    }

    if (items.length === 0)
      return (
        <div className="text-center py-16">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-3 text-sm font-medium text-gray-600">
            No items found.
          </h3>
        </div>
      );

    return (
      <AnimatePresence>
        <motion.div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${showDocumentsCard
            // If document card is visible, use 3 columns to fit in the smaller space.
            ? 'lg:grid-cols-3'
            // If no document card, expand to 4 columns to use the full width.
            : 'lg:grid-cols-4'
            }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {items.map((item) => (
            <DashboardCard
              key={item._id}
              image={item.image}
              name={item.name}
              retailerPrice={item.retailerPrice}
              showPrice={showPrice}
              isKycVerified={user?.isKycVerified}
              onClick={(e) => {
                if (!user?.isKycVerified) return;
                if (subServiceSlug) handleApplyClick(item);
                else if (serviceSlug)
                  navigate(`/retailer/services/${serviceSlug}/${item.slug}`);
                else navigate(`/retailer/services/${item.slug}`);
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    );
  };

  /* -------------------------------------------------------------------
   🧭 Page Layout
  ------------------------------------------------------------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <nav className="flex items-center text-sm font-medium text-gray-500">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={16} className="mx-1" />}
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-blue-600">
                  {crumb.name}
                </Link>
              ) : (
                <span>{crumb.name}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </motion.div>

      {/* KYC Prompt Notice */}
      {!user?.isKycVerified && <KycPromptNotice kycData={kycData} />}

      <div className={`grid grid-cols-1 ${showDocumentsCard ? 'lg:grid-cols-3 lg:gap-8' : ''}`}>
        <div className={showDocumentsCard ? 'lg:col-span-2' : 'col-span-1 lg:col-span-3'}>
          {renderContent()}
        </div>
        {showDocumentsCard && (
          <div className="lg:col-span-1">
            <RequiredDocumentsCard
              isVisible={showDocumentsCard}
              serviceName={data?.service?.name}
              documents={data?.service?.requiredDocuments}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
