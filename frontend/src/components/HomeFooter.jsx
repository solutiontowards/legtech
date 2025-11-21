import React from "react";
import {
    Linkedin,
    Twitter,
    Mail,
    Phone,
    MapPin,
    Clock,
    Shield,
    HelpCircle,
} from "lucide-react";

const HomeFooter = () => {
    return (
        <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
            <div className="w-full mx-auto  px-6 md:px-12 lg:px-20 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* Company Info */}
                    <div className="space-y-5">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="h-16 w-auto object-contain"
                        />
                        <p className="text-sm leading-relaxed">
                            Innovating financial technology solutions for the digital economy.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                <Linkedin className="w-5 h-5" strokeWidth={1.5} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                <Twitter className="w-5 h-5" strokeWidth={1.5} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                <Mail className="w-5 h-5" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-5">
                        <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
                            Solutions
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    Payment Processing
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    Fraud Detection
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    Financial Analytics
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    API Integration
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-5">
                        <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
                            Resources
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    API Reference
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    Case Studies
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="hover:text-white transition-colors flex items-center"
                                >
                                    <span className="w-1 h-1 bg-gray-500 rounded-full mr-2"></span>
                                    Whitepapers
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-5">
                        <h4 className="text-white text-sm font-semibold tracking-wider uppercase">
                            Contact
                        </h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start">
                                <MapPin className="w-4 h-4 mt-0.5 mr-3 text-blue-400 flex-shrink-0" />
                                <span>Swami Vivekananda Rd Kolkata, West Bengal 700157</span>
                            </li>
                            <li className="flex items-start">
                                <Phone className="w-4 h-4 mt-0.5 mr-3 text-blue-400 flex-shrink-0" />
                                <span>+91-7029959582</span>
                            </li>
                            <li className="flex items-start">
                                <Mail className="w-4 h-4 mt-0.5 mr-3 text-blue-400 flex-shrink-0" />
                                <span>contact@legtech.com</span>
                            </li>
                            <li className="flex items-start">
                                <Clock className="w-4 h-4 mt-0.5 mr-3 text-blue-400 flex-shrink-0" />
                                <span>Mon-Fri: 9AM - 6PM IST</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-8"></div>

                {/* Bottom Footer */}
                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center  pt-0 mt-10 text-gray-400 text-xs">
                    {/* Left: Support Links */}
                    <div className="flex items-center space-x-6 mb-4 md:mb-0">
                        <a
                            href="#"
                            className="hover:text-white transition-colors flex items-center"
                        >
                            <Shield className="w-3 h-3 mr-1 text-blue-400" />
                            Security
                        </a>
                        <a
                            href="#"
                            className="hover:text-white transition-colors flex items-center"
                        >
                            <HelpCircle className="w-3 h-3 mr-1 text-blue-400" />
                            Support
                        </a>
                    </div>

                    {/* Center: Copyright */}
                    <p className="text-center mb-4 md:mb-0">
                        © 2025 LegTech. All rights reserved.
                        {/* Development by{" "}
    <a
      href="https://local-stowards.netlify.app/"
      className="text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      SolutionTowards
    </a> */}
                    </p>

                    {/* Right: Policy Links */}
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-white transition-colors">
                            Terms of Service
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-white transition-colors">
                            Cookie Policy
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default HomeFooter;