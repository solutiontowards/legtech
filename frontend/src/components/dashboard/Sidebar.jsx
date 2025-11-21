import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  LogOut,
  ChevronDown,
  X,
  Package,
  PieChart,
  Layers,
  History,
  BarChart3,
  LifeBuoy,
  Megaphone,
  UserCheck,
  UserPlus,
  UserCog,
  Store,
  ClipboardList,
  WalletCards,
  ArrowRightLeft,
  Wallet,
  MessageCircle, // Admin icon
  // New icons for retailer sidebar
  UserCircle,
  Settings,
  PieChart as PieChartIcon,
  BarChart3 as BarChartIcon,
  ConciergeBell,
  Tv,
  FileText,
  Landmark,
  FileSearch,
  FolderSearch,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log me out!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        navigate("/");
        Swal.fire({
          title: "Logged Out!",
          text: "You have been logged out successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const retailerLinks = [
    { id: "dashboard", to: "/retailer/dashboard", text: "Dashboard", icon: LayoutDashboard },
    { id: "services", to: "/retailer/services", text: "Services", icon: BriefcaseBusiness },
    { id: "submissions", to: "/retailer/submission-history", text: "Submissions", icon: History },
    { id: "findDocuments", to: "/retailer/find-documents", text: "Find Documents", icon: FileSearch },
    { id: "transactions", to: "/retailer/transaction", text: "Transactions", icon: ArrowRightLeft },
    {
      id: "wallet",
      text: "Wallet",
      icon: Wallet,
      submenu: [
        { to: "/retailer/wallet", text: "Add Money", icon: WalletCards },
        { to: "/retailer/fund-request", text: "Fund Request", icon: Landmark },
        { to: "/retailer/fund-request-history", text: "Request History", icon: History },
      ],
    },
    {
      id: "service-request",
      text: "Service Request",
      icon: ConciergeBell,
      submenu: [
        { to: "/retailer/dth-recharge", text: "DTH Recharge", icon: Tv },
        { to: "/retailer/bill-pay", text: "Bill Pay (BBPS)", icon: FileText },
        { to: "/retailer/aaps", text: "AEPS", icon: Landmark },
        { to: "/retailer/payout", text: "Payout", icon: WalletCards },
        { to: "/retailer/uti-pan-report", text: "UTI Pan Report", icon: FileText },
      ],
    },
    {
      id: "my-business",
      text: "My Business",
      icon: Store,
      submenu: [
        { to: "/retailer/commision-chart", text: "Commission Chart", icon: PieChartIcon },
        { to: "/retailer/price-chart", text: "Price Chart", icon: BarChartIcon },
      ],
    },
    {
      id: "account",
      text: "Account",
      icon: UserCircle,
      submenu: [
        { to: "/retailer/profile", text: "My Profile", icon: UserCircle },
      ],
    },
    { id: "support", to: "/retailer/support", text: "Support", icon: LifeBuoy },
  ];

  const adminLinks = [
    { id: "Dashboard", to: "/st-admin/dashboard", text: "Dashboard", icon: LayoutDashboard },
    {
      id: "retailers",
      text: "Retailers",
      icon: Store,
      submenu: [

        { to: "/st-admin/verify-retailers", text: "Kyc Pending Retailers", icon: UserCheck },
        { to: "/st-admin/kyc-requests", text: "KYC Requests", icon: UserCog },
        { to: "/st-admin/retailers", text: "Active Retailers", icon: Users },
      ],
    },
    {
      id: "services",
      text: "Services Managment",
      icon: BriefcaseBusiness,
      submenu: [
        { to: "/st-admin/services", text: "Services", icon: Package },
        { to: "/st-admin/subservices", text: "Sub Services", icon: Layers },
        { to: "/st-admin/subservice-option", text: "Services Options", icon: UserCog },
      ],
    },
    { id: "Service-Requests", to: "/st-admin/service-requests", text: "Service Requests", icon: ClipboardList },
    { id: 'credit-wallet', to: '/st-admin/credit-wallet', text: 'Credit Wallet', icon: WalletCards },
    { id: "notices", to: "/st-admin/manage-notices", text: "Manage Notices", icon: Megaphone },
    {
      id: "user",
      text: "User Management",
      icon: Users,
      submenu: [
        { to: "/st-admin/add-user", text: "Add New User", icon: UserPlus },
        { to: "/st-admin/admin-list", text: "Admin List", icon: UserCog },
      ],
    },
    { id: 'wishes', to: "/st-admin/retailer-wishes", text: "Global Messages", icon: MessageCircle }
  ];

  const links = user?.role === "admin" ? adminLinks : retailerLinks;
  const toggleMenu = (id) => setExpandedMenu(expandedMenu === id ? null : id);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 z-[9999] h-screen bg-[#2A2185] text-white shadow-xl 
          transition-all duration-300 ease-in-out overflow-hidden flex flex-col 
          ${isOpen ? "w-[280px]" : "w-0 md:w-[80px]"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-[#2A2185] rounded-full w-10 h-10 flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            {isOpen && (
              <div>
                <h1 className="font-semibold text-lg leading-tight">{user?.name}</h1>
                <p className="text-xs text-gray-300 capitalize">{user?.role || "Admin"}</p>
                <p className="text-xs text-gray-300 capitalize">{user?.mobile}</p>
              </div>
            )}
          </div>
          {isOpen && (
            <button
              onClick={toggleSidebar}
              className="md:hidden text-white hover:bg-white/20 p-2 rounded-full"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu with custom scrollbar */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isExpanded = expandedMenu === link.id;

              return (
                <li key={link.id} className="relative group">
                  {link.submenu ? (
                    <>
                      <button
                        onClick={() => toggleMenu(link.id)}
                        className={`w-full flex items-center justify-between px-5 py-3.5 transition-all duration-300 
                          ${isExpanded ? "bg-white/5 " : "hover:bg-white/10"}`}
                      >
                        <div className="flex items-center gap-4">
                          <Icon className="w-6 h-6" />
                          {isOpen && (
                            <span className="text-base font-medium tracking-wide">
                              {link.text}
                            </span>
                          )}
                        </div>
                        {isOpen && (
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>
                      <AnimatePresence>
                        {isExpanded && isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="ml-8 pl-4 border-l-2 border-white/10 overflow-hidden"
                          >
                            <div className="py-2 space-y-1">
                              {link.submenu.map((sub, idx) => {
                                const SubIcon = sub.icon;
                                return (
                                  <NavLink
                                    key={idx}
                                    to={sub.to}
                                    className={({ isActive }) =>
                                      `flex items-center gap-4 text-[15px] px-4 py-3 rounded-lg transition-all ${isActive
                                        ? "bg-white text-[#2A2185] font-semibold"
                                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                                      }`
                                    }
                                  >
                                    <SubIcon className="w-5 h-5" />
                                    <span>{sub.text}</span>
                                  </NavLink>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-5 py-3.5 relative transition-all duration-300 ${isActive
                          ? "bg-white text-[#2A2185] font-semibold"
                          : "hover:bg-white/10 text-white"
                        }`
                      }
                    >
                      <Icon className="w-6 h-6" />
                      {isOpen && (
                        <span className="text-base font-medium tracking-wide">
                          {link.text}
                        </span>
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-lg hover:bg-red-500/20 text-red-300 transition-all"
          >
            <LogOut className="w-6 h-6" />
            {isOpen && <span className="text-base font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
