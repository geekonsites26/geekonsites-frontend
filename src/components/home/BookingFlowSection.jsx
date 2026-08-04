import { motion } from "framer-motion"
import {
  CreditCard,
  UserCog,
  UserCheck,
  Navigation,
  Wrench,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react"

const steps = [
  { title: "Paid", status: "Done", icon: CreditCard },
  { title: "Assigning", status: "Live", icon: UserCog },
  { title: "Assigned", status: "Next", icon: UserCheck },
  { title: "On Way", status: "Next", icon: Navigation },
  { title: "Started", status: "Next", icon: Wrench },
  { title: "Completed", status: "Next", icon: CheckCircle2 },
]

export default function BookingFlowSection() {
  return (
    <section className="relative overflow-hidden bg-[#070B12] py-12 sm:py-16 lg:py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.10),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7 sm:mb-12 flex flex-col gap-3 text-center lg:text-left lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-cyan-400 font-black text-sm sm:text-base">
              BOOKING TRACKING
            </p>

            <h2 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Service Tracking
            </h2>
          </div>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-6">
            Track payment, technician assignment, arrival and service completion
            from website or mobile app.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] sm:text-sm text-slate-400">
                  Booking ID
                </p>

                <h3 className="text-lg sm:text-2xl font-black">
                  GOS-2026-1048
                </h3>
              </div>

              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] sm:text-sm font-bold text-cyan-300">
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                const active = index <= 1

                return (
                  <div
                    key={step.title}
                    className={`rounded-2xl border p-3.5 sm:p-4 ${
                      active
                        ? "border-cyan-400/30 bg-cyan-500/10"
                        : "border-white/10 bg-black/20"
                    }`}
                  >
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                        active ? "bg-cyan-500/15" : "bg-white/5"
                      }`}
                    >
                      <Icon
                        size={19}
                        className={active ? "text-cyan-300" : "text-slate-400"}
                      />
                    </div>

                    <h4 className="text-sm sm:text-base font-black">
                      {step.title}
                    </h4>

                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold ${
                        step.status === "Done"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : step.status === "Live"
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-[1.55rem] border border-white/10 bg-white/[0.055] p-4 sm:p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[11px] sm:text-sm font-bold text-[#F7E7A1]">
              <Sparkles size={14} />
              Technician Preview
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl sm:text-2xl font-black">
                  RK
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-black">
                    Rahul Kumar
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400">
                    Laptop Repair Specialist
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <CompactInfo
                  icon={Clock}
                  label="Arrival"
                  value="Today, 4:00 PM - 5:00 PM"
                />

                <CompactInfo
                  icon={MapPin}
                  label="Area"
                  value="Nearest local technician"
                />

                <CompactInfo
                  icon={Wrench}
                  label="Experience"
                  value="4+ years field service"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-black text-black">
                  <Phone size={16} />
                  Call
                </button>

                <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300">
                  Track
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CompactInfo({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Icon size={18} className="text-cyan-300" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-200">
          {value}
        </p>
      </div>
    </div>
  )
}