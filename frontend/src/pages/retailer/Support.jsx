import React from "react";
import { Phone, MessageCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const RetailerSupport = () => {
  const supportCards = [
    {
      title: "24/7 Retailer Helpdesk",
      description:
        "Need guidance? Access FAQs, watch quick tutorials, or connect instantly with a support executive.",
      cta: "Visit Help Center",
      link: "https://wa.me/919919918196?text=Hi%20I%20am%20a%20retailer.%20I%20need%20help.",
      gradient: "from-[#E9EEFF] to-[#F4F6FF]",
      accent: "text-black",
      iconBg: "bg-indigo-600",
      icon: <HelpCircle className="w-6 h-6 text-white" />,
    },
    {
      title: "Talk to Our Team",
      description:
        "Speak directly with our expert support staff for real-time issue resolution and onboarding guidance.",
      cta: "Call Now",
      link: "tel:+919919918196",
      gradient: "from-[#EEF9F2] to-[#F8FCF9]",
      accent: "text-black",
      iconBg: "bg-emerald-600",
      icon: <Phone className="w-6 h-6 text-white" />,
    },
    {
      title: "Chat on WhatsApp",
      description:
        "Start a chat session with our support executive on WhatsApp for instant help — quick and convenient.",
      cta: "Start Chat",
      link: "https://wa.me/919919918196?text=Hi%20I%20am%20a%20retailer.%20I%20need%20help.",
      gradient: "from-[#E8F1FF] to-[#F3F8FF]",
      accent: "text-black",
      iconBg: "bg-blue-600",
      icon: <MessageCircle className="w-6 h-6 text-white" />,
    },
  ];

  return (
    <div className="min-h-screen  text-gray-900 flex flex-col items-center py-20 px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Contact Support
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
          Get in touch with the right people at <span className="text-indigo-600 font-semibold">LegTech</span>.  
          Our retailer success team is here to help you every step of the way.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
        {supportCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-3xl p-10 flex flex-col justify-between shadow-lg bg-gradient-to-br ${card.gradient} border border-gray-200 hover:shadow-2xl transition-all duration-500`}
          >
            <div>
              {/* Icon */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full ${card.iconBg} shadow-md mb-6`}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h3
                className={`text-2xl font-bold mb-3 ${card.accent}`}
              >
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 text-base leading-relaxed mb-8">
                {card.description}
              </p>
            </div>

            {/* CTA Button */}
            <a
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm ${card.accent} border border-current hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white transition-all duration-300`}
            >
              {card.cta}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-24 text-gray-500 text-sm">
        © {new Date().getFullYear()} LegTech All Rights Reserved.
      </div>
    </div>
  );
};

export default RetailerSupport;
