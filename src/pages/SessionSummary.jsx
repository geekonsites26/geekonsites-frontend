import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2, CreditCard, FileText, Home, Lock, MapPin, Monitor, Star, User } from "lucide-react"
import BrandLogo from "../components/common/BrandLogo"
import DashboardLoader from "../components/ui/DashboardLoader"
import { getBookingById } from "../services/bookingService"
import { formatLocalDateTime } from "../utils/dateTime"
import { getDashboardPathForRole } from "../utils/authRouting"

const COMPLETED = new Set(["SERVICE_COMPLETED", "COMPLETED", "CLOSED", "FULLY_PAID", "INVOICE_GENERATED", "BOOKING_CLOSED", "REMAINING_PAYMENT_PENDING"])
const currencySymbol = (currency) => (currency === "GBP" ? "£" : currency === "USD" ? "$" : "")
const money = (currency, amount) => `${currencySymbol(currency)}${Number(amount || 0).toFixed(2)}`

export default function SessionSummary() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = String(localStorage.getItem("gos_role") || "").toUpperCase()
  const routeBooking = location.state?.booking
  const bookingId = new URLSearchParams(location.search).get("bookingId") || routeBooking?.id
  const [booking, setBooking] = useState(routeBooking || null)
  const [loading, setLoading] = useState(Boolean(bookingId))
  const [error, setError] = useState("")
  useEffect(() => {
    if (!bookingId) { setLoading(false); return }
    let active = true
    const refresh = () => getBookingById(bookingId).then((value) => { if (active) setBooking(value) }).catch((requestError) => { if (active && !routeBooking) setError(requestError.message || "Completed booking details could not be loaded.") }).finally(() => { if (active) setLoading(false) })
    refresh()
    window.addEventListener("focus", refresh)
    return () => { active = false; window.removeEventListener("focus", refresh) }
  }, [bookingId, routeBooking])
  const base = getDashboardPathForRole(role)
  const dashboard = role === "TECHNICIAN" ? `${base}?view=completed` : role === "CUSTOMER" ? `${base}?view=bookings` : base
  if (loading && !booking) return <DashboardLoader />
  if (!booking || error) return <main className="min-h-screen bg-gos-off-white px-4 pt-24 text-gos-blue-deep"><section className="mx-auto max-w-md rounded-xl border border-gos-border bg-white p-6 text-center"><h1 className="text-xl font-black">Completed job unavailable</h1><p className="mt-2 text-sm text-gos-muted">{error || "Open a completed booking from your dashboard."}</p><button onClick={() => navigate(dashboard)} className="mt-5 min-h-11 rounded-lg bg-gos-blue-deep px-5 text-sm font-bold text-white">Back to dashboard</button></section></main>
  const status = booking.bookingStatus || booking.status
  const completed = COMPLETED.has(status)
  const remote = booking.remoteSessionRequired || booking.serviceMode === "REMOTE"
  const paymentDue = Number(booking.remainingAmount || 0) > 0 && ["BALANCE_PENDING", "REMAINING_PAYMENT_PENDING"].includes(booking.paymentStatus || status)
  const fullyPaid = completed && !paymentDue
  const rating = booking.customerRating ?? booking.rating
  const review = booking.customerReview ?? booking.review
  const currency = booking.currency
  const payRemaining = () => { localStorage.setItem("currentBooking", JSON.stringify(booking)); navigate("/payment", { state: { booking, bookingId: booking.id, paymentType: "REMAINING" } }) }

  return <main className="min-h-screen bg-[#f4f7f9] px-4 pb-12 pt-[max(18px,env(safe-area-inset-top))] text-gos-charcoal">
    <header className="mx-auto flex max-w-3xl justify-center"><BrandLogo className="h-8 w-auto" /></header>
    <section className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-gos-border bg-white shadow-sm">
      <div className="border-b border-gos-border p-5 text-center">
        <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${fullyPaid ? "bg-emerald-50 text-emerald-600" : "bg-teal-50 text-gos-turquoise"}`}><CheckCircle2 size={22} /></span>
        <p className="mt-3 text-[10px] font-black uppercase text-gos-turquoise">{completed ? "Service completed" : "Service summary"}</p>
        <h1 className="mt-1 text-2xl font-black text-gos-blue-deep">{remote ? "Remote Service Completed" : "Service Completed"}</h1>
        <p className="mt-2 text-sm font-semibold text-gos-muted">GOS-{booking.id} · {booking.serviceType || "Selected service"}</p>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Summary title="Booking" icon={FileText} rows={[["Mode", remote ? "Remote" : "On-site"], ["Status", String(status || "Completed").replaceAll("_", " ")], ["Completed", booking.completedAt ? formatLocalDateTime(booking.completedAt, booking) : null]]} />
        <Summary title={role === "TECHNICIAN" ? "Customer" : "Technician"} icon={User} rows={role === "TECHNICIAN" ? [["Name", booking.customerName], ["Email", booking.customerEmail], ["Phone", booking.customerPhone]] : [["Name", booking.technicianName]]} />
        <Summary title="Service" icon={remote ? Monitor : MapPin} rows={[["Service", booking.serviceType], ["Description", booking.issueDescription], ["Resolution", booking.resolutionNotes || booking.technicianNotes]]} />
        {!paymentDue && <Summary title="Payment" icon={CreditCard} rows={[["Status", booking.paymentStatus], ["Invoice", booking.invoiceNumber]]} />}
      </div>

      {/* Bill summary - real backend amounts only, shown whenever there is a
          balance to collect or once it has actually been paid. Never
          reconstructed from the frontend. */}
      {(paymentDue || fullyPaid) && <div className="px-4 pb-4">
        <div className={`rounded-2xl border p-4 ${paymentDue ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className={`text-sm font-black ${paymentDue ? "text-amber-800" : "text-emerald-800"}`}>{paymentDue ? "Payment Outstanding" : "Payment Completed"}</p>
              <p className={`mt-0.5 text-xs font-semibold ${paymentDue ? "text-amber-700" : "text-emerald-700"}`}>{paymentDue ? "Please pay the remaining amount to close this booking." : "Thank you - your payment has been received in full."}</p>
            </div>
            <p className={`text-xl font-black ${paymentDue ? "text-amber-700" : "text-emerald-700"}`}>{money(currency, paymentDue ? booking.remainingAmount : booking.paidAmount ?? booking.totalAmount)}</p>
          </div>
          <dl className="mt-4 space-y-2 border-t border-black/5 pt-3">
            <BillRow label="Total Service Amount" value={money(currency, booking.totalAmount)} />
            <BillRow label="Amount Paid" value={money(currency, booking.paidAmount)} tone="positive" />
            <BillRow label="Remaining Amount" value={money(currency, paymentDue ? booking.remainingAmount : 0)} tone={paymentDue ? "due" : undefined} bold />
          </dl>
          {role === "CUSTOMER" && paymentDue && <>
            <button onClick={payRemaining} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gos-blue-deep text-sm font-black text-white">Pay Remaining Amount · {money(currency, booking.remainingAmount)}</button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-800/70"><Lock size={11} /> Secure payment powered by Stripe</p>
          </>}
        </div>
      </div>}

      {role === "CUSTOMER" && fullyPaid && rating != null && <div className="px-4 pb-4"><Summary title="Your Rating" icon={Star} rows={[["Rating", `${rating} / 5`], ["Review", review]]} /></div>}
      {role === "TECHNICIAN" && rating != null && <div className="px-4 pb-4"><Summary title="Customer Rating" icon={Star} rows={[["Rating", `${rating} / 5`], ["Review", review]]} /></div>}

      <div className="grid gap-2 border-t border-gos-border p-4 sm:grid-cols-2">
        {role === "CUSTOMER" && fullyPaid && rating == null && <button onClick={() => navigate(`/rate-booking/${booking.id}`)} className="min-h-11 rounded-lg bg-amber-400 px-4 text-xs font-black">Rate Technician</button>}
        <button onClick={() => navigate(dashboard)} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gos-border px-4 text-xs font-black text-gos-blue-deep"><Home size={15} /> {role === "CUSTOMER" ? "Back to My Bookings" : "Back to dashboard"}</button>
      </div>
    </section>
  </main>
}

function BillRow({ label, value, tone, bold }) {
  const color = tone === "positive" ? "text-emerald-700" : tone === "due" ? "text-amber-700" : "text-gos-blue-deep"
  return <div className="flex justify-between gap-3 text-xs"><dt className="font-bold text-gos-muted">{label}</dt><dd className={`${bold ? "font-black" : "font-bold"} ${color}`}>{value}</dd></div>
}

function Summary({ title, icon: Icon, rows }) {
  const visible = rows.filter(([, value]) => value !== undefined && value !== null && value !== "")
  return <section className="rounded-xl border border-gos-border bg-[#fafcfd] p-4"><div className="flex items-center gap-2 text-gos-blue-deep"><Icon size={16} className="text-gos-turquoise" /><h2 className="text-sm font-black">{title}</h2></div><dl className="mt-3 space-y-2">{visible.map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-t border-gos-border/70 pt-2 first:border-0"><dt className="text-[10px] font-bold uppercase text-gos-muted">{label}</dt><dd className="max-w-[65%] break-words text-right text-xs font-bold">{value}</dd></div>)}</dl></section>
}
