import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats, getServiceCount, getApplicationStatusStats, getTotalOrdersStats, getWeeklyOrdersStats, getDailyOrdersStats, getStatusCardStats, getMonthlyProfitStats, getWeeklyProfitStats, getDailyProfitStats, getTotalRevenue, getActiveWishes, getMyKycDetails } from "../../api/retailer";
import { motion } from "framer-motion";

import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { getWalletBalance, getRecentTransactions } from "../../api/wallet";
import {
  Wallet as WalletIcon,
  BarChart2,
  CheckCircle,
  ShieldAlert,
  Award,
  TrendingUp,
  CreditCard,
  Bell,
  Info,
  Clock,
  AlertCircle,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  Gift,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import NoticeBoard from "./NoticeBoard";
import toast from "react-hot-toast";
import KycPromptNotice from "../../components/common/KycPromptNotice";

/* =========================================================
   Reusable bits
========================================================= */
const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
  <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer" onClick={onClick}>
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
      <Icon className="h-7 w-7 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const MiniKPI = ({ title, value, sub, change, positive }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md">
    <div className="flex items-center justify-between mb-3">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-xs px-2 py-0.5 rounded-full ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
        {positive ? "▲" : "▼"} {change}
      </div>
    </div>
    <div className="text-2xl font-semibold text-gray-800">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{sub}</div>
  </div>
);

const ProfitSpark = ({ title, value, change }) => (
  <div className="bg-white rounded-2xl p-4 shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-semibold text-gray-800">{value}</div>
      </div>
      <div className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+{change}</div>
    </div>
    <div className="h-16 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sparkData}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="v" type="monotone" stroke="#10b981" strokeWidth={2} fill="url(#g1)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const TransactionItem = ({ transaction }) => {
  const getTransactionDescription = (meta) => {
    if (typeof meta === "string" && meta.startsWith("WALLET_")) return "Wallet Recharge";
    if (meta?.reason?.startsWith("Payment Failed")) return `Failed: ${meta.reason}`;
    if (meta?.reason === "service purchase") return `Wallet Payment for Service`;
    if (meta?.reason === "Online Service Payment") return `Online Payment for Service`;
    if (meta?.reason === "service purchase retry") return "Retry Payment for Submission";
    if (meta?.reason) return `Manual Credit: ${meta.reason}`;
    if (typeof meta === 'string') return meta;
    return "Transaction";
  };

  const isCredit = transaction.type === "credit";
  const isDebit = transaction.type === "debit";
  const Icon = isCredit ? ArrowDownCircle : isDebit ? ArrowUpCircle : XCircle;
  const iconColor = isCredit ? "text-green-600" : isDebit ? "text-red-600" : "text-gray-500";
  const bgColor = isCredit ? "bg-green-50" : isDebit ? "bg-red-50" : "bg-gray-100";
  const amountColor = isCredit ? "text-green-600" : isDebit ? "text-red-600" : "text-gray-500";
  const amountPrefix = isCredit ? "+" : isDebit ? "-" : "";

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bgColor}`}>
          <Icon className={`${iconColor} w-5 h-5`} />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-800">{getTransactionDescription(transaction.meta)}</div>
          <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleString()}</div>
        </div>
      </div>
      <div className={`text-sm font-semibold ${amountColor}`}>
        {amountPrefix}₹{transaction.amount.toFixed(2)}
      </div>
    </div>
  );
};

/* =========================================================
   Dummy data (replace with API later)
========================================================= */

const sparkData = Array.from({ length: 14 }, (_, i) => ({ t: i + 1, v: 40 + Math.round(Math.random() * 20) }));

/* =========================================================
   Verification Notice (shown when not verified)
========================================================= */


const GlobalMessageCard = ({ message }) => {
  if (!message) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-sm border border-blue-100 text-white transition-all duration-300 hover:shadow-md hover:-translate-y-[2px]">
      <div className="flex items-start gap-4">
        {/* Icon Section */}
        <div className="min-w-[60px] h-[60px] rounded-full flex items-center justify-center bg-white/20 border border-white/30 shadow-inner">
          <Info className="h-8 w-8 text-white" />
        </div>

        {/* Text Section */}
        <div className="flex flex-col">
          {/* <h3 className="text-lg font-semibold tracking-wide">
            Welcome to <span className="text-yellow-300">Legtech Dashboard</span>
          </h3> */}
          <p className="text-sm md:text-[15px] mt-1 leading-relaxed text-blue-50 font-medium">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
/* =========================================================
   Main Dashboard
========================================================= */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    walletBalance: 0,
    servicesCount: 0,
    monthlyApplications: 0,
    serviceUsage: [],
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [totalOrdersStats, setTotalOrdersStats] = useState({
    total: 0,
    percentageChange: 0,
  });
  const [weeklyOrdersStats, setWeeklyOrdersStats] = useState({
    total: 0,
    percentageChange: 0,
  });
  const [dailyOrdersStats, setDailyOrdersStats] = useState({
    total: 0,
    percentageChange: 0,
  });
  const [statusCardStats, setStatusCardStats] = useState({
    completed: { total: 0, percentageChange: 0 },
    pending: { total: 0 },
    cancelled: { total: 0, percentageChange: 0 },
  });
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState({ total: 0, percentageChange: 0 });
  const [weeklyProfit, setWeeklyProfit] = useState({ total: 0, percentageChange: 0 });
  const [dailyProfit, setDailyProfit] = useState({ total: 0, percentageChange: 0 });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeWish, setActiveWish] = useState(null);
  const [kycData, setKycData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Define colors for each status
        const statusColors = {
          Applied: "#3b82f6", // blue
          "On Process": "#f97316", // orange
          Completed: "#22c55e", // green
          "Reject | Failed": "#ef4444", // red
          "On Hold": "#eab308", // yellow
          "Payment Failed": "#ef4444", // red
          "Document Required": "#a855f7", // purple
          // Add other statuses and their colors
          default: "#6b7280", // gray
        };

        // Fetch all data concurrently for better performance
        const [statsRes, walletRes, serviceCountRes, transactionsRes, statusStatsRes, totalOrdersRes, weeklyOrdersRes, dailyOrdersRes, statusCardsRes, monthlyProfitRes, weeklyProfitRes, dailyProfitRes, totalRevenueRes, wishesRes, kycRes] = await Promise.all([
          getDashboardStats(),
          getWalletBalance(),
          getServiceCount(),
          getRecentTransactions(),
          getApplicationStatusStats(),
          getTotalOrdersStats(),
          getWeeklyOrdersStats(),
          getDailyOrdersStats(),
          getStatusCardStats(),
          getMonthlyProfitStats(),
          getWeeklyProfitStats(),
          getDailyProfitStats(),
          getTotalRevenue(),
          getActiveWishes(),
          getMyKycDetails(),
        ]);

        setStats({
          monthlyApplications: statsRes.data?.monthlyApplicationsCount || 0,
          serviceUsage: statsRes.data?.serviceUsage || [],
          walletBalance: walletRes.data?.balance || 0,
          servicesCount: serviceCountRes.data?.count || 0,
        });
        setRecentTransactions(transactionsRes.data?.transactions || []);
        setTotalOrdersStats({
          total: totalOrdersRes.data.stats.totalOrdersThisMonth,
          percentageChange: totalOrdersRes.data.stats.percentageChange,
        });
        setWeeklyOrdersStats({
          total: weeklyOrdersRes.data.stats.totalOrdersThisWeek,
          percentageChange: weeklyOrdersRes.data.stats.percentageChange,
        });
        setDailyOrdersStats({
          total: dailyOrdersRes.data.stats.totalOrdersToday,
          percentageChange: dailyOrdersRes.data.stats.percentageChange,
        });
        setStatusCardStats(statusCardsRes.data.stats);
        setMonthlyProfit(monthlyProfitRes.data.stats);
        setWeeklyProfit(weeklyProfitRes.data.stats);
        setDailyProfit(dailyProfitRes.data.stats);
        setTotalRevenue(totalRevenueRes.data.totalRevenue);
        setKycData(kycRes.data);

        // Set the most recent active wish
        if (wishesRes.data.wishes && wishesRes.data.wishes.length > 0) {
          setActiveWish(wishesRes.data.wishes[0]); // The API sorts by most recent
        }

        const pieData = statusStatsRes.data.stats.map(stat => ({
          status: stat.status,
          count: stat.count,
          color: statusColors[stat.status] || statusColors.default,
        }));
        setOrderStatusData(pieData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }

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

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-auto mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Retailer Overview</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Bell className="w-4 h-4" /> Let’s check store today?
          </div>
        </div>

        {!user?.isKycVerified && <KycPromptNotice kycData={kycData} />}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
          {/* ===== Left / Main ===== */}
          <div className="xl:col-span-2 space-y-6">
            {user?.isKycVerified && <GlobalMessageCard message={activeWish?.message} />}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <StatCard title="Wallet Balance" value={loading ? "..." : `₹${stats.walletBalance.toFixed(2)}`} icon={WalletIcon} color="bg-blue-500" onClick={() => navigate("/retailer/wallet")} />
              <StatCard title="Total Services" value={loading ? "..." : stats.servicesCount} icon={CheckCircle} color="bg-green-500" onClick={() => navigate("/retailer/services")} />
              <StatCard title="Monthly Applications" value={loading ? "..." : stats.monthlyApplications} icon={BarChart2} color="bg-indigo-500" onClick={() => navigate("/retailer/submission-history")} />
            </div>


            {/* Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Usage This Month</h3>
              <div className="w-full h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Chart...
                  </div>
                ) : stats.serviceUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.serviceUsage} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(239,246,255,0.6)" }}
                        contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}
                      />
                      <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <Info className="w-5 h-5 mr-2" />
                    No service usage data for this month yet.
                  </div>
                )}
              </div>
            </div>

            {/* =========================
     Order Statistics Section
========================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ======= Order Statistics Pie Chart (70%) ======= */}
              <div className="bg-white rounded-2xl shadow-md p-6 lg:col-span-2 w-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Statistics
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center h-[250px] text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Stats...
                  </div>
                ) : orderStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) =>
                          `${status} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-500">
                    No order data to display.
                  </div>
                )}
              </div>

              {/* ======= Total Order Summary Card (30%) ======= */}
              {loading ? (
                <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-center w-full">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Orders</h3>
                  <p className="text-xs text-gray-500 mb-4">This Month vs. Last Month</p>

                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-28 h-28">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                        fill="none"
                        stroke={totalOrdersStats.percentageChange >= 0 ? "#22c55e" : "#ef4444"}
                        strokeWidth="3"
                        strokeDasharray={`${Math.abs(totalOrdersStats.percentageChange)}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className={`text-2xl font-bold ${totalOrdersStats.percentageChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {totalOrdersStats.percentageChange >= 0 ? "▲" : "▼"}
                        {Math.abs(totalOrdersStats.percentageChange)}%
                      </p>
                      <p className="text-xs text-gray-500">Change</p>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">Orders This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalOrdersStats.total}
                    </p>
                  </div>
                </div>
              )}
            </div>


            {/* Profit / Growth tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


              <MiniKPI
                title="Monthly Growth"
                value={`${totalOrdersStats.percentageChange}%`}
                sub="vs. Last Month"
                change={`${totalOrdersStats.percentageChange >= 0 ? '+' : ''}${totalOrdersStats.percentageChange}%`}
                positive={totalOrdersStats.percentageChange >= 0}
              />
              <MiniKPI
                title="Weekly Orders"
                value={weeklyOrdersStats.total}
                sub="This Week"
                change={`${weeklyOrdersStats.percentageChange >= 0 ? '+' : ''}${weeklyOrdersStats.percentageChange}%`}
                positive={weeklyOrdersStats.percentageChange >= 0}
              />
              <MiniKPI
                title="Today Orders"
                value={dailyOrdersStats.total}
                sub="Yesterday"
                change={`${dailyOrdersStats.percentageChange >= 0 ? '+' : ''}${dailyOrdersStats.percentageChange}%`}
                positive={dailyOrdersStats.percentageChange >= 0}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProfitSpark
                title="Monthly Profit Report"
                value={`₹${monthlyProfit.total.toFixed(2)}`}
                change={`${monthlyProfit.percentageChange.toFixed(1)}%`}
              />
              <ProfitSpark
                title="Weekly Profit Report"
                value={`₹${weeklyProfit.total.toFixed(2)}`}
                change={`${weeklyProfit.percentageChange.toFixed(1)}%`}
              />
              <ProfitSpark
                title="Daly Profit Report"
                value={`₹${dailyProfit.total.toFixed(2)}`}
                change={`${dailyProfit.percentageChange.toFixed(1)}%`}
              />
            </div>
          </div>

          {/* ===== Right / Sidebar ===== */}
          <div className="space-y-6">



            {/* Announcements */}
            <NoticeBoard />
            {/* Transactions */}
            <div className="bg-white p-5 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
              <div>
                {loading ? (
                  <div className="text-center text-gray-500 py-4">Loading transactions...</div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => <TransactionItem key={tx._id} transaction={tx} />)
                ) : (
                  <div className="text-center text-gray-500 py-4">No recent transactions.</div>
                )}
              </div>
            </div>

            {/* Wallet quick card */}
            <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5" />
                <div className="font-medium">Wallet</div>
              </div>
              <div className="text-3xl font-bold">{loading ? "..." : `₹${stats.walletBalance.toFixed(2)}`}</div>
              <div className="text-sm text-indigo-100 mt-1">Current Balance</div>
              <button className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium" onClick={() => navigate('/retailer/wallet')}>
                Add Money
              </button>
            </div>
            {/* Growth small */}
            <div className="bg-white p-5 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-600 w-5 h-5" />
                <div className="font-medium text-gray-800">Revenue</div>
              </div>
              <div className="text-2xl font-semibold mt-2">₹{loading ? '...' : totalRevenue.toFixed(2)}</div>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <Area dataKey="v" type="monotone" stroke="#6366f1" fill="#c7d2fe" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>


          </div>
        </div>
      </div>
      {/* Status Cards Section */}
      {loading ? (
        <div className="text-center mt-5">
          <Loader2 className="w-6 h-6 animate-spin inline-block text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
          {/* Completed Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <div>
                <p className="text-gray-600 text-sm">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{statusCardStats.completed.total}</p>
                <p className={`text-xs mt-1 ${statusCardStats.completed.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {statusCardStats.completed.percentageChange >= 0 ? '▲' : '▼'} {Math.abs(statusCardStats.completed.percentageChange)}% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-4">
              <Clock className="w-10 h-10 text-orange-500" />
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{statusCardStats.pending.total}</p>
                <p className="text-xs text-orange-600 mt-1">Awaiting processing</p>
              </div>
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <div>
                <p className="text-gray-600 text-sm">Cancelled Orders</p>
                <p className="text-2xl font-bold text-gray-900">{statusCardStats.cancelled.total}</p>
                <p className={`text-xs mt-1 ${statusCardStats.cancelled.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {statusCardStats.cancelled.percentageChange >= 0 ? '▲' : '▼'} {Math.abs(statusCardStats.cancelled.percentageChange)}% from last month
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
<style jsx>
  {`
    .recharts-pie-label-text {
      font-size: 12px !important;
    }
  `}
</style>
    </div>
  );
}
