import React from "react";
import { Activity, Smartphone, Settings, Lock, Zap, Database } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Activity className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Real-Time Analytics",
      description: "Monitor your financial data in real-time with customizable dashboards and automated reports.",
      highlights: ["Live data updates", "Custom KPIs", "Exportable reports"]
    },
    {
      icon: <Smartphone className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Mobile Access",
      description: "Full platform functionality on iOS and Android with offline capabilities and biometric login.",
      highlights: ["Cross-platform", "Offline mode", "Touch/Face ID"]
    },
    {
      icon: <Settings className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Customizable Workflows",
      description: "Tailor our platform to fit your unique business processes with no-code automation tools.",
      highlights: ["Drag-and-drop builder", "API triggers", "Role-based views"]
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Bank-Level Security",
      description: "Enterprise-grade security with end-to-end encryption and regular third-party audits.",
      highlights: ["256-bit encryption", "SOC 2 compliant", "2FA enforcement"]
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Instant Notifications",
      description: "Get real-time alerts for important transactions and system events across multiple channels.",
      highlights: ["Multi-channel alerts", "Custom thresholds", "Snooze options"]
    },
    {
      icon: <Database className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Data Portability",
      description: "Easily import/export your data with support for all major accounting formats and APIs.",
      highlights: ["CSV/Excel", "QuickBooks sync", "API access"]
    }
  ];

  return (
    <section id="features" className="py-16 md:pt-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful <span className="text-blue-600">Features</span> Built for Growth
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to manage, analyze, and optimize your financial operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <svg className="flex-shrink-0 w-4 h-4 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
            Explore All Features
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;