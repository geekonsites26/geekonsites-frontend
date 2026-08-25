import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, ChevronLeft, CreditCard, FileText, Home, MapPin, Monitor, User } from "lucide-react"
import BrandLogo from "../components/common/BrandLogo"
import DashboardLoader from "../components/ui/DashboardLoader"
import { getBookingById } from "../services/bookingService"
import { formatLocalDateTime } from "../utils/dateTime"

const completedStatuses = new Set(["SERVICE_COMPLETED", "COMPLETED", "CLOSED", "FULLY_PAID", "INVOICE_GENERATED", "BOOKING_CLOSED", "REMAINING_PAYMENT_PENDING"])

export default function SessionSummary() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = String(localStorage.getItem("gos_role") || "CUSTOMER").toUpperCase()
  const routeBooking = location.state?.booking
  const bookingId = new URLSearchParams(location.search).get("bookingId") || routeBooking?.id
  const [booking, setBooking] = useState(routeBooking || null)
  const [loading, setLoading] = useState(Boolean(bookingId))
  const [error, setError] = useState("")

  useEffect(() => {
    if (!bookingId) { setLoading(false); return }
    let active = true
    getBookingById(bookingId).then((latest) => { if (active) setBooking(latest) }).catch((requestError) => {
      if (active && !routeBooking) setError(requestError.message || "Completed booking details could not be loaded.")
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [bookingId, routeBooking])

  if (loading && !booking) return <DashboardLoader />
  if (!booking || error) return <main className="min-h-screen bg-gos-off-white px-4 pt-24 text-gos-blue-deep"><section className="mx-auto max-w-md rounded-xl border border-gos-border bg-white p-6 text-center shadow-sm"><h1 className="text-xl font-black">Completed job unavailable</h1><p className="mt-2 text-sm text-gos-muted">{error || "Open a completed booking from your dashboard."}</p><button type="button" onClick={() => navigate(role === "TECHNICIAN" ? "/technician-dashboard" : "/customer-dashboard?view=bookings")} className="mt-5 min-h-11 rounded-lg bg-gos-blue-deep px-5 text-sm font-bold text-white">Back to dashboard</button></section></main>

  const status = booking.bookingStatus || booking.status
  const completed = completedStatuses.has(status)
  const remote = booking.remoteSessionRequired || booking.serviceMode === "REMOTE"
  const paymentDue = Number(booking.remainingAmount || 0) > 0 && ["BALANCE_PENDING", "REMAINING_PAYMENT_PENDING"].includes(booking.paymentStatus || status)
  const dashboard = role === "TECHNICIAN" ? "/technician-dashboard?view=completed" : "/customer-dashboard?view=bookings"

  return <main className="min-h-screen bg-[#f4f7f9] px-4 pb-12 pt-[max(18px,env(safe-area-inset-top))] text-gos-charcoal"><header className="mx-auto flex max-w-3xl items-center justify-between"><button type="button" onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gos-blue-deep shadow-sm" aria-label="Go back"><ChevronLeft size={19} /></button><BrandLogo className="h-8 w-auto" /><span className="w-10" /></header><section className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-gos-border bg-white shadow-[0_8px_24px_rgba(8,43,91,.08)]"><div className="border-b border-gos-border p-5 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={25} /></span><p className="mt-3 text-[10px] font-black uppercase tracking-[.12em] text-gos-turquoise">{completed ? "Service completed" : "Service summary"}</p><h1 className="mt-1 text-2xl font-black text-gos-blue-deep">{remote ? "Remote Service Completed" : "Service Completed"}</h1><p className="mt-2 text-sm font-semibold text-gos-muted">GOS-{booking.id} · {booking.serviceType || "Selected service"}</p></div><div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5"><Summary title="Booking" icon={FileText} rows={[["Mode", remote ? "Remote" : "On-site"], ["Status", String(status || "Completed").replaceAll("_", " ")], ["Scheduled", [booking.bookingDate, booking.timeSlot].filter(Boolean).join(" · ")], ["Completed", booking.completedAt ? formatLocalDateTime(booking.completedAt, booking) : null]]} /><Summary title={role === "TECHNICIAN" ? "Customer" : "Technician"} icon={User} rows={role === "TECHNICIAN" ? [["Name", booking.customerName], ["Email", booking.customerEmail], ["Phone", booking.customerPhone]] : [["Name", booking.technicianName], ["Service", booking.serviceType]]} /><Summary title="Service details" icon={remote ? Monitor : MapPin} rows={[["Service", booking.serviceType], ["Description", booking.issueDescription], ["Session status", remote ? booking.remoteSessionStatus : null], ["Resolution", booking.resolutionNotes || booking.technicianNotes]]} /><Summary title="Payment" icon={CreditCard} rows={[["Payment status", booking.paymentStatus], ["Invoice", booking.invoiceNumber], ["Remaining", Number(booking.remainingAmount || 0) > 0 ? `${booking.currency || ""} ${Number(booking.remainingAmount).toFixed(2)}` : null]]} /></div><div className="grid gap-2 border-t border-gos-border p-4 sm:grid-cols-2 sm:p-5">{role === "CUSTOMER" && paymentDue && <button type="button" onClick={() => navigate("/remaining-payment", { state: { booking } })} className="min-h-11 rounded-lg bg-amber-500 px-4 text-xs font-black text-black">Complete Remaining Payment</button>}{role === "CUSTOMER" && !paymentDue && booking.invoiceGenerated && <button type="button" onClick={() => navigate("/invoice", { state: { booking } })} className="min-h-11 rounded-lg bg-gos-blue-deep px-4 text-xs font-black text-white">View Invoice</button>}<button type="button" onClick={() => navigate(dashboard)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gos-border bg-white px-4 text-xs font-black text-gos-blue-deep"><Home size={15} /> Back to {role === "TECHNICIAN" ? "Technician" : "Customer"} Dashboard</button></div></section></main>
}

function Summary({ title, icon: Icon, rows }) {
  const visible = rows.filter(([, value]) => value !== undefined && value !== null && value !== "")
  return <section className="rounded-xl border border-gos-border bg-[#fafcfd] p-4"><div className="flex items-center gap-2 text-gos-blue-deep"><Icon size={16} className="text-gos-turquoise" /><h2 className="text-sm font-black">{title}</h2></div><dl className="mt-3 space-y-2">{visible.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-3 border-t border-gos-border/70 pt-2 first:border-0 first:pt-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-gos-muted">{label}</dt><dd className="max-w-[65%] break-words text-right text-xs font-bold text-gos-charcoal">{value}</dd></div>)}</dl></section>
}
