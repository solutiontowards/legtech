import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, Wallet, BarChart2, CheckCircle, Info, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getWalletBalance, getDashboardStats, getServiceCount } from "../../api/retailer";
import { useAuth } from "../../context/AuthContext"; // refreshUser is now used
import NoticeBoard from "./NoticeBoard";

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

const StatsAndChart = ({ walletBalance, servicesCount, monthlyApplications, chartData }) => (
  <div className="mb-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard title="Wallet Balance" value={`₹${walletBalance !== null ? walletBalance.toFixed(2) : '...'}`} icon={Wallet} color="bg-blue-500" />
      <StatCard title="Available Services" value={servicesCount} icon={CheckCircle} color="bg-green-500" />
      <StatCard title="Paid Applications (This Month)" value={monthlyApplications} icon={BarChart2} color="bg-indigo-500" />
    </div>
    <div data-aos="fade-up" data-aos-delay="100" className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Service Usage This Month</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }} />
            <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [servicesCount, setServicesCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    monthlyApplicationsCount: 0,
    serviceUsage: [],
  });

  useEffect(() => {
    setLoading(true);
    const fetchWallet = async () => {
      try {
        const { data } = await getWalletBalance();
        setWalletBalance(data.balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance", error);
        setWalletBalance(user?.wallet?.balance || 0); // Fallback to context
      }
    };

    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        if (data.ok) setDashboardStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }

    const fetchServiceCount = async () => {
      try {
        const { data } = await getServiceCount();
        if (data.ok) setServicesCount(data.count);
      } catch (error) {
        console.error("Failed to fetch service count", error);
      }
    };

    const fetchAllData = async () => {
      await Promise.all([
        fetchWallet(),
        fetchStats(),
        fetchServiceCount()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="w-full lg:flex-1">
        <div data-aos="fade-in" className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Retailer Overview</h1>
        </div>

        {!user?.isVerified && <VerificationNotice />}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <StatsAndChart
            walletBalance={walletBalance}
            servicesCount={servicesCount}
            monthlyApplications={dashboardStats.monthlyApplicationsCount}
            chartData={dashboardStats.serviceUsage}
          />
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-1/3 xl:w-1/4">
        <NoticeBoard />
      </div>
    </div>
  );
};

export default Dashboard;
