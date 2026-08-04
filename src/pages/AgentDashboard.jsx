import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllBookings } from "../services/bookingService"
import { getAllTechnicians } from "../services/technicianService"
import {
  getAllAgents,
  getAgentNotifications,
} from "../services/agentService"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Search,
  Settings,
  User,
  Users,
  Video,
  Wrench,
  X,
} from "lucide-react"

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`

const statusLabel = {
  PENDING: "Pending",
  PAYMENT_COMPLETED: "Payment Completed",
  ASSIGNMENT_PENDING: "Assignment Pending",
  TECHNICIAN_ASSIGNED: "Technician Assigned",
  TECHNICIAN_ON_THE_WAY: "On The Way",
  SERVICE_STARTED: "Service Started",
  REMOTE_SESSION_STARTED: "Remote Started",
  SERVICE_COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

const currencySymbol = (currency) => {
  if (currency === "USD") return "$"
  if (currency === "GBP") return "£"
  return ""
}

const getMode = (booking) => {
  if (booking.serviceMode) return booking.serviceMode
  return booking.remoteSessionRequired ? "REMOTE" : "ONSITE"
}

const getLocation = (booking) =>
  [booking.city, booking.state, booking.country].filter(Boolean).join(", ") ||
  "Location not provided"

const isUnassigned = (booking) => !booking.technicianId

const isPending = (booking) =>
  booking.bookingStatus === "PENDING" ||
  booking.bookingStatus === "PAYMENT_COMPLETED" ||
  booking.bookingStatus === "ASSIGNMENT_PENDING"

const formatMoney = (booking, amount) =>
  `${currencySymbol(booking.currency)}${Number(amount || 0).toFixed(2)}`

export default function AgentDashboard() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("Dashboard")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [popup, setPopup] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("")
  const [bookings, setBookings] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [agents, setAgents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
const [statusFilter, setStatusFilter] = useState("ALL")
const [modeFilter, setModeFilter] = useState("ALL")
 
  const { user, logoutCustomer } = useCustomerAuth()

 const agentName = user?.fullName || "Agent"
 const agentRole = user?.role || "AGENT"

  useEffect(() => {
    const token = localStorage.getItem("gos_token")
    const role = localStorage.getItem("gos_role")

    console.log("TOKEN =", token)
    console.log("ROLE =", role)

    if (!token) {
      navigate("/agent-login")
      return
    }

    loadDashboard()
  }, [navigate])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      const [
  bookingData,
  technicianData,
  agentData,
  notificationData,
] = await Promise.all([
  getAllBookings(),
  getAllTechnicians(),
  getAllAgents(),
  getAgentNotifications(),
])

      setBookings(Array.isArray(bookingData) ? bookingData : [])
      setTechnicians(Array.isArray(technicianData) ? technicianData : [])
      setAgents(Array.isArray(agentData) ? agentData : [])
      setNotifications(
  Array.isArray(notificationData) ? notificationData : []
)
    } catch (error) {
      console.error("Agent dashboard load error:", error)
      showPopup("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const assignTechnician = async () => {
    if (!selectedBooking?.id || !selectedTechnicianId) {
      showPopup("Select booking and technician")
      return
    }

    try {
      const response = await fetch(
  `${API_BASE_URL}/bookings/${selectedBooking.id}/assign-technician/${selectedTechnicianId}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("gos_token")}`,
    },
  }
)

      if (!response.ok) {
        throw new Error("Assign technician failed")
      }

      const updatedBooking = await response.json()

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      )

      setSelectedBooking(null)
      setSelectedTechnicianId("")
      showPopup("Technician assigned successfully")
    } catch (error) {
      console.error(error)
      showPopup("Assignment failed")
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(
  `${API_BASE_URL}/bookings/${bookingId}/status/${status}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("gos_token")}`,
    },
  }
)

      if (!response.ok) {
        throw new Error("Status update failed")
      }

      const updatedBooking = await response.json()

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      )

      showPopup(`Booking updated to ${statusLabel[status] || status}`)
    } catch (error) {
      console.error(error)
      showPopup("Status update failed")
    }
  }

  const metrics = useMemo(() => {
    const completed = bookings.filter(
      (booking) => booking.bookingStatus === "SERVICE_COMPLETED"
    )


    const paid = bookings.filter(
      (booking) =>
        booking.paymentStatus === "PAID" ||
        booking.paymentStatus === "PARTIALLY_PAID"
    )

    const totalRevenue = paid.reduce(
      (sum, booking) => sum + Number(booking.paidAmount || 0),
      0
    )

    return {
      totalBookings: bookings.length,
      pending: bookings.filter(isPending).length,
      assigned: bookings.filter((booking) => booking.technicianId).length,
      completed: completed.length,
      availableTechs: technicians.filter(
        (tech) => tech.availabilityStatus === "AVAILABLE"
      ).length,
      totalRevenue,
    }
  }, [bookings, technicians])

  const filteredBookings = useMemo(() => {
  const keyword = searchTerm.toLowerCase().trim()

  return bookings.filter((booking) => {
    const readableStatus =
      statusLabel[booking.bookingStatus] || booking.bookingStatus || ""

    const mode = getMode(booking)

    const matchesSearch =
      !keyword ||
      String(booking.id || "").toLowerCase().includes(keyword) ||
      String(booking.customerName || "").toLowerCase().includes(keyword) ||
      String(booking.customerEmail || "").toLowerCase().includes(keyword) ||
      String(booking.customerPhone || "").toLowerCase().includes(keyword) ||
      String(booking.serviceType || "").toLowerCase().includes(keyword) ||
      String(booking.technicianName || "").toLowerCase().includes(keyword) ||
      readableStatus.toLowerCase().includes(keyword)

    const matchesStatus =
      statusFilter === "ALL" || booking.bookingStatus === statusFilter

    const matchesMode =
      modeFilter === "ALL" || mode === modeFilter

    return matchesSearch && matchesStatus && matchesMode
  })
}, [bookings, searchTerm, statusFilter, modeFilter])

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Live Bookings", icon: BriefcaseBusiness },
    { title: "Assign Technician", icon: Wrench },
    { title: "Customers", icon: Users },
    { title: "Remote Sessions", icon: Monitor },
    { title: "Reports", icon: BarChart3 },
    { title: "Notifications", icon: Bell },
    { title: "Settings", icon: Settings },
  ]

  const mobileTabs = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Live Bookings", icon: BriefcaseBusiness },
    { title: "Assign Technician", icon: Wrench },
    { title: "Reports", icon: BarChart3 },
    { title: "Settings", icon: Settings },
  ]

  const showPopup = (text) => {
    setPopup(text)
    setTimeout(() => setPopup(""), 2200)
  }

  const openTab = (tab) => {
    setActiveTab(tab)
    setMobileMenu(false)

    setTimeout(() => {
      document
        .getElementById("agent-main-content")
        ?.scrollTo({ top: 0, behavior: "smooth" })
    }, 50)
  }

  const DashboardSection = () => (
    <>
    <div className="mb-5 flex flex-wrap gap-2">
  {[
    ["ALL", "All"],
    ["PENDING", "Pending"],
    ["ASSIGNMENT_PENDING", "Assignment"],
    ["TECHNICIAN_ASSIGNED", "Assigned"],
    ["SERVICE_COMPLETED", "Completed"],
  ].map(([value, label]) => (
    <button
      key={value}
      onClick={() => setStatusFilter(value)}
      className={`rounded-2xl px-4 py-2 text-xs font-black ${
        statusFilter === value
          ? "bg-cyan-400 text-black"
          : "border border-white/10 bg-[#0b1628] text-cyan-100/60"
      }`}
    >
      {label}
    </button>
  ))}

  {[
    ["ALL", "All Modes"],
    ["REMOTE", "Remote"],
    ["ONSITE", "Onsite"],
  ].map(([value, label]) => (
    <button
      key={value}
      onClick={() => setModeFilter(value)}
      className={`rounded-2xl px-4 py-2 text-xs font-black ${
        modeFilter === value
          ? "bg-green-400 text-black"
          : "border border-white/10 bg-[#0b1628] text-cyan-100/60"
      }`}
    >
      {label}
    </button>
  ))}
</div>
      <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
        <StatCard title="Total Bookings" value={metrics.totalBookings} icon={BriefcaseBusiness} />
        <StatCard title="Pending" value={metrics.pending} icon={Clock3} />
        <StatCard title="Available Techs" value={metrics.availableTechs} icon={Wrench} />
        <StatCard title="Completed" value={metrics.completed} icon={CheckCircle2} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Live Booking Queue" subtitle="Real bookings from backend">
          <div className="space-y-4">
            {filteredBookings.length ? (
              filteredBookings.slice(0, 5).map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onView={() => setSelectedBooking(booking)}
                  onAssign={() => {
                    setSelectedBooking(booking)
                    openTab("Assign Technician")
                  }}
                  onStatus={updateBookingStatus}
                />
              ))
            ) : (
              <EmptyState title="No bookings found" text="Backend bookings will appear here." />
            )}
          </div>
        </Panel>

        <Panel title="Agent Summary" subtitle="Operations overview">
          <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                <User className="h-8 w-8" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-xl font-black">{agentName}</h3>
                <p className="truncate text-sm text-cyan-100/45">
                   AGENT ACCOUNT
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniInfo label="Agents" value={agents.length} />
              <MiniInfo label="Assigned" value={metrics.assigned} />
              <MiniInfo label="Revenue" value={`£/$${metrics.totalRevenue.toFixed(2)}`} />
              <MiniInfo label="Region" value="US / UK" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <SummaryLine text={`${metrics.pending} bookings need attention`} />
            <SummaryLine text={`${metrics.availableTechs} technicians available`} />
            <SummaryLine text={`${metrics.completed} bookings completed`} />
            <SummaryLine text={`${bookings.filter((b) => b.remoteSessionRequired).length} remote session bookings`} />
          </div>
        </Panel>
      </div>
    </>
  )

  const LiveBookingsSection = () => (
    <Panel title="Live Booking Queue" subtitle="Manage all backend bookings">
      <div className="space-y-4">
        {filteredBookings.length ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onView={() => setSelectedBooking(booking)}
              onAssign={() => {
                setSelectedBooking(booking)
                openTab("Assign Technician")
              }}
              onStatus={updateBookingStatus}
            />
          ))
        ) : (
          <EmptyState title="No bookings" text="No booking records returned from backend." />
        )}
      </div>
    </Panel>
  )

  const AssignTechnicianSection = () => {
    const unassignedBookings = bookings.filter(isUnassigned)
    const availableTechnicians = technicians.filter(
      (tech) => tech.availabilityStatus === "AVAILABLE"
    )

    return (
      <Panel title="Assign Technician" subtitle="Assign available technicians to unassigned bookings">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <h3 className="text-lg font-black">Unassigned Bookings</h3>

            {unassignedBookings.length ? (
              unassignedBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`w-full rounded-3xl border p-5 text-left ${
                    selectedBooking?.id === booking.id
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "border-white/10 bg-[#0b1628]"
                  }`}
                >
                  <h4 className="font-black">GOS-{booking.id}</h4>
                  <p className="mt-1 text-sm text-cyan-100/70">
                    {booking.customerName}
                  </p>
                  <p className="mt-1 text-sm text-cyan-100/45">
                    {booking.serviceType}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={booking.bookingStatus} />
                    <Badge>{booking.country}</Badge>
                    <Badge>{getMode(booking)}</Badge>
                  </div>
                </button>
              ))
            ) : (
              <EmptyState title="No unassigned bookings" text="All bookings are already assigned or completed." />
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
            <h3 className="text-lg font-black">Available Technicians</h3>

            {!selectedBooking && (
              <p className="mt-4 text-sm text-cyan-100/45">
                Select a booking first.
              </p>
            )}

            {selectedBooking && (
              <>
                <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="text-sm text-cyan-100/45">Selected Booking</p>
                  <h4 className="mt-1 font-black">GOS-{selectedBooking.id}</h4>
                  <p className="text-sm text-cyan-100/70">
                    {selectedBooking.serviceType}
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {availableTechnicians.length ? (
                    availableTechnicians.map((tech) => (
                      <label
                        key={tech.id}
                        className={`block cursor-pointer rounded-2xl border p-4 ${
                          String(selectedTechnicianId) === String(tech.id)
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "border-white/10 bg-[#071122]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="technician"
                          value={tech.id}
                          checked={String(selectedTechnicianId) === String(tech.id)}
                          onChange={(e) => setSelectedTechnicianId(e.target.value)}
                          className="hidden"
                        />

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-black">{tech.name}</h4>
                            <p className="text-sm text-cyan-100/45">{tech.email}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge>{tech.country || "Region N/A"}</Badge>
                              <Badge>{tech.city || "City N/A"}</Badge>
                              <Badge>{tech.availabilityStatus || "Status N/A"}</Badge>
                              <Badge>{tech.specialization || "General IT"}</Badge>
                            </div>
                          </div>

                          {String(selectedTechnicianId) === String(tech.id) && (
                            <CheckCircle2 className="h-6 w-6 text-cyan-300" />
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <EmptyState title="No available technicians" text="Technicians with AVAILABLE status will appear here." />
                  )}
                </div>

                <button
                  onClick={assignTechnician}
                  className="mt-6 w-full rounded-2xl bg-cyan-400 py-4 font-black text-black hover:bg-cyan-300"
                >
                  Assign Technician
                </button>
              </>
            )}
          </div>
        </div>
      </Panel>
    )
  }

  const CustomersSection = () => (
    <Panel title="Customers" subtitle="Customer records from bookings">
      <div className="space-y-4">
        {filteredBookings.length ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-3xl border border-white/10 bg-[#0b1628] p-5"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-black">{booking.customerName}</h3>
                  <p className="mt-1 text-sm text-cyan-100/45">
                    {booking.customerEmail}
                  </p>
                  <p className="mt-1 text-sm text-cyan-100/45">
                    {booking.customerPhone}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{getLocation(booking)}</Badge>
                    <Badge>{booking.serviceType}</Badge>
                    <Badge>{booking.paymentStatus}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:flex">
                  <a
                    href={booking.customerPhone ? `tel:${booking.customerPhone}` : undefined}
                    className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-center text-sm font-bold text-cyan-300"
                  >
                    Call
                  </a>
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No customers" text="Customer records will appear from bookings." />
        )}
      </div>
    </Panel>
  )

  const RemoteSessionsSection = () => {
    const remoteBookings = bookings.filter((booking) => booking.remoteSessionRequired)

    return (
      <Panel title="Remote Sessions" subtitle="Remote bookings from backend">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {remoteBookings.length ? (
            remoteBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border border-white/10 bg-[#0b1628] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">{booking.customerName}</h3>
                    <p className="mt-1 text-sm text-cyan-100/45">
                      {booking.serviceType}
                    </p>
                  </div>
                  <StatusBadge status={booking.bookingStatus} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniInfo label="Technician" value={booking.technicianName || "Not assigned"} />
                  <MiniInfo label="Payment" value={booking.paymentStatus || "N/A"} />
                  <MiniInfo label="Schedule" value={`${booking.bookingDate || "N/A"} • ${booking.timeSlot || "N/A"}`} />
                  <MiniInfo label="Mode" value={getMode(booking)} />
                </div>

                <button
                  onClick={() =>
                    navigate("/remote-session", {
                      state: { booking },
                    })
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-4 font-black text-black"
                >
                  Monitor Session
                  <Video className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <EmptyState title="No remote sessions" text="Remote session bookings will appear here." />
          )}
        </div>
      </Panel>
    )
  }

  const ReportsSection = () => {
    const completed = bookings.filter(
      (booking) => booking.bookingStatus === "SERVICE_COMPLETED"
    ).length

    const paid = bookings.filter(
      (booking) =>
        booking.paymentStatus === "PAID" ||
        booking.paymentStatus === "PARTIALLY_PAID"
    ).length

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.paidAmount || 0),
      0
    )

    const averageValue = bookings.length ? totalRevenue / bookings.length : 0

    return (
      <Panel title="Agent Reports" subtitle="Calculated from backend bookings">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReportCard title="Completed" value={completed} />
          <ReportCard title="Paid Bookings" value={paid} />
          <ReportCard title="Total Revenue" value={`£/$${totalRevenue.toFixed(2)}`} />
          <ReportCard title="Avg Booking" value={`£/$${averageValue.toFixed(2)}`} />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0b1628] p-6">
          <h3 className="font-black text-cyan-100">Booking Status Split</h3>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.entries(
              bookings.reduce((acc, booking) => {
                acc[booking.bookingStatus || "UNKNOWN"] =
                  (acc[booking.bookingStatus || "UNKNOWN"] || 0) + 1
                return acc
              }, {})
            ).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#071122] p-4"
              >
                <span className="text-sm text-cyan-100/70">
                  {statusLabel[status] || status}
                </span>
                <span className="font-black text-cyan-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    )
  }

  const NotificationsSection = () => (
  <Panel
    title="Notifications"
    subtitle="Real-time agent notifications"
  >
    <div className="space-y-4">
      {notifications.length ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-5"
          >
            <Bell className="h-5 w-5 text-cyan-300" />

            <div className="flex-1">
              <h3 className="font-black">
                {notification.title}
              </h3>

              <p className="mt-1 text-sm text-cyan-100/70">
                {notification.message}
              </p>

              <p className="mt-2 text-xs text-cyan-100/40">
                {notification.createdAt
                  ? new Date(
                      notification.createdAt
                    ).toLocaleString()
                  : ""}
              </p>
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          title="No notifications"
          text="Agent notifications will appear here."
        />
      )}
    </div>
  </Panel>
)

  const SettingsSection = () => (
    <Panel title="Settings" subtitle="Agent account and workspace">
      <div className="space-y-4">
        <Info label="Agent Name" value={agentName} />
        <Info label="Role" value={agentRole || "AGENT"} />
        <Info label="Regions" value="US / UK" />
        <Info label="Connected APIs" value="Bookings, Technicians, Agents" />

        <button
          onClick={() => {
          logoutCustomer()
          navigate("/agent-login")
}}
          className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-4 font-black text-red-300"
        >
          Logout
        </button>
      </div>
    </Panel>
  )

  const renderContent = () => {
    if (activeTab === "Live Bookings") return <LiveBookingsSection />
    if (activeTab === "Assign Technician") return <AssignTechnicianSection />
    if (activeTab === "Customers") return <CustomersSection />
    if (activeTab === "Remote Sessions") return <RemoteSessionsSection />
    if (activeTab === "Reports") return <ReportsSection />
    if (activeTab === "Notifications") return <NotificationsSection />
    if (activeTab === "Settings") return <SettingsSection />
    return <DashboardSection />
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center overflow-x-hidden bg-[#020817] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-4 font-bold text-cyan-300">
            Loading Agent Dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#020817] text-white">
      {popup && (
        <div className="fixed bottom-24 right-4 z-[80] rounded-2xl border border-cyan-500/20 bg-[#071122] px-5 py-4 shadow-2xl md:bottom-6 md:right-6">
          <p className="text-sm font-semibold text-cyan-100">{popup}</p>
        </div>
      )}

      <aside className="hidden h-screen w-[310px] shrink-0 flex-col border-r border-cyan-500/20 bg-[#071122] p-6 lg:flex">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-cyan-300">GOS</h1>
          <p className="mt-2 text-sm text-cyan-100/45">
            Agent Operations Center
          </p>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.title}
                onClick={() => openTab(item.title)}
                className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 ${
                  activeTab === item.title
                    ? "bg-cyan-400 font-black text-black"
                    : "border border-white/5 bg-[#0b1628] text-cyan-100/70"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.title}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => {
            logoutCustomer()
            navigate("/agent-login")
          }}
          className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {mobileMenu && (
        <div className="fixed inset-0 z-[90] overflow-y-auto overflow-x-hidden bg-[#020817]/95 p-5 backdrop-blur-xl lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-cyan-300">GOS</h1>
              <p className="text-sm text-cyan-100/45">Agent Menu</p>
            </div>

            <button
              onClick={() => setMobileMenu(false)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#071122]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.title}
                  onClick={() => openTab(item.title)}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 ${
                    activeTab === item.title
                      ? "bg-cyan-400 font-black text-black"
                      : "border border-white/5 bg-[#0b1628] text-cyan-100/70"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <main className="h-screen min-w-0 flex-1 overflow-hidden pb-20 lg:pb-0">
        <header className="flex h-[82px] items-center justify-between border-b border-cyan-500/10 bg-[#071122]/95 px-4 md:h-[90px] md:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black md:text-2xl">
              {activeTab}
            </h1>
            <p className="mt-1 truncate text-xs text-cyan-100/40 md:text-sm">
              Backend-connected dispatch operations
            </p>
          </div>

          <div className="hidden w-full max-w-[380px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-5 py-3 md:flex">
  <Search className="h-5 w-5 text-cyan-100/40" />
  <input
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search booking, customer, technician..."
    className="w-full bg-transparent outline-none placeholder:text-cyan-100/30"
  />
</div>

          <button
            onClick={() => setMobileMenu(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] lg:hidden"
          >
            <Menu className="h-5 w-5 text-cyan-300" />
          </button>
        </header>

        <div
          id="agent-main-content"
          className="h-[calc(100vh-82px)] overflow-y-auto overflow-x-hidden p-4 pb-28 md:h-[calc(100vh-90px)] md:p-6 lg:pb-6"
        >
          {renderContent()}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-cyan-500/20 bg-[#071122]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileTabs.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.title

            return (
              <button
                key={item.title}
                onClick={() => openTab(item.title)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 ${
                  active
                    ? "bg-cyan-400 font-black text-black"
                    : "text-cyan-100/45"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-none">
                  {item.title === "Live Bookings"
                    ? "Bookings"
                    : item.title === "Assign Technician"
                      ? "Assign"
                      : item.title}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {selectedBooking && activeTab !== "Assign Technician" && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAssign={() => openTab("Assign Technician")}
          onStatus={updateBookingStatus}
        />
      )}
    </div>
  )
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-black md:text-2xl">{title}</h2>
        <p className="mt-2 text-sm text-cyan-100/45">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-cyan-500/10 bg-[#071122] p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-cyan-100/45 md:text-sm">{title}</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">{value}</h2>
        </div>
        <Icon className="h-7 w-7 shrink-0 text-cyan-300 md:h-8 md:w-8" />
      </div>
    </div>
  )
}

function BookingCard({ booking, onView, onAssign, onStatus }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-4 md:p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black">GOS-{booking.id}</h3>
            <StatusBadge status={booking.bookingStatus} />
          </div>

          <p className="mt-2 text-cyan-100/70">{booking.customerName}</p>
          <p className="mt-1 text-sm text-cyan-100/45">
            {booking.serviceType}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{getLocation(booking)}</Badge>
            <Badge>{booking.paymentStatus || "PAYMENT N/A"}</Badge>
            <Badge>{getMode(booking)}</Badge>
            <Badge>{booking.technicianName || "Unassigned"}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:flex">
          <button
            onClick={onView}
            className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-300"
          >
            View
          </button>

          {isUnassigned(booking) && (
            <button
              onClick={onAssign}
              className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-black"
            >
              Assign
            </button>
          )}

          {booking.bookingStatus === "TECHNICIAN_ASSIGNED" && (
            <button
              onClick={() => onStatus(booking.id, "TECHNICIAN_ON_THE_WAY")}
              className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-black"
            >
              On Way
            </button>
          )}

          {booking.bookingStatus === "TECHNICIAN_ON_THE_WAY" && (
            <button
              onClick={() => onStatus(booking.id, "SERVICE_STARTED")}
              className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-black"
            >
              Start
            </button>
          )}

          {booking.bookingStatus === "SERVICE_STARTED" && (
            <button
              onClick={() => onStatus(booking.id, "SERVICE_COMPLETED")}
              className="rounded-xl bg-green-400 px-4 py-3 text-sm font-black text-black"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingDetailsModal({ booking, onClose, onAssign, onStatus }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto overflow-x-hidden rounded-[32px] border border-cyan-500/20 bg-[#071122] p-5 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">
              GOS-{booking.id}
            </h2>
            <p className="mt-2 text-cyan-100/45">{booking.serviceType}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Customer" value={booking.customerName} />
          <Info label="Email" value={booking.customerEmail} />
          <Info label="Phone" value={booking.customerPhone} />
          <Info label="Location" value={getLocation(booking)} />
          <Info label="Issue" value={booking.issueDescription} />
          <Info label="Payment" value={booking.paymentStatus || "N/A"} />
          <Info label="Status" value={booking.bookingStatus || "N/A"} />
          <Info label="Technician" value={booking.technicianName || "Unassigned"} />
          <Info label="Total" value={formatMoney(booking, booking.totalAmount)} />
          <Info label="Paid" value={formatMoney(booking, booking.paidAmount)} />
          <Info label="Schedule" value={`${booking.bookingDate || "N/A"} • ${booking.timeSlot || "N/A"}`} />
          <Info label="Remote" value={booking.remoteSessionRequired ? "Yes" : "No"} />
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {isUnassigned(booking) && (
            <button
              onClick={onAssign}
              className="rounded-2xl bg-cyan-400 py-4 font-black text-black"
            >
              Assign Technician
            </button>
          )}

          {booking.bookingStatus === "TECHNICIAN_ASSIGNED" && (
            <button
              onClick={() => onStatus(booking.id, "TECHNICIAN_ON_THE_WAY")}
              className="rounded-2xl bg-cyan-400 py-4 font-black text-black"
            >
              Mark On Way
            </button>
          )}

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-[#0b1628] py-4 font-bold text-cyan-100/70"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
      <p className="text-sm text-cyan-100/45">{title}</p>
      <h3 className="mt-3 text-3xl font-black text-cyan-300">{value}</h3>
    </div>
  )
}

function SummaryLine({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4">
      <CheckCircle2 className="h-5 w-5 text-cyan-300" />
      <span className="text-sm text-cyan-100/70">{text}</span>
    </div>
  )
}

function EmptyState({ title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-8 text-center">
      <BriefcaseBusiness className="mx-auto h-10 w-10 text-cyan-300/50" />
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-cyan-100/45">{text}</p>
    </div>
  )
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071122] px-4 py-3">
      <p className="text-xs text-cyan-100/35">{label}</p>
      <p className="mt-1 text-sm font-bold text-cyan-100/80">{value}</p>
    </div>
  )
}

function Badge({ children }) {
  return (
    <span className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
      {children}
    </span>
  )
}

function StatusBadge({ status }) {
  const cls =
    status === "SERVICE_COMPLETED" || status === "PAYMENT_COMPLETED"
      ? "border-green-500/20 bg-green-500/10 text-green-300"
      : status === "PENDING" || status === "ASSIGNMENT_PENDING"
        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
        : status === "CANCELLED"
          ? "border-red-500/20 bg-red-500/10 text-red-300"
          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"

  return (
    <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${cls}`}>
      {statusLabel[status] || status || "UNKNOWN"}
    </span>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1628] p-4">
      <p className="text-xs text-cyan-100/35">{label}</p>
      <p className="mt-1 break-words font-bold text-cyan-100/85">
        {value || "N/A"}
      </p>
    </div>
  )
}