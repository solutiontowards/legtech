import React from "react";
import { assets } from "../../assets/assets_frontend/assets";
import { Expand, ChevronLeft, ChevronRight } from "lucide-react";

const Gallery = () => {
  const galleryImages = [
    { src: "/banner_2.jpg", alt: "Our office workspace" },
    { src: "/banner_2.jpg", alt: "Team collaboration session" },
    { src: "/banner_2.jpg", alt: "Product showcase" },
    { src: "/banner_2.jpg", alt: "Company event" },
    { src: "/banner_2.jpg", alt: "Award ceremony" },
    { src: "/banner_2.jpg", alt: "Client meeting" },
  ];

  return (
    <section id="gallery" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-4">
            Moments
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-blue-600">Gallery</span>
          </h2>
          <p className="text-lg text-gray-600">
            Capturing the essence of our work and culture
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-medium">{image.alt}</p>
                  <button className="mt-2 flex items-center text-sm text-white/80 hover:text-white transition-colors">
                    <Expand className="w-4 h-4 mr-1" />
                    View full size
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12 space-x-4">
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
