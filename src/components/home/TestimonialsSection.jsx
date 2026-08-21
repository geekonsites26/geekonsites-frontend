import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import Section from "../layout/Section"
import SectionHeading from "../content/SectionHeading"
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from "../../styles/motion"

const reviews = [
  { name: "Emily Carter", role: "Laptop Repair Customer", text: "The technician arrived on time and fixed my laptop screen professionally. Smooth booking and clear updates." },
  { name: "James Wilson", role: "Printer Setup Customer", text: "GOS helped me set up my wireless printer quickly. Very clean and professional service experience." },
  { name: "Sophia Brown", role: "CCTV Installation Customer", text: "The CCTV setup was handled perfectly. I could track the service and technician status easily." },
  { name: "Daniel Smith", role: "Business IT Client", text: "Reliable support for our office network and IT setup. The process felt premium and organized." },
]

export default function TestimonialsSection() {
  const trackRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const [timerKey, setTimerKey] = useState(0)
  const move = (direction, manual = true) => {
    const track = trackRef.current
    if (!track) return
    const step = Math.min(track.clientWidth * 0.86, 430)
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step * 0.45
    const atStart = track.scrollLeft <= step * 0.15
    if (direction > 0 && atEnd) track.scrollTo({ left: 0, behavior: "smooth" })
    else if (direction < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" })
    else track.scrollBy({ left: direction * step, behavior: "smooth" })
    if (manual) setTimerKey((current) => current + 1)
  }

  useEffect(() => {
    if (reduceMotion) return undefined
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") move(1, false)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [reduceMotion, timerKey])

  return (
    <Section className="overflow-hidden bg-white pb-10 pt-4 sm:pb-14 sm:pt-5 lg:pb-16 lg:pt-6">
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
        <SectionHeading eyebrow="Customer experiences" title="Support people can feel good about." description="Straightforward service, professional technicians, and useful updates throughout the process." />
        <div className="flex gap-2" aria-label="Testimonial controls"><button type="button" onClick={() => move(-1)} aria-label="Previous testimonial" className="flex h-12 w-12 items-center justify-center rounded-md border border-gos-border text-gos-blue transition hover:border-gos-turquoise hover:text-gos-turquoise active:scale-[0.98]"><ArrowLeft size={19} /></button><button type="button" onClick={() => move(1)} aria-label="Next testimonial" className="flex h-12 w-12 items-center justify-center rounded-md bg-gos-blue text-white transition hover:bg-gos-blue-deep active:scale-[0.98]"><ArrowRight size={19} /></button></div>
      </motion.div>
      <motion.div ref={trackRef} onPointerDown={() => setTimerKey((current) => current + 1)} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewportOnce} className="-mx-5 mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:mt-9 sm:px-8 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
        {reviews.map((review) => (
          <motion.figure variants={staggerItem} key={review.name} className="relative w-[78vw] max-w-[21rem] shrink-0 snap-start rounded-lg border border-gos-border bg-gos-off-white p-5 transition-colors hover:border-gos-turquoise sm:w-[20rem]">
            <div className="flex items-center justify-between"><div className="flex gap-1 text-gos-gold">{[1,2,3,4,5].map((star) => <Star key={star} size={14} fill="currentColor" />)}</div><Quote size={21} className="text-gos-turquoise" /></div>
            <blockquote className="mt-4 min-h-24 text-sm leading-6 text-gos-charcoal">“{review.text}”</blockquote>
            <figcaption className="mt-5 border-t border-gos-border pt-4"><p className="font-bold text-gos-blue-deep">{review.name}</p><p className="mt-1 text-xs text-gos-muted">{review.role}</p></figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </Section>
  )
}
