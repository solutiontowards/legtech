import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronRight,
  Package,
  ArrowRight,
  Lock,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { listServices, getServiceDetail } from "../../api/retailer";
import { useAuth } from "../../context/AuthContext";
import ApplicationFormModal from "./ApplicationFormModal";
import NoticeBoard from "./NoticeBoard";

/* ----------------------------------------------------
 🧩 Professional Dashboard Service Card
---------------------------------------------------- */
const ServiceCard = ({ image, name, onClick, isVerified }) => (
  <motion.div
    onClick={isVerified ? onClick : () => {}}
    className={`group relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 ${
      isVerified ? "hover:shadow-xl hover:-translate-y-1.5 cursor-pointer" : "cursor-not-allowed"
    }`}
    whileHover={isVerified ? { scale: 1.02 } : {}}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <motion.img
        src={image}
        alt={name}
        className={`h-full w-full object-cover transition-transform duration-700 ${isVerified ? "group-hover:scale-110" : ""}`}
      />
      {!isVerified && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
          <Lock size={40} />
          <p className="mt-2 text-center font-semibold">Retailer Not Verified</p>
        </div>
      )}
      {isVerified && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      )}
    </div>

    {/* Content */}
    <div className="p-4 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 truncate pr-2">
          {name}
        </h3>
        <ArrowRight
          size={18}
          className={`transition-transform ${isVerified ? "text-blue-600 group-hover:translate-x-1" : "text-gray-400"}`}
        />
      </div>
    </div>
  </motion.div>
);

/* ----------------------------------------------------
 💼 Professional Dashboard Option Card
---------------------------------------------------- */
const OptionCard = ({ image, name, price, onClick, isVerified }) => (
  <motion.div
    className={`group relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 ${
      isVerified ? "hover:shadow-xl hover:-translate-y-1.5" : "cursor-not-allowed"
    }`}
    whileHover={isVerified ? { scale: 1.02 } : {}}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <motion.img
        src={image}
        alt={name}
        className={`h-full w-full object-cover transition-transform duration-700 ${isVerified ? "group-hover:scale-110" : ""}`}
      />
      {!isVerified && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
          <Lock size={40} />
          <p className="mt-2 text-center font-semibold">Retailer Not Verified</p>
        </div>
      )}
      {isVerified && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      )}
    </div>

    {/* Content */}
    <div className="p-4 bg-white">
      <h3 className="text-base font-semibold text-gray-800 truncate mb-3">
        {name}
      </h3>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 font-bold text-lg ${isVerified ? "text-blue-600" : "text-gray-500"}`}>
          <IndianRupee size={18} />
          {price?.toFixed(2)}
        </div>

        <motion.button
          onClick={(e) => {
            if (isVerified) onClick(e); // Pass event
          }}
          whileHover={isVerified ? { scale: 1.05 } : {}}
          whileTap={isVerified ? { scale: 0.95 } : {}}
          disabled={!isVerified}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Apply Now
        </motion.button>
      </div>
    </div>
  </motion.div>
);

/* ----------------------------------------------------
 🚀 Main Services Component
---------------------------------------------------- */
const Services = () => {
  const { serviceSlug, subServiceSlug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("All Services");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

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
            { name: response.data.service.name, path: `/retailer/services/${serviceSlug}` },
            { name: response.data.subService.name, path: "" },
          ]);
        } else if (serviceSlug) {
          response = await getServiceDetail(serviceSlug);
          setTitle(response.data.service.name);
          setBreadcrumbs([
            { name: "Services", path: "/retailer/services" },
            { name: response.data.service.name, path: "" },
          ]);
        } else {
          response = await listServices();
          setTitle("All Services");
          setBreadcrumbs([{ name: "Services", path: "" }]);
        }
        setData(response.data);
      } catch (error) {
        toast.error("Failed to fetch services. Please try again.");
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceSlug, subServiceSlug]);

  const handleApplyClick = (option) => {
    if (user?.isVerified) setSelectedOption(option);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOption(null);
    refreshUser(); // Refresh user context to get updated wallet balance
  };

  /* ----------------------------------------------------
   📦 Render Cards Section
  ---------------------------------------------------- */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!data) {
      return <div className="text-center text-gray-500">No services found.</div>;
    }

    let items = [];
    let CardComponent = ServiceCard;

    if (subServiceSlug) {
      items = data.subService?.options || [];
      CardComponent = OptionCard;
    } else if (serviceSlug) {
      items = data.service?.subServices || [];
    } else {
      items = data.services || [];
    }

    if (items.length === 0) {
      const message = subServiceSlug
        ? "No options found for this sub-service."
        : serviceSlug
        ? "No sub-services found for this service."
        : "No services found.";
      return (
        <div className="text-center py-16">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
        </div>
      );
    }

    return (
      <AnimatePresence>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {items.map((item) => (
            <CardComponent
              key={item._id}
              {...item}
              price={item.price}
              isVerified={user?.isVerified}
              onClick={(e) => {
                if (user?.isVerified) {
                  if (CardComponent === OptionCard) {
                    e.stopPropagation();
                    handleApplyClick(item);
                  } else if (serviceSlug) {
                    navigate(`/retailer/services/${serviceSlug}/${item.slug}`);
                  } else {
                    navigate(`/retailer/services/${item.slug}`);
                  }
                }
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    );
  };

  /* ----------------------------------------------------
   🧭 Main Layout
  ---------------------------------------------------- */
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="w-full lg:flex-1">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          <nav className="flex items-center text-sm font-medium text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight size={16} className="mx-1" />}
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

        {renderContent()}
      </div>


      {/* Modal */}
      {modalOpen && selectedOption && (
        <ApplicationFormModal
          serviceSlug={serviceSlug}
          subServiceSlug={subServiceSlug}
          optionSlug={selectedOption.slug}
          onClose={handleModalClose}
          onSubmitted={handleModalClose}
        />
      )}
    </div>
  );
};

export default Services;
