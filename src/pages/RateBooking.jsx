import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCustomerBookings } from "../services/bookingService"
import {
  Search,
  Laptop,
  Wifi,
  Printer,
  Phone,
  MapPin,
  CheckCircle2,
  Clock3,
  Star,
  FileText,
  ChevronRight,
  Navigation,
  Video,
  Monitor,
  X,
} from "lucide-react"

const statusTabs = [
  "All",
  "Pending",
  "Payment Completed",
  "Assigned",
  "On The Way",
  "Completed",
  "Cancelled",
]

const statusLabel = {
  PENDING: "Pending",
  PAYMENT_COMPLETED: "Payment Completed",
  ASSIGNMENT_PENDING: "Assignment Pending",
  TECHNICIAN_ASSIGNED: "Assigned",
  TECHNICIAN_ON_THE_WAY: "On The Way",
  SERVICE_STARTED: "Service Started",
  REMOTE_SESSION_STARTED: "Remote Session Started",
  SERVICE_COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

const getIcon = (serviceType = "") => {
  const name = serviceType.toLowerCase()
  if (name.includes("wifi") || name.includes("network") || name.includes("router")) return Wifi
  if (name.includes("printer")) return Printer
  if (name.includes("remote") || name.includes("virus") || name.includes("software")) return Monitor
  return Laptop
}

const getSymbol = (currency, country) => {
  if (currency === "USD" || country === "US") return "$"
  return "£"
}

const getDateText = (booking) => {
  if (booking.bookingDate && booking.timeSlot) {
    return `${booking.bookingDate} • ${booking.timeSlot}`
  }
  return "Schedule not selected"
}

const getLocationText = (booking) => {
  return [booking.city, booking.state, booking.country].filter(Boolean).join(", ") || "Location not provided"
}

export default function MyBookings() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
  try {
    setLoading(true)
    setLoadError("")

    const data = await getCustomerBookings()

    setBookings(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error(error)
    setLoadError(error.message || "Failed to load bookings.")
  } finally {
    setLoading(false)
  }
}

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return bookings.filter((item) => {
      const readableStatus = statusLabel[item.bookingStatus] || item.bookingStatus || "Pending"

      const matchesFilter = filter === "All" || readableStatus === filter

      const matchesSearch =
        String(item.id).toLowerCase().includes(keyword) ||
        String(item.serviceType || "").toLowerCase().includes(keyword) ||
        String(item.technicianName || "").toLowerCase().includes(keyword) ||
        String(item.bookingStatus || "").toLowerCase().includes(keyword)

      return matchesFilter && matchesSearch
    })
  }, [bookings, filter, search])

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.bookingStatus === "SERVICE_COMPLETED").length
    const active = bookings.filter(
      (b) => b.bookingStatus !== "SERVICE_COMPLETED" && b.bookingStatus !== "CANCELLED"
    ).length
    const cancelled = bookings.filter((b) => b.bookingStatus === "CANCELLED").length

    return { active, completed, cancelled }
  }, [bookings])

  const openTrack = (booking) => {
    navigate(`/track-technician/${booking.id}`, {
      state: {
        booking: {
          ...booking,
          id: booking.id,
          serviceType: booking.serviceType,
          issueDescription: booking.issueDescription,
          technicianName: booking.technicianName || "Technician not assigned",
          technicianRole: booking.serviceMode === "REMOTE" ? "Remote Support Technician" : "On-site Technician",
          technicianPhone: booking.technicianPhone || "",
          rating: "4.9",
          status: statusLabel[booking.bookingStatus] || booking.bookingStatus,
          date: getDateText(booking),
          location: getLocationText(booking),
          supportType: booking.remoteSessionRequired ? "remote" : "onsite",
          sessionId: `GOS-RM-${booking.id}`,
          remoteMeetingLink: booking.remoteSessionLink,
        },
      },
    })
  }

  const openInvoice = (booking) => {
    const symbol = getSymbol(booking.currency, booking.country)

    navigate(`/invoice/${booking.id}`, {
      state: {
        booking: {
          ...booking,
          id: booking.id,
          serviceType: booking.serviceType,
          issueDescription: booking.issueDescription,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          sessionId: `GOS-RM-${booking.id}`,
          invoiceNumber: booking.invoiceNumber || `INV-GOS-${booking.id}`,
          amountPaid: Number(booking.paidAmount || booking.paymentAmount || 0).toFixed(2),
          serviceAmount: Number(booking.baseAmount || 0).toFixed(2),
          platformFee: Number(booking.platformFee || 0).toFixed(2),
          currency: symbol,
          paymentMethod: booking.paymentMethod || "CARD",
        },
        technician: {
          name: booking.technicianName || "Technician not assigned",
          role: booking.serviceMode === "REMOTE" ? "Remote Support Technician" : "On-site Technician",
        },
        sessionDuration: "00:00:00",
        workPerformed: [
          "Booking details reviewed",
          "Payment status checked",
          "Service status updated",
          "Invoice details prepared",
        ],
        resolutionNotes: "Service details were loaded from backend booking history.",
      },
    })
  }

  const openRemoteSession = (booking) => {
    navigate("/remote-session", {
      state: {
        booking: {
          ...booking,
          id: booking.id,
          serviceType: booking.serviceType,
          issueDescription: booking.issueDescription,
          supportType: "remote",
          sessionId: `GOS-RM-${booking.id}`,
          remoteMeetingLink: booking.remoteSessionLink || "",
        },
        technician: {
          name: booking.technicianName || "Technician not assigned",
          role: "Remote Support Technician",
          phone: booking.technicianPhone || "",
        },
      },
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020817] px-4 pb-28 pt-[140px] text-white">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-[#071122] p-8 text-center">
          <p className="font-black text-cyan-300">Loading bookings...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020817] px-4 pb-28 pt-[110px] text-white sm:px-6 lg:pt-[140px]">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black sm:text-4xl">My Bookings</h1>
          <p className="mt-2 text-sm text-slate-400">
            Track services, contact technicians, and download invoices.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-3">
          <StatCard value={stats.active} label="Active" />
          <StatCard value={stats.completed} label="Completed" />
          <StatCard value={stats.cancelled} label="Cancelled" />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {statusTabs.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black transition ${
                filter === item
                  ? "bg-cyan-400 text-black"
                  : "border border-white/10 bg-[#071122] text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#071122] px-4 py-3">
          <Search size={18} className="text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search booking, service, technician..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
          {search && <button type="button" onClick={() => setSearch("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-500 hover:text-white" aria-label="Clear search"><X size={16} /></button>}
        </div>

        {loadError && (
  <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
    {loadError}
  </div>
)}

        <div className="space-y-4">
          {filtered.map((booking) => {
            const Icon = getIcon(booking.serviceType)
            const readableStatus = statusLabel[booking.bookingStatus] || booking.bookingStatus || "Pending"
            const supportType = booking.remoteSessionRequired ? "remote" : "onsite"

            return (
              <div
                key={booking.id}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-[#071122] shadow-xl shadow-cyan-500/5"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
                      <Icon size={28} className="text-cyan-300" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black">
                            {booking.serviceType || "Selected Service"}
                          </h3>
                          <p className="mt-1 text-xs text-cyan-300">
                            #GOS-{booking.id}
                          </p>
                        </div>

                        <ChevronRight className="text-slate-500" size={18} />
                      </div>

                      <div className="mt-4 inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300">
                        {readableStatus}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Technician</p>
                        <h4 className="mt-1 font-black">
                          {booking.technicianName || "Technician not assigned"}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={15} fill="currentColor" />
                        <span className="text-sm">4.9</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                      <Clock3 size={15} />
                      {getDateText(booking)}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <MapPin size={15} />
                      {getLocationText(booking)}
                    </div>
                  </div>

                  <div className="mt-5 flex justify-between">
                    <TimelineStep active text="Booked" />
                    <TimelineStep
                      active={["PAID", "PARTIALLY_PAID"].includes(booking.paymentStatus)}
                      text="Paid"
                    />
                    <TimelineStep
                      active={[
                        "TECHNICIAN_ASSIGNED",
                        "TECHNICIAN_ON_THE_WAY",
                        "SERVICE_STARTED",
                        "SERVICE_COMPLETED",
                      ].includes(booking.bookingStatus)}
                      text="Assigned"
                    />
                    <TimelineStep
                      active={[
                        "TECHNICIAN_ON_THE_WAY",
                        "SERVICE_STARTED",
                        "SERVICE_COMPLETED",
                      ].includes(booking.bookingStatus)}
                      text="On Way"
                    />
                    <TimelineStep
  active={[
    "SERVICE_COMPLETED",
    "FULLY_PAID",
    "BOOKING_CLOSED",
  ].includes(booking.bookingStatus)}
  text="Done"
/>
                    
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openTrack(booking)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3 text-xs font-black text-black"
                    >
                      <Navigation size={14} />
                      Track
                    </button>

                    <a
                      href={booking.technicianPhone ? `tel:${booking.technicianPhone}` : undefined}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-xs font-bold text-white"
                    >
                      <Phone size={14} />
                      Call
                    </a>

                    {booking.invoiceGenerated ? (
  <button
    onClick={() => openInvoice(booking)}
    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-xs font-bold text-white"
  >
    <FileText size={14} />
    Invoice
  </button>
) : (
  <button
    disabled
    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-xs font-bold text-slate-500"
  >
    <FileText size={14} />
    Pending
  </button>
)}
                    
                  </div>

        {booking.paymentStatus === "BALANCE_PENDING" &&
  !booking.bookingClosed &&
  Number(booking.remainingAmount || 0) > 0 && (
    <button
      onClick={() =>
        navigate("/payment", {
          state: {
            bookingId: booking.id,
            paymentType: "REMAINING",
          },
        })
      }
      className="mt-3 flex w-full items-center justify-center rounded-2xl bg-amber-400 py-3 text-sm font-black text-black hover:bg-amber-300"
    >
      Pay Remaining Balance
    </button>
)}

{booking.bookingClosed && (
  <button
    onClick={() =>
      navigate(`/rate-booking/${booking.id}`)
    }
    className="mt-3 flex w-full items-center justify-center rounded-2xl bg-green-500 py-3 text-sm font-black text-white hover:bg-green-600"
  >
    ⭐ Rate Technician
  </button>
)}

                  {supportType === "remote" && booking.bookingStatus !== "SERVICE_COMPLETED" && (
                    <button
                      onClick={() => openRemoteSession(booking)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 py-3 text-xs font-black text-cyan-300"
                    >
                      <Video size={15} />
                      Join Remote Session
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="rounded-[28px] border border-white/10 bg-[#071122] p-8 text-center">
              <p className="font-bold text-white">No bookings found</p>
              <p className="mt-2 text-sm text-slate-400">
                Try changing filter or search text.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function TimelineStep({ active, text }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <CheckCircle2
        size={18}
        className={active ? "text-cyan-300" : "text-slate-600"}
      />
      <span className="text-[10px] text-slate-500">{text}</span>
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071122] p-4 text-center">
      <h3 className="text-2xl font-black">{value}</h3>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}
