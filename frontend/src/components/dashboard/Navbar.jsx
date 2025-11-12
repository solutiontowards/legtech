import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Wallet,
  PhoneCall,
  User,
} from "lucide-react";
import { getWalletBalance } from "../../api/wallet";
import Swal from "sweetalert2";

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const profileRef = useRef(null);

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
        await logout();
        navigate("/");
        // Show success message after navigation
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
  const phoneNumber = "9919918196";

  useEffect(() => {
    fetchBalance();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  return (
    <header className="sticky top-0 z-[999] bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2">
        {/* Left section - Logo and menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full transition-colors text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Wallet (for retailer only) */}
          {user?.role === "retailer" && (
            <Link to="/retailer/wallet" className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2 text-indigo-800">
                <Wallet className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">
                  {walletBalance !== null
                    ? `₹${walletBalance.toFixed(2)}`
                    : "Loading..."}
                </span>
              </div>
            </Link>
          )}

          {/* Contact button */}
          <a
            href={`tel:${phoneNumber}`}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <PhoneCall className="h-4 w-4 text-gray-600" />
            <span className="text-gray-700">Support</span>
          </a>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "Admin"}
                </p>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                } hidden sm:block`}
              />
            </button>
            {/* Dropdown menu */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100"
                style={{ transform: 'scale(0.95)', opacity: 0, animation: 'fadeIn 0.1s ease-out forwards' }}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || "Admin"}
                  </p>
                </div>
                <div className="py-1">
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

const fadeInAnimation = `
  @keyframes fadeIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Inject the animation into the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = fadeInAnimation;
document.head.appendChild(styleSheet);

export default Navbar;
