import { motion } from "framer-motion"
import { ArrowRight, BadgeCheck, Building2, Camera, Globe2, Headphones, Laptop, MapPin, Printer, ShieldCheck, Wifi } from "lucide-react"
import SEO from "../components/common/SEO"
import Container from "../components/layout/Container"
import Section from "../components/layout/Section"
import Button from "../components/ui/Button"
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "../styles/motion"
import { useRegion } from "../utils/location"

const capabilities = [
  { title: "Remote support", icon: Headphones },
  { title: "Laptop repair", icon: Laptop },
  { title: "Printer setup", icon: Printer },
  { title: "Wi-Fi support", icon: Wifi },
  { title: "CCTV installation", icon: Camera },
  { title: "Business IT", icon: Building2 },
]

const principles = [
  { number: "01", title: "Clear from the start", text: "Customers see the service path, booking details, and next steps without unnecessary technical language." },
  { number: "02", title: "Professional by design", text: "GOS connects each request with reviewed professionals and keeps important service information in one place." },
  { number: "03", title: "Built around real needs", text: "Remote and on-site options make support practical for homes, individuals, and growing businesses." },
]

export default function About() {
  const region = useRegion()
  return (
    <main className="min-h-screen overflow-hidden bg-white pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-gos-charcoal lg:pb-0">
      <SEO title="About GeekOnSites | Professional Technology Support" description="Learn how GeekOnSites connects homes and businesses across the US and UK with professional remote and on-site technology support." />

      <section className="border-b border-gos-border bg-gos-off-white pt-[calc(5.25rem+env(safe-area-inset-top))] sm:pt-[calc(6rem+env(safe-area-inset-top))]">
        <Container className="grid gap-8 pb-10 sm:pb-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14 lg:pb-16">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.p variants={staggerItem} className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-gold">A service by ASI TECH INC</motion.p>
            <motion.h1 variants={fadeUp} className="mt-3 max-w-2xl font-['Cormorant_Garamond'] text-[3rem] font-bold leading-[0.9] text-gos-blue-deep sm:text-[clamp(3.6rem,6vw,5.8rem)]">
              Technology support, made human.
            </motion.h1>
            <motion.p variants={staggerItem} className="mt-5 max-w-xl text-base font-semibold leading-7 text-gos-charcoal sm:text-lg sm:leading-8">
              GeekOnSites connects customers with dependable remote and on-site support for the devices, networks, and systems they use every day.
            </motion.p>
            <motion.div variants={staggerItem} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button to="/book-service" className="group w-full sm:w-auto">Book a Service <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Button>
              <Button to="/services" variant="outline" className="w-full sm:w-auto">Explore Services</Button>
            </motion.div>
          </motion.div>

          <motion.figure initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="overflow-hidden rounded-lg border border-gos-border bg-white p-2 shadow-[var(--gos-shadow-sm)]">
            <img src="/images/support/onsite-support.webp" alt="Professional GOS on-site technology support" className="aspect-[4/3] w-full rounded-md object-cover object-center sm:aspect-[16/10]" />
            <figcaption className="flex items-center justify-between gap-4 px-2 py-3 sm:px-3">
              <span className="text-xs font-extrabold text-gos-blue-deep">Professional support for home and business</span>
              <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-[0.12em] text-gos-turquoise">{region.code}</span>
            </figcaption>
          </motion.figure>
        </Container>
      </section>

      <section className="border-b border-gos-border bg-white">
        <Container className="grid grid-cols-3">
          {[[Globe2, "2", "Service regions"], [BadgeCheck, "Verified", "Professional network"], [Headphones, "2 modes", "Remote and on-site"]].map(([Icon, value, label], index) => (
            <div key={label} className={`flex min-h-24 flex-col items-center justify-center px-2 py-4 text-center sm:min-h-28 ${index ? "border-l border-gos-border" : ""}`}>
              <Icon size={18} className="text-gos-turquoise" />
              <strong className="mt-2 text-sm font-extrabold text-gos-blue-deep sm:text-lg">{value}</strong>
              <span className="mt-0.5 text-[9px] font-bold uppercase leading-4 tracking-[0.05em] text-gos-muted sm:text-[10px]">{label}</span>
            </div>
          ))}
        </Container>
      </section>

      <Section className="bg-white py-9 sm:py-12 lg:py-16">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="grid gap-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14">
          <motion.div variants={staggerItem} className="overflow-hidden rounded-lg border border-gos-border bg-gos-off-white p-2">
            <img src="/images/support/remote-support.webp" alt="GOS remote support experience" className="aspect-[16/10] w-full rounded-md object-cover" loading="lazy" decoding="async" />
          </motion.div>
          <div>
            <motion.p variants={staggerItem} className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-turquoise">Why GOS exists</motion.p>
            <motion.h2 variants={staggerItem} className="mt-2 font-['Cormorant_Garamond'] text-[2.55rem] font-bold leading-[0.94] text-gos-blue-deep sm:text-5xl">One clear connection to capable support.</motion.h2>
            <motion.p variants={staggerItem} className="mt-4 text-base font-semibold leading-7 text-gos-charcoal">Technology problems interrupt work, communication, and daily life. GOS creates a simpler route from the first request to professional assistance, whether the right solution is remote or at the customer’s location.</motion.p>
            <motion.div variants={staggerItem} className="mt-5 flex items-center gap-3 border-y border-gos-border py-3">
              <ShieldCheck size={21} className="shrink-0 text-gos-turquoise" />
              <p className="text-sm font-extrabold text-gos-blue-deep">Clear booking, useful updates, and accountable service.</p>
            </motion.div>
          </div>
        </motion.div>
      </Section>

      <Section className="border-y border-gos-border bg-gos-off-white py-9 sm:py-12 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-gold">Our standard</p>
          <h2 className="mt-2 font-['Cormorant_Garamond'] text-[2.55rem] font-bold leading-[0.94] text-gos-blue-deep sm:text-5xl">A better service experience at every step.</h2>
        </div>
        <div className="mt-7 grid border-y border-gos-border md:grid-cols-3">
          {principles.map(({ number, title, text }, index) => (
            <div key={number} className={`py-5 md:px-6 ${index ? "border-t border-gos-border md:border-l md:border-t-0" : ""} ${index === 0 ? "md:pl-0" : ""}`}>
              <span className="text-[10px] font-extrabold tracking-[0.14em] text-gos-turquoise">{number}</span>
              <h3 className="mt-2 font-['Cormorant_Garamond'] text-2xl font-bold text-gos-blue-deep">{title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-gos-charcoal">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-white py-9 sm:py-12 lg:py-16">
        <div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr] lg:items-end lg:gap-14">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-turquoise">What we support</p>
            <h2 className="mt-2 font-['Cormorant_Garamond'] text-[2.55rem] font-bold leading-[0.94] text-gos-blue-deep sm:text-5xl">Practical help across essential technology.</h2>
          </div>
          <div className="grid grid-cols-2 border-y border-gos-border sm:grid-cols-3">
            {capabilities.map(({ title, icon: Icon }, index) => (
              <div key={title} className={`flex min-h-24 items-center gap-3 px-3 py-4 ${index % 2 ? "border-l border-gos-border" : ""} ${index > 1 ? "border-t border-gos-border" : ""} sm:border-l sm:[&:nth-child(3n+1)]:border-l-0 sm:[&:nth-child(3)]:border-t-0`}>
                <Icon size={19} className="shrink-0 text-gos-turquoise" />
                <span className="text-sm font-extrabold leading-5 text-gos-blue-deep">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-gos-blue-deep py-9 text-white sm:py-12 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-gold">Service coverage</p>
            <h2 className="mt-2 font-['Cormorant_Garamond'] text-[2.5rem] font-bold leading-none text-white sm:text-5xl">Support across the {region.country}.</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/75 sm:text-base">Service availability depends on location and support type. Booking confirms the options available for each request.</p>
          </div>
          <div className="border-y border-white/20 lg:min-w-80">
            {[region.country].map((regionName) => (
              <div key={regionName} className="flex min-h-24 flex-col items-center justify-center px-4 text-center">
                <MapPin size={19} className="text-gos-turquoise" />
                <span className="mt-2 text-sm font-extrabold text-white">{regionName}</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/55">Available</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-white py-9 sm:py-12 lg:py-16">
        <div className="flex flex-col gap-6 border-y border-gos-border py-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-gold">Ready when you are</p>
            <h2 className="mt-2 font-['Cormorant_Garamond'] text-[2.4rem] font-bold leading-none text-gos-blue-deep sm:text-5xl">Start with the support you need.</h2>
          </div>
          <Button to="/book-service" className="group w-full lg:w-auto">Book a Service <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Button>
        </div>
      </Section>
    </main>
  )
}
