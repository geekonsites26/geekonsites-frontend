import { BadgeCheck, CreditCard, Headphones, MapPinned, ReceiptText, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import Section from "../layout/Section"
import { staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

const assurances = [
  { title: "Secure payments", text: "Protected booking and payment steps.", icon: CreditCard },
  { title: "Live tracking", text: "Clear updates for eligible visits.", icon: MapPinned },
  { title: "Flexible support", text: "Remote and on-site service options.", icon: Headphones },
  { title: "Clear pricing", text: "Costs explained before work begins.", icon: ReceiptText },
]

export default function WhyChooseSection() {
  return (
    <Section className="relative overflow-hidden border-y border-gos-border bg-white py-10 text-gos-blue-deep sm:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gos-turquoise via-gos-gold to-gos-turquoise" aria-hidden="true" />

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        <div className="lg:flex lg:flex-col lg:justify-between">
          <div>
            <motion.p variants={staggerItem} className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-blue">Why choose GOS</motion.p>
            <motion.h2 variants={staggerItem} className="mt-3 max-w-xl font-['Cormorant_Garamond'] text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.92] tracking-normal text-gos-blue-deep">Confidence is part of the service.</motion.h2>
            <motion.p variants={staggerItem} className="mt-4 max-w-lg text-base font-bold leading-7 text-gos-charcoal">Professional standards and useful technology support every stage, from booking to completion.</motion.p>
          </div>

          <motion.div variants={staggerItem} className="mt-6 flex items-center gap-4 border-y border-gos-border py-4 lg:mt-10">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gos-turquoise/60 bg-gos-off-white text-gos-turquoise"><ShieldCheck size={23} /></span>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-gos-gold">One consistent standard</p><p className="mt-1 text-sm font-bold text-gos-blue-deep">Home, business, remote, and on-site support</p></div>
          </motion.div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gos-border bg-gos-off-white shadow-[var(--gos-shadow-sm)]">
          <motion.div variants={staggerItem} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4 border-b border-gos-border bg-gos-blue-deep p-5 text-white sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gos-turquoise text-gos-blue-deep"><BadgeCheck size={22} /></span>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-gos-gold">Core standard</p><h3 className="mt-1 text-2xl font-bold text-white">Verified technicians</h3></div>
            <p className="col-start-2 text-sm font-semibold leading-6 text-white/80 sm:col-start-auto sm:max-w-[13rem]">Professionals are reviewed before joining the platform.</p>
          </motion.div>

          {assurances.map(({ title, text, icon: Icon }, index) => (
            <motion.div variants={staggerItem} key={title} className="grid min-h-[4.75rem] grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-gos-border px-5 py-3 last:border-b-0">
              <Icon size={19} className="text-gos-turquoise" />
              <div className="min-w-0"><h3 className="text-base font-bold text-gos-blue-deep">{title}</h3><p className="mt-0.5 text-xs font-semibold text-gos-muted sm:text-sm">{text}</p></div>
              <span className="text-[9px] font-extrabold tracking-[0.14em] text-gos-muted">0{index + 2}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}
