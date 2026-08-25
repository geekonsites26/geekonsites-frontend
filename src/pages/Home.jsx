import SEO from "../components/common/SEO"
import HeroSection from "../components/home/HeroSection"
import ServicesSection from "../components/home/ServicesSection"
import WhyChooseSection from "../components/home/WhyChooseSection"
import HowItWorksSection from "../components/home/HowItWorksSection"
import BookingFlowSection from "../components/home/BookingFlowSection"
import TestimonialsSection from "../components/home/TestimonialsSection"
import CTASection from "../components/home/CTASection"
import SupportModesSection from "../components/home/SupportModesSection"
import LiveExperienceSection from "../components/home/LiveExperienceSection"
import { Capacitor } from "@capacitor/core"
import AndroidCustomerHome from "./AndroidCustomerHome"
import AndroidGuestHome from "./AndroidGuestHome"
import { Navigate } from "react-router-dom"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import DashboardLoader from "../components/ui/DashboardLoader"

export default function Home() {
  const { user, token, authReady } = useCustomerAuth()
  const isNativePlatform = Capacitor.isNativePlatform()
  const platform = Capacitor.getPlatform()
  const role = String(user?.role || "").toUpperCase()
  const hasToken = Boolean(token)
  const isCapacitorAndroid = isNativePlatform && platform === "android"
  if (isCapacitorAndroid && !authReady) return <DashboardLoader />
  if (isCapacitorAndroid && hasToken && role === "TECHNICIAN") return <Navigate to="/technician-dashboard" replace />
  if (isCapacitorAndroid && hasToken && role === "AGENT") return <Navigate to="/agent-dashboard" replace />
  if (isCapacitorAndroid && hasToken && role === "ADMIN") return <Navigate to="/admin-dashboard" replace />
  const nativeCustomer = isCapacitorAndroid && role === "CUSTOMER" && hasToken
  if (nativeCustomer) return <AndroidCustomerHome />
  if (isCapacitorAndroid) return <AndroidGuestHome />
  return (
    <div className="gos-v2-home pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
      <SEO title="GeekOnSites | Remote & On-Site Tech Support in US & UK" description="GeekOnSites provides professional remote and on-site tech support across the United States and United Kingdom." keywords="GeekOnSites,laptop repair,computer repair,printer setup,wifi troubleshooting,CCTV installation,remote tech support,business IT support" url="https://geekonsites.com/" />
      <HeroSection />
      <ServicesSection />
      <SupportModesSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <div className="bg-gos-off-white">
        <LiveExperienceSection />
        <BookingFlowSection />
      </div>
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
