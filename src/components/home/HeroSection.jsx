import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Globe2, Headphones, MapPin } from "lucide-react"
import Container from "../layout/Container"
import Button from "../ui/Button"
import ViewportVideo from "../media/ViewportVideo"
import { fadeUp, staggerContainer, staggerItem, tapMotion } from "../../styles/motion"
import { useRegion } from "../../utils/location"

const serviceModes = [
  { icon: Headphones, title: "Remote support", detail: "Secure assistance" },
  { icon: MapPin, title: "On-site service", detail: "Local technicians" },
]

export default function HeroSection() {
  const region = useRegion()
  const visibleModes = [...serviceModes, { icon: Globe2, title: region.code, detail: region.coverage }]
  return (
    <section className="relative overflow-hidden border-b border-gos-border bg-gos-blue-deep pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[calc(4rem+env(safe-area-inset-top))]">
      <ViewportVideo className="absolute inset-0 h-full w-full object-cover" src="/videos/gos-home.mp4?v=4" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,13,29,0.58)_0%,rgba(3,13,29,0.72)_58%,rgba(3,13,29,0.9)_100%)]" aria-hidden="true" />

      <Container className="relative py-8 text-center sm:py-14 lg:py-16">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-5xl">
          <motion.p variants={staggerItem} className="mb-5 text-center text-xs font-black uppercase tracking-[0.18em] text-gos-gold sm:text-sm">
            A service by ASI TECH INC
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1 variants={fadeUp} transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }} className="font-['Cormorant_Garamond'] text-[2.25rem] font-bold leading-[0.94] tracking-normal text-white sm:text-[clamp(2.6rem,5vw,4.25rem)]">
              Expert support for home and business.
            </motion.h1>
          </div>
          <div className="overflow-hidden pb-2">
            <motion.h2 variants={fadeUp} transition={{ duration: 0.65, delay: 0.32, ease: [0.22, 1, 0.36, 1] }} className="font-['Cormorant_Garamond'] text-[2.25rem] font-bold italic leading-[0.94] tracking-normal text-gos-turquoise sm:text-[clamp(2.6rem,5vw,4.25rem)]">
              Remote or at your door.
            </motion.h2>
          </div>

          <motion.p variants={staggerItem} className="mx-auto mt-5 max-w-2xl text-base font-bold leading-7 text-white sm:text-lg">
            Clear answers, verified professionals, and dependable support for your home or business.
          </motion.p>

          <motion.div variants={staggerItem} className="mx-auto mt-7 flex max-w-md flex-col justify-center gap-3 sm:flex-row">
            <motion.div whileTap={tapMotion} className="sm:flex-1">
              <Button to="/book-service" className="group w-full">Book a Service <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></Button>
            </motion.div>
            <Button to="/services" variant="outline" className="w-full border-white/70 text-white hover:border-white hover:bg-white hover:text-gos-blue-deep sm:flex-1">Explore Services</Button>
          </motion.div>

          <motion.div variants={staggerItem} className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-white/85">
            <CheckCircle2 size={16} className="text-gos-turquoise" /> Secure booking. Transparent service. No obligation.
          </motion.div>
        </motion.div>
      </Container>

      <div className="relative border-t border-gos-border bg-gos-off-white">
        <Container>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3">
            {visibleModes.map(({ icon: Icon, title, detail }, index) => (
              <motion.div
                variants={staggerItem}
                key={title}
                className={`flex min-w-0 flex-col items-center justify-center gap-1.5 px-1 py-3 text-center sm:flex-row sm:gap-3 sm:px-5 sm:py-6 sm:text-left ${index ? "border-l border-gos-border" : ""}`}
              >
                <Icon size={19} className="shrink-0 text-gos-turquoise" />
                <div className="min-w-0">
                  <span className="block text-[10px] font-extrabold leading-4 text-gos-blue-deep sm:text-sm">{title}</span>
                  <span className="hidden text-[10px] font-semibold text-gos-muted sm:block">{detail}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </div>
    </section>
  )
}
