import { motion } from "framer-motion"
import {
  Globe2,
  Laptop,
  Printer,
  Camera,
  Wifi,
  Building2,
  MapPin,
} from "lucide-react"

const services = [
  { title: "Laptop Repair", icon: Laptop, angle: 0 },
  { title: "Printer Setup", icon: Printer, angle: 72 },
  { title: "CCTV", icon: Camera, angle: 144 },
  { title: "WiFi", icon: Wifi, angle: 216 },
  { title: "Business IT", icon: Building2, angle: 288 },
]

export default function About() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B12] pt-28 text-white md:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.14),transparent_35%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_100%,56px_56px,56px_56px]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-6">
        <div className="mb-10 mt-5 text-center">
          <p className="text-sm font-black tracking-[0.28em] text-cyan-400 md:text-lg">
            ABOUT GOS
          </p>

          <h1 className="mt-4 text-2xl font-black leading-tight sm:text-4xl">
            <TypewriterLoop />
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            GeekOnSites connects customers with verified remote and onsite
            technology experts across the United States and United Kingdom.
          </p>
        </div>

        {/* MOBILE UI */}
        <section className="md:hidden">
          <div className="mx-auto max-w-sm rounded-[2rem] border border-cyan-500/20 bg-[#0A1020]/80 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
            <motion.div
              animate={{
                y: [0, -8, 0],
                boxShadow: [
                  "0 0 30px rgba(14,165,233,0.25)",
                  "0 0 70px rgba(14,165,233,0.45)",
                  "0 0 30px rgba(14,165,233,0.25)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto flex h-40 w-40 flex-col items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10"
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Globe2 size={70} className="text-cyan-300" />
              </motion.div>

              <h2 className="mt-3 bg-gradient-to-r from-[#D4AF37] to-[#F7E7A1] bg-clip-text text-2xl font-black text-transparent">
                GOS
              </h2>
            </motion.div>

            <p className="mt-6 text-center text-xs font-bold tracking-[0.18em] text-slate-500">
              US / UK SERVICE NETWORK
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {services.map((service) => {
                const Icon = service.icon

                return (
                  <motion.div
                    key={service.title}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                      <Icon size={18} className="text-cyan-300" />
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-200">
                      {service.title}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                <p className="text-2xl">🇺🇸</p>
                <p className="mt-1 text-sm font-black text-cyan-300">USA</p>
                <p className="mt-1 text-xs text-slate-500">Available</p>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
                <p className="text-2xl">🇬🇧</p>
                <p className="mt-1 text-sm font-black text-[#F7E7A1]">UK</p>
                <p className="mt-1 text-xs text-slate-500">Available</p>
              </div>
            </div>
          </div>
        </section>

        {/* DESKTOP UI */}
        <section className="relative mx-auto hidden min-h-[680px] max-w-5xl items-center justify-center md:flex">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute h-[620px] w-[620px] rounded-full border border-cyan-400/20"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute h-[500px] w-[500px] rounded-full border border-[#D4AF37]/20"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
            className="absolute h-[620px] w-[620px]"
          >
            {services.map((service) => {
              const Icon = service.icon
              const radius = 310
              const x = Math.cos((service.angle * Math.PI) / 180) * radius
              const y = Math.sin((service.angle * Math.PI) / 180) * radius

              return (
                <motion.div
                  key={service.title}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 42,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex min-w-[155px] items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15">
                      <Icon size={19} className="text-cyan-300" />
                    </div>

                    <span className="text-sm font-medium text-gray-200">
                      {service.title}
                    </span>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute left-[40%] top-[40%] z-40"
          >
            <MapPin
              size={18}
              className="text-cyan-300 drop-shadow-[0_0_10px_#22d3ee]"
            />
            <p className="mt-2 text-xs font-medium text-cyan-300">🇺🇸 US</p>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="absolute right-[40%] top-[34%] z-40"
          >
            <MapPin
              size={18}
              className="text-[#F7E7A1] drop-shadow-[0_0_10px_#F7E7A1]"
            />
            <p className="mt-2 text-xs font-medium text-[#F7E7A1]">🇬🇧 UK</p>
          </motion.div>

          <motion.div
            animate={{
              y: [0, -14, 0],
              boxShadow: [
                "0 0 40px rgba(14,165,233,0.25)",
                "0 0 110px rgba(14,165,233,0.5)",
                "0 0 40px rgba(14,165,233,0.25)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 flex h-[340px] w-[340px] flex-col items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 backdrop-blur-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-white/10"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute inset-16 rounded-full border border-[#D4AF37]/20"
            />

            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Globe2 size={120} className="text-cyan-300" />
            </motion.div>

            <h2 className="mt-5 bg-gradient-to-r from-[#D4AF37] to-[#F7E7A1] bg-clip-text text-4xl font-bold text-transparent">
              GOS
            </h2>

            <p className="mt-2 text-xs tracking-[0.25em] text-gray-400">
              SERVICE NETWORK
            </p>
          </motion.div>
        </section>
      </div>
    </main>
  )
}

function TypewriterLoop() {
  const text = "Service network for US & UK"

  return (
    <div className="flex items-center justify-center overflow-hidden">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            times: [0, (index + 1) / text.length, 0.82, 1],
            ease: "linear",
          }}
          className="inline-block bg-gradient-to-r from-white via-cyan-200 to-[#F7E7A1] bg-clip-text text-transparent"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}

      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.7, repeat: Infinity }}
        className="ml-1 text-cyan-300"
      >
        |
      </motion.span>
    </div>
  )
}