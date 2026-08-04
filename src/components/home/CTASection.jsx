import { motion } from "framer-motion"
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react"

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-[#070B12] py-20 text-white">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.16),transparent_30%)]" />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-10 top-10 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#D4AF37]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl sm:p-12 lg:p-16"
        >

          {/* Shine */}
          <div className="absolute top-0 left-[-120%] h-full w-1/2 skew-x-[-20deg] bg-white/10 animate-[shine_7s_linear_infinite]" />

          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-[#D4AF37]/10" />

          <div className="relative text-center">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-300"
            >
              <Sparkles size={16} />
              PREMIUM TECH SUPPORT PLATFORM
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl"
            >
              Need Expert Tech Support At Your Doorstep?
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base"
            >
              Book trusted technicians for laptop repair, WiFi setup,
              printer support, CCTV installation and business IT services.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 35px rgba(14,165,233,0.35)",
                }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-sm font-semibold shadow-xl shadow-cyan-500/20 sm:text-base"
              >
                Book a Service
                <ArrowRight size={18} />
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.04,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl border border-white/10 px-8 py-4 text-sm font-semibold text-gray-300 backdrop-blur-xl sm:text-base"
              >
                Explore Services
              </motion.button>

            </motion.div>

            {/* Bottom Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400"
            >

              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                Verified Technicians
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                Same-Day Support
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                Secure Booking Flow
              </div>

            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}