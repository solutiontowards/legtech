import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const AdminProtectRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
                <div
                    data-aos="fade-in"
                    className="text-blue-700 font-semibold text-lg animate-pulse"
                >
                    Loading...
                </div>
            </div>
        );

    if (!user || user.role !== "admin") {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div
                    data-aos="zoom-in"
                    className="bg-white shadow-2xl rounded-2xl p-10 text-center border border-gray-100 max-w-sm w-full"
                >
                    <div data-aos="fade-down" className="flex justify-center mb-5">
                        <ShieldAlert className="w-16 h-16 text-red-500" />
                    </div>

                    <h1
                        data-aos="fade-up"
                        className="text-2xl font-bold text-gray-800 mb-2"
                    >
                        Access Denied
                    </h1>

                    <p
                        data-aos="fade-up"
                        data-aos-delay="100"
                        className="text-gray-500 mb-6"
                    >
                        You do not have permission to view this page.
                        Only admin users can access this area.
                    </p>

                    <button
                        data-aos="fade-up"
                        data-aos-delay="200"
                        onClick={() => navigate("/")}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 w-full"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </button>
                </div>

                <p
                    data-aos="fade-up"
                    data-aos-delay="300"
                    className="text-sm text-gray-400 mt-6"
                >
                    © {new Date().getFullYear()} Legtech
                </p>
            </div>
        );
    }

    return children;
};

export default AdminProtectRoute;
