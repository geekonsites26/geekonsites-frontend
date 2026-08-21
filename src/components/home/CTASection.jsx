import { ArrowRight, BadgeCheck, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import Section from "../layout/Section"
import Button from "../ui/Button"
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

export default function CTASection() {
  return (
    <Section className="relative overflow-hidden border-y border-gos-border bg-white py-8 sm:py-12 lg:py-14">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="relative grid gap-7 overflow-hidden rounded-lg border border-gos-blue/15 bg-[linear-gradient(135deg,rgba(229,240,249,0.96),rgba(240,248,249,0.92))] p-6 shadow-[var(--gos-shadow-sm)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gos-turquoise" aria-hidden="true" />
        <div className="grid gap-5 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:items-start">
          <motion.span variants={staggerItem} className="flex h-12 w-12 items-center justify-center rounded-full bg-gos-off-white text-gos-turquoise"><BadgeCheck size={24} /></motion.span>
          <div>
            <motion.p variants={staggerItem} className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-blue">Ready when you are</motion.p>
            <div className="overflow-hidden pb-1"><motion.h2 variants={fadeUp} className="mt-2 font-['Cormorant_Garamond'] text-[clamp(2.35rem,5vw,4.25rem)] font-bold leading-[0.95] tracking-normal text-gos-blue-deep">Technology support should feel simple.</motion.h2></div>
            <motion.p variants={staggerItem} className="mt-4 max-w-2xl text-base font-bold leading-7 text-gos-charcoal">Book trusted remote or on-site help for your home or business through one clear service experience.</motion.p>
            <motion.div variants={staggerItem} className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-extrabold text-gos-blue sm:text-sm">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gos-turquoise" /> Verified professionals</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gos-turquoise" /> Secure booking</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gos-turquoise" /> US & UK support</span>
            </motion.div>
          </div>
        </div>

        <motion.div variants={staggerItem} className="flex flex-col gap-3 sm:flex-row lg:min-w-44 lg:flex-col">
          <Button to="/book-service" className="group w-full">Book a Service <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Button>
          <Button to="/services" variant="outline" className="w-full">Explore Services</Button>
        </motion.div>
      </motion.div>
    </Section>
  )
}
