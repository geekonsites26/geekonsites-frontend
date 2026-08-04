import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const reviews = [
  {
    name: "Emily Carter",
    role: "Laptop Repair Customer",
    text: "The technician arrived on time and fixed my laptop screen professionally. Smooth booking and clear updates.",
  },
  {
    name: "James Wilson",
    role: "Printer Setup Customer",
    text: "GOS helped me set up my wireless printer quickly. Very clean and professional service experience.",
  },
  {
    name: "Sophia Brown",
    role: "CCTV Installation Customer",
    text: "The CCTV setup was handled perfectly. I could track the service and technician status easily.",
  },
  {
    name: "Daniel Smith",
    role: "Business IT Client",
    text: "Reliable support for our office network and IT setup. The process felt premium and organized.",
  },
  {
    name: "Olivia Taylor",
    role: "WiFi Support Customer",
    text: "My WiFi issue was solved the same day. The technician was friendly and skilled.",
  },
  {
    name: "Michael Johnson",
    role: "Software Support Customer",
    text: "They optimized my PC and installed all required drivers. Excellent doorstep tech support.",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-[#070B12] py-20 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_right,rgba(212,175,55,0.1),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="mb-3 text-lg font-bold text-cyan-400 sm:text-xl"
          >
            CUSTOMER REVIEWS
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
          >
            Trusted By Customers For Doorstep Tech Support
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            className="mt-5 text-sm text-gray-400 sm:text-base"
          >
            Real service-style feedback cards designed for both website and
            mobile app experience.
          </motion.p>
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex w-max gap-5"
          >
            {[...reviews, ...reviews].map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ review }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="w-[310px] sm:w-[370px] rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1 text-[#D4AF37]">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={16} fill="currentColor" />
          ))}
        </div>

        <Quote className="text-cyan-400" size={26} />
      </div>

      <p className="min-h-[96px] text-sm leading-relaxed text-gray-300">
        “{review.text}”
      </p>

      <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 font-bold">
          {review.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        <div>
          <h4 className="font-semibold text-white">{review.name}</h4>
          <p className="text-xs text-gray-400">{review.role}</p>
        </div>
      </div>
    </motion.div>
  )
}