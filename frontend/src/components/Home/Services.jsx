import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import {
  CreditCard,
  PieChart,
  Shield,
  Building2,
  BadgeIndianRupee,
  Landmark,
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "GST Services",
      description:
        "Streamline your tax filing and compliance with expert GST solutions.",
      features: ["GST Registration", "Return Filing", "Consultation"],
    },
    {
      icon: <Building2 className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "PAN Services",
      description:
        "Apply or update your PAN with guided support and fast processing.",
      features: ["New PAN", "Corrections", "Reprint Services"],
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Aadhar ATM",
      description:
        "Convenient cash withdrawal and balance check using Aadhaar authentication.",
      features: ["Secure AEPS", "Micro-ATM Setup", "Easy Integration"],
    },
    {
      icon: <PieChart className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Income Tax Services",
      description:
        "Reliable income tax filing and advisory services for individuals and businesses.",
      features: ["ITR Filing", "Tax Planning", "Assessment Help"],
    },
    {
      icon: <Building2 className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Ayushman Bharat Agency",
      description:
        "Get registered to offer health coverage under the Ayushman Bharat scheme.",
      features: ["Agency Setup", "Scheme Onboarding", "Support & Training"],
    },
    {
      icon: (
        <BadgeIndianRupee className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
      ),
      title: "Financial Services",
      description:
        "Comprehensive financial solutions to support business and personal goals.",
      features: ["Loan Assistance", "Investment Plans", "Insurance Services"],
    },
    {
      icon: <Landmark className="w-6 h-6 text-blue-600" strokeWidth={1.5} />,
      title: "Start New Business",
      description:
        "End-to-end support for setting up and launching your new business venture.",
      features: [
        "Business Registration",
        "MSME/Startup India",
        "Legal & Branding Help",
      ],
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-4">
            What We Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Transformative <span className="text-blue-600">Financial</span>{" "}
            Solutions
          </h2>
          <p className="text-lg text-gray-600">
            Empowering businesses and individuals with secure, fast, and
            future-ready services.
          </p>
        </div>

        <Swiper
          spaceBetween={16}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          modules={[Autoplay]}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="mySwiper"
        >
          {services.map((service, index) => (
            <SwiperSlide key={index}>
              <div className="h-full px-2 py-6">
                <div className="group relative bg-white p-6 h-full rounded-xl border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="absolute -top-5 left-6 w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                    {service.icon}
                  </div>
                  <div className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start text-sm text-gray-600"
                        >
                          <svg
                            className="flex-shrink-0 w-4 h-4 text-blue-500 mt-0.5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center mt-16">
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
            Discover All Capabilities
            <svg
              className="ml-2 -mr-1 w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;