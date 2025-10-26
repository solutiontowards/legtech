import React, { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const HomeNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Features", href: "#features" },
    { name: "Contact Us", href: "#contact" },
  ];

  // Effect to handle clicks outside the navbar to close the mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNavClick = (e, href, isMobile = false) => {
    if (href.startsWith("#")) {
      e.preventDefault();

      if (isMobile) {
        toggleMenu();
      }

      // If we are not on the home page, navigate there first
      if (location.pathname !== "/") {
        navigate("/");
      }

      // Use a short timeout to allow the page to change before scrolling
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <nav
      ref={navRef}
      className="flex items-center justify-between text-black bg-white py-2 px-3 md:px-12 lg:px-20 shadow-md sticky top-0 z-50"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-16 w-auto object-contain"
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center">
        <ul className="flex gap-8 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href.startsWith("#") ? `/${item.href}` : item.href}
                className="relative group transition-all duration-300 hover:text-blue-400 uppercase"
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </li>
          ))}
        </ul>

      </div>

      <div className="hidden lg:flex items-center gap-2">
        <Link
          to="/register"
          className="bg-black hover:bg-black px-5 py-2 text-white rounded-md font-medium transition-colors duration-300 whitespace-nowrap"
        >
          Register Retailer
        </Link>
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 px-5 py-2 text-white rounded-md font-medium transition-colors duration-300 whitespace-nowrap"
        >
          Retailer Login
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <button onClick={toggleMenu} className="lg:hidden text-black">
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown */}
      <div
        className={`absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-xl p-6 z-40 lg:hidden transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          }`} // Improved animation
      >
        <ul className="flex flex-col gap-4 text-base font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href.startsWith("#") ? `/${item.href}` : item.href}
                className="block py-2 transition-all duration-300 hover:text-blue-400 uppercase"
                onClick={(e) => handleNavClick(e, item.href, true)}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t pt-6 flex gap-4">
          <Link
            to="/register"
            onClick={toggleMenu}
            className="w-full text-center block bg-black hover:bg-blue-500 px-5 py-3 text-white rounded-md font-medium transition-colors duration-300"
          >
            Register Retailer
          </Link>
          <Link
            to="/login"
            onClick={toggleMenu}
            className="w-full text-center block bg-blue-400 hover:bg-blue-500 px-5 py-3 text-white rounded-md font-medium transition-colors duration-300"
          >
            Retailer Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;