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
import AdminServiceRequest from "./pages/admin/AdminServiceRequest";
import AdminViewSubmission from "./pages/admin/AdminViewSubmission"; // Ensure this is imported
import AddNewUser from "./pages/admin/AddNewUser";
import ActiveUsers from "./pages/admin/AdminList";
import AdminList from "./pages/admin/AdminList";
import RetailerProtectRoute from "./components/common/RetailerProtectRoute";
import Services from "./pages/retailer/Services";
import Dashboard from "./pages/retailer/Dashboard";
import TransctionHistory from "./pages/retailer/TransctionHistory";
import SubmissionHistory from "./pages/retailer/SubmissionHistory";
import PaymentChart from "./pages/retailer/PaymentChart";
import ViewSubmission from "./pages/retailer/ViewSubmission";
import Support from "./pages/retailer/Support";
import ApplicationForm from "./pages/retailer/ApplicationForm";

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
        <Route path="/admin" element={<AdminLogin />} />
      </Route>

      {/* ---------- Admin Login ---------- */}

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
        <Route path="service-requests" element={<AdminServiceRequest />} />
        <Route path="view-submission/:id" element={<AdminViewSubmission />} /> \
        <Route path="add-user" element={<AddNewUser />} />
        <Route path="admin-list" element={<AdminList />} />



      </Route>


      <Route
        path="/retailer"
        element={
          <RetailerProtectRoute>
            <DashboardLayout />
          </RetailerProtectRoute>
        }
      >



        <Route path="dashboard" element={<Dashboard />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:serviceSlug" element={<Services />} />
        <Route path="services/:serviceSlug/:subServiceSlug" element={<Services />} />
        <Route path="apply/:serviceSlug/:subServiceSlug/:optionSlug" element={<ApplicationForm />} />
        <Route path="submission-history" element={<SubmissionHistory />} />
        <Route path="view-submission/:id" element={<ViewSubmission />} />
        <Route path="payment-chart" element={<PaymentChart />} />
        <Route path="transction" element={<TransctionHistory />} />
        <Route path="support" element={<Support />} />


      </Route>


      {/* ---------- 404 Fallback ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
