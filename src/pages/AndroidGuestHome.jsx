import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, ChevronRight, Clock3, Headphones, MapPin, Search, ShieldCheck, UserRound, X } from "lucide-react"
import BrandLogo from "../components/common/BrandLogo"
import MobileBottomNav from "../components/layout/MobileBottomNav"
import { SERVICES, ServiceTile } from "./AndroidCustomerHome"
import { setLocation, useRegion } from "../utils/location"
import { MobileBookCTA, MobileWhyChoose } from "../components/home/MobileHomeSections"
import customerHomeImage from "../assets/map/mobile/customer-home.jpg"
import gosVanImage from "../assets/map/mobile/gos-van.jpg"

export default function AndroidGuestHome() {
  const navigate = useNavigate()
  const region = useRegion()
  const [query, setQuery] = useState("")
  const [locationOpen, setLocationOpen] = useState(false)
  const services = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return keyword ? SERVICES.filter((item) => `${item.label} ${item.serviceType}`.toLowerCase().includes(keyword)) : SERVICES
  }, [query])

  const openBooking = (service) => navigate("/customer-login", { state: { returnTo: "/book-service", selectedService: service } })

  return <main className="min-h-[100dvh] overflow-x-hidden bg-[#f4f7f9] pb-[calc(5.75rem+env(safe-area-inset-bottom))] text-gos-charcoal">
    <header className="sticky top-0 z-40 border-b border-[#dfe8ed] bg-[#f8fbfc]/95 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl"><div className="mx-auto flex max-w-lg items-center gap-3"><BrandLogo className="h-auto w-28 shrink-0" /><button type="button" onClick={() => setLocationOpen(true)} className="min-w-0 flex-1 text-left"><span className="block text-[9px] font-extrabold uppercase tracking-[.12em] text-gos-muted">Service region</span><span className="mt-0.5 flex items-center gap-1 truncate text-sm font-extrabold text-gos-blue-deep"><MapPin size={14} className="text-gos-turquoise" />{region.country}<ChevronRight size={14} /></span></button><button type="button" onClick={() => navigate("/portal")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gos-blue-deep text-white shadow-[0_5px_14px_rgba(8,43,91,.2)]" aria-label="Choose your portal"><UserRound size={20} /></button></div></header>

    <div className="mx-auto max-w-lg px-4 py-4">
      <label className="flex min-h-13 items-center gap-3 rounded-2xl border border-gos-border bg-white px-4 shadow-[0_5px_18px_rgba(8,43,91,.07)]"><Search size={20} className="text-gos-turquoise" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="What do you need help with?" className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-gos-muted" />{query && <button type="button" onClick={() => setQuery("")} className="flex h-9 w-9 items-center justify-center" aria-label="Clear search"><X size={17} /></button>}</label>

      <section className="mt-6"><div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-gos-turquoise">Book trusted support</p><h1 className="mt-1 text-xl font-extrabold text-gos-blue-deep">What can we fix?</h1></div><button type="button" onClick={() => navigate("/services")} className="text-xs font-extrabold text-gos-blue">Browse all</button></div>{services.length ? <div className="grid grid-cols-4 gap-x-2 gap-y-4">{services.map((service) => <ServiceTile key={service.label} service={service} onClick={() => openBooking(service)} />)}</div> : <div className="rounded-2xl border border-dashed border-gos-border bg-white p-6 text-center text-sm font-semibold text-gos-muted">No matching service found.</div>}</section>

      <section className="mt-7"><h2 className="mb-3 text-base font-extrabold text-gos-blue-deep">Choose how we help</h2><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => openBooking(SERVICES[5])} className="relative overflow-hidden rounded-[22px] bg-gos-blue-deep p-4 text-left text-white shadow-[0_8px_22px_rgba(8,43,91,.14)]"><span className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gos-turquoise/20" /><span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#75e4da]"><Headphones size={23} /></span><strong className="relative mt-5 block text-sm">Remote support</strong><span className="relative mt-1 block text-[10px] font-semibold text-white/65">Secure expert help online</span><span className="relative mt-3 inline-flex items-center gap-1 text-[10px] font-black text-[#75e4da]">Get started <ChevronRight size={13} /></span></button><button type="button" onClick={() => navigate("/customer-login")} className="overflow-hidden rounded-[22px] bg-white text-left shadow-[0_8px_22px_rgba(8,43,91,.10)]"><img src={gosVanImage} alt="GeekOnSites onsite service" className="h-24 w-full object-cover" loading="lazy" /><span className="block p-3"><strong className="block text-sm text-gos-blue-deep">On-site technician</strong><span className="mt-1 block text-[10px] font-semibold text-gos-muted">Support at your location</span></span></button></div></section>

      <button type="button" onClick={() => navigate("/customer-register")} className="relative mt-6 flex min-h-32 w-full overflow-hidden rounded-[22px] bg-[#dff4f1] text-left shadow-[0_8px_22px_rgba(8,43,91,.08)]"><span className="relative z-10 w-[57%] p-4"><span className="text-[9px] font-black uppercase tracking-[.12em] text-gos-turquoise">Support made simple</span><strong className="mt-2 block text-base leading-5 text-gos-blue-deep">Your trusted technology team</strong><span className="mt-2 block text-[10px] font-semibold leading-4 text-gos-muted">Create an account and keep every service in one place.</span></span><img src={customerHomeImage} alt="Customer receiving GeekOnSites support" className="absolute inset-y-0 right-0 h-full w-[48%] object-cover" loading="lazy" /></button>

      <section className="mt-7"><h2 className="text-base font-extrabold text-gos-blue-deep">How GeekOnSites works</h2><div className="mt-3 grid grid-cols-3 gap-2">{[[Search, "Choose help"], [Clock3, "Pick a time"], [CheckCircle2, "Get support"]].map(([Icon, label], index) => <div key={label} className="rounded-2xl border border-gos-border bg-white p-3 text-center"><span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf7f5] text-gos-turquoise"><Icon size={17} /></span><strong className="mt-2 block text-[10px] leading-4 text-gos-blue-deep">{index + 1}. {label}</strong></div>)}</div></section>

      <MobileWhyChoose />
      <MobileBookCTA label="Create an account to get started." buttonLabel="Get Started" onClick={() => navigate("/customer-register")} />

      <section className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigate("/customer-login")} className="min-h-12 rounded-xl bg-gos-blue-deep px-3 text-sm font-extrabold text-white">Log in</button><button type="button" onClick={() => navigate("/customer-register")} className="min-h-12 rounded-xl border border-gos-border bg-white px-3 text-sm font-extrabold text-gos-blue-deep">Create account</button></section>

      <p className="mt-4 text-center text-xs font-semibold text-gos-muted">Working with GeekOnSites? <button type="button" onClick={() => navigate("/technician-login")} className="font-extrabold text-gos-blue">Technician Sign In</button></p>
      <button type="button" onClick={() => navigate("/support")} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-extrabold text-gos-blue"><ShieldCheck size={16} className="text-gos-turquoise" /> GeekOnSites support and help</button>
    </div>

    {locationOpen && <div className="fixed inset-0 z-[10000] flex items-end bg-gos-blue-deep/50" role="dialog" aria-modal="true"><div className="w-full rounded-t-3xl bg-white px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-5"><div className="mx-auto max-w-lg"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold text-gos-blue-deep">Service region</h2><p className="mt-1 text-xs font-semibold text-gos-muted">Choose where you need support.</p></div><button type="button" onClick={() => setLocationOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gos-off-white"><X size={18} /></button></div><div className="grid grid-cols-2 gap-3">{[{ code: "US", name: "United States" }, { code: "UK", name: "United Kingdom" }].map((item) => <button key={item.code} type="button" onClick={() => { setLocation(item.code, "manual"); setLocationOpen(false) }} className={`min-h-14 rounded-xl border px-3 text-sm font-extrabold ${region.code === item.code ? "border-gos-turquoise bg-[#eaf7f5] text-gos-blue-deep" : "border-gos-border text-gos-muted"}`}>{item.name}</button>)}</div></div></div></div>}
    <MobileBottomNav />
  </main>
}
