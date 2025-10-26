import React, { useEffect, useRef, useState } from "react";
import Typed from "typed.js";
import HomeNavbar from "../components/HomeNavbar";
import HomeFooter from "../components/HomeFooter";
import About from "../components/Home/About";
import Services from "../components/Home/Services";
import Features from "../components/Home/Features";
import Contact from "../components/Home/Contact";
// import { assets } from "../assets/assets_frontend/assets";
import TopNavbar from "../components/TopNavbar";

const Home = () => {
  const typedRef = useRef(null);
  const [isPopupVisible, setIsPopupVisible] = useState(true); // Controls rendering
  const [showPopup, setShowPopup] = useState(false); // Controls animation

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "Empower Your Finances with",
        "Transform Your Business with",
        "Scale Securely with",
      ],
      typeSpeed: 50,
      loop: true,
      backSpeed: 30,
      backDelay: 1500,
    });

    // Show popup after a short delay on component mount
    const timer = setTimeout(() => setShowPopup(true), 100);

    return () => {
      typed.destroy();
      clearTimeout(timer);
    };
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false); // Start fade-out animation
    setTimeout(() => {
      setIsPopupVisible(false); // Remove from DOM after animation
    }, 300); // Must match the transition duration
  };

  return (
    <div className="bg-gray-50">
      {/* ===== Popup Modal ===== */}
      {/* {isPopupVisible && (
        <div
          onClick={handleClosePopup}
          className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            showPopup ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative text-center transition-all duration-300 ${
              showPopup ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-blue-600 mb-4">🚀 শীঘ্রই আসছে</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              রিটেইলারদের জন্য স্মার্ট Fintech সমাধান – সহজ, নিরাপদ, লাভজনক।
            </p>

            <div className="flex justify-center mt-6">
              <video
                src="/loader.mp4" // place this file inside /public folder
                autoPlay
                loop
                muted
                playsInline
                className="w-32 h-32 rounded-full object-contain"
              />
            </div>

            <p className="mt-6 text-sm text-gray-500">🤝 আপনার ব্যবসার ভরসা।</p>
          </div>
        </div>
      )} */}

      {/* ====== Actual Website Content ====== */}
  
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section
          id="home"
          className="relative px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("/hero_image_2.webp")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-12 lg:gap-16">
              {/* Left Content */}
              <div className="space-y-6 text-white w-full">
                <div className="min-h-[120px] md:min-h-[144px] flex items-center">
                  <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold leading-tight">
                    <span
                      ref={typedRef}
                      className="block mb-2 whitespace-normal break-words"
                      style={{ lineHeight: "1.2" }}
                    />
                    <span className="text-blue-400">LegTech Solutions</span>
                  </h1>
                </div>

                <p className="text-gray-200 text-lg leading-relaxed max-w-lg">
                  Streamline your financial operations with cutting-edge fintech
                  software. Secure, scalable, and tailored to your business
                  needs.
                </p>

                <div className="flex items-center gap-4">
                  {/* <img
                    src={assets.group_profiles}
                    alt="Group Profiles"
                    className="w-28"
                    loading="lazy"
                  /> */}
                  <span className="text-gray-300">
                    Trusted by{" "}
                    <span className="font-semibold text-white">10K+</span>{" "}
                    businesses worldwide
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <a
                    href="#services"
                    className="inline-flex items-center gap-2 bg-blue-400 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .querySelector("#services")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Explore Services
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white hover:text-gray-900 transition-all duration-300"
                  >
                    Contact Us
                  </a>
                </div>
              </div>

              {/* Right Content */}
              <div className="relative w-full">
                <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
              
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other Sections */}
        <About />
        <Services />
        <Features />
        <Contact />
      </main>
   
    </div>
  );
};

export default Home;
