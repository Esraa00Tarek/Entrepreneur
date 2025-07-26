import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import SelectRolePage from "./pages/SelectRolePage"
import CompleteProfileEntrepreneur from "./pages/CompleteProfileEntrepreneur"
import CompleteProfileInvestor from "./pages/CompleteProfileInvestor"
import CompleteProfileSupplier from "./pages/CompleteProfileSupplier"
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard"
import DashboardInvestor from "./pages/DashboardInvestor"
import DashboardSupplier from "./pages/DashboardSupplier"
import AdminDashboard from "./pages/AdminDashboard"
import Support from "./pages/Support"
import TermsOfUse from "./components/TermsofUse"
import PrivacyPolicy from "./components/Privacy Policy"
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from "./components/SettingsPage"
import EntrepreneurRegisterForm from "./pages/EntrepreneurRegisterForm"
import InvestorRegisterForm from "./pages/InvestorRegisterForm"
import SupplierRegisterForm from "./pages/SupplierRegisterForm"
import PendingApprovalPage from "./pages/PendingApprovalPage"
import RejectedFormPage from "./pages/RejectedFormPage"
import OffersPage from "./pages/entrepreneur/OffersPage";
import AdminResourceRequests from "./components/admin/AdminResourceRequests"
import AdminVendorOffers from "./components/admin/AdminVendorOffers"
// import FeedbackAndReviews from "./pages/FeedbackAndReviews";
import AdminOverview from "./components/admin/AdminOverview";
import AdminUsers from "./components/admin/AdminUsers";
import AdminExecutionPhases from "./components/admin/AdminExecutionPhases";
import NotificationsPage from "./components/NotificationsPage";
import AdminSettings from "./components/admin/AdminSettings";
import AdminFeedback from "./components/admin/AdminFeedback";
import PaymentPage from "./pages/PaymentPage";
import WalletPage from "./pages/WalletPage";
import TransactionReceipt from "./pages/TransactionReceipt";
import { useEffect } from "react";
import BusinessDetails from "./pages/BusinessDetails";
import AdminChatDashboard from './components/admin/AdminChatDashboard';
import { Toaster } from './components/ui/toaster';

function RedirectToRoleDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    const role = localStorage.getItem("userRole")?.toLowerCase();
    if (role === "entrepreneur") navigate("/dashboard/entrepreneur", { replace: true });
    else if (role === "investor") navigate("/dashboard/investor", { replace: true });
    else if (role === "supplier") navigate("/dashboard/supplier", { replace: true });
    else navigate("/", { replace: true });
  }, [navigate]);
  return null;
}

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/entrepreneur" element={<EntrepreneurRegisterForm />} />
        <Route path="/register/investor" element={<InvestorRegisterForm />} />
        <Route path="/register/supplier" element={<SupplierRegisterForm />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/complete-profile/entrepreneur" element={<CompleteProfileEntrepreneur />} />
        <Route path="/complete-profile/investor" element={<CompleteProfileInvestor />} />
        <Route path="/complete-profile/supplier" element={<CompleteProfileSupplier />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/rejected-form" element={<RejectedFormPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/receipt/:transactionId" element={<TransactionReceipt />} />
        <Route path="/dashboard" element={<RedirectToRoleDashboard />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        
        {/* Entrepreneur Dashboard Routes */}
        <Route path="/dashboard/entrepreneur" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/profile" element={<ProfilePage />} />
        <Route path="/dashboard/entrepreneur/investors" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/funding" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/projects" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/partnerships" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/messages" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/documents" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/calendar" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/analytics" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/settings" element={<SettingsPage userRole="entrepreneur" user={{ name: 'Entrepreneur Name', email: 'entrepreneur@demo.com', location: 'Cairo' }} />} />
        <Route path="/dashboard/entrepreneur/my-business" element={<EntrepreneurDashboard />} />
        <Route path="/dashboard/entrepreneur/my-deals" element={<EntrepreneurDashboard />} />
        {/* <Route path="/dashboard/offers" element={<OffersPage />} /> */}
        
        {/* Investor Dashboard Routes */}
        <Route path="/dashboard/investor" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/profile" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/portfolio" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/deals" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/startups" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/due-diligence" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/messages" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/documents" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/calendar" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/analytics" element={<DashboardInvestor />} />
        <Route path="/dashboard/investor/settings" element={<DashboardInvestor />} />
        
        {/* Supplier Dashboard Routes */}
        <Route path="/dashboard/supplier" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/profile" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/clients" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/services" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/orders" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/revenue" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/messages" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/documents" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/calendar" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/analytics" element={<DashboardSupplier />} />
        <Route path="/dashboard/supplier/settings" element={<DashboardSupplier />} />
        
        {/* Support Routes */}
        <Route path="/dashboard/entrepreneur/support" element={<Support userRole="entrepreneur" />} />
        <Route path="/dashboard/investor/support" element={<Support userRole="investor" />} />
        <Route path="/dashboard/supplier/support" element={<Support userRole="supplier" />} />
        
        {/* Admin Dashboard Routes (nested) */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="requests" element={<AdminResourceRequests />} />
          <Route path="vendor-offers" element={<AdminVendorOffers />} />
          <Route path="phases" element={<AdminExecutionPhases />} />
          <Route path="notifications" element={<NotificationsPage userRole="admin" />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="chat" element={<AdminChatDashboard pageTitle="Support Chat" />} />
        </Route>
        {/* Business details page */}
        <Route path="/business/:id" element={<BusinessDetails />} />
      </Routes>
    </Router>
  )
}

export default App
