import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, LogOut, ChevronDown, Wallet, PhoneCall } from "lucide-react";
import { getWalletBalance } from "../../api/wallet";
import Swal from "sweetalert2";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);

  const profileRef = useRef(null);
  const langRef = useRef(null);

  // -------------------------------------------
  // GOOGLE TRANSLATE SCRIPT LOAD
  // -------------------------------------------
  const googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: "en,hi,bn",
        autoDisplay: false,
        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
      },
      "google_translate_element"
    );
  };

  useEffect(() => {
    // Define the init function on the window object
    window.googleTranslateElementInit = googleTranslateElementInit;

    // Check if the script already exists to avoid duplicates
    if (!document.querySelector("script[src*='translate.google.com']")) {
      const googleTranslateScript = document.createElement("script");
      googleTranslateScript.id = "google-translate-script";
      googleTranslateScript.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(googleTranslateScript);
    };
  }, []);

  // Hide Google Translate Default UI
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .goog-te-banner-frame { display: none !important; }
      .goog-logo-link { display: none !important; }
      .goog-te-gadget { height: 0 !important; overflow: hidden; }
      .goog-te-gadget-simple { display: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  // -------------------------------------------
  // MANUAL LANGUAGE CHANGE
  // -------------------------------------------
  const changeLanguage = (langCode) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      if (langCode === 'en') {
        // If switching back to English, we only need to do it once.
        select.value = 'en';
        select.dispatchEvent(new Event("change"));
      } else {
        // To ensure a clean translation when switching between non-English languages,
        // we first revert to the original language (English).
        select.value = 'en';
        select.dispatchEvent(new Event("change"));

        // A short delay is crucial to allow the widget to process the reversion
        // before applying the new language.
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
      }
    } else {
      console.error("Google Translate dropdown not found.");
    }
    setLanguageOpen(false);
  };

  // -------------------------------------------
  // FETCH WALLET BALANCE
  // -------------------------------------------
  const fetchBalance = async () => {
    if (user?.role === "retailer") {
      try {
        const { data } = await getWalletBalance();
        setWalletBalance(data.balance);
      } catch (err) {
        setWalletBalance(null);
      }
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  // -------------------------------------------
  // LOGOUT
  // -------------------------------------------
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
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
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }

      if (langRef.current && !langRef.current.contains(e.target)) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  
  return (
    <>
      {/* Hidden Google translate element */}
      <div id="google_translate_element" className="hidden"></div>

      <header className="sticky top-0 z-[999] bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2">

          {/* LEFT: Menu + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* 🌐 CUSTOM LANGUAGE DROPDOWN */}
            <div className="relative sm:block hidden" ref={langRef}>
              <button
                onClick={() => setLanguageOpen(!languageOpen)}
                className="px-4 py-2 border rounded-full text-sm flex items-center gap-2 hover:bg-gray-100"
              >
                🌐 Language
                <ChevronDown
                  className={`h-4 w-4 transition ${languageOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {languageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border text-sm">
                  <button
                    onClick={() => changeLanguage("en")}
                    className="w-full px-4 py-2 hover:bg-gray-100"
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("hi")}
                    className="w-full px-4 py-2 hover:bg-gray-100"
                  >
                    हिंदी
                  </button>
                  <button
                    onClick={() => changeLanguage("bn")}
                    className="w-full px-4 py-2 hover:bg-gray-100"
                  >
                    বাংলা
                  </button>
                </div>
              )}
            </div>

            {/* Wallet */}
            {user?.role === "retailer" && (
              <Link
                to="/retailer/wallet"
                className="flex items-center gap-2 px-3 py-2 rounded-full border hover:bg-gray-100"
              >
                <Wallet className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">
                  {walletBalance !== null
                    ? `₹${walletBalance.toFixed(2)}`
                    : "Loading..."}
                </span>
              </Link>
            )}

            {/* Support */}
            <a
              href="https://wa.me/919919918196"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100 text-sm"
            >
              <PhoneCall className="h-4 w-4 text-gray-600" />
              Support
            </a>


            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>

                <ChevronDown
                  className={`h-5 w-5 text-gray-400 hidden sm:block ${profileOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
