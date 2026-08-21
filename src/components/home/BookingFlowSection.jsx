import { ArrowRight, CalendarDays, CheckCircle2, Monitor, Wrench } from "lucide-react"
import { motion } from "framer-motion"
import Section from "../layout/Section"
import Button from "../ui/Button"
import { staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

const journey = [
  { number: "01", title: "Choose support", text: "Select remote or on-site help.", icon: Monitor },
  { number: "02", title: "Set the details", text: "Confirm schedule and service information.", icon: CalendarDays },
  { number: "03", title: "Meet your expert", text: "Receive assignment and status updates.", icon: Wrench },
]

export default function BookingFlowSection() {
  return (
    <Section className="border-t border-gos-border bg-white pb-3 pt-7 sm:pb-4 sm:pt-10 lg:pb-5 lg:pt-12">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <motion.p variants={staggerItem} className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-blue">A better booking experience</motion.p>
            <motion.h2 variants={staggerItem} className="mt-2 max-w-3xl font-['Cormorant_Garamond'] text-[2.35rem] font-bold leading-[0.95] tracking-normal text-gos-blue-deep sm:text-[clamp(2.5rem,5vw,4rem)]">A clear path from problem to solution.</motion.h2>
          </div>
          <motion.p variants={staggerItem} className="max-w-md text-sm font-bold leading-6 text-gos-charcoal">Secure booking keeps service details, scheduling, and technician assignment in one place.</motion.p>
        </div>

        <motion.div variants={staggerItem} className="mt-5 overflow-hidden rounded-lg border border-gos-border bg-white p-1.5 shadow-[var(--gos-shadow-sm)]">
          <div
            role="img"
            aria-label="Connected GOS booking journey"
            className="h-28 w-full rounded-md bg-gos-off-white bg-cover bg-center sm:h-32 lg:h-36"
            style={{ backgroundImage: "url('/images/home/booking-journey.webp')" }}
          />
        </motion.div>

        <div className="mt-6 overflow-hidden rounded-lg border border-gos-border bg-gos-off-white">
          <div className="grid sm:grid-cols-3">
            {journey.map(({ number, title, text, icon: Icon }, index) => (
              <motion.div variants={staggerItem} key={number} className={`grid min-h-24 grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 px-4 py-4 ${index ? "border-t border-gos-border sm:border-l sm:border-t-0" : ""}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-gos-blue"><Icon size={18} /></span>
                <div className="min-w-0"><p className="text-[9px] font-extrabold tracking-[0.14em] text-gos-turquoise">{number}</p><h3 className="mt-0.5 text-base font-extrabold text-gos-blue-deep">{title}</h3><p className="mt-0.5 text-xs font-bold leading-5 text-gos-charcoal">{text}</p></div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={staggerItem} className="flex flex-col gap-3 border-t border-gos-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-xs font-extrabold text-gos-blue-deep"><CheckCircle2 size={16} className="text-gos-turquoise" /> Review everything before confirming</span>
            <Button to="/book-service" className="group min-h-11 w-full sm:w-auto">Start booking <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Button>
          </motion.div>
        </div>
      </motion.div>
    </Section>
  )
}
