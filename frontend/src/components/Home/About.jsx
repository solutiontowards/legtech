import React from "react";
import CountUp from "react-countup";

const About = () => {
  return (
    <section id="about" className="py-16 md:pt-24 pb-0 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-400">LegTech</span>
          </h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto">
            Pioneering fintech solutions for the modern business landscape
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center relative">
          {/* Image with video overlay */}
          <div className="lg:w-1/2 relative">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              alt="LegTech Team" 
              className="rounded-lg shadow-xl w-full h-auto object-cover"
            />
            <div className="absolute bottom-4 right-4 w-32 h-50 rounded-lg overflow-hidden border-2 border-white shadow-md">
              <video
                src="https://cdnl.iconscout.com/lottie/premium/preview-watermark/insurance-policy-animation-download-in-lottie-json-gif-static-svg-file-formats--protection-security-claim-protect-project-ideas-pack-business-animations-10119241.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:w-1/2">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Empowering Businesses Through Innovation
              </h3>

              <p className="text-gray-600 leading-relaxed">
                LegTech is a leading fintech software provider dedicated to empowering businesses with innovative financial solutions. Our mission is to simplify complex financial processes through cutting-edge technology.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Founded in 2020, we have grown to serve over 10,000 businesses worldwide, offering secure, scalable, and user-friendly platforms that transform financial operations.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-400 text-xl mb-2">
                    <CountUp end={10000} duration={2.5} separator="," />+
                  </h4>
                  <p className="text-gray-600">Businesses Served</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-400 text-xl mb-2">
                    <CountUp end={50} duration={2} />+
                  </h4>
                  <p className="text-gray-600">Countries</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-400 text-xl mb-2">
                    24/7
                  </h4>
                  <p className="text-gray-600">Support</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-400 text-xl mb-2">
                    <CountUp end={99.9} duration={2} decimals={1} />%
                  </h4>
                  <p className="text-gray-600">Uptime</p>
                </div>
              </div>

              <button className="mt-8 px-8 py-3 bg-blue-400 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg">
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
