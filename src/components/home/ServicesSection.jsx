import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle,
  Star,
  ShieldCheck,
} from "lucide-react"

import laptop from "../../assets/services/laptop.png"
import printer from "../../assets/services/printer.png"
import wifi from "../../assets/services/wifi.png"
import cctv from "../../assets/services/cctv.png"
import software from "../../assets/services/software.png"
import business from "../../assets/services/business.png"

const services = [
  {
    title: "Laptop Repair",
    image: laptop,
    desc: "Screen, battery, heating and performance fixes.",
    points: ["Screen Repair", "Battery", "Data Recovery"],
    badge: "Most Booked",
    price: "$49",
  },
  {
    title: "Printer Setup",
    image: printer,
    desc: "Printer installation, wireless setup and scanner support.",
    points: ["Wireless", "Scanner", "Cartridge"],
    badge: "Same Day",
    price: "$39",
  },
  {
    title: "WiFi & Network",
    image: wifi,
    desc: "Router setup, slow internet and office networking.",
    points: ["Router", "Internet", "Office"],
    badge: "Popular",
    price: "$45",
  },
  {
    title: "CCTV Installation",
    image: cctv,
    desc: "Camera setup, DVR/NVR and remote monitoring.",
    points: ["Camera", "DVR/NVR", "Remote"],
    badge: "Security",
    price: "$59",
  },
  {
    title: "Software Support",
    image: software,
    desc: "Windows, drivers, PC optimization and troubleshooting.",
    points: ["Windows", "Drivers", "Optimize"],
    badge: "Fast Support",
    price: "$29",
  },
  {
    title: "Antivirus Installation",
    image: software,
    desc: "Antivirus setup, malware removal and system protection.",
    points: ["Install", "Malware Scan", "Protection"],
    badge: "Protection",
    price: "$35",
  },
  {
    title: "Business IT Support",
    image: business,
    desc: "Managed IT, server setup and cloud support.",
    points: ["Server", "Cloud", "Managed IT"],
    badge: "Business",
    price: "$99",
  },
]

export default function ServicesSection() {
  return (
    <section className="relative bg-[#070B12] text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-20 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-7 sm:mb-12 flex flex-col gap-3 text-center lg:text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-cyan-400 font-black text-sm sm:text-base">
              OUR POPULAR SERVICES
            </p>

            <h2 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Professional Tech Support Services
            </h2>
          </div>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0">
            Choose premium doorstep, remote, and business IT services.
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              viewport={{ once: true, amount: 0.2 }}
              className="group min-w-[270px] sm:min-w-0 rounded-[1.55rem] border border-white/10 bg-white/[0.05] backdrop-blur-xl overflow-hidden hover:border-cyan-400/40 transition-all duration-300"
            >
              <div className="relative h-40 sm:h-52 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                <div className="absolute top-3 left-3 bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  {service.title === "Antivirus Installation" ? (
                    <ShieldCheck size={12} />
                  ) : (
                    <Star size={12} />
                  )}
                  {service.badge}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg sm:text-2xl font-black">
                    {service.title}
                  </h3>

                  <p className="text-cyan-300 text-xs sm:text-sm mt-1 font-semibold">
                    Starting from {service.price}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-slate-400 text-xs sm:text-sm leading-5 min-h-[42px]">
                  {service.desc}
                </p>

                <div className="mt-4 grid gap-2">
                  {service.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 text-xs sm:text-sm text-slate-300"
                    >
                      <CheckCircle
                        size={14}
                        className="text-cyan-400 shrink-0"
                      />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Link
                    to="/services"
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center text-xs sm:text-sm font-bold text-slate-300"
                  >
                    Details
                  </Link>

                  <Link
                    to="/book-service"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-black text-black"
                  >
                    Book
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}