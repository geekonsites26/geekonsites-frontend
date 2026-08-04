import SEO from "./components/common/SEO"
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom"

import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import MobileBottomNav from "./components/layout/MobileBottomNav"

import HeroSection from "./components/home/HeroSection"
import ServicesSection from "./components/home/ServicesSection"
import WhyChooseSection from "./components/home/WhyChooseSection"
import HowItWorksSection from "./components/home/HowItWorksSection"
import BookingFlowSection from "./components/home/BookingFlowSection"
import TestimonialsSection from "./components/home/TestimonialsSection"
import CTASection from "./components/home/CTASection"

import About from "./pages/About"
import Contact from "./pages/Contact"
import Services from "./pages/Services"
import BookService from "./pages/BookService"
import Payment from "./pages/Payment"
import PaymentDetails from "./pages/PaymentDetails"
import RemainingPayment from "./pages/RemainingPayment"
import BookingSuccess from "./pages/BookingSuccess"
import TechnicianAssigned from "./pages/TechnicianAssigned"
import RemoteSession from "./pages/RemoteSession"
import SessionSummary from "./pages/SessionSummary"
import MyBookings from "./pages/MyBookings"
import RateBooking from "./pages/RateBooking"
import Profile from "./pages/Profile"
import Notifications from "./pages/Notifications"
import InvoiceDetails from "./pages/InvoiceDetails"
import TrackTechnician from "./pages/TrackTechnician"

import CustomerLogin from "./pages/CustomerLogin"
import CustomerRegister from "./pages/CustomerRegister"
import CustomerDashboard from "./pages/CustomerDashboard"

import TechnicianLogin from "./pages/TechnicianLogin"
import TechnicianRegister from "./pages/TechnicianRegister"
import TechnicianVerificationPending from "./pages/TechnicianVerificationPending"
import TechnicianDashboard from "./pages/TechnicianDashboard"

import AgentLogin from "./pages/AgentLogin"
import AgentDashboard from "./pages/AgentDashboard"

import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"

import { useCustomerAuth } from "./context/CustomerAuthContext"

function HomePage() {
  return (
    <>
      <SEO
        title="GeekOnSites | Remote & On-Site Tech Support in US & UK"
        description="GeekOnSites provides premium remote and on-site tech support across the United States and United Kingdom. Laptop repair, printer setup, WiFi troubleshooting, CCTV installation, virus removal and business IT support."
        keywords="GeekOnSites,laptop repair,computer repair,printer setup,wifi troubleshooting,CCTV installation,remote tech support,business IT support"
        url="https://geekonsites.com/"
      />

      <HeroSection />
      <ServicesSection />
      <WhyChooseSection />
      <HowItWorksSection />
      <BookingFlowSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}

function ProtectedRoute({ children, allowedRoles, redirectTo = "/customer-login" }) {
  const { user, token, authReady } = useCustomerAuth()

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">
        Loading...
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to={redirectTo} replace />
  }

  const role = String(user.role || "").toUpperCase()

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppContent() {
  const location = useLocation()

  const hideLayout =
    [
      "/customer-login",
      "/customer-register",
      "/customer-dashboard",
      "/technician-login",
      "/technician-register",
      "/technician-verification",
      "/technician-dashboard",
      "/agent-login",
      "/agent-dashboard",
      "/admin-login",
      "/admin-dashboard",
      "/remaining-payment",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/track-technician") ||
    location.pathname.startsWith("/invoice")

  return (
    <div className="min-h-screen bg-[#020817] text-white overflow-x-hidden">
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/book-service" element={<BookService />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-details" element={<PaymentDetails />} />
        <Route path="/remaining-payment" element={<RemainingPayment />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/technician-assigned" element={<TechnicianAssigned />} />
        <Route path="/remote-session" element={<RemoteSession />} />
        <Route path="/session-summary" element={<SessionSummary />} />

        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-register" element={<CustomerRegister />} />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]} redirectTo="/customer-login">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]} redirectTo="/customer-login">
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
  path="/rate-booking/:bookingId"
  element={
    <ProtectedRoute
      allowedRoles={["CUSTOMER"]}
      redirectTo="/customer-login"
    >
      <RateBooking />
    </ProtectedRoute>
  }
/>

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]} redirectTo="/customer-login">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]} redirectTo="/customer-login">
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route path="/technician-login" element={<TechnicianLogin />} />
        <Route path="/technician-register" element={<TechnicianRegister />} />
        <Route path="/technician-verification" element={<TechnicianVerificationPending />} />

        <Route
          path="/technician-dashboard"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]} redirectTo="/technician-login">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/agent-login" element={<AgentLogin />} />

        <Route
          path="/agent-dashboard"
          element={
            <ProtectedRoute allowedRoles={["AGENT"]} redirectTo="/agent-login">
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]} redirectTo="/admin-login">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-technician/:bookingId"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "TECHNICIAN", "AGENT", "ADMIN"]}>
              <TrackTechnician />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoice/:invoiceId"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "AGENT", "ADMIN"]}>
              <InvoiceDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoice"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER", "AGENT", "ADMIN"]}>
              <InvoiceDetails />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideLayout && <MobileBottomNav />}
      {!hideLayout && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
