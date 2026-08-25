import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, BriefcaseBusiness, Camera, ChevronRight, Computer, Headphones, Laptop, MapPin, Printer, Search, Wifi, X } from "lucide-react"
import MobileBottomNav from "../components/layout/MobileBottomNav"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import { getCustomerBookings } from "../services/bookingService"
import { setLocation, useRegion } from "../utils/location"
import { MobileBookCTA, MobileHowItWorks, MobileSupportModes, MobileWhyChoose } from "../components/home/MobileHomeSections"
import laptopImage from "../assets/services/mobile/laptop.png"
import printerImage from "../assets/services/mobile/printer.png"
import wifiImage from "../assets/services/mobile/wifi.png"
import softwareImage from "../assets/services/mobile/software.png"
import cctvImage from "../assets/services/mobile/cctv.png"
import businessImage from "../assets/services/mobile/business.png"

// These two reuse real GeekOnSites photography already published under
// public/images (not the icon-style mobile tile set) so Desktop Repair and
// Remote Support get a distinct photo instead of a bare Lucide icon, without
// reusing the Laptop Repair or Software Support tile images.
const desktopImage = "/images/services/computer-laptop-support.webp"
const remoteImage = "/images/support/remote-support.webp"

export const SERVICES = [
  { label: "Laptop Repair", serviceType: "Laptop Repair", category: "Laptop Repair", icon: Laptop, image: laptopImage, tone: "bg-[#e9f2ff] text-[#1459a6]" },
  { label: "Desktop Repair", serviceType: "Desktop Repair", category: "Computer Repair", icon: Computer, image: desktopImage, tone: "bg-[#e9f7f5] text-[#087f82]" },
  { label: "Printer Support", serviceType: "Printer Setup & Configuration", category: "Printer Setup", icon: Printer, image: printerImage, tone: "bg-[#fff6df] text-[#a56700]" },
  { label: "Wi-Fi / Network", serviceType: "Wi-Fi & Network Troubleshooting", category: "WiFi / Router Setup", icon: Wifi, image: wifiImage, tone: "bg-[#edf0ff] text-[#3f51a8]" },
  { label: "Software Support", serviceType: "Software Installation", category: "Remote IT Support", icon: Headphones, image: softwareImage, tone: "bg-[#eef6ff] text-[#1769aa]" },
  { label: "Remote Support", serviceType: "PC Health Check & Diagnosis", category: "Remote Support", icon: Headphones, image: remoteImage, tone: "bg-[#e8f8f1] text-[#13845d]" },
  { label: "CCTV Support", serviceType: "CCTV Installation", category: "CCTV Installation", icon: Camera, image: cctvImage, tone: "bg-[#f2edff] text-[#6846a5]" },
  { label: "Business IT", serviceType: "Business IT Support", category: "Business IT Support", icon: BriefcaseBusiness, image: businessImage, tone: "bg-[#fff0ea] text-[#ad5231]" },
]

const ACTIVE_STATUSES = new Set(["PENDING", "PAYMENT_COMPLETED", "ASSIGNMENT_PENDING", "TECHNICIAN_ASSIGNED", "TECHNICIAN_ACCEPTED", "TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED", "REMOTE_SESSION_STARTED", "REMAINING_PAYMENT_PENDING"])
const statusLabel = (value = "PENDING") => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function AndroidCustomerHome() {
  const navigate = useNavigate()
  const { customer } = useCustomerAuth()
  const region = useRegion()
  const [query, setQuery] = useState("")
  const [bookings, setBookings] = useState([])
  const [locationOpen, setLocationOpen] = useState(false)

  useEffect(() => {
    let active = true
    getCustomerBookings().then((items) => active && setBookings(Array.isArray(items) ? items : [])).catch(() => active && setBookings([]))
    return () => { active = false }
  }, [])

  const services = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return keyword ? SERVICES.filter((service) => `${service.label} ${service.serviceType}`.toLowerCase().includes(keyword)) : SERVICES
  }, [query])
  const sorted = useMemo(() => [...bookings].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)), [bookings])
  const activeBooking = sorted.find((booking) => ACTIVE_STATUSES.has(booking.bookingStatus))
  const locationLabel = [localStorage.getItem("gos_city"), region.country].filter(Boolean).join(", ")
  const customerName = customer?.fullName || customer?.name || "Customer"
  const firstName = customerName.trim().split(/\s+/)[0]
  const book = (service) => navigate("/book-service", { state: { serviceType: service.serviceType, serviceCategory: service.category } })

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f4f7f9] pb-[calc(5.75rem+env(safe-area-inset-bottom))] text-gos-charcoal">
      <header className="sticky top-0 z-40 border-b border-[#dfe8ed] bg-[#f8fbfc]/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button type="button" onClick={() => setLocationOpen(true)} className="min-w-0 flex-1 text-left" aria-label="Change service location">
            <span className="block truncate text-lg font-black text-gos-blue-deep">Hello, {firstName}</span>
            <span className="mt-0.5 flex items-center gap-1 truncate text-sm font-extrabold text-gos-blue-deep"><MapPin size={14} className="shrink-0 text-gos-turquoise" />{locationLabel}<ChevronRight size={14} className="shrink-0" /></span>
          </button>
          <button type="button" onClick={() => navigate("/notifications")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gos-border bg-white text-gos-blue-deep shadow-sm" aria-label="Open notifications"><Bell size={19} /></button>
          <button type="button" onClick={() => navigate("/profile")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gos-blue-deep font-extrabold text-white shadow-[0_5px_14px_rgba(8,43,91,.2)]" aria-label="Open profile">{customerName.charAt(0).toUpperCase()}</button>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-4">
        <label className="flex min-h-13 items-center gap-3 rounded-2xl border border-gos-border bg-white px-4 shadow-[0_5px_18px_rgba(8,43,91,.07)]">
          <Search size={20} className="shrink-0 text-gos-turquoise" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="What do you need help with?" className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-gos-blue-deep outline-none placeholder:text-gos-muted" />
          {query && <button type="button" onClick={() => setQuery("")} className="flex h-9 w-9 items-center justify-center text-gos-muted" aria-label="Clear search"><X size={17} /></button>}
        </label>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-gos-turquoise">GeekOnSites services</p><h1 className="mt-1 text-xl font-extrabold text-gos-blue-deep">How can we help?</h1></div><button type="button" onClick={() => navigate("/services")} className="text-xs font-extrabold text-gos-blue">View all</button></div>
          {services.length ? <div className="grid grid-cols-4 gap-x-2 gap-y-4">{services.map((service) => <ServiceTile key={service.label} service={service} onClick={() => book(service)} />)}</div> : <div className="rounded-2xl border border-dashed border-gos-border bg-white p-6 text-center text-sm font-semibold text-gos-muted">No matching service. Try a broader search.</div>}
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-extrabold text-gos-blue-deep">Active booking</h2>{activeBooking && <button type="button" onClick={() => navigate("/customer-dashboard?view=bookings")} className="text-xs font-extrabold text-gos-turquoise">All bookings</button>}</div>
          {activeBooking ? <button type="button" onClick={() => navigate("/customer-dashboard?view=bookings")} className="relative w-full overflow-hidden rounded-[22px] bg-gos-blue-deep p-5 text-left text-white shadow-[0_14px_30px_rgba(8,43,91,.22)]"><span className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gos-turquoise/15" /><span className="relative flex items-start justify-between gap-3"><span className="min-w-0 flex-1"><span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.1em] text-[#7ce5dc]">{statusLabel(activeBooking.bookingStatus)}</span><span className="mt-3 block truncate text-base font-extrabold">{activeBooking.serviceType || "GeekOnSites service"}</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.08em] text-white/55">Booking GOS-{activeBooking.id}</span>{activeBooking.technicianName && <span className="mt-3 block truncate text-xs font-semibold text-white/80">Technician · {activeBooking.technicianName}</span>}<span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-white/15"><span className="block h-full w-2/3 rounded-full bg-gos-turquoise" /></span><span className="mt-4 inline-flex min-h-9 items-center gap-1 rounded-xl bg-white px-3 text-xs font-extrabold text-gos-blue-deep">View details <ChevronRight size={14} /></span></span><BriefcaseBusiness size={24} className="shrink-0 text-[#7ce5dc]" /></span></button> : <button type="button" onClick={() => navigate("/book-service")} className="flex min-h-20 w-full items-center justify-between rounded-2xl border border-dashed border-gos-border bg-white px-4 text-left"><span><strong className="block text-sm text-gos-blue-deep">No active booking</strong><span className="mt-1 block text-xs font-semibold text-gos-muted">Book remote or onsite support when needed.</span></span><ChevronRight size={18} className="text-gos-turquoise" /></button>}
        </section>

        {sorted.length > 0 && <section className="mt-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-extrabold text-gos-blue-deep">Recent bookings</h2><button type="button" onClick={() => navigate("/customer-dashboard?view=bookings")} className="text-xs font-extrabold text-gos-turquoise">View all</button></div><div className="space-y-2">{sorted.slice(0, 2).map((booking) => <button key={booking.id} type="button" onClick={() => navigate("/customer-dashboard?view=bookings")} className="flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border border-gos-border bg-white px-4 text-left"><span className="min-w-0"><strong className="block truncate text-xs text-gos-blue-deep">{booking.serviceType || "GeekOnSites service"}</strong><span className="mt-1 block text-[10px] font-bold text-gos-muted">GOS-{booking.id} · {statusLabel(booking.bookingStatus)}</span></span><ChevronRight size={16} className="shrink-0 text-gos-turquoise" /></button>)}</div></section>}
        <section className="mt-6"><h2 className="mb-3 text-base font-extrabold text-gos-blue-deep">Quick actions</h2><div className="grid grid-cols-4 gap-2">{[[BriefcaseBusiness,"Book",()=>navigate("/book-service")],[MapPin,"Track",()=>navigate("/customer-dashboard?view=bookings")],[Headphones,"Remote",()=>book(SERVICES[5])],[Bell,"Updates",()=>navigate("/notifications")]].map(([Icon,label,action]) => <button key={label} type="button" onClick={action} className="min-w-0 rounded-2xl bg-white px-1 py-3 text-center shadow-[0_4px_14px_rgba(8,43,91,.07)]"><span className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f7f5] text-gos-turquoise"><Icon size={18} /></span><strong className="mt-2 block truncate text-[9px] text-gos-blue-deep">{label}</strong></button>)}</div></section>

        <MobileSupportModes onSelect={(mode) => navigate("/book-service", { state: { supportMode: mode } })} />
        <MobileHowItWorks />
        <MobileWhyChoose />
        <MobileBookCTA onClick={() => navigate("/book-service")} />
      </div>

      {locationOpen && <div className="fixed inset-0 z-[10000] flex items-end bg-gos-blue-deep/50" role="dialog" aria-modal="true" aria-label="Choose service location"><div className="w-full rounded-t-3xl bg-white px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-5"><div className="mx-auto max-w-lg"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-gos-blue-deep">Service location</h2><p className="mt-1 text-xs font-semibold text-gos-muted">Choose your GeekOnSites service country.</p></div><button type="button" onClick={() => setLocationOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gos-off-white" aria-label="Close"><X size={18} /></button></div><div className="grid grid-cols-2 gap-3">{[{ code: "US", name: "United States" }, { code: "UK", name: "United Kingdom" }].map((item) => <button key={item.code} type="button" onClick={() => { setLocation(item.code, "manual"); setLocationOpen(false) }} className={`min-h-14 rounded-xl border px-3 text-sm font-extrabold ${region.code === item.code ? "border-gos-turquoise bg-[#eaf7f5] text-gos-blue-deep" : "border-gos-border text-gos-muted"}`}>{item.name}</button>)}</div></div></div></div>}
      <MobileBottomNav />
    </main>
  )
}

export function ServiceTile({ service, onClick }) {
  const Icon = service.icon
  return <button type="button" onClick={onClick} className="min-w-0 text-center"><span className={`mx-auto flex aspect-square w-full max-w-[78px] items-center justify-center overflow-hidden rounded-2xl border border-white/80 shadow-[0_5px_16px_rgba(8,43,91,.09)] ${service.tone} ${service.image ? "" : "gos-illustrated-service-tile"}`}>{service.image ? <img src={service.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : <Icon size={30} strokeWidth={1.8} />}</span><span className="mt-2 block text-[10px] font-extrabold leading-4 text-gos-blue-deep">{service.label}</span></button>
}
