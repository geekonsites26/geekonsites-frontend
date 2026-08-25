import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Bell, CalendarDays, Check, ChevronRight, Circle, ClipboardList, CreditCard, FileText, Headphones, Home, Laptop, LogOut, MapPin, Monitor, Navigation, Phone, Plus, Printer, ReceiptText, RefreshCw, Search, ShieldCheck, User, Video, Wifi, X } from "lucide-react"
import { getCustomerBookings } from "../services/bookingService"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import { useRegion } from "../utils/location"
import MobileBottomNav from "../components/layout/MobileBottomNav"
import DashboardReturnLink from "../components/customer/DashboardReturnLink"
import BrandLogo from "../components/common/BrandLogo"
import DashboardLoader from "../components/ui/DashboardLoader"
import { remoteSessionReady } from "../utils/remoteSession"
import { customerServiceRoute, isRemoteBooking, onsiteTrackingAction } from "../utils/customerBookingAction"

const STATUS_LABELS = {
  PENDING: "Pending",
  PAYMENT_COMPLETED: "Payment completed",
  ASSIGNMENT_PENDING: "Awaiting technician",
  TECHNICIAN_ASSIGNED: "Technician assigned",
  TECHNICIAN_ACCEPTED: "Technician accepted",
  TECHNICIAN_REJECTED: "Reassignment pending",
  TECHNICIAN_ON_THE_WAY: "On the way",
  TECHNICIAN_ARRIVED: "Technician arrived",
  SERVICE_STARTED: "Service in progress",
  REMOTE_SESSION_STARTED: "Remote session active",
  SERVICE_COMPLETED: "Service completed",
  REMAINING_PAYMENT_PENDING: "Final payment due",
  FULLY_PAID: "Fully paid",
  INVOICE_GENERATED: "Invoice ready",
  BOOKING_CLOSED: "Closed",
  CANCELLED: "Cancelled",
}

const FILTERS = ["All", "Active", "Completed", "Cancelled"]
const COMPLETED = new Set(["SERVICE_COMPLETED", "FULLY_PAID", "INVOICE_GENERATED", "BOOKING_CLOSED"])
const WORK_COMPLETED = new Set([...COMPLETED, "REMAINING_PAYMENT_PENDING"])
const hasOnsiteBalanceDue = (booking) => !isRemoteBooking(booking)
  && Number(booking?.remainingAmount || 0) > 0
  && (booking?.paymentStatus === "BALANCE_PENDING" || ["SERVICE_COMPLETED", "REMAINING_PAYMENT_PENDING"].includes(booking?.bookingStatus))

const serviceIcon = (name = "") => {
  const value = name.toLowerCase()
  if (value.includes("wifi") || value.includes("network") || value.includes("router")) return Wifi
  if (value.includes("printer")) return Printer
  if (value.includes("remote") || value.includes("software") || value.includes("virus")) return Monitor
  return Laptop
}

const statusText = (status) => STATUS_LABELS[status] || status?.replaceAll("_", " ") || "Pending"
const scheduleText = (booking) => [booking?.bookingDate, booking?.timeSlot].filter(Boolean).join(" at ") || "Schedule pending"
const locationText = (booking) => [booking?.city, booking?.state, booking?.country].filter(Boolean).join(", ") || "Location pending"
const hasRequiredPayment = (booking) => isRemoteBooking(booking)
  ? booking?.paymentStatus === "PAID"
  : ["PAID", "PARTIALLY_PAID", "BALANCE_PENDING"].includes(booking?.paymentStatus)

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const region = useRegion()
  const { customer, logoutCustomer } = useCustomerAuth()
  const [view, setView] = useState(() => new URLSearchParams(location.search).get("view") === "bookings" ? "Bookings" : "Home")

  useEffect(() => {
    if (new URLSearchParams(location.search).get("view") === "bookings") setView("Bookings")
  }, [location.search])
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const name = customer?.fullName || customer?.name || customer?.email?.split("@")[0] || "Customer"
  const email = customer?.email || ""
  const phone = customer?.phone || "Not added"

  const loadBookings = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const data = await getCustomerBookings()
      setBookings(Array.isArray(data) ? data : [])
      setLoadError("")
    } catch (error) {
      if (String(error?.message).includes("401")) {
        logoutCustomer()
        navigate("/customer-login", { replace: true })
        return
      }
      setLoadError(error?.message || "Bookings could not be loaded.")
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [logoutCustomer, navigate])

  useEffect(() => {
    loadBookings(true)
    const timer = window.setInterval(() => loadBookings(false), 10000)
    const refresh = () => document.visibilityState === "visible" && loadBookings(false)
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [loadBookings])

  const sortedBookings = useMemo(() => [...bookings].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)), [bookings])
  const activeBookings = sortedBookings.filter((booking) => !COMPLETED.has(booking.bookingStatus) && booking.bookingStatus !== "CANCELLED")
  const currentBooking = activeBookings[0] || sortedBookings[0] || null
  const stats = {
    active: activeBookings.length,
    completed: sortedBookings.filter((booking) => COMPLETED.has(booking.bookingStatus)).length,
    total: sortedBookings.length,
  }

  const visibleBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return sortedBookings.filter((booking) => {
      const status = booking.bookingStatus
      const filterMatch = filter === "All" || (filter === "Active" && !COMPLETED.has(status) && status !== "CANCELLED") || (filter === "Completed" && COMPLETED.has(status)) || (filter === "Cancelled" && status === "CANCELLED")
      const searchMatch = !keyword || [`GOS-${booking.id}`, booking.serviceType, booking.technicianName, statusText(status)].some((value) => String(value || "").toLowerCase().includes(keyword))
      return filterMatch && searchMatch
    })
  }, [filter, search, sortedBookings])

  const logout = () => {
    logoutCustomer()
    navigate("/", { replace: true })
  }

  const navigation = [
    { label: "Home", icon: Home },
    { label: "Bookings", icon: ClipboardList },
    { label: "Updates", icon: Bell },
    { label: "Profile", icon: User },
  ]

  if (loading) return <DashboardLoader />

  return (
    <div className="min-h-screen bg-gos-off-white text-gos-charcoal">
      <header className="sticky top-0 z-40 border-b border-gos-border bg-white/95 backdrop-blur-xl" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <button type="button" onClick={() => navigate("/")} className="flex min-w-0 items-center gap-2.5 text-left" aria-label="Return to GeekOnSites home">
            <BrandLogo className="h-auto w-32 sm:w-40" />
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate("/notifications")} className="flex h-9 w-9 items-center justify-center rounded-md border border-gos-border bg-gos-off-white text-gos-blue" aria-label="View notifications"><Bell size={16} /></button>
            <button type="button" onClick={() => navigate("/book-service")} className="flex min-h-9 items-center gap-2 rounded-md bg-gos-blue-deep px-3 text-[11px] font-extrabold text-white"><Plus size={15} /> <span className="hidden min-[380px]:inline">Book service</span><span className="min-[380px]:hidden">Book</span></button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-gos-border bg-white px-4 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-gos-border pb-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gos-blue-deep font-['Cormorant_Garamond'] text-xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
            <span className="min-w-0"><strong className="block truncate text-sm font-extrabold text-gos-blue-deep">{name}</strong><span className="mt-0.5 block truncate text-[10px] font-semibold text-gos-muted">{email}</span></span>
          </div>
          <nav className="mt-5 space-y-1" aria-label="Customer workspace">
            {navigation.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => label === "Updates" ? navigate("/notifications") : setView(label)} className={`flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-xs font-extrabold transition ${view === label ? "bg-[#eaf7f5] text-gos-blue-deep" : "text-gos-muted hover:bg-gos-off-white hover:text-gos-blue"}`}><Icon size={16} className={view === label ? "text-gos-turquoise" : ""} /> {label}</button>)}
          </nav>
          <div className="mt-auto border-t border-gos-border pt-4">
            <p className="mb-3 flex items-center gap-2 px-3 text-[9px] font-extrabold uppercase tracking-[0.1em] text-emerald-700"><ShieldCheck size={14} /> Active GOS account</p>
            <button type="button" onClick={logout} className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-xs font-extrabold text-red-700 hover:bg-red-50"><LogOut size={16} /> Log out</button>
          </div>
        </aside>

        <main className="relative min-w-0 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-10">
          {view !== "Home" && <DashboardReturnLink force onClick={() => { setView("Home"); navigate("/customer-dashboard", { replace: true }) }} className="-ml-2 mb-2" />}
          {loadError && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"><span>{loadError}</span><button type="button" onClick={loadBookings} className="flex h-8 w-8 shrink-0 items-center justify-center" aria-label="Retry"><RefreshCw size={15} /></button></div>}
          {view === "Home" ? <HomeView name={name} stats={stats} booking={currentBooking} navigate={navigate} openBookings={() => setView("Bookings")} openProfile={() => setView("Profile")} /> : view === "Bookings" ? <BookingsView bookings={visibleBookings} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} navigate={navigate} onBack={() => setView("Home")} /> : <ProfileView name={name} email={email} phone={phone} region={region} logout={logout} navigate={navigate} onBack={() => setView("Home")} />}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  )
}

function PageHeading({ eyebrow, title, text, onBack }) {
  return <div><div className="flex items-center gap-1">{onBack && <button type="button" onClick={onBack} className="-ml-2 flex h-8 w-8 shrink-0 items-center justify-center text-gos-blue hover:text-gos-turquoise" aria-label="Back to dashboard"><ArrowLeft size={17} strokeWidth={1.8} /></button>}<p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-turquoise">{eyebrow}</p></div><h1 className="mt-1 font-['Cormorant_Garamond'] text-3xl font-bold leading-none text-gos-blue-deep sm:text-4xl">{title}</h1>{text && <p className="mt-2 text-sm font-semibold leading-6 text-gos-muted">{text}</p>}</div>
}

function HomeView({ name, stats, booking, navigate, openBookings, openProfile }) {
  return <div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><PageHeading eyebrow="Customer dashboard" title={`Welcome back, ${name}.`} text="Your bookings, technician progress, and payments in one place." /><button type="button" onClick={() => navigate("/")} className="hidden items-center gap-2 text-xs font-extrabold text-gos-blue sm:flex"><ArrowLeft size={15} /> Website</button></div>
    <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-md border border-gos-border bg-white shadow-[var(--gos-shadow-sm)]"><Stat value={stats.active} label="Active" /><Stat value={stats.completed} label="Completed" /><Stat value={stats.total} label="All bookings" /></div>
    <section className="mt-5"><SectionLabel label="Current service" action={booking ? "View all" : null} onAction={openBookings} />{booking ? <CurrentBooking booking={booking} navigate={navigate} /> : <EmptyBookings navigate={navigate} />}</section>
    <section className="mt-6"><SectionLabel label="Quick actions" /><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><QuickAction icon={Plus} label="Book service" onClick={() => navigate("/book-service", { state: { fromCustomerDashboard: true } })} /><QuickAction icon={Headphones} label="Contact support" onClick={() => navigate("/contact", { state: { fromCustomerDashboard: true } })} /><QuickAction icon={ReceiptText} label="My invoices" onClick={openBookings} /><QuickAction icon={User} label="My profile" onClick={openProfile} /></div></section>
  </div>
}

function Stat({ value, label }) {
  return <div className="border-r border-gos-border px-2 py-4 text-center last:border-r-0 sm:px-5"><strong className="font-['Cormorant_Garamond'] text-3xl font-bold leading-none text-gos-blue-deep">{value}</strong><span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.08em] text-gos-muted">{label}</span></div>
}

function SectionLabel({ label, action, onAction }) {
  return <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-extrabold text-gos-blue-deep">{label}</h2>{action && <button type="button" onClick={onAction} className="flex items-center gap-1 text-[10px] font-extrabold text-gos-turquoise">{action}<ChevronRight size={14} /></button>}</div>
}

function CurrentBooking({ booking, navigate }) {
  const Icon = serviceIcon(booking.serviceType)
  const remote = isRemoteBooking(booking)
  const paid = hasRequiredPayment(booking)
  const sessionReady = remoteSessionReady(booking)
  const onsiteAction = onsiteTrackingAction(booking)
  const balanceDue = hasOnsiteBalanceDue(booking)
  return <article className="overflow-hidden rounded-md border border-gos-border bg-white shadow-[var(--gos-shadow-sm)]">
    <div className="grid md:grid-cols-[1fr_0.72fr]">
      <div className="p-4 sm:p-5"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#eaf7f5] text-gos-turquoise"><Icon size={21} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-base font-extrabold text-gos-blue-deep">{booking.serviceType || "Selected service"}</h3><p className="mt-1 text-[10px] font-extrabold text-gos-turquoise">GOS-{booking.id}</p></div><Status status={booking.bookingStatus} /></div><p className="mt-4 flex items-center gap-2 text-xs font-bold text-gos-muted"><CalendarDays size={14} /> {scheduleText(booking)}</p><p className="mt-2 flex items-center gap-2 text-xs font-bold text-gos-muted"><MapPin size={14} /> {locationText(booking)}</p></div></div></div>
      <div className="border-t border-gos-border bg-gos-off-white p-4 md:border-l md:border-t-0 sm:p-5"><p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-gos-muted">{remote ? "Remote session" : balanceDue ? "Payment required" : "Assigned professional"}</p><p className="mt-2 text-sm font-extrabold text-gos-blue-deep">{remote ? (!paid ? "Payment required" : sessionReady ? "Secure meeting ready" : "Meeting preparation in progress") : balanceDue ? `Remaining balance ${booking.currency === "GBP" ? "£" : "$"}${Number(booking.remainingAmount).toFixed(2)}` : (booking.technicianName || "Assignment in progress")}</p><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => balanceDue ? navigate("/payment", { state: { booking, bookingId: booking.id, paymentType: "REMAINING" } }) : remote && !paid ? navigate("/payment", { state: { booking } }) : (remote || onsiteAction.canTrack) && navigate(customerServiceRoute(booking), { state: { booking } })} disabled={!balanceDue && (remote ? paid && !sessionReady : !onsiteAction.canTrack)} className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-gos-blue-deep px-2 text-center text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:opacity-100">{balanceDue ? <CreditCard size={14} /> : remote ? (!paid ? <CreditCard size={14} /> : <Video size={14} />) : <Navigation size={14} />} {balanceDue ? "Pay remaining" : remote ? (!paid ? "Complete payment" : sessionReady ? "Session" : "Preparing") : onsiteAction.label}</button><button type="button" onClick={() => navigate("/invoice", { state: { booking } })} disabled={!booking.invoiceGenerated} className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-gos-border bg-white text-xs font-extrabold text-gos-blue disabled:opacity-45"><FileText size={14} /> Invoice</button></div></div>
    </div><Timeline booking={booking} />
  </article>
}

function EmptyBookings({ navigate }) {
  return <div className="rounded-md border border-dashed border-gos-border bg-white px-5 py-9 text-center"><ClipboardList size={27} className="mx-auto text-gos-turquoise" /><h3 className="mt-3 font-['Cormorant_Garamond'] text-2xl font-bold text-gos-blue-deep">No service booked yet.</h3><p className="mt-2 text-sm font-semibold text-gos-muted">Choose remote or on-site support when you are ready.</p><button type="button" onClick={() => navigate("/book-service")} className="mt-5 min-h-10 rounded-md bg-gos-blue-deep px-5 text-xs font-extrabold text-white">Book a service</button></div>
}

function QuickAction({ icon: Icon, label, onClick }) {
  return <button type="button" onClick={onClick} className="flex min-h-20 items-center gap-3 rounded-md border border-gos-border bg-white px-3 text-left shadow-[var(--gos-shadow-sm)] transition hover:border-gos-turquoise"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gos-off-white text-gos-blue"><Icon size={17} /></span><span className="text-xs font-extrabold text-gos-blue-deep">{label}</span></button>
}

function BookingsView({ bookings, filter, setFilter, search, setSearch, navigate }) {
  return <div className="mx-auto max-w-6xl"><PageHeading eyebrow="Service history" title="My bookings." text="Review active work, completed services, tracking, and invoices." /><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex overflow-x-auto rounded-md border border-gos-border bg-white p-1">{FILTERS.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-8 shrink-0 rounded px-3 text-[10px] font-extrabold ${filter === item ? "bg-gos-blue-deep text-white" : "text-gos-muted"}`}>{item}</button>)}</div><label className="flex min-h-10 items-center gap-2 rounded-md border border-gos-border bg-white px-3 sm:w-72"><Search size={15} className="shrink-0 text-gos-turquoise" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search bookings" className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none" />{search && <button type="button" onClick={() => setSearch("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-gos-muted hover:text-gos-blue" aria-label="Clear search"><X size={15} /></button>}</label></div><div className="mt-4 space-y-3">{bookings.length ? bookings.map((booking) => <BookingRow key={booking.id} booking={booking} navigate={navigate} />) : <EmptyBookings navigate={navigate} />}</div></div>
}

function BookingRow({ booking, navigate }) {
  const Icon = serviceIcon(booking.serviceType)
  const remote = isRemoteBooking(booking)
  const paid = hasRequiredPayment(booking)
  const sessionReady = remoteSessionReady(booking)
  const onsiteAction = onsiteTrackingAction(booking)
  const balanceDue = hasOnsiteBalanceDue(booking)
  return <article className="rounded-md border border-gos-border bg-white p-4 shadow-[var(--gos-shadow-sm)]"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gos-off-white text-gos-blue"><Icon size={19} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-extrabold text-gos-blue-deep">{booking.serviceType || "Selected service"}</h3><p className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-gos-turquoise">GOS-{booking.id}</p></div><Status status={booking.bookingStatus} /></div><div className="mt-3 grid gap-2 text-[11px] font-semibold text-gos-muted sm:grid-cols-3"><span className="flex items-center gap-1.5"><CalendarDays size={13} />{scheduleText(booking)}</span><span className="flex items-center gap-1.5"><User size={13} />{booking.technicianName || "Not assigned"}</span><span className="flex items-center gap-1.5"><MapPin size={13} />{remote ? (!paid ? "Payment required" : booking.remoteSessionStatus || "Meeting preparation in progress") : locationText(booking)}</span></div></div></div><Timeline booking={booking} compact /><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => balanceDue ? navigate("/payment", { state: { booking, bookingId: booking.id, paymentType: "REMAINING" } }) : remote && !paid ? navigate("/payment", { state: { booking } }) : (remote || onsiteAction.canTrack) && navigate(customerServiceRoute(booking), { state: { booking } })} disabled={!balanceDue && (remote ? paid && !sessionReady : !onsiteAction.canTrack)} className="flex min-h-9 items-center gap-2 rounded-md bg-gos-blue-deep px-3 text-center text-[10px] font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 disabled:opacity-100">{balanceDue ? <CreditCard size={13} /> : remote ? <Video size={13} /> : <Navigation size={13} />} {balanceDue ? "Pay remaining" : remote ? (!paid ? "Complete payment" : sessionReady ? "Session" : "Preparing") : onsiteAction.label}</button><button type="button" onClick={() => navigate("/invoice", { state: { booking } })} disabled={!booking.invoiceGenerated} className="flex min-h-9 items-center gap-2 rounded-md border border-gos-border px-3 text-[10px] font-extrabold text-gos-blue disabled:opacity-45"><FileText size={13} /> Invoice</button></div></article>
}

function Status({ status }) {
  const cancelled = status === "CANCELLED"
  const done = COMPLETED.has(status)
  return <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[9px] font-extrabold ${cancelled ? "bg-red-50 text-red-700" : done ? "bg-emerald-50 text-emerald-700" : "bg-[#eaf7f5] text-gos-blue"}`}>{statusText(status)}</span>
}

function Timeline({ booking, compact = false }) {
  const status = booking.bookingStatus
  const assigned = ["TECHNICIAN_ASSIGNED", "TECHNICIAN_ACCEPTED", "TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED", "REMOTE_SESSION_STARTED", ...WORK_COMPLETED].includes(status)
  const started = ["SERVICE_STARTED", "REMOTE_SESSION_STARTED", ...WORK_COMPLETED].includes(status)
  const steps = [{ label: "Booked", active: true }, { label: "Advance paid", active: hasRequiredPayment(booking) }, { label: "Assigned", active: assigned }, { label: "Started", active: started }, { label: "Service done", active: WORK_COMPLETED.has(status) }]
  return <div className={`border-t border-gos-border ${compact ? "mt-3 pt-3" : "px-4 py-3 sm:px-5"}`}><div className="grid grid-cols-5">{steps.map(({ label, active }, index) => <div key={label} className="relative text-center"><span className={`relative z-10 mx-auto flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-gos-turquoise bg-gos-turquoise text-white" : "border-gos-border bg-white text-gos-border"}`}>{active ? <Check size={11} /> : <Circle size={8} />}</span>{index < steps.length - 1 && <span className={`absolute left-1/2 top-2.5 h-px w-full ${steps[index + 1].active ? "bg-gos-turquoise" : "bg-gos-border"}`} />}<span className="mt-1.5 block text-[8px] font-bold text-gos-muted">{label}</span></div>)}</div></div>
}

function ProfileView({ name, email, phone, region, logout, navigate }) {
  const details = [[Phone, "Phone", phone], [MapPin, "Service region", region.country], [ShieldCheck, "Account status", "Active and verified"]]
  return <div className="mx-auto max-w-4xl"><PageHeading eyebrow="Customer account" title="Your profile." text="Review the account details used for bookings and service updates." /><section className="mt-5 overflow-hidden rounded-md border border-gos-border bg-white shadow-[var(--gos-shadow-sm)]"><div className="flex items-center gap-4 bg-gos-blue-deep p-5 text-white"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white font-['Cormorant_Garamond'] text-2xl font-bold text-gos-blue-deep">{name.charAt(0).toUpperCase()}</span><div className="min-w-0"><h2 className="truncate font-['Cormorant_Garamond'] text-2xl font-bold">{name}</h2><p className="truncate text-xs font-semibold text-white/65">{email}</p></div></div><div className="grid sm:grid-cols-3">{details.map(([Icon, label, value]) => <div key={label} className="border-b border-gos-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><Icon size={16} className="text-gos-turquoise" /><p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.08em] text-gos-muted">{label}</p><p className="mt-1 text-xs font-extrabold text-gos-blue-deep">{value}</p></div>)}</div></section><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => navigate("/profile")} className="min-h-11 flex-1 rounded-md bg-gos-blue-deep text-xs font-extrabold text-white">Open profile settings</button><button type="button" onClick={logout} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-red-200 bg-white text-xs font-extrabold text-red-700"><LogOut size={15} /> Log out</button></div></div>
}
