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

export default function Home() {
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
