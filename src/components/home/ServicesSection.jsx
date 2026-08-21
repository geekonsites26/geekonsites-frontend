import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Building2, Camera, Headphones, MonitorCog, Printer, Wifi } from "lucide-react"
import businessImage from "../../assets/services/business.png"
import cctvImage from "../../assets/services/cctv.png"
import printerImage from "../../assets/services/printer.png"
import wifiImage from "../../assets/services/wifi.png"
import Section from "../layout/Section"
import Container from "../layout/Container"
import ViewportVideo from "../media/ViewportVideo"
import { staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

const services = [
  { short: "Remote", title: "Remote IT Support", description: "Secure expert help for software, setup, performance, and everyday technical issues.", icon: Headphones, image: "/images/services/computer-support.webp?v=1", serviceType: "Remote IT Support" },
  { short: "Computers", title: "Computer & Laptop Repair", description: "Professional diagnostics, repair, upgrades, startup recovery, and system optimization.", icon: MonitorCog, image: "/images/services/computer-laptop-support.webp?v=1", serviceType: "Computer Repair" },
  { short: "Printers", title: "Printer Setup", description: "Reliable installation, wireless connection, troubleshooting, and device configuration.", icon: Printer, image: printerImage, serviceType: "Printer Setup & Configuration" },
  { short: "Networks", title: "Wi-Fi & Router Setup", description: "Secure configuration and stronger connectivity for your home or office network.", icon: Wifi, image: wifiImage, serviceType: "Wi-Fi & Network Troubleshooting" },
  { short: "Security", title: "CCTV Installation", description: "Professional camera placement, installation, testing, and connected remote access.", icon: Camera, image: cctvImage, serviceType: "CCTV Installation" },
  { short: "Business", title: "Business IT Support", description: "Dependable support that keeps teams, devices, networks, and systems working.", icon: Building2, image: businessImage, serviceType: "Business IT Support" },
]

export default function ServicesSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const active = services[activeIndex]
  const ActiveIcon = active.icon

  useEffect(() => {
    if (reduceMotion) return undefined
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % services.length)
    }, 4500)
    return () => window.clearTimeout(timer)
  }, [activeIndex, reduceMotion])

  return (
    <Section
      id="services"
      contained={false}
      className="relative overflow-hidden bg-gos-off-white"
    >
      <ViewportVideo className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60 motion-reduce:hidden" src="/videos/services-background.mp4?v=1" />
      <div className="pointer-events-none absolute inset-0 bg-gos-off-white/55" aria-hidden="true" />
      <Container className="relative">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div className="max-w-2xl">
          <motion.p variants={staggerItem} className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-gos-blue">What we solve</motion.p>
          <div className="overflow-hidden pb-1">
            <motion.h2 variants={staggerItem} className="gos-section-title text-gos-blue-deep">One service desk. Six areas of expertise.</motion.h2>
          </div>
          <motion.p variants={staggerItem} className="mt-5 text-base leading-7 text-gos-muted sm:text-lg">Choose a category to see how GeekOnSites can help.</motion.p>
        </div>
        <motion.p variants={staggerItem} className="border-l-2 border-gos-gold pl-4 text-sm leading-6 text-gos-muted">Remote and on-site support for homes and businesses across the US and UK.</motion.p>
      </motion.div>

      <div className="mt-7 overflow-hidden rounded-lg border border-gos-border bg-white shadow-[var(--gos-shadow-md)]">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="grid grid-cols-2 sm:grid-cols-6" role="tablist" aria-label="Service categories">
          {services.map((service, index) => {
            const Icon = service.icon
            const selected = index === activeIndex
            return (
              <motion.button
                key={service.title}
                variants={staggerItem}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveIndex(index)}
                className={`relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1.5 border-b border-r border-gos-border px-2 py-2 text-center transition sm:min-h-[4.5rem] sm:border-b-0 ${index % 2 === 1 ? "border-r-0 sm:border-r" : ""} ${index >= 4 ? "border-b-0" : ""} ${index === 5 ? "sm:border-r-0" : ""} ${selected ? "bg-gos-blue-deep text-white" : "bg-white text-gos-blue hover:bg-gos-off-white"}`}
              >
                <Icon size={17} className={selected ? "text-gos-turquoise" : "text-gos-blue"} />
                <span className="w-full text-[9px] font-extrabold uppercase leading-3 tracking-[0.06em] sm:text-[10px]">{service.short}</span>
                {selected && <motion.span layoutId="service-active" className="absolute inset-x-0 bottom-0 h-0.5 bg-gos-turquoise" />}
              </motion.button>
            )
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={active.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24 }} className="grid bg-white lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:border-t lg:border-gos-border" aria-live="polite">
            <div className="bg-white p-3">
              <div className="h-40 overflow-hidden rounded-lg bg-gos-blue-deep sm:h-52 lg:h-72">
                <motion.img initial={{ scale: 1.035, opacity: 0.72 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.55 }} src={active.image} alt={`${active.title} service`} className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="flex min-h-60 flex-col justify-center border-t border-gos-border bg-white px-5 py-6 sm:px-8 lg:min-h-72 lg:border-l lg:border-t-0 lg:px-12">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-gos-turquoise"><ActiveIcon size={15} /> Service {String(activeIndex + 1).padStart(2, "0")}</motion.div>
              <motion.h3 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="mt-3 text-2xl font-bold leading-tight text-gos-blue-deep sm:text-3xl">{active.title}</motion.h3>
              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-3 max-w-xl text-base font-semibold leading-7 text-gos-muted">{active.description}</motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
              <Link to="/book-service" state={{ serviceType: active.serviceType }} className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 border-b-2 border-gos-turquoise text-sm font-bold text-gos-blue transition hover:text-gos-turquoise">
                Book this service <ArrowRight size={16} />
              </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      </Container>
    </Section>
  )
}
