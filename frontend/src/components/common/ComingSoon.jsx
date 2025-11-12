import React from "react";
import { motion } from "framer-motion";
import { Mail, Instagram, Facebook, Linkedin } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center  text-gray-800 px-4 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-10 left-10 text-gray-300 text-xl">•</div>
      <div className="absolute top-16 right-16 text-gray-300 text-xl">+</div>
      <div className="absolute bottom-10 left-1/3 text-gray-200 text-5xl">.</div>
      <div className="absolute bottom-16 right-1/4 text-gray-200 text-4xl">•</div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl w-full"
      >
        <p className="uppercase tracking-[3px] text-sm text-gray-400 mb-4">
          Coming Soon
        </p>
        <h1 className="text-5xl sm:text-6xl font-serif font-semibold text-gray-900 mb-4">
          We’re blowing up<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg mb-10">
          We’re under construction. Check back for an update soon.
          <br /> Stay in touch!
        </p>

   

        {/* Social Icons */}
        <div className="flex justify-center gap-6 text-gray-400 mb-8">
          <a href="#" className="hover:text-indigo-500 transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="hover:text-indigo-500 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>

          <a href="#" className="hover:text-indigo-500 transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} LegTech Fintech Systems
        </p>
      </motion.div>

      {/* Optional floating button */}
      <a
        href="https://wa.me/919919918196?text=Hi%2C%20I%20am%20a%20retailer.%20I%20need%20help."
        target="_blank"
        className="absolute top-6 right-6 bg-yellow-400 text-black px-4 py-2 rounded-full font-medium text-sm shadow hover:bg-yellow-500 transition-all"
      >
        Support ☕
      </a>
    </div>
  );
};

export default ComingSoon;
