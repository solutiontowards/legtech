import React, { useEffect, useRef } from "react";
import Typed from "typed.js";

import About from "../components/Home/About";
import Services from "../components/Home/Services";
import Features from "../components/Home/Features";
import Contact from "../components/Home/Contact";

const Home = () => {
  const typedRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ["Empower Growth", "Transform Operations", "Scale Securely"],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
      smartBackspace: true,
      showCursor: false, // WE HIDE THIS CURSOR
    });

    return () => typed.destroy();
  }, []);

  return (
    <div className="bg-gray-50">

      {/* INLINE CSS FIX FOR CURSOR */}
      <style>{`
        .typed-cursor-custom {
          display: inline-block;
          font-weight: 300;
          margin-left: 2px;
          animation: blink 0.7s infinite;
        }
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <main className="overflow-hidden">

        {/* HERO SECTION */}
        <section
          id="home"
          className="relative px-6 md:px-12 lg:px-20 py-24 md:py-32 bg-black/70"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("/hero_image_2.webp")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mx-auto w-full">
            <div >

              {/* LEFT TEXT CONTENT */}
              <div className="text-white space-y-7">

                {/* TYPING TITLE */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">

                  {/* FIXED HEIGHT TYPING ROW */}
                  <div className="flex items-center min-h-[80px] leading-none">
                    <span
                      ref={typedRef}
                      className="typed-text block text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold whitespace-nowrap overflow-hidden"
                    />
                    <span className="typed-cursor-custom text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl">|</span>
                  </div>


                  {/* STATIC TITLE */}
                  <span className="text-blue-400 block pt-3 text-3xl md:text-5xl lg:text-6xl">
                    LegTech Solutions
                  </span>
                </h1>

                {/* SUBTEXT */}
                <p className="text-gray-200 text-lg md:text-xl max-w-xl leading-relaxed">
                  Transform your financial operations with enterprise-ready fintech
                  solutions — secure, scalable, and built for high-performance growth.
                </p>

                {/* TRUST BADGE */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-10 w-10 rounded-full bg-blue-400/20 backdrop-blur flex items-center justify-center text-blue-300 text-xl font-semibold">
                    ⭐
                  </div>
                  <span className="text-gray-300">
                    Trusted by <span className="text-white font-bold">1000+</span> global Retailers
                  </span>
                </div>

                {/* CTA BUTTONS */}
                <div className="flex flex-wrap gap-4 pt-6">

                  <button
                    onClick={() =>
                      document.querySelector("#services")?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-7 py-3.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Explore Services
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 border border-white text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-white hover:text-black transition-all"
                  >
                    Contact Us
                  </a>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* REST OF THE PAGE */}
        <About />
        <Services />
        <Features />
        <Contact />

      </main>
    </div>
  );
};

export default Home;
