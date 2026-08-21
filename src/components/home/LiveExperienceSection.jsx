import { BadgeCheck, Check, Clock3, MapPin, Navigation, Wrench } from "lucide-react"
import { motion } from "framer-motion"
import Section from "../layout/Section"
import { staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

const statuses = [
  { title: "Booked", detail: "Laptop support confirmed", icon: Check, state: "complete" },
  { title: "Assigned", detail: "Verified GOS professional", icon: BadgeCheck, state: "complete" },
  { title: "En route", detail: "Arrival updates enabled", icon: Navigation, state: "active" },
  { title: "Complete", detail: "Service summary available", icon: Wrench, state: "next" },
]

export default function LiveExperienceSection() {
  return (
    <Section className="overflow-hidden bg-gos-off-white py-7 sm:py-10 lg:py-12">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-12">
        <div>
          <motion.p variants={staggerItem} className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-blue">Technology-enabled service</motion.p>
          <motion.h2 variants={staggerItem} className="mt-2 max-w-xl font-['Cormorant_Garamond'] text-[2.35rem] font-bold leading-[0.94] tracking-normal text-gos-blue-deep sm:text-[clamp(2.45rem,5vw,4.4rem)]">Every update, clearly in view.</motion.h2>
          <motion.p variants={staggerItem} className="mt-3 max-w-lg text-sm font-bold leading-6 text-gos-charcoal sm:text-base sm:leading-7">Follow assignment, arrival, and completion through one connected service timeline.</motion.p>
          <motion.div variants={staggerItem} className="mt-4 flex items-center gap-3 border-y border-gos-border py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gos-turquoise"><Clock3 size={19} /></span>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-muted">Current update</p><p className="mt-0.5 text-sm font-extrabold text-gos-blue-deep">Technician is on the way</p></div>
          </motion.div>
          <motion.div variants={staggerItem} className="mt-4 overflow-hidden rounded-lg border border-gos-border bg-white p-1.5 shadow-[var(--gos-shadow-sm)]">
            <div
              role="img"
              aria-label="Technology-enabled GOS service"
              className="h-28 w-full rounded-md bg-gos-off-white bg-cover bg-center sm:h-32 lg:h-36"
              style={{ backgroundImage: "url('/images/home/live-service.webp')" }}
            />
          </motion.div>
        </div>

        <motion.div variants={staggerItem} className="overflow-hidden rounded-lg border border-gos-border bg-white shadow-[var(--gos-shadow-sm)]">
          <div className="flex items-center justify-between gap-4 border-b border-gos-border bg-white px-5 py-4 sm:px-7">
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-gos-turquoise">Service GOS-1842</p><h3 className="mt-1 text-lg font-bold text-gos-blue-deep">On-site laptop support</h3></div>
            <span className="flex shrink-0 items-center gap-2 rounded-full border border-gos-turquoise/45 bg-gos-off-white px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-gos-blue-deep"><span className="h-2 w-2 rounded-full bg-gos-turquoise" /> Active</span>
          </div>

          <div className="px-5 py-4 sm:px-7 sm:py-5">
            <div className="relative grid grid-cols-4" aria-label="Service progress">
              <div className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 bg-gos-border" aria-hidden="true" />
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 0.68 }} viewport={viewportOnce} transition={{ duration: 0.8, ease: "easeOut" }} className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 origin-left bg-gos-turquoise" aria-hidden="true" />
              {statuses.map(({ title, icon: Icon, state }) => (
                <div key={title} className="relative z-10 flex min-w-0 flex-col items-center text-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${state === "next" ? "border-gos-border bg-white text-gos-muted" : "border-gos-turquoise bg-gos-turquoise text-white"}`}><Icon size={13} /></span>
                  <span className={`mt-2 w-full text-[9px] font-extrabold uppercase leading-3 tracking-[0.04em] ${state === "active" ? "text-gos-turquoise" : "text-gos-blue-deep"}`}>{title}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-md bg-gos-off-white p-4">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gos-turquoise" />
              <div><p className="text-[9px] font-extrabold uppercase tracking-[0.13em] text-gos-muted">Live arrival</p><p className="mt-0.5 text-sm font-extrabold text-gos-blue-deep">Technician en route · Updates available in your account</p></div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </Section>
  )
}
