import React from "react";
import { FaPhoneAlt, FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";

const TopNavbar = () => {
  return (
    <div className="bg-[#082c4c] text-white text-sm px-4 md:px-8 lg:px-20 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {/* Left: Phone Number */}
        <div className="flex items-center gap-2">
          <FaPhoneAlt className="text-white" />
          <span className="font-medium">+91 (702) 995-9582</span>
        </div>

        {/* Center: Message */}
        <div className="text-center font-medium text-sm">
          Elevate Your Business with Our Cutting-Edge Web Solutions
        </div>

        {/* Right: Social Icons */}
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Facebook" className="hover:text-blue-400 transition">
            <FaFacebookF />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-blue-400 transition">
            <FaLinkedinIn />
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-blue-400 transition">
            <FaInstagram />
          </a>
        </div>
        
      </div>
    </div>
  );
};

export default TopNavbar;