import React from "react";
import { Phone, Mail, Clock, MapPin, MessageCircle, HelpCircle } from "lucide-react";

const Support = () => {
  const supportOptions = [
    {
      icon: <Phone size={28} />,
      title: "Call Us Directly",
      description:
        "Need instant help? Our experts are just a call away to assist you with any issue or inquiry.",
      detail: "+91 123-456-7890",
      cta: "Call Now",
      link: "tel:+911234567890",
    },
    {
      icon: <Mail size={28} />,
      title: "Email Support",
      description:
        "For detailed queries, reach out to us via email. Expect a thoughtful response within 24 hours.",
      detail: "support@legtech.com",
      cta: "Send Email",
      link: "mailto:support@legtech.com",
    },
    {
      icon: <MessageCircle size={28} />,
      title: "Live Chat",
      description:
        "Chat instantly with our support agents for quick troubleshooting and general inquiries.",
      detail: "Chat with us now",
      cta: "Start Chat",
      link: "#",
    },
    {
      icon: <Clock size={28} />,
      title: "Business Hours",
      description:
        "We’re available throughout the week during these hours. Reach us anytime between 9 AM to 6 PM.",
      detail: "Mon – Sat: 9 AM – 6 PM",
      cta: "View Schedule",
      link: "#",
    },
    {
      icon: <MapPin size={28} />,
      title: "Visit Our Office",
      description:
        "Prefer an in-person discussion? Visit our Bangalore office for direct consultation and assistance.",
      detail: "123 Tech Park, Bangalore, India",
      cta: "Get Directions",
      link: "https://www.google.com/maps/search/?api=1&query=123+Tech+Park+Bangalore+India",
      target: "_blank",
    },
    {
      icon: <HelpCircle size={28} />,
      title: "Help Center",
      description:
        "Explore guides, FAQs, and articles to help you get the most out of our platform.",
      detail: "Access resources instantly",
      cta: "Go to Help Center",
      link: "#",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-indigo-600 via-purple-600 to-indigo-700 text-white py-28 text-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            We're Here to Help You
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 leading-relaxed mb-8">
            Whether you have a question, need technical support, or want to
            discuss solutions — our team is ready to assist.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a
              href="tel:+911234567890"
              className="bg-white text-indigo-700 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-indigo-100 transition-all duration-300"
            >
              Call Now
            </a>
            <a
              href="mailto:support@legtech.com"
              className="bg-transparent border border-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-700 transition-all duration-300"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="relative z-10 -mt-16 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {supportOptions.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 border border-gray-100 hover:border-indigo-200 group"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
                <p className="text-indigo-600 font-semibold mb-6">
                  {item.detail}
                </p>
                <a
                  href={item.link}
                  target={item.target || "_self"}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium shadow-md hover:bg-indigo-700 transition-all duration-300"
                >
                  {item.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="text-center py-10 bg-gray-100 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} LegTech Support. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Support;
