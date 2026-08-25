// Compact, native-feeling versions of the website's marketing sections
// (How It Works, Why Choose GOS, Remote vs On-site, Book CTA), reused by
// both the signed-in and guest Android home screens. Testimonials are
// intentionally not ported here: the website's TestimonialsSection reviews
// are placeholder copy, not real customer data, so they are left off the
// native home rather than presented as genuine feedback.
import { motion } from "framer-motion"
import { ArrowRight, BadgeCheck, CalendarCheck, CreditCard, Headphones, Home as HomeIcon, MapPinned, MousePointerClick, ReceiptText, Wrench } from "lucide-react"

const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }
const viewportOnce = { once: true, amount: 0.3 }

const steps = [
  { title: "Choose your service", text: "Pick the issue and support mode that fits.", icon: MousePointerClick },
  { title: "Confirm your service", text: "Confirm your service details and preferred timing.", icon: CalendarCheck },
  { title: "Get expert support", text: "Connect remotely or meet your technician.", icon: Wrench },
]

export function MobileHowItWorks() {
  return (
    <section className="mt-7">
      <h2 className="mb-3 text-base font-extrabold text-gos-blue-deep">How GeekOnSites works</h2>
      <div className="space-y-2.5">
        {steps.map((step, index) => (
          <motion.div key={step.title} initial="hidden" whileInView="visible" viewport={viewportOnce} variants={fadeUp} transition={{ delay: index * 0.06 }} className="flex items-center gap-3 rounded-2xl border border-gos-border bg-white p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gos-blue-deep text-xs font-black text-white">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm text-gos-blue-deep">{step.title}</strong>
              <span className="mt-0.5 block text-xs font-semibold leading-5 text-gos-muted">{step.text}</span>
            </div>
            <step.icon size={18} className="shrink-0 text-gos-turquoise" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const assurances = [
  { title: "Service records", text: "Keep booking and invoice details together.", icon: CreditCard },
  { title: "Live tracking", text: "Clear updates for eligible visits.", icon: MapPinned },
  { title: "Flexible support", text: "Remote and on-site options.", icon: Headphones },
  { title: "Clear pricing", text: "Costs explained before work begins.", icon: ReceiptText },
]

export function MobileWhyChoose() {
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={viewportOnce} variants={fadeUp} className="mt-7">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf7f5] text-gos-turquoise"><BadgeCheck size={16} /></span>
        <h2 className="text-base font-extrabold text-gos-blue-deep">Why choose GeekOnSites</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {assurances.map((item) => (
          <div key={item.title} className="rounded-2xl border border-gos-border bg-white p-3.5">
            <item.icon size={17} className="text-gos-turquoise" />
            <strong className="mt-2 block text-xs text-gos-blue-deep">{item.title}</strong>
            <span className="mt-1 block text-[10px] font-semibold leading-4 text-gos-muted">{item.text}</span>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

export function MobileSupportModes({ onSelect }) {
  const modes = [
    { eyebrow: "Remote support", title: "Expert help, wherever you are.", icon: Headphones, image: "/images/support/remote-support.webp?v=1", mode: "Remote" },
    { eyebrow: "On-site support", title: "Professional service at your door.", icon: HomeIcon, image: "/images/support/onsite-support.webp?v=1", mode: "On-Site" },
  ]
  return (
    <section className="mt-7">
      <h2 className="mb-3 text-base font-extrabold text-gos-blue-deep">Remote when it can be. On-site when it should be.</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {modes.map((item, index) => (
          <motion.button
            type="button"
            key={item.mode}
            onClick={() => onSelect?.(item.mode)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ delay: index * 0.08 }}
            className="group relative min-h-36 overflow-hidden rounded-2xl bg-gos-blue-deep text-left text-white"
          >
            <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" loading="lazy" />
            <span className="absolute inset-0 bg-gradient-to-t from-[#03101d] via-[#03101d]/45 to-transparent" />
            <span className="relative flex h-full min-h-36 flex-col justify-end p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gos-blue-deep"><item.icon size={15} /></span>
              <span className="mt-2 block text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#7ce5dc]">{item.eyebrow}</span>
              <span className="mt-0.5 block text-xs font-extrabold leading-4">{item.title}</span>
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}

export function MobileBookCTA({ label = "Ready when you are.", buttonLabel = "Book a Service", onClick }) {
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={viewportOnce} variants={fadeUp} className="mt-7">
      <button type="button" onClick={onClick} className="relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-gos-blue-deep p-5 text-left text-white shadow-[0_10px_26px_rgba(8,43,91,.2)]">
        <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gos-turquoise/20" />
        <span className="relative min-w-0">
          <span className="block text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#7ce5dc]">Technology support, simplified</span>
          <strong className="mt-1 block text-base font-extrabold leading-5">{label}</strong>
        </span>
        <span className="relative flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-gos-blue-deep">{buttonLabel}<ArrowRight size={14} /></span>
      </button>
    </motion.section>
  )
}
