import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { listServices, getServiceDetail } from "../../api/retailer";
import { Loader2, ArrowLeft, ChevronRight, Layers, Briefcase, Package } from "lucide-react";
import toast from "react-hot-toast";

const ServiceCard = ({ image, name, description, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-gray-200"
  >
    <div className="h-40 overflow-hidden">
      <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-2">{name}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
    </div>
    <div className="px-5 pb-4 flex justify-end">
      <div className="flex items-center text-blue-600 font-semibold text-sm">
        View Details <ChevronRight size={18} className="ml-1" />
      </div>
    </div>
  </div>
);

const OptionCard = ({ image, name, price, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-gray-200"
  >
    <div className="h-40 overflow-hidden">
      <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-gray-800 mb-2">{name}</h3>
      <p className="text-2xl font-bold text-blue-600">₹{price.toFixed(2)}</p>
    </div>
    <div className="px-5 pb-4 mt-2">
      <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Apply Now
      </button>
    </div>
  </div>
);

const Services = () => {
  const { serviceSlug, subServiceSlug } = useParams();
  const navigate = useNavigate();
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
          setTitle(response.data.service.name);
          setBreadcrumbs([
            { name: "Services", path: "/retailer/services" },
            { name: response.data.service.parentService.name, path: `/retailer/services/${serviceSlug}` },
            { name: response.data.service.name, path: "" },
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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!data) return <div className="text-center text-gray-500">No services found.</div>;

    let items = [];
    let CardComponent = ServiceCard;

    if (subServiceSlug) {
      items = data.service?.options || [];
      CardComponent = OptionCard;
    } else if (serviceSlug) {
      items = data.service?.subServices || [];
    } else {
      items = data.services || [];
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <CardComponent
            key={item._id}
            {...item}
            onClick={() => {
              if (subServiceSlug) {
                // Handle option click, e.g., navigate to application form
                navigate(`/retailer/apply/${serviceSlug}/${subServiceSlug}/${item.slug}`);
              } else if (serviceSlug) {
                navigate(`/retailer/services/${serviceSlug}/${item.slug}`);
              } else {
                navigate(`/retailer/services/${item.slug}`);
              }
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        <nav className="flex items-center text-sm font-medium text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={16} className="mx-1" />}
              {crumb.path ? <Link to={crumb.path} className="hover:text-blue-600">{crumb.name}</Link> : <span>{crumb.name}</span>}
            </React.Fragment>
          ))}
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default Services;

