
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BriefcaseBusiness,
  MessageSquare,
  HelpCircle,
  Settings,
  Lock,
  LogOut,
  ChevronDown,
  X,
  Package,
  ShoppingCart,
  PieChart,
  ServerCogIcon,
  Layers,
  Wallet,
  History,
  User,
  BarChart3,
  LifeBuoy,
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
        const { success, message } = await logout();
        if (success) {
          navigate("/");
          Swal.fire("Logged Out!", "You have been logged out successfully.", "success");
        } else {
          Swal.fire("Error!", message, "error");
        }
      }
    });
  };

  const retailerLinks = [
    { id: "dashboard", to: "/retailer/dashboard", text: "Dashboard", icon: LayoutDashboard },
  { id: "services", to: "/retailer/services", text: "Services", icon: Layers },
  { id: "transction", to: "/retailer/transction", text: "Transactions", icon: PieChart },
  { id: "history", to: "/", text: "History", icon: History },
  { id: "profile", to: "/", text: "Profile", icon: User },
  { id: "paymentChart", to: "/", text: "Payment Chart", icon: BarChart3 },
  { id: "support", to: "/", text: "Support", icon: LifeBuoy },
  ]

  const adminLinks = [
    { id: "Dashboard", to: "/admin/dashboard", text: "Dashboard", icon: LayoutDashboard },
    {
      id: "retailers",
      text: "Retailers",
      icon: Briefcase,
      submenu: [
        { to: "/admin/verify-retailers", text: "Verify Retailers" },
        { to: "/admin/retailers", text: "All Retailers" },
      ],
    },

    {
      id: "services",
      text: "Services Managment",
      icon: BriefcaseBusiness,
      submenu: [
        { to: "/admin/services", text: "Services" },
        { to: "/admin/subservices", text: "Sub Services" },
        { to: "/admin/subservice-option", text: "Services Options" },

      ],
    },

    { id: "Service-Requests", to: "/admin/service-requests", text: "Service Requests", icon: LayoutDashboard },




    {
      id: "user",
      text: "User Managment",
      icon: Users,
      submenu: [
        { to: "/admin/add-user", text: "Add New User" },
        { to: "/admin/admin-list", text: "Admin List" },
      ],
    },
  ]

  const links = user?.role === "admin" ? adminLinks : retailerLinks
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
          transition-all duration-500 overflow-hidden flex flex-col 
          ${isOpen ? "w-[280px]" : "w-0 md:w-[80px]"}
        `}
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
                <p className="text-xs text-gray-300 capitalize">
                  {user?.role || "Admin"}
                </p>
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

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide">
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
                        className={`w-full flex items-center justify-between px-5 py-3 rounded-l-[30px] transition-all duration-300 
                          ${isExpanded ? "bg-white/10 " : "hover:bg-white/10"}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          {isOpen && (
                            <span className="text-[15px] font-medium tracking-wide">
                              {link.text}
                            </span>
                          )}
                        </div>
                        {isOpen && (
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                              }`}
                          />
                        )}
                      </button>
                      {isExpanded && isOpen && (
                        <div className="ml-10 mt-2 space-y-1 border-l border-white/20 pl-3">
                          {link.submenu.map((sub, idx) => (
                            <NavLink
                              key={idx}
                              to={sub.to}
                              className={({ isActive }) =>
                                `block text-sm px-3 py-2 rounded-lg transition-all ${isActive
                                  ? "bg-white text-[#2A2185] font-semibold"
                                  : "text-gray-200 hover:bg-white/10 hover:text-white"
                                }`
                              }
                            >
                              {sub.text}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-5 py-3 rounded-l-[30px] relative transition-all duration-300 
                          ${isActive
                          ? "bg-white text-[#2A2185] font-semibold"
                          : "hover:bg-white/10 text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="w-5 h-5" />
                          {isOpen && (
                            <span className="text-[15px] font-medium tracking-wide">
                              {link.text}
                            </span>
                          )}


                        </>
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
            className="w-full flex items-center gap-3 px-5 py-3 rounded-l-[30px] hover:bg-red-500/20 text-red-300 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="text-[15px] font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
