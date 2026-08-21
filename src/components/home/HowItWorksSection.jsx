import { CalendarCheck, ChevronRight, MousePointerClick, Wrench } from "lucide-react"
import { motion } from "framer-motion"
import Section from "../layout/Section"
import SectionHeading from "../content/SectionHeading"
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

const steps = [
  { number: "01", title: "Choose Your Service", text: "Select the issue and the support mode that fits.", icon: MousePointerClick },
  { number: "02", title: "Book Securely", text: "Confirm your details, preferred time, and payment.", icon: CalendarCheck },
  { number: "03", title: "Get Expert Support", text: "Connect remotely or meet your verified technician.", icon: Wrench },
]

export default function HowItWorksSection() {
  return (
    <Section
      className="overflow-hidden bg-gos-off-white bg-cover bg-center bg-no-repeat py-8 sm:py-12 lg:py-16"
      style={{ backgroundImage: "linear-gradient(rgba(246,248,250,0.64), rgba(246,248,250,0.76)), url('/images/home/service-journey-background.webp?v=2')" }}
    >
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}><SectionHeading className="[&_p]:font-bold" eyebrow="Simple by design" title="One connected service journey." description="From the first selection to expert support, every stage stays clear." /></motion.div>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="relative mt-7 grid gap-0 sm:mt-9 lg:grid-cols-3">
        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={viewportOnce} transition={{ duration: 1, ease: "easeOut" }} className="absolute left-[12%] right-[12%] top-10 hidden h-0.5 origin-left bg-gradient-to-r from-gos-turquoise via-gos-blue to-gos-gold lg:block" aria-hidden="true" />
        {steps.map(({ number, title, text, icon: Icon }, index) => (
          <motion.article variants={staggerItem} key={number} className="group relative grid grid-cols-[3.5rem_1fr] gap-4 pb-10 last:pb-0 lg:block lg:px-6 lg:pb-0 lg:first:pl-0 lg:last:pr-0">
            {index < steps.length - 1 && <motion.span initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={viewportOnce} transition={{ duration: 0.65, delay: index * 0.12 }} className="absolute bottom-0 left-[1.7rem] top-14 w-0.5 origin-top bg-gos-turquoise/40 lg:hidden" aria-hidden="true" />}
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-gos-off-white bg-gos-blue text-white shadow-[var(--gos-shadow-sm)] transition-transform duration-300 group-hover:scale-105"><Icon size={20} /></div>
            <div className="pt-1 lg:mt-10 lg:border-t lg:border-gos-border lg:pt-7">
              <div className="flex items-center gap-3"><span className="text-xs font-extrabold tracking-[0.15em] text-gos-turquoise">{number}</span>{index < steps.length - 1 && <ChevronRight size={16} className="hidden text-gos-gold lg:block" />}</div>
              <h3 className="mt-3 text-xl font-extrabold text-gos-blue-deep">{title}</h3>
              <p className="mt-3 max-w-sm text-sm font-bold leading-6 text-gos-charcoal">{text}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  )
}
