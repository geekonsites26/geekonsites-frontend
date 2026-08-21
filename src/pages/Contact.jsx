import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, ChevronDown, Clock3, Mail, MapPin, Send, ShieldCheck } from "lucide-react"
import SEO from "../components/common/SEO"
import Container from "../components/layout/Container"
import { sendContactMessage } from "../services/contactService"
import { setLocation, useRegion } from "../utils/location"
import DashboardReturnLink from "../components/customer/DashboardReturnLink"
import { useCustomerAuth } from "../context/CustomerAuthContext"

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  subject: "",
  message: "",
}

export default function Contact() {
  const region = useRegion()
  const { customer } = useCustomerAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [submitError, setSubmitError] = useState("")
  const [requestId, setRequestId] = useState(null)

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      fullName: current.fullName || customer?.fullName || customer?.name || "",
      email: current.email || customer?.email || "",
      phone: current.phone || String(customer?.phone || "").replace(/^\+1|^\+44/, ""),
      country: region.code,
    }))
  }, [customer, region.code])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))

    if (name === "country") {
      setLocation(value)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError("")
    setRequestId(null)
    const digits = formData.phone.replace(/\D/g, "").replace(region.code === "US" ? /^1/ : /^44/, "")
    if (!formData.country || !formData.subject) {
      setSubmitError("Select your country and service type.")
      return
    }
    if (digits && digits.length !== 10) {
      setSubmitError(`Enter a valid 10-digit ${region.code} phone number.`)
      return
    }
    setLoading(true)

    try {
      const saved = await sendContactMessage({ ...formData, phone: digits ? `${region.dialCode}${digits}` : "", country: region.code })
      setRequestId(saved?.id)
      setFormData((current) => ({ ...initialForm, fullName: current.fullName, email: current.email, phone: digits, country: region.code }))
    } catch (error) {
      setSubmitError(error?.message || "Your message could not be sent. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gos-off-white pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-gos-charcoal lg:pb-0">
      <SEO title="Contact GeekOnSites | Remote & On-Site Support" description="Contact GeekOnSites for professional remote and on-site technology support across the United States and United Kingdom." />

      <section className="border-b border-gos-border bg-white pt-[calc(3.5rem+env(safe-area-inset-top))] sm:pt-[calc(4rem+env(safe-area-inset-top))]">
        <Container><DashboardReturnLink force to="/" className="-ml-2 my-2" /></Container>
        <Container className="grid gap-8 pb-10 sm:pb-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end lg:gap-14 lg:pb-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-gold">Contact GeekOnSites</p>
            <h1 className="mt-3 font-['Cormorant_Garamond'] text-[3rem] font-bold leading-[0.9] text-gos-blue-deep sm:text-[clamp(3.6rem,6vw,5.6rem)]">Tell us what you need help with.</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.65, delay: 0.15 }}>
            <p className="max-w-2xl text-base font-semibold leading-7 text-gos-charcoal sm:text-lg sm:leading-8">Reach the GOS support team about laptop repair, printer setup, Wi-Fi, CCTV, business IT, or an existing service request.</p>
            <div className="mt-5 flex items-center gap-3 border-y border-gos-border py-3">
              <Clock3 size={19} className="shrink-0 text-gos-turquoise" />
              <p className="text-sm font-extrabold text-gos-blue-deep">Share the details once. Our team will guide the next step.</p>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="border-b border-gos-border bg-gos-off-white">
        <Container className="grid sm:grid-cols-2">
          {[
            { icon: Mail, label: "Email support", value: "support@geekonsites.com", href: "mailto:support@geekonsites.com" },
            { icon: MapPin, label: "Service region", value: region.coverage },
          ].map(({ icon: Icon, label, value, href }, index) => {
            const content = (
              <>
                <Icon size={19} className="shrink-0 text-gos-turquoise" />
                <span className="min-w-0"><span className="block text-[9px] font-extrabold uppercase tracking-[0.12em] text-gos-muted">{label}</span><span className="mt-1 block break-words text-sm font-extrabold text-gos-blue-deep">{value}</span></span>
              </>
            )
            return href ? (
              <a key={label} href={href} className={`flex min-h-24 items-center gap-3 px-3 py-4 transition hover:bg-white sm:px-5 ${index ? "border-t border-gos-border sm:border-l sm:border-t-0" : ""}`}>{content}</a>
            ) : (
              <div key={label} className={`flex min-h-24 items-center gap-3 px-3 py-4 sm:px-5 ${index ? "border-t border-gos-border sm:border-l sm:border-t-0" : ""}`}>{content}</div>
            )
          })}
        </Container>
      </section>

      <section className="bg-gos-off-white py-9 sm:py-12 lg:py-16">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-28">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-turquoise">Support request</p>
            <h2 className="mt-2 font-['Cormorant_Garamond'] text-[2.55rem] font-bold leading-[0.94] text-gos-blue-deep sm:text-5xl">A clear message helps us respond well.</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-gos-charcoal sm:text-base">Include the device or service, what is happening, and your preferred support location. Avoid sharing passwords or sensitive payment information.</p>

            <div className="mt-6 overflow-hidden rounded-lg border border-gos-border bg-white p-2 shadow-[var(--gos-shadow-sm)]">
              <img src="/images/contact/contact-support.webp" alt="Professional GOS support team" className="aspect-[16/10] w-full rounded-md object-cover" loading="lazy" decoding="async" />
            </div>

            <div className="mt-5 space-y-3 border-y border-gos-border py-4">
              {["Remote and on-site service options", "US and UK support coverage", "Secure handling of your request"].map((item) => (
                <p key={item} className="flex items-center gap-3 text-sm font-bold text-gos-blue-deep"><CheckCircle2 size={17} className="shrink-0 text-gos-turquoise" />{item}</p>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} className="min-w-0 max-w-full rounded-lg border border-gos-border bg-white p-5 shadow-[var(--gos-shadow-sm)] sm:p-7 lg:p-8">
            <div className="flex items-start gap-3 border-b border-gos-border pb-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gos-off-white text-gos-turquoise"><ShieldCheck size={20} /></span>
              <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-turquoise">Secure contact</p><h2 className="mt-1 font-['Cormorant_Garamond'] text-3xl font-bold leading-none text-gos-blue-deep">Send a message</h2></div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid min-w-0 max-w-full gap-5 sm:grid-cols-2">
              {submitError && <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 sm:col-span-2">{submitError}</div>}
              {requestId && <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700 sm:col-span-2">Thank you for contacting GeekOnSites. Your message has been received successfully. Our support team will get back to you as soon as possible.</div>}
              <Field label="Full name" name="fullName" value={formData.fullName} onChange={handleChange} autoComplete="name" maxLength={120} required />
              <Field label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" maxLength={254} required />
              <Field label="Phone number (optional)" name="phone" type="tel" inputMode="tel" value={formData.phone} onChange={handleChange} autoComplete="tel" maxLength={16} />
              <SelectField label="Country" name="country" value={formData.country} onChange={handleChange} options={[{ value: "US", label: "United States" }, { value: "UK", label: "United Kingdom" }]} required />
              <div className="min-w-0 max-w-full sm:col-span-2"><SelectField label="Service type" name="subject" value={formData.subject} onChange={handleChange} options={["Laptop Repair", "Printer Setup", "WiFi Setup", "CCTV Installation", "Business IT", "Existing Booking"]} required /></div>
              <label className="sm:col-span-2">
                <span className="text-xs font-extrabold text-gos-blue-deep">Message</span>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={5} minLength={10} maxLength={5000} placeholder="Describe the issue and the support you need" required className="mt-2 min-h-36 w-full resize-y rounded-md border border-gos-border bg-gos-off-white px-4 py-3 text-sm font-semibold text-gos-charcoal outline-none transition placeholder:text-gos-muted focus:border-gos-turquoise focus:bg-white" />
              </label>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.985 }} className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gos-blue-deep px-6 py-3 text-sm font-extrabold text-white transition hover:bg-gos-blue disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
                {loading ? "Sending message..." : "Send Message"}<Send size={17} />
              </motion.button>
              <p className="flex items-start gap-2 text-xs font-semibold leading-5 text-gos-muted sm:col-span-2"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-gos-turquoise" />Your contact details are used to respond to this request and coordinate support.</p>
            </form>
          </motion.div>
        </Container>
      </section>

      <section className="border-t border-gos-border bg-white">
        <Container className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:py-9">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gos-gold">Need to book now?</p><h2 className="mt-1 font-['Cormorant_Garamond'] text-3xl font-bold text-gos-blue-deep">Go directly to service booking.</h2></div>
          <a href="/book-service" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-gos-blue-deep px-5 py-3 text-sm font-extrabold text-gos-blue-deep transition hover:bg-gos-blue-deep hover:text-white sm:w-auto">Book a Service <ArrowRight size={17} /></a>
        </Container>
      </section>
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="min-w-0 max-w-full">
      <span className="text-xs font-extrabold text-gos-blue-deep">{label}</span>
      <input {...props} className="mt-2 min-h-12 w-full rounded-md border border-gos-border bg-gos-off-white px-4 py-3 text-sm font-semibold text-gos-charcoal outline-none transition placeholder:text-gos-muted focus:border-gos-turquoise focus:bg-white" />
    </label>
  )
}

function SelectField({ label, options, ...props }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const items = options.map((option) => typeof option === "string" ? { value: option, label: option } : option)
  const selected = items.find((item) => item.value === props.value)

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [])

  const choose = (value) => {
    props.onChange?.({ target: { name: props.name, value } })
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="block min-w-0 max-w-full">
      <span className="text-xs font-extrabold text-gos-blue-deep">{label}</span>
      <span className="relative mt-2 block min-w-0 max-w-full">
        <button type="button" onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false) }} aria-haspopup="listbox" aria-expanded={open} aria-required={props.required || undefined} className={`flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md border bg-gos-off-white py-3 pl-4 pr-3 text-left text-sm font-semibold outline-none transition ${open ? "border-gos-turquoise bg-white" : "border-gos-border"}`}>
          <span className={`min-w-0 flex-1 truncate ${selected ? "text-gos-charcoal" : "text-gos-muted"}`}>{selected?.label || `Select ${label.toLowerCase()}`}</span>
          <ChevronDown size={17} className={`shrink-0 text-gos-blue transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        {open && <div role="listbox" aria-label={label} className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-[70] max-h-48 w-full overflow-y-auto overscroll-contain rounded-md border border-gos-border bg-white p-1 shadow-[var(--gos-shadow-md)]">
          {items.map((item) => <button key={item.value} type="button" role="option" aria-selected={props.value === item.value} onClick={() => choose(item.value)} className={`flex min-h-10 w-full items-center rounded px-3 text-left text-sm font-semibold ${props.value === item.value ? "bg-gos-blue-deep text-white" : "text-gos-charcoal hover:bg-gos-off-white"}`}>{item.label}</button>)}
        </div>}
      </span>
    </div>
  )
}
