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
import AdminNotices from "./pages/admin/AdminNotices"; // Import the new page
import AdminViewSubmission from "./pages/admin/AdminViewSubmission"; // Ensure this is imported
import AddNewUser from "./pages/admin/AddNewUser";
import ActiveUsers from "./pages/admin/AdminList";
import AdminList from "./pages/admin/AdminList";
import RetailerProtectRoute from "./components/common/RetailerProtectRoute";
import Services from "./pages/retailer/Services";
import Dashboard from "./pages/retailer/Dashboard";
import TransactionHistory from "./pages/retailer/TransactionHistory";
import SubmissionHistory from "./pages/retailer/SubmissionHistory";
import PaymentChart from "./pages/retailer/PaymentChart";
import ViewSubmission from "./pages/retailer/ViewSubmission";
import Support from "./pages/retailer/Support";
import ApplicationForm from "./pages/retailer/ApplicationForm";
import Wallet from "./pages/retailer/Wallet";
import AdminCreditWallet from "./pages/admin/AdminCreditWallet";
import CommisionChart from "./pages/retailer/CommisionChart";
import PriceChart from "./pages/retailer/PriceChart";
import RetailerWishes from "./pages/admin/RetailerWishes";
import ComingSoon from "./components/common/ComingSoon";
import KycRequests from "./pages/admin/KycRequests";
import KycVerificationPage from "./pages/admin/KycVerificationPage";
import KycPage from "./pages/retailer/KycPage";
import ViewKycDetails from "./pages/admin/retailer/ViewKycDetails";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/retailer/Profile";
import FindDocuments from "./pages/retailer/FindDocuments";
import RaiseComplaint from "./pages/retailer/RaiseComplaint";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/st-admin" element={<AdminLogin />} />
      </Route>

      {/* ---------- Admin Login ---------- */}

      {/* ---------- Protected Admin Routes ---------- */}
      <Route
        path="/st-admin"
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
        <Route path="manage-notices" element={<AdminNotices />} />
        <Route path="view-submission/:id" element={<AdminViewSubmission />} /> \
        <Route path="add-user" element={<AddNewUser />} />
        <Route path="admin-list" element={<AdminList />} />
        <Route path="credit-wallet" element={<AdminCreditWallet />} />
        <Route path="kyc-requests" element={<KycRequests />} />
        <Route path="kyc-verification/:id" element={<KycVerificationPage />} />
        <Route path="retailer-wishes" element={<RetailerWishes />} />
        <Route path="retailer/kyc-details/:retailerId" element={<ViewKycDetails />} />




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
        <Route path="transaction" element={<TransactionHistory />} />
        <Route path="support" element={<Support />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="commision-chart" element={<CommisionChart />} />
        <Route path="price-chart" element={<PriceChart />} />
        <Route path="kyc" element={<KycPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="find-documents" element={<FindDocuments />} />
        <Route path="raise-complaint" element={<RaiseComplaint />} />


        <Route path="*" element={<ComingSoon />} />



      </Route>


      {/* ---------- 404 Fallback ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
