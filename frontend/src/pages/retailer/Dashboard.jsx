import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, ChevronRight, Package, IndianRupee, Wallet, BarChart2, CheckCircle, Info, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { listServices, getServiceDetail, getWalletBalance } from "../../api/retailer";
import { useAuth } from "../../context/AuthContext"; // refreshUser is now used
import NoticeBoard from "./NoticeBoard";

const chartData = [
  { name: 'PAN', applications: 12 },
  { name: 'GST', applications: 19 },
  { name: 'ITR', applications: 8 },
  { name: 'Passport', applications: 5 },
  { name: 'License', applications: 15 },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div data-aos="fade-up" className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-5">
    <div className={`p-4 rounded-full ${color}`}>
      <Icon className="h-7 w-7 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const StatsAndChart = ({ walletBalance, servicesCount }) => (
  <div className="mb-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard title="Wallet Balance" value={`₹${walletBalance !== null ? walletBalance.toFixed(2) : '...'}`} icon={Wallet} color="bg-blue-500" />
      <StatCard title="Available Services" value={servicesCount} icon={CheckCircle} color="bg-green-500" />
      <StatCard title="Monthly Applications" value="44" icon={BarChart2} color="bg-indigo-500" />
    </div>
    <div data-aos="fade-up" data-aos-delay="100" className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Service Usage This Month</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }} />
            <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

const ItemCard = ({ item, type, onClick }) => (
  <div data-aos="fade-up" onClick={onClick} className="group bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border border-gray-200/80 hover:shadow-2xl">
    <div className="h-44 overflow-hidden">
      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-gray-800 truncate">{item.name}</h3>
      {type === 'option' ? (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xl font-extrabold text-blue-600 flex items-center"><IndianRupee size={18} className="mr-1" />{item.price.toFixed(2)}</p>
          <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Apply Now
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-3 text-sm font-semibold text-blue-600">
          <span>View Details</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  </div>
);

const VerificationNotice = () => (
  <div data-aos="fade-in" className="mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-5 shadow-md">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <ShieldAlert className="h-6 w-6 text-orange-500" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-orange-800">Account Pending Verification</h3>
        <p className="mt-1 text-sm text-orange-700">
          Your retailer account is not active yet. Please wait for an administrator to approve your account.
        </p>
        <p className="mt-2 text-sm text-orange-700">
          To potentially speed up the verification process, you can add a minimum balance to your wallet. This shows your commitment and helps us prioritize your application.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link to="/retailer/wallet" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Top-up Wallet
          </Link>
          <Link to="/retailer/services" className="inline-flex items-center justify-center px-4 py-2 border border-orange-500 text-sm font-medium rounded-md text-orange-700 bg-transparent hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Explore Our Services
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { serviceSlug, subServiceSlug } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Retailer Overview");
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [itemType, setItemType] = useState('service');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await getWalletBalance();
        setWalletBalance(data.balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance", error);
        setWalletBalance(user?.wallet?.balance || 0); // Fallback to context
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (subServiceSlug) {
          response = await getServiceDetail(serviceSlug, subServiceSlug);
          setTitle(response.data.subService.name);
          setItemType('option');
          setBreadcrumbs([
            { name: "Services", path: "/retailer/services" },
            { name: response.data.service.name, path: `/retailer/services/${serviceSlug}` },
            { name: response.data.subService.name, path: "" },
          ]);
        } else if (serviceSlug) {
          response = await getServiceDetail(serviceSlug);
          setTitle(response.data.service.name);
          setItemType('subService');
          setBreadcrumbs([
            { name: "Services", path: "/retailer/services" },
            { name: response.data.service.name, path: "" },
          ]);
        } else {
          response = await listServices();
          setItemType('service');
          setTitle("Retailer Overview");
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
    fetchWallet();
  }, [serviceSlug, subServiceSlug]);

  const handleApplyClick = (option) => {
    setSelectedOption(option);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOption(null);
    refreshUser(); // Refresh user context to get updated wallet balance
  };

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

    if (subServiceSlug) {
      items = data.subService?.options || [];
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            type={itemType}
            onClick={() => {
              if (itemType === 'option') {
                handleApplyClick(item);
              } else if (itemType === 'subService') {
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

  const servicesCount = data?.services?.length || data?.service?.subServices?.length || data?.subService?.options?.length || 0;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="w-full lg:flex-1">
        <div data-aos="fade-in" className="mb-6">
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
        </div>

        {!user?.isVerified && <VerificationNotice />}

        {!serviceSlug && <StatsAndChart walletBalance={walletBalance} servicesCount={servicesCount} />}
        
        {renderContent()}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-1/3 xl:w-1/4">
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

export default Dashboard;
