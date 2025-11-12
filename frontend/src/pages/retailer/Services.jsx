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
} from "lucide-react";
import Swal from "sweetalert2";
import { listServices, getServiceDetail } from "../../api/retailer";
import { useAuth } from "../../context/AuthContext";

/* -------------------------------------------------------------------
 🧩 Reusable Card Component (for both Service & Option cards)
------------------------------------------------------------------- */
const DashboardCard = ({
  image,
  name,
  retailerPrice,
  onClick,
  isVerified,
  showPrice = false,
  buttonText = "View Details",
  isOption = false,
}) => (
  <motion.div
    onClick={isVerified ? onClick : () => {}}
    className={`group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 ${
      isVerified
        ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        : "cursor-not-allowed"
    }`}
    whileHover={isVerified ? { scale: 1.02 } : {}}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {/* Image Section */}
    <div className="relative h-48 overflow-hidden">
      <motion.img
        src={image}
        alt={name}
        className={`h-full w-full object-cover transition-transform duration-700 ${
          isVerified ? "group-hover:scale-110" : ""
        }`}
      />

      {!isVerified && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center px-3">
          <Lock size={38} />
          <p className="mt-2 font-semibold text-sm">Retailer Not Verified</p>
        </div>
      )}

      {isVerified && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      )}
    </div>

    {/* Text & Action Section */}
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {name}
        </h3>
        <ArrowRight
          size={18}
          className={`transition-transform ${
            isVerified
              ? "text-blue-600 group-hover:translate-x-1"
              : "text-gray-400"
          }`}
        />
      </div>

      {showPrice && (
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-1 font-bold text-lg ${
              isVerified ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <IndianRupee size={16} />
            {(retailerPrice || 0).toFixed(2)}
          </div>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (isVerified) onClick(e);
            }}
            whileHover={isVerified ? { scale: 1.05 } : {}}
            whileTap={isVerified ? { scale: 0.95 } : {}}
            disabled={!isVerified}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply Now
          </motion.button>
        </div>
      )}
    </div>
  </motion.div>
);

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

  const handleApplyClick = (option) => {
    if (user?.isVerified) {
      navigate(`/retailer/apply/${serviceSlug}/${subServiceSlug}/${option.slug}`);
    }
  };

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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
              isVerified={user?.isVerified}
              onClick={(e) => {
                if (!user?.isVerified) return;
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

      {/* Grid Content */}
      {renderContent()}
    </div>
  );
};

export default Services;
