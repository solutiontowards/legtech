import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Wallet,
  BarChart2,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getWalletBalance, getDashboardStats, getServiceCount } from "../../api/retailer";
import { useAuth } from "../../context/AuthContext";
import NoticeBoard from "./NoticeBoard";

/* -----------------------------------------------------------
   🎯 Stat Card
----------------------------------------------------------- */
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div
    data-aos="fade-up"
    className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
  >
    <div
      className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full ${color}`}
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
    </div>
    <div className="text-center sm:text-left">
      <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

/* -----------------------------------------------------------
   📊 Stats + Chart Section
----------------------------------------------------------- */
const StatsAndChart = ({ walletBalance, servicesCount, monthlyApplications, chartData }) => (
  <div className="space-y-6">
    {/* 🔹 Stat Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <StatCard
        title="Wallet Balance"
        value={`₹${walletBalance?.toFixed(2) || "0.00"}`}
        icon={Wallet}
        color="bg-blue-500"
      />
      <StatCard
        title="Available Services"
        value={servicesCount}
        icon={CheckCircle}
        color="bg-green-500"
      />
      <StatCard
        title="Paid Applications (This Month)"
        value={monthlyApplications}
        icon={BarChart2}
        color="bg-indigo-500"
      />
    </div>

    {/* 🔹 Chart */}
    <div
      data-aos="fade-up"
      className="bg-white p-4 sm:p-6 rounded-2xl shadow-md"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
        Service Usage This Month
      </h3>
      <div className="w-full h-[240px] sm:h-[300px] md:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(239,246,255,0.5)" }}
              contentStyle={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
              }}
            />
            <Bar
              dataKey="applications"
              name="Applications"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

/* -----------------------------------------------------------
   ⚠️ Verification Notice
----------------------------------------------------------- */
const VerificationNotice = () => (
  <div
    data-aos="fade-in"
    className="mb-6 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-5 sm:p-6 shadow-sm"
  >
    <div className="flex items-start gap-4">
      <ShieldAlert className="h-6 w-6 text-orange-500" />
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-orange-800">
          Account Pending Verification
        </h3>
        <p className="mt-1 text-sm text-orange-700">
          Your retailer account is not active yet. Please wait for admin
          approval.
        </p>
        <p className="mt-2 text-sm text-orange-700">
          To speed up verification, add a small wallet balance — it helps
          prioritize your application.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/retailer/wallet"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 shadow"
          >
            Top-up Wallet
          </Link>
          <Link
            to="/retailer/services"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-orange-700 border border-orange-500 hover:bg-orange-100"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  </div>
);

/* -----------------------------------------------------------
   🧠 Dashboard (Main)
----------------------------------------------------------- */
const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [servicesCount, setServicesCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    monthlyApplicationsCount: 0,
    serviceUsage: [],
  });

  /* 🔹 Fetch all data */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: wallet }, { data: stats }, { data: count }] = await Promise.all([
          getWalletBalance(),
          getDashboardStats(),
          getServiceCount(),
        ]);
        setWalletBalance(wallet?.balance || 0);
        if (stats?.ok) setDashboardStats(stats);
        if (count?.ok) setServicesCount(count.count);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* -----------------------------------------------------------
     🧱 Layout
  ----------------------------------------------------------- */
  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen flex flex-col xl:flex-row gap-6 transition-all duration-300 ease-in-out">
      {/* 🧩 Left Side (Main Content) */}
      <div className="flex-1 w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-5">
          Retailer Overview
        </h1>

        {!user?.isVerified && <VerificationNotice />}

        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

      {/* 🧩 Right Side (Notice Board) */}
      <div className="w-full xl:w-[35%] 2xl:w-[30%]">
        <NoticeBoard />
      </div>
    </div>
  );
};

export default Dashboard;
