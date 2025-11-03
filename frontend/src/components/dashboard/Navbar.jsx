import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Wallet,
  PhoneCall,
  Settings,
  User,
} from "lucide-react";
import { getWalletBalance } from "../../api/wallet";
import Swal from "sweetalert2";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);

  const fetchBalance = async () => {
    if (user && user.role === "retailer") {
      try {
        const { data } = await getWalletBalance();
        setWalletBalance(data.balance);
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
        setWalletBalance(null); // Set to null on error
      }
    }
  };

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
  const phoneNumber = "8250883776";

  useEffect(() => {
    fetchBalance();
    // We listen for changes on the user object from AuthContext
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left section - Logo and menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 "
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Wallet (for retailer only) */}
          {user?.role === "retailer" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-800">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">
                {walletBalance !== null
                  ? `₹${walletBalance.toFixed(2)}`
                  : "Loading..."}
              </span>
            </div>
          )}

          {/* Contact button */}
          <a
            href={`tel:${phoneNumber}`}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <PhoneCall className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Support</span>
          </a>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-800 to-indigo-600 text-white font-bold text-base">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">{user?.role || "Admin"}</p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                  } hidden sm:block`}
              />
            </button>

            {/* Dropdown menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white border border-gray-100 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="py-1">
                  {/* <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="h-4 w-4 text-gray-500" /> Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="h-4 w-4 text-gray-500" /> Settings
                  </button> */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
