import { ArrowRight, Headphones, Home, MonitorCheck, MapPinCheck } from "lucide-react"
import { motion } from "framer-motion"
import Section from "../layout/Section"
import Button from "../ui/Button"
import { staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

const modes = [
  {
    eyebrow: "Remote support",
    title: "Expert help, wherever you are.",
    text: "Secure guidance for setup, software, performance, and troubleshooting.",
    icon: Headphones,
    detailIcon: MonitorCheck,
    detail: "Secure guided assistance",
    image: "/images/support/remote-support.webp?v=1",
    state: { supportMode: "Remote" },
  },
  {
    eyebrow: "On-site support",
    title: "Professional service at your door.",
    text: "Verified technicians for repairs, installations, networks, CCTV, and business IT.",
    icon: Home,
    detailIcon: MapPinCheck,
    detail: "Home and business visits",
    image: "/images/support/onsite-support.webp?v=1",
    state: { supportMode: "On-Site" },
  },
]

export default function SupportModesSection() {
  return (
    <Section className="overflow-hidden bg-white py-10 sm:py-14 lg:py-16">
      <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={staggerContainer} className="mx-auto max-w-3xl text-center">
        <motion.p variants={staggerItem} className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gos-blue">Support that fits the problem</motion.p>
        <motion.h2 variants={staggerItem} className="mt-2 font-['Cormorant_Garamond'] text-[clamp(2.15rem,5vw,3.75rem)] font-bold leading-[0.95] tracking-normal text-gos-blue-deep">Remote when it can be. On-site when it should be.</motion.h2>
        <motion.p variants={staggerItem} className="mt-3 text-base font-semibold text-gos-muted">Two professional service modes, one clear GOS experience.</motion.p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="mt-6 grid gap-3 sm:mt-8 lg:grid-cols-2">
        {modes.map(({ eyebrow, title, text, icon: Icon, detailIcon: DetailIcon, detail, image, state }, index) => (
          <motion.article variants={staggerItem} key={title} className="group relative min-h-[15.5rem] overflow-hidden rounded-lg bg-gos-blue-deep text-white sm:min-h-[17rem]">
            <img className="absolute inset-0 h-full w-full object-cover" src={image} alt="" loading="lazy" />
            <div className={`absolute inset-0 ${index === 0 ? "bg-[linear-gradient(90deg,rgba(3,13,29,0.74),rgba(3,13,29,0.2))]" : "bg-[linear-gradient(90deg,rgba(3,13,29,0.72),rgba(3,13,29,0.18))]"}`} aria-hidden="true" />

            <div className="relative flex min-h-[15.5rem] flex-col p-5 sm:min-h-[17rem] sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/95 text-gos-blue"><Icon size={19} /></span>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-gos-turquoise">0{index + 1}</span>
              </div>
              <p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-gos-gold">{eyebrow}</p>
              <h3 className="mt-1.5 max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">{title}</h3>
              <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-white/85">{text}</p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/20 pt-3">
                <span className="flex min-w-0 items-center gap-2 text-[10px] font-bold sm:text-xs"><DetailIcon size={15} className="shrink-0 text-gos-turquoise" /><span className="truncate">{detail}</span></span>
                <Button to="/book-service" state={state} variant="secondary" className="group/button min-h-10 shrink-0 px-3 py-2 text-xs">Choose <ArrowRight size={15} className="transition-transform group-hover/button:translate-x-1" /></Button>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </Section>
  )
}
