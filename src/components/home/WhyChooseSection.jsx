import { motion } from "framer-motion"
import {
  ShieldCheck,
  Clock,
  CreditCard,
  BadgeCheck,
  Headphones,
  Wrench,
  ArrowUpRight,
} from "lucide-react"

const features = [
  { title: "Verified Technicians", desc: "Checked and approved experts.", icon: ShieldCheck, stat: "100%" },
  { title: "Fast Doorstep Service", desc: "Quick home and office visits.", icon: Clock, stat: "Same Day" },
  { title: "Secure Payments", desc: "Safe booking payment flow.", icon: CreditCard, stat: "Safe" },
  { title: "Transparent Pricing", desc: "Clear cost before service.", icon: BadgeCheck, stat: "Clear" },
  { title: "24/7 Support", desc: "Support whenever you need help.", icon: Headphones, stat: "24/7" },
  { title: "Service Warranty", desc: "Reliable post-service support.", icon: Wrench, stat: "Trusted" },
]

const flow = ["Book", "Pay", "Assign", "Track", "Complete"]

export default function WhyChooseSection() {
  return (
    <section className="relative bg-[#070B12] text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr] gap-7 lg:gap-12 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-cyan-400 font-black text-sm sm:text-base mb-3 text-center lg:text-left">
              WHY CHOOSE GOS
            </p>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-center lg:text-left">
              Premium support experience for every booking.
            </h2>

            <p className="text-slate-400 mt-4 text-sm sm:text-base leading-6 max-w-xl text-center lg:text-left">
              From booking to technician assignment, GeekOnSites keeps service
              fast, secure, and easy to track.
            </p>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.05] p-4 sm:p-5">
              <p className="text-slate-400 text-xs sm:text-sm mb-3">
                Platform flow
              </p>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {flow.map((item) => (
                  <span
                    key={item}
                    className="shrink-0 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="group relative min-w-[245px] sm:min-w-0 rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-4 sm:p-5 overflow-hidden hover:border-cyan-400/40 transition-all"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
                    <Icon size={22} />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-black group-hover:text-cyan-300 transition">
                      {feature.title}
                    </h3>

                    <ArrowUpRight
                      size={17}
                      className="text-slate-500 group-hover:text-cyan-300 transition shrink-0"
                    />
                  </div>

                  <p className="text-slate-400 text-xs sm:text-sm leading-5 mt-2">
                    {feature.desc}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F7E7A1] bg-clip-text text-transparent">
                      {feature.stat}
                    </span>

                    <span className="text-[11px] rounded-full bg-white/10 border border-white/10 px-3 py-1 text-slate-300">
                      GOS
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}