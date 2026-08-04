import { motion } from "framer-motion"
import {
  Search,
  CalendarCheck,
  UserCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

const steps = [
  {
    title: "Choose Service",
    desc: "Select laptop, printer, WiFi, CCTV or IT service.",
    icon: Search,
    number: "01",
  },
  {
    title: "Book Appointment",
    desc: "Pick date, time and confirm your request.",
    icon: CalendarCheck,
    number: "02",
  },
  {
    title: "Agent Assigns",
    desc: "Best technician is assigned by service and location.",
    icon: UserCheck,
    number: "03",
  },
  {
    title: "Technician Visits",
    desc: "Expert visits your home or joins remotely.",
    icon: Truck,
    number: "04",
  },
  {
    title: "Service Completed",
    desc: "Service closes with support confirmation.",
    icon: CheckCircle2,
    number: "05",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="relative bg-[#070B12] text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-7 sm:mb-12 flex flex-col gap-3 text-center lg:text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-cyan-400 font-black text-sm sm:text-base">
              HOW IT WORKS
            </p>

            <h2 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Smooth Booking To Service Completion
            </h2>
          </div>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0">
            A simple flow built for website, mobile app, agent portal, and
            technician dashboard.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[46px] left-10 right-10 h-[2px] bg-white/10" />

          <motion.div
            animate={{ x: ["0%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="hidden lg:block absolute top-[42px] left-10 h-3 w-28 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 blur-sm"
          />

          <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible lg:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  viewport={{ once: true, amount: 0.2 }}
                  className="relative min-w-[230px] lg:min-w-0"
                >
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-base font-black shadow-lg shadow-cyan-500/25">
                    {step.number}
                  </div>

                  <div className="mt-4 rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-4 sm:p-5 text-center backdrop-blur-xl hover:border-cyan-400/40 transition-all">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                      <Icon size={23} className="text-cyan-300" />
                    </div>

                    <h3 className="text-base sm:text-lg font-black">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm leading-5 text-slate-400">
                      {step.desc}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-[38px] -right-4 z-20 h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/20">
                      <ArrowRight size={16} className="text-cyan-300" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}