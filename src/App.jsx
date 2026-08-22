import { useCallback, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom"

import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import MobileBottomNav from "./components/layout/MobileBottomNav"
import SplashScreen from "./components/ui/SplashScreen"
import ScrollToTop from "./components/ui/ScrollToTop"
import RegionInitializer from "./components/RegionInitializer"
import PushNotificationInitializer from "./components/PushNotificationInitializer"

import Home from "./pages/Home"
import About from "./pages/About"
import Contact from "./pages/Contact"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsConditions from "./pages/TermsConditions"
import RefundPolicy from "./pages/RefundPolicy"
import Services from "./pages/Services"
import BookService from "./pages/BookService"
import Payment from "./pages/Payment"
import PaymentDetails from "./pages/PaymentDetails"
import RemainingPayment from "./pages/RemainingPayment"
import BookingSuccess from "./pages/BookingSuccess"
import TechnicianAssigned from "./pages/TechnicianAssigned"
import RemoteSession from "./pages/RemoteSession"
import SessionSummary from "./pages/SessionSummary"
import RateBooking from "./pages/RateBooking"
import Profile from "./pages/Profile"
import Notifications from "./pages/Notifications"
import InvoiceDetails from "./pages/InvoiceDetails"
import TrackTechnician from "./pages/TrackTechnician"

import CustomerLogin from "./pages/CustomerLogin"
import CustomerRegister from "./pages/CustomerRegister"
import CustomerDashboard from "./pages/CustomerDashboard"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"

import TechnicianLogin from "./pages/TechnicianLogin"
import TechnicianRegister from "./pages/TechnicianRegister"
import TechnicianVerificationPending from "./pages/TechnicianVerificationPending"
import TechnicianDashboard from "./pages/TechnicianDashboard"
import TechnicianSetPassword from "./pages/TechnicianSetPassword"

import AgentLogin from "./pages/AgentLogin"
import AgentDashboard from "./pages/AgentDashboard"

import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute"

import { useCustomerAuth } from "./context/CustomerAuthContext"

const shouldShowLaunchSplash = () => {
  try {
    return sessionStorage.getItem("gos_splash_seen") !== "true"
  } catch {
    return true
  }
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
      "/forgot-password",
      "/reset-password",
      "/customer-dashboard",
      "/technician-login",
      "/technician-register",
      "/technician-verification",
      "/technician-dashboard",
      "/technician/set-password",
      "/agent-login",
      "/agent-dashboard",
      "/admin-login",
      "/admin-dashboard",
      "/remaining-payment",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/track-technician") ||
    location.pathname.startsWith("/invoice")

  return (
    <div className={`${hideLayout ? "" : "gos-app-shell "}min-h-screen overflow-x-hidden bg-gos-off-white text-gos-charcoal`}>
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />

        <Route path="/book-service" element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><BookService /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><Payment /></ProtectedRoute>} />
        <Route path="/payment-details" element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><PaymentDetails /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><PaymentDetails /></ProtectedRoute>} />
        <Route path="/remaining-payment" element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><RemainingPayment /></ProtectedRoute>} />
        <Route path="/booking-success" element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><BookingSuccess /></ProtectedRoute>} />
        <Route path="/technician-assigned" element={<ProtectedRoute allowedRoles={["CUSTOMER"]}><TechnicianAssigned /></ProtectedRoute>} />
        <Route path="/remote-session" element={<ProtectedRoute allowedRoles={["CUSTOMER", "TECHNICIAN", "AGENT", "ADMIN"]}><RemoteSession /></ProtectedRoute>} />
        <Route path="/session-summary" element={<ProtectedRoute allowedRoles={["CUSTOMER", "TECHNICIAN", "AGENT", "ADMIN"]}><SessionSummary /></ProtectedRoute>} />

        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-register" element={<CustomerRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
              <Navigate to="/customer-dashboard?view=bookings" replace />
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
            <ProtectedRoute allowedRoles={["CUSTOMER", "TECHNICIAN", "AGENT"]} redirectTo="/customer-login">
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
        <Route path="/technician/set-password" element={<TechnicianSetPassword />} />

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
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideLayout && <MobileBottomNav />}
      {!hideLayout && <Footer />}
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(shouldShowLaunchSplash)
  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem("gos_splash_seen", "true")
    } catch {
      // Storage can be unavailable in restricted browser contexts; the splash
      // must still finish and reveal the application.
    }
    setShowSplash(false)
  }, [])

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <RegionInitializer />
        <PushNotificationInitializer />
        <AppContent />
      </BrowserRouter>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={finishSplash} />}
      </AnimatePresence>
    </>
  )
}
