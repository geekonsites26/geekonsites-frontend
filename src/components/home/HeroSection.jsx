import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

import laptop from "../../assets/services/laptop.png"
import printer from "../../assets/services/printer.png"
import wifi from "../../assets/services/wifi.png"
import cctv from "../../assets/services/cctv.png"
import software from "../../assets/services/software.png"
import business from "../../assets/services/business.png"

import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  Headphones,
  MapPin,
} from "lucide-react"

export default function HeroSection() {
  const [activeService, setActiveService] = useState(0)

  const services = useMemo(
    () => [
      { title: "Laptop Repair", subtitle: "Screen, battery and performance fixes", image: laptop },
      { title: "Printer Setup", subtitle: "Wireless setup and printer support", image: printer },
      { title: "WiFi & Network", subtitle: "Router setup and signal issues", image: wifi },
      { title: "CCTV Installation", subtitle: "Camera setup and monitoring", image: cctv },
      { title: "Software Support", subtitle: "Windows, drivers and troubleshooting", image: software },
      { title: "Business IT Support", subtitle: "Managed IT and cloud support", image: business },
    ],
    []
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveService((prev) => (prev + 1) % services.length)
    }, 3000)

    return () => clearInterval(timer)
  }, [services.length])

  const currentService = services[activeService]

  return (
    <section className="relative overflow-hidden bg-[#070B12] text-white pt-[92px] sm:pt-28 lg:pt-36 pb-10">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 -right-24 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-7 lg:grid-cols-2 lg:items-center lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center lg:text-left"
          >
            <h1 className="mt-4 text-[30px] sm:text-5xl lg:text-7xl font-black leading-[1.02] tracking-tight">
              Tech Experts
              <span className="block">
                At Your{" "}
                <span className="bg-gradient-to-r from-[#D4AF37] to-[#F7E7A1] bg-clip-text text-transparent">
                  Doorstep
                </span>
              </span>
            </h1>

            <p className="mx-auto lg:mx-0 mt-4 max-w-xl text-[13px] sm:text-base lg:text-lg leading-6 text-slate-400">
              Book trusted technicians for laptop repair, printer setup, WiFi,
              CCTV, software support, and business IT services.
            </p>

            <div className="mt-6 flex gap-3 lg:justify-start">
              <Link
                to="/book-service"
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-3 py-3 text-xs font-black text-[#041014] shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Book Service
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/services"
                className="flex-1 lg:flex-none inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-bold text-slate-200 transition-all hover:bg-white/10 sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Services
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
              <Stat icon={Users} value="10K+" label="Customers" />
              <Stat icon={Clock} value="24/7" label="Support" />
              <Stat icon={MapPin} value="500+" label="Techs" />
              <Stat icon={Headphones} value="98%" label="Happy" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="mx-auto w-full max-w-[390px] sm:max-w-[560px] lg:max-w-[620px] rounded-[26px] border border-white/10 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentService.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                  className="relative overflow-hidden rounded-[22px]"
                >
                  <img
                    src={currentService.image}
                    alt={currentService.title}
                    className="h-[200px] w-full rounded-[22px] object-cover sm:h-[320px] lg:h-[420px]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/20 px-3 py-1 text-[10px] font-semibold text-cyan-200">
                      <ShieldCheck size={12} />
                      GeekOnSites Service
                    </div>

                    <h3 className="text-lg sm:text-3xl font-black">
                      {currentService.title}
                    </h3>

                    <p className="mt-1 text-xs sm:text-sm leading-5 text-slate-300">
                      {currentService.subtitle}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-3 flex items-center justify-center gap-2">
                {services.map((service, index) => (
                  <button
                    type="button"
                    key={service.title}
                    onClick={() => setActiveService(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeService === index ? "w-8 bg-cyan-400" : "w-2 bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mx-auto mt-3 grid max-w-[390px] grid-cols-2 gap-3 lg:hidden">
              <MiniTrust text="Verified Technicians" />
              <MiniTrust text="Remote + Onsite" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-center backdrop-blur-xl">
      <Icon className="mx-auto mb-1.5 text-cyan-400" size={18} />
      <h3 className="text-base font-black">{value}</h3>
      <p className="mt-0.5 text-[10px] text-slate-400">{label}</p>
    </div>
  )
}

function MiniTrust({ text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-center text-xs font-semibold text-slate-300">
      {text}
    </div>
  )
}