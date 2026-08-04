import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCustomerBookings } from "../services/bookingService"
import logo from "../assets/logo.png"
import { useCustomerAuth } from "../context/CustomerAuthContext"

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Circle,
  ClipboardList,
  Headphones,
  Home,
  Laptop,
  LogOut,
  MapPin,
  Phone,
  Plus,
  Printer,
  Receipt,
  Search,
  ShieldCheck,
  User,
  Wifi,
  Wrench,
  Monitor,
  Navigation,
  FileText,
} from "lucide-react"

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

const statusTabs = [
  "All",
  "Pending",
  "Payment Completed",
  "Assigned",
  "On The Way",
  "Completed",
  "Cancelled",
]

const getIcon = (serviceType = "") => {
  const name = serviceType.toLowerCase()

  if (name.includes("wifi") || name.includes("network") || name.includes("router")) return Wifi
  if (name.includes("printer")) return Printer
  if (name.includes("remote") || name.includes("virus") || name.includes("software")) return Monitor

  return Laptop
}

const getReadableStatus = (bookingStatus = "") => {
  return statusLabel[bookingStatus] || bookingStatus || "Pending"
}

const getSchedule = (booking) => {
  if (booking?.bookingDate && booking?.timeSlot) {
    return `${booking.bookingDate} • ${booking.timeSlot}`
  }

  return "Schedule not selected"
}

const getLocation = (booking) => {
  return [booking?.city, booking?.state, booking?.country]
    .filter(Boolean)
    .join(", ") || "Location not provided"
}

export default function CustomerDashboard() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("Home")
  const [bookingFilter, setBookingFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const { customer , logoutCustomer } = useCustomerAuth()

const customerName = customer?.fullName || "Customer"
const customerEmail = customer?.email || ""
const customerPhone = customer?.phone || "Not added"

  useEffect(() => {
    const token = localStorage.getItem("gos_token")

     if (!token) {
      navigate("/customer-login")
      return
    }

    loadBookings()
  }, [navigate])

  const loadBookings = async () => {
  try {
    setLoading(true)

    const data = await getCustomerBookings()

    setBookings(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error(error)

    if (error.message?.includes("401")) {
      logout()
      return
    }

    setLoadError(error.message || "Failed to load customer dashboard bookings.")
  } finally {
    setLoading(false)
  }
}

  const filteredBookings = useMemo(() => {
    const keyword = search.toLowerCase()

    return bookings.filter((item) => {
      const readableStatus = getReadableStatus(item.bookingStatus)

      const filterMatch =
        bookingFilter === "All" || readableStatus === bookingFilter

      const searchMatch =
        String(item.id).toLowerCase().includes(keyword) ||
        String(item.serviceType || "").toLowerCase().includes(keyword) ||
        String(item.technicianName || "").toLowerCase().includes(keyword) ||
        String(item.bookingStatus || "").toLowerCase().includes(keyword)

      return filterMatch && searchMatch
    })
  }, [bookings, bookingFilter, search])

  const stats = useMemo(() => {
    const completed = bookings.filter(
      (item) => item.bookingStatus === "SERVICE_COMPLETED"
    ).length

    const cancelled = bookings.filter(
      (item) => item.bookingStatus === "CANCELLED"
    ).length

    const active = bookings.filter(
      (item) =>
        item.bookingStatus !== "SERVICE_COMPLETED" &&
        item.bookingStatus !== "CANCELLED"
    ).length

    return {
      active,
      completed,
      cancelled,
    }
  }, [bookings])

  const currentBooking = bookings[0] || null

  const logout = () => {
  logoutCustomer()
  navigate("/")
}

  const tabs = [
    { title: "Home", icon: Home },
    { title: "Bookings", icon: ClipboardList },
    { title: "Notifications", icon: Bell },
    { title: "Profile", icon: User },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] pt-40 text-white">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[#071122] p-8 text-center">
          <p className="font-black text-cyan-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[292px] lg:flex-col lg:border-r lg:border-cyan-500/10 lg:bg-[#071122] lg:p-6">
        <div className="border-b border-white/10 pb-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-3xl font-black text-cyan-300">
            {customerName.charAt(0).toUpperCase()}
          </div>

          <h2 className="mt-4 font-black">{customerName}</h2>
          <p className="mt-1 break-words text-xs text-slate-500">
            {customerEmail}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-300">
            <ShieldCheck size={13} />
            Verified Customer
          </div>
        </div>

        <div className="mt-7 space-y-2">
          {tabs.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.title

            return (
              <button
                key={item.title}
                onClick={() => setActiveTab(item.title)}
                className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition ${
                  active
                    ? "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-bold">{item.title}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={logout}
          className="mt-auto flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-red-300"
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="lg:ml-[292px]">
        <header className="sticky top-0 z-40 border-b border-cyan-500/10 bg-[#071122]/95 px-4 py-4 backdrop-blur-xl lg:px-7">
          <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
  <img
    src={logo}
    alt="GeekOnSites Logo"
    className="h-11 w-auto object-contain"
  />

  <div>
    <button
      onClick={() => navigate("/")}
      className="mb-1 flex items-center gap-2 text-sm text-cyan-300"
    >
      <ArrowLeft size={15} />
      Back
    </button>

    <h1 className="text-2xl font-black">{activeTab}</h1>
  </div>
</div>

            <button
              onClick={() => navigate("/book-service")}
              className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-black"
            >
              Book
            </button>
          </div>
        </header>

        <div className="px-4 py-5 pb-28 lg:px-7 lg:pb-8">
          {loadError && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {loadError}
            </div>
          )}
          {activeTab === "Home" && (
            <HomeScreen
              name={customerName}
              currentBooking={currentBooking}
              stats={stats}
              onBookings={() => setActiveTab("Bookings")}
            />
          )}

          {activeTab === "Bookings" && (
            <BookingsScreen
              bookings={filteredBookings}
              filter={bookingFilter}
              setFilter={setBookingFilter}
              search={search}
              setSearch={setSearch}
              navigate={navigate}
            />
          )}

          {activeTab === "Notifications" && (
            <NotificationsScreen bookings={bookings} />
          )}

          {activeTab === "Profile" && (
            <ProfileScreen
              name={customerName}
              email={customerEmail}
              phone={customerPhone}
              logout={logout}
            />
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cyan-500/10 bg-[#071122]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.title

            return (
              <button
                key={item.title}
                onClick={() => setActiveTab(item.title)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-xs font-bold ${
                  active
                    ? "bg-cyan-500/10 text-cyan-300"
                    : "text-slate-500"
                }`}
              >
                <Icon size={20} />
                {item.title === "Notifications" ? "Notify" : item.title}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function HomeScreen({ name, currentBooking, stats, onBookings }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold text-cyan-300">Welcome back</p>
        <h2 className="mt-1 text-3xl font-black">{name}</h2>
        <p className="mt-1 text-sm text-slate-400">
          Track your service, technician and booking updates.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard value={stats.active} label="Active" />
        <StatCard value={stats.completed} label="Completed" />
        <StatCard value={stats.cancelled} label="Cancelled" />
      </div>

      {currentBooking ? (
        <CurrentService booking={currentBooking} onBookings={onBookings} />
      ) : (
        <EmptyCurrentService />
      )}

      <div>
        <h3 className="mb-3 text-lg font-black">Quick Actions</h3>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickAction icon={Plus} title="Book Service" path="/book-service" />
          <QuickAction icon={Headphones} title="Support" path="/contact" />
          <QuickAction icon={Receipt} title="Invoices" path="/my-bookings" />
          <QuickAction icon={Wrench} title="Remote Help" path="/remote-session" />
        </div>
      </div>

      {currentBooking && (
        <div>
          <h3 className="mb-3 text-lg font-black">Recent Booking</h3>
          <BookingPreview booking={currentBooking} />
        </div>
      )}
    </div>
  )
}

function CurrentService({ booking, onBookings }) {
  const Icon = getIcon(booking.serviceType)
  const status = getReadableStatus(booking.bookingStatus)

  return (
    <div className="overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-[#071122] p-5 shadow-2xl">
      <p className="text-sm font-bold text-cyan-300">Current Service</p>

      <div className="mt-4 flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-cyan-500/10">
          <Icon className="h-8 w-8 text-cyan-300" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-black">
            {booking.serviceType || "Selected Service"}
          </h3>
          <p className="mt-1 text-xs font-bold text-cyan-300">
            #GOS-{booking.id}
          </p>

          <span className="mt-3 inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-black text-green-300">
            {status}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs text-slate-500">Assigned Technician</p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div>
            <h4 className="font-black">
              {booking.technicianName || "Technician not assigned"}
            </h4>
            <p className="text-sm text-yellow-300">⭐ 4.9</p>
          </div>

          <p className="text-right text-sm text-slate-400">
            {getSchedule(booking)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={onBookings}
          className="rounded-2xl bg-cyan-400 py-3 text-sm font-black text-black"
        >
          Track Service
        </button>

        <a
          href={booking.technicianPhone ? `tel:${booking.technicianPhone}` : undefined}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-black"
        >
          <Phone size={17} />
          Call
        </a>
      </div>
    </div>
  )
}

function EmptyCurrentService() {
  const navigate = useNavigate()

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-6 text-center">
      <ClipboardList className="mx-auto h-10 w-10 text-slate-600" />
      <h3 className="mt-4 text-xl font-black">No bookings yet</h3>
      <p className="mt-2 text-sm text-slate-400">
        Book your first GeekOnSites service to start tracking.
      </p>
      <button
        onClick={() => navigate("/book-service")}
        className="mt-5 rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black"
      >
        Book Service
      </button>
    </div>
  )
}

function BookingsScreen({
  bookings,
  filter,
  setFilter,
  search,
  setSearch,
  navigate,
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-black">My Bookings</h2>
        <p className="mt-1 text-sm text-slate-400">
          View active and completed service bookings.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black ${
              filter === item
                ? "bg-cyan-400 text-black"
                : "border border-white/10 bg-white/[0.04] text-slate-400"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
        <Search size={18} className="text-slate-500" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search booking ID, service, technician..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="space-y-4">
        {bookings.length ? (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} navigate={navigate} />
          ))
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-8 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-600" />
            <h3 className="mt-4 text-xl font-black">No bookings found</h3>
            <p className="mt-2 text-sm text-slate-400">
              Try another filter or book a new service.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking, navigate }) {
  const Icon = getIcon(booking.serviceType)
  const status = getReadableStatus(booking.bookingStatus)

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-4 shadow-xl">
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
          <Icon className="h-7 w-7 text-cyan-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="text-lg font-black">
                {booking.serviceType || "Selected Service"}
              </h3>
              <p className="mt-1 text-xs font-bold text-cyan-300">
                #GOS-{booking.id}
              </p>
            </div>

            <span className="h-fit rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-black text-green-300">
              {status}
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <p className="text-xs text-slate-500">Technician</p>

            <div className="mt-1 flex justify-between gap-3">
              <p className="font-black">
                {booking.technicianName || "Technician not assigned"}
              </p>
              <p className="text-sm text-yellow-300">⭐ 4.9</p>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              {getSchedule(booking)}
            </p>
          </div>
        </div>
      </div>

      <MiniTimeline booking={booking} />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() =>
            navigate(`/track-technician/${booking.id}`, {
              state: { booking },
            })
          }
          className="flex items-center justify-center gap-1 rounded-2xl bg-cyan-400 py-3 text-xs font-black text-black"
        >
          <Navigation size={14} />
          Track
        </button>

        <a
          href={booking.technicianPhone ? `tel:${booking.technicianPhone}` : undefined}
          className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 py-3 text-xs font-black"
        >
          <Phone size={14} />
          Call
        </a>

        <button
          onClick={() =>
            navigate("/invoice", {
              state: { booking },
            })
          }
          className="flex items-center justify-center gap-1 rounded-2xl border border-white/10 py-3 text-xs font-black"
        >
          <FileText size={14} />
          Invoice
        </button>
      </div>
    </div>
  )
}

function MiniTimeline({ booking }) {
  const status = booking.bookingStatus

  const steps = [
    {
      label: "Booked",
      active: true,
    },
    {
      label: "Paid",
      active: ["PAID", "PARTIALLY_PAID"].includes(booking.paymentStatus),
    },
    {
      label: "Assigned",
      active: [
        "TECHNICIAN_ASSIGNED",
        "TECHNICIAN_ON_THE_WAY",
        "SERVICE_STARTED",
        "SERVICE_COMPLETED",
      ].includes(status),
    },
    {
      label: "On Way",
      active: [
        "TECHNICIAN_ON_THE_WAY",
        "SERVICE_STARTED",
        "SERVICE_COMPLETED",
      ].includes(status),
    },
    {
      label: "Done",
      active: status === "SERVICE_COMPLETED",
    },
  ]

  return (
    <div className="mt-5 grid grid-cols-5 gap-1">
      {steps.map((step) => (
        <div key={step.label} className="text-center">
          {step.active ? (
            <CheckCircle2 className="mx-auto h-4 w-4 text-cyan-300" />
          ) : (
            <Circle className="mx-auto h-4 w-4 text-slate-600" />
          )}

          <p className="mt-1 text-[10px] text-slate-500">{step.label}</p>
        </div>
      ))}
    </div>
  )
}

function BookingPreview({ booking }) {
  const status = getReadableStatus(booking.bookingStatus)

  return (
    <div className="rounded-3xl border border-white/10 bg-[#071122] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-black">
            {booking.serviceType || "Selected Service"}
          </h4>
          <p className="mt-1 text-xs text-cyan-300">#GOS-{booking.id}</p>
        </div>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-black text-green-300">
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-400">
        {booking.technicianName || "Technician not assigned"} •{" "}
        {getSchedule(booking)}
      </p>
    </div>
  )
}

function NotificationsScreen({ bookings }) {
  const recentBookings = bookings.slice(0, 3)

  if (!recentBookings.length) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-3xl font-black">Notifications</h2>
          <p className="mt-1 text-sm text-slate-400">Latest service updates.</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-8 text-center">
          <Bell className="mx-auto h-10 w-10 text-slate-600" />
          <h3 className="mt-4 text-xl font-black">No notifications yet</h3>
          <p className="mt-2 text-sm text-slate-400">
            Booking updates will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-black">Notifications</h2>
        <p className="mt-1 text-sm text-slate-400">Latest service updates.</p>
      </div>

      {recentBookings.map((booking) => (
        <div
          key={booking.id}
          className="rounded-[2rem] border border-white/10 bg-[#071122] p-4"
        >
          <Bell className="h-6 w-6 text-cyan-300" />
          <h3 className="mt-3 font-black">
            {getReadableStatus(booking.bookingStatus)}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {booking.serviceType} booking #GOS-{booking.id} was updated.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {booking.updatedAt || booking.createdAt || "Recently"}
          </p>
        </div>
      ))}
    </div>
  )
}

function ProfileScreen({ name, email, phone, logout }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-black">Profile</h2>
        <p className="mt-1 text-sm text-slate-400">Your account details.</p>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-400 text-3xl font-black text-black">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="text-2xl font-black">{name}</h3>
            <p className="break-words text-sm text-slate-400">{email}</p>
            <p className="mt-1 text-sm font-bold text-cyan-300">
              Verified Customer
            </p>
          </div>
        </div>
      </div>

      <InfoCard icon={Phone} label="Phone" value={phone} />
      <InfoCard
        icon={MapPin}
        label="Service Region"
        value={localStorage.getItem("gos_location") || "US"}
      />
      <InfoCard icon={ShieldCheck} label="Account Status" value="Active" />

      <button
        onClick={logout}
        className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-3 font-black text-red-300"
      >
        Logout
      </button>
    </div>
  )
}

function QuickAction({ icon: Icon, title, path }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(path)}
      className="rounded-3xl border border-white/10 bg-[#071122] p-4 text-left"
    >
      <Icon className="h-6 w-6 text-cyan-300" />
      <p className="mt-4 font-black">{title}</p>
    </button>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#071122] p-5">
      <Icon className="h-5 w-5 text-cyan-300" />
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
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