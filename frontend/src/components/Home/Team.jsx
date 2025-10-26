import React from "react";
import { assets } from "../../assets/assets_frontend/assets";
import { Linkedin, Twitter, Github, Mail } from "lucide-react";

const Team = () => {
  const teamMembers = [
    {
      img: assets.mainul,
      name: "Mainul Haque",
      role: "CEO & Founder",
      bio:"Founder & CEO of Comply, passionate about driving innovation and excellence. With a vision to simplify compliance and empower businesses, they lead with integrity, agility, and a relentless focus on impact.",
      social: [
        { icon: <Linkedin size={16} />, url: "#" },
        { icon: <Twitter size={16} />, url: "#" },
        { icon: <Mail size={16} />, url: "#" }
      ]
    },
    {
      img: assets.profile_pic,
      name: "Jane Smith",
      role: "CTO",
      social: [
        { icon: <Linkedin size={16} />, url: "#" },
        { icon: <Github size={16} />, url: "#" },
        { icon: <Mail size={16} />, url: "#" }
      ]
    },
    {
      img: assets.profile_pic,
      name: "Alex Johnson",
      role: "Lead Developer",
      social: [
        { icon: <Linkedin size={16} />, url: "#" },
        { icon: <Twitter size={16} />, url: "#" },
        { icon: <Github size={16} />, url: "#" }
      ]
    }
  ];

  return (
    <section id="team" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full mb-4">
            Our Experts
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Leadership Team
          </h2>
          <p className="text-gray-600">
          Founder & CEO of Comply, passionate about driving innovation and excellence. With a vision to simplify compliance and empower businesses, they lead with integrity, agility, and a relentless focus on impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="group flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 left-0 right-0 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {member.social.map((social, i) => (
                    <a 
                      key={i}
                      href={social.url}
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors duration-200 shadow-md"
                      aria-label={`Connect with ${member.name} on ${social.icon.type.name}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <div className="w-12 h-0.5 bg-gray-200 mb-4"></div>
              <p className="text-gray-500 text-sm">
                {member.bio || "Passionate about driving innovation and excellence"}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <button className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-100 hover:bg-blue-50 hover:shadow-sm transition-all duration-200">
            View Full Team
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Team;