import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Home from "./pages/Home";
import HomeLayout from "./components/layout/HomeLayout";
import NotFound from "./components/common/NotFound";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminProtectRoute from "./components/common/AdminProtectRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import VerifyRetailer from "./pages/admin/VerifyRetailer";
import AddService from "./pages/admin/services/AdminServices";
import AdminServices from "./pages/admin/services/AdminServices";
import AddServices from "./pages/admin/services/AddServices";
import AllRetailer from "./pages/admin/retailer/AllRetailer";
import AdminSubServices from "./pages/admin/subservices/AdminSubServices";
import AddSubServices from "./pages/admin/subservices/AddSubServices";
import AdminServicesOption from "./pages/admin/service-option/AdminSubServicesOption";
import AddSubServicesOption from "./pages/admin/service-option/AddSubServicesOption";

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  return (
    <Routes>
      {/* ---------- Public Routes ---------- */}
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* ---------- Admin Login ---------- */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* ---------- Protected Admin Routes ---------- */}
      <Route
        path="/admin"
        element={
          <AdminProtectRoute>
            <DashboardLayout />
          </AdminProtectRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="verify-retailers" element={<VerifyRetailer />} />
        <Route path="retailers" element={<AllRetailer />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="add-service" element={<AddServices />} />
        <Route path="edit-service/:slug" element={<AddServices />} />
        <Route path="subservices" element={<AdminSubServices />} />
        <Route path="add-subservice" element={<AddSubServices />} />
        <Route path="edit-subservice/:serviceSlug/:subServiceSlug" element={<AddSubServices />} />
        <Route path="subservice-option" element={<AdminServicesOption />} />
        <Route path="add-subservice-option" element={<AddSubServicesOption />} />
        <Route path="edit-subservice-option/:serviceSlug/:subServiceSlug/:optionSlug" element={<AddSubServicesOption />} />


      </Route>


      {/* ---------- 404 Fallback ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
