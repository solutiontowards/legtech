import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronRight,
  Package,
  ArrowRightCircle,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { listServices, getServiceDetail } from "../../api/retailer";
import ApplicationFormModal from "./ApplicationFormModal";
import NoticeBoard from "./NoticeBoard";

/* ----------------------------------------------------
 🧩 Professional Dashboard Service Card
---------------------------------------------------- */
const ServiceCard = ({ image, name, description, onClick }) => (
  <motion.div
    onClick={onClick}
    className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <motion.img
        src={image}
        alt={name}
        className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      <div className="absolute bottom-3 left-4">
        <h3 className="text-lg font-semibold text-white drop-shadow-lg">
          {name}
        </h3>
      </div>
    </div>

    {/* Content */}
    <div className="p-5 bg-white/90 backdrop-blur-sm">
      <p className="text-gray-600 text-sm line-clamp-2 min-h-[38px]">
        {description || "Explore this service and its sub-services."}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-600">View Details</span>
        <ArrowRightCircle
          size={20}
          className="text-blue-600 group-hover:translate-x-1 transition-transform"
        />
      </div>
    </div>
  </motion.div>
);

/* ----------------------------------------------------
 💼 Professional Dashboard Option Card
---------------------------------------------------- */
const OptionCard = ({ image, name, price, description, onClick }) => (
  <motion.div
    className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <motion.img
        src={image}
        alt={name}
        className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute bottom-3 left-4">
        <h3 className="text-lg font-semibold text-white drop-shadow-lg">
          {name}
        </h3>
      </div>
    </div>

    {/* Content */}
    <div className="p-5 bg-white/90 backdrop-blur-sm">
      <p className="text-gray-600 text-sm line-clamp-2 min-h-[38px]">
        {description || "Premium option available under this sub-service."}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-blue-600 font-semibold text-xl">
          <IndianRupee size={18} />
          {price?.toFixed(2)}
        </div>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
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
    setSelectedOption(option);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOption(null);
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {items.map((item) => (
            <CardComponent
              key={item._id}
              {...item}
              price={item.price}
              onClick={() => {
                if (subServiceSlug) {
                  handleApplyClick(item);
                } else if (serviceSlug) {
                  navigate(`/retailer/services/${serviceSlug}/${item.slug}`);
                } else {
                  navigate(`/retailer/services/${item.slug}`);
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
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="w-full lg:w-3/4">
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

      {/* Sidebar */}
      <div className="hidden lg:block lg:w-1/3">
        <NoticeBoard />
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
