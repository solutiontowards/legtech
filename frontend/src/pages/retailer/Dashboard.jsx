import React, { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  BarChart2,
  CheckCircle,
  ShieldAlert,
  Award,
  TrendingUp,
  CreditCard,
  Upload,
  Download,
  Bell,
  Info,
  Clock,
  AlertCircle,
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

/* =========================================================
   Reusable bits
========================================================= */
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all">
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

const TransactionItem = ({ icon: Icon, title, note, amount, credit }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${credit ? "bg-emerald-50" : "bg-indigo-50"}`}>
        <Icon className={`${credit ? "text-emerald-600" : "text-indigo-600"} w-5 h-5`} />
      </div>
      <div>
        <div className="text-sm font-medium text-gray-800">{title}</div>
        <div className="text-xs text-gray-500">{note}</div>
      </div>
    </div>
    <div className={`text-sm font-semibold ${credit ? "text-emerald-600" : "text-rose-600"}`}>
      {credit ? "+" : "-"} {amount}
    </div>
  </div>
);

/* =========================================================
   Dummy data (replace with API later)
========================================================= */
const barData = [
  { name: "Driving Licence", applications: 18 },
  { name: "PAN", applications: 9 },
  { name: "Aadhaar", applications: 12 },
  { name: "GST", applications: 5 },
];

const orderStats = [
  { name: "Electronic", amount: "$1,174" },
  { name: "Fashion", amount: "$1,074" },
  { name: "Dr & Med", amount: "$912" },
  { name: "Sports", amount: "$811" },
];


const orderStatusData = [
  { status: "Completed", count: 156, color: "#10b981" },
  { status: "Pending", count: 89, color: "#f59e0b" },
  { status: "Processing", count: 42, color: "#3b82f6" },
  { status: "Cancelled", count: 12, color: "#ef4444" },
]

const sparkData = Array.from({ length: 14 }, (_, i) => ({ t: i + 1, v: 40 + Math.round(Math.random() * 20) }));



const transactions = [
  { title: "Mastercard", note: "Receive money", amount: "$82.6 USD", credit: true, icon: Download },
  { title: "Paypal", note: "Withdraw money", amount: "$28 USD", credit: false, icon: Upload },
  { title: "Wallet", note: "Receive money", amount: "$45 USD", credit: true, icon: Download },
  { title: "Transfer", note: "Refund money", amount: "$12 USD", credit: true, icon: Download },
];

/* =========================================================
   Verification Notice (shown when not verified)
========================================================= */
const VerificationNotice = () => (
  <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <ShieldAlert className="w-6 h-6 text-orange-500" />
      <div>
        <h3 className="text-lg font-semibold text-orange-800">Account Pending Verification</h3>
        <p className="text-sm text-orange-700 mt-1">
          Your retailer account is not active yet. Please wait for admin approval.
        </p>
        <p className="text-sm text-orange-700 mt-1">
          To speed up verification, add a small wallet balance — it helps prioritize your application.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a href="/retailer/wallet" className="px-4 py-2 text-sm rounded-md text-white bg-orange-600 hover:bg-orange-700">Top-up Wallet</a>
          <a href="/retailer/services" className="px-4 py-2 text-sm rounded-md text-orange-700 border border-orange-500 hover:bg-orange-100">Explore Services</a>
        </div>
      </div>
    </div>
  </div>
);

/* =========================================================
   Main Dashboard
========================================================= */
export default function Dashboard() {
  // you can gate this with auth later; keeping it simple and “verified=false” to show the banner once
  const [isVerified] = useState(true);

  // state kept only to mirror your current structure (easy API swap later)
  const [walletBalance, setWalletBalance] = useState(401.0);
  const [servicesCount, setServicesCount] = useState(6);
  const [monthlyApplications, setMonthlyApplications] = useState(1);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // simulate initial load
    setChartData(barData);
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Retailer Overview</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Bell className="w-4 h-4" /> Let’s check store today?
          </div>
        </div>

        {!isVerified ? <VerificationNotice /> : null}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ===== Left / Main ===== */}
          <div className="xl:col-span-2 space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <StatCard title="Wallet Balance" value={`₹${walletBalance.toFixed(2)}`} icon={WalletIcon} color="bg-blue-500" />
              <StatCard title="Total Services" value={servicesCount} icon={CheckCircle} color="bg-green-500" />
              <StatCard title="Monthly Applications" value={monthlyApplications} icon={BarChart2} color="bg-indigo-500" />
            </div>

            {/* Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Usage This Month</h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
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
              </div>
            </div>

            {/* Order statistics + donut stub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Order Statistics Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Statistics</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>


              <div className="bg-white p-5 rounded-2xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Order</h3>
                <p className="text-xs text-gray-500 mb-3">564</p>
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-24 h-24">
                      <path
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeDasharray="40 60"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-800">40%</div>
                    <div className="text-xs text-gray-500">Weekly</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit / Growth tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-5 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Award className="text-indigo-600 w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Congratulations Muneer</div>
                    <div className="text-xs text-gray-500">You have done 72% more sales today. Check your new badge in your profile.</div>
                  </div>
                </div>
                <a href="#badges" className="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline">
                  View Badges
                </a>
              </div>

              <MiniKPI title="Growth" value="78%" sub="62% Company Growth" change="+18%" positive />
              <MiniKPI title="Orders" value="276k" sub="This week" change="-14.82%" positive={false} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProfitSpark title="Profit Report" value="$92,654k" change="72.2%" />
              <ProfitSpark title="Profit Report" value="$92,654k" change="72.2%" />
              <ProfitSpark title="Profit Report" value="$92,654k" change="72.2%" />
            </div>
          </div>

          {/* ===== Right / Sidebar ===== */}
          <div className="space-y-6">
            {/* Announcements */}
         <NoticeBoard />
            {/* Transactions */}
            <div className="bg-white p-5 rounded-2xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transactions</h3>
              <div>
                {transactions.map((t, i) => (
                  <TransactionItem
                    key={i}
                    icon={t.icon}
                    title={t.title}
                    note={t.note}
                    amount={t.amount}
                    credit={t.credit}
                  />
                ))}
              </div>
            </div>

            {/* Wallet quick card */}
            <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5" />
                <div className="font-medium">Wallet</div>
              </div>
              <div className="text-3xl font-bold">₹{walletBalance.toFixed(2)}</div>
              <div className="text-sm text-indigo-100 mt-1">Current Balance</div>
              <button className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium">
                Add Money
              </button>
            </div>

            {/* Growth small */}
            <div className="bg-white p-5 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-emerald-600 w-5 h-5" />
                <div className="font-medium text-gray-800">Revenue</div>
              </div>
              <div className="text-2xl font-semibold mt-2">$4,321</div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-gray-600 text-sm">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-4">
            <Clock className="w-10 h-10 text-orange-500" />
            <div>
              <p className="text-gray-600 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-xs text-orange-600 mt-1">Awaiting processing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div>
              <p className="text-gray-600 text-sm">Cancelled Orders</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-red-600 mt-1">-4% from last month</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
