import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/geekonsites-logo.png"
import { getAllBookings } from "../services/bookingService"
import { getAllTechnicians } from "../services/technicianService"
import {
  getAllAgents,
  getAgentNotifications,
  getAgentProfile,
  getAgentDashboardSummary,
  getAgentBookingQueue,
} from "../services/agentService"
import { markAllNotificationsAsRead, markNotificationAsRead } from "../services/notificationService"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import { apiRequest } from "../services/api"
import { formatLocalDateTime } from "../utils/dateTime"
import { safeNotificationPath } from "../utils/notificationRoute"
import { normalizeNotifications } from "../utils/notifications"
import { getAllContactMessages, updateContactMessageStatus } from "../services/contactService"
import RevenueChart from "../components/agent/RevenueChart"
import BookingChart from "../components/agent/BookingChart"
import StatusToast from "../components/ui/StatusToast"
import DashboardLoader from "../components/ui/DashboardLoader"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Download,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Monitor,
  MapPin,
  Phone,
  Repeat,
  RefreshCw,
  Search,
  Settings,
  ContactRound,
  User,
  Users,
  Video,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from "lucide-react"
import AgentCrm from "../components/agent/AgentCrm"

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

// Mirrors the backend compatibility check in BookingService.assignTechnician
// so the UI never offers a technician the API would reject for the
// booking's service mode (REMOTE/ONSITE/HYBRID). A technician with no mode
// set (or "REMOTE_AND_ONSITE") is treated as approved for both.
const isTechnicianEligibleForBookingMode = (technician, booking) => {
  const bookingMode = getMode(booking)
  const technicianMode = (technician.serviceMode || "REMOTE_AND_ONSITE").toUpperCase()
  if (bookingMode === "REMOTE") return technicianMode !== "ONSITE_ONLY"
  if (bookingMode === "ONSITE") return technicianMode !== "REMOTE_ONLY"
  if (bookingMode === "HYBRID") return technicianMode === "REMOTE_AND_ONSITE"
  return true
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

  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(window.location.search).get("view") === "notifications" ? "Notifications" : "Dashboard")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [popup, setPopup] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("")
  const [bookings, setBookings] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [agents, setAgents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [agentProfile, setAgentProfile] = useState(null)
  const [supportMessages, setSupportMessages] = useState([])
  const [operationsSummary, setOperationsSummary] = useState(null)
  const [bookingQueue, setBookingQueue] = useState([])
  const [notificationsMuted, setNotificationsMuted] = useState(localStorage.getItem("gos_agent_notifications_muted") === "true")
  const [notificationRefreshing, setNotificationRefreshing] = useState(false)
  const knownNotificationIds = useRef(new Set())
  const popupTimer = useRef(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
const [statusFilter, setStatusFilter] = useState("ALL")
const [modeFilter, setModeFilter] = useState("ALL")
 
  const { user, logoutCustomer, updateCustomerProfile } = useCustomerAuth()

  const agentName = agentProfile?.name || user?.fullName || "Agent"
  const agentRole = user?.role || "AGENT"

  useEffect(() => {
    const token = localStorage.getItem("gos_token")

    if (!token) {
      navigate("/agent-login")
      return
    }

    loadDashboard()
  }, [navigate])

  useEffect(() => {
    const refresh = () => loadAgentNotifications(true)
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh()
    }, 30000)
    window.addEventListener("gos:push-received", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("gos:push-received", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [notificationsMuted])

  useEffect(() => {
    if (!["Assign Technician", "Technicians"].includes(activeTab)) return
    let active = true
    getAllTechnicians()
      .then((data) => { if (active) setTechnicians(Array.isArray(data) ? data : []) })
      .catch((error) => console.error("Technician availability could not be refreshed", error))
    return () => { active = false }
  }, [activeTab])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      const results = await Promise.allSettled([
        getAllBookings(),
        getAllTechnicians(),
        getAllAgents(),
        getAgentNotifications(),
        getAgentProfile(),
        getAllContactMessages(),
        getAgentDashboardSummary(),
        getAgentBookingQueue(0, 25),
      ])
      const value = (index, fallback) => results[index].status === "fulfilled" ? results[index].value : fallback
      const bookingData = value(0, [])
      const technicianData = value(1, [])
      const agentData = value(2, [])
      const notificationData = value(3, [])
      const profileData = value(4, null)
      const supportData = value(5, [])
      const summaryData = value(6, null)
      const queueData = value(7, { content: [] })

      setBookings(Array.isArray(bookingData) ? bookingData : [])
      setTechnicians(Array.isArray(technicianData) ? technicianData : [])
      setAgents(Array.isArray(agentData) ? agentData : [])
      const normalizedNotifications = normalizeNotifications(notificationData)
      setNotifications(normalizedNotifications)
      knownNotificationIds.current = new Set(normalizedNotifications.map((item) => String(item.id)))
      setAgentProfile(profileData)
      setSupportMessages(Array.isArray(supportData) ? supportData : [])
      setOperationsSummary(summaryData)
      setBookingQueue(Array.isArray(queueData?.content) ? queueData.content : [])
      if (profileData) {
        updateCustomerProfile({
          ...user,
          id: user?.id,
          fullName: profileData.name,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          country: profileData.country,
          city: profileData.city,
          status: profileData.status,
          role: "AGENT",
        })
      }
      const failures = results.filter((result) => result.status === "rejected")
      failures.forEach((result) => console.error("Agent dashboard API error:", result.reason))
      if (failures.length) showPopup(`${8 - failures.length} of 8 dashboard feeds loaded`)
    } catch (error) {
      console.error("Agent dashboard load error:", error)
      showPopup("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const loadAgentNotifications = async (quiet = false) => {
    try {
      if (quiet) setNotificationRefreshing(true)
      const data = await getAgentNotifications()
      setNotifications((previous) => {
        const items = normalizeNotifications(data, previous)
        const newItems = knownNotificationIds.current.size ? items.filter((item) => !knownNotificationIds.current.has(String(item.id))) : []
        knownNotificationIds.current = new Set(items.map((item) => String(item.id)))
        if (newItems.length && !notificationsMuted) {
          showPopup(newItems[0].title || "New agent notification")
          navigator.vibrate?.([100, 60, 100])
        }
        return items
      })
    } catch (error) {
      if (!quiet) showPopup(error.message || "Notifications could not be loaded")
    } finally {
      setNotificationRefreshing(false)
    }
  }

  const openAgentNotification = async (notification) => {
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, isRead: true } : item))
    if (!notification.isRead) {
      try { await markNotificationAsRead(notification.id) } catch { loadAgentNotifications(true) }
    }
    navigate(safeNotificationPath(notification.actionUrl, "AGENT"))
  }

  const markAllAgentNotificationsRead = async () => {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    try { await markAllNotificationsAsRead() } catch { loadAgentNotifications(true) }
  }

  const toggleAgentNotifications = () => {
    const next = !notificationsMuted
    setNotificationsMuted(next)
    localStorage.setItem("gos_agent_notifications_muted", String(next))
  }

  const assignTechnician = async () => {
    if (!selectedBooking?.id || !selectedTechnicianId) {
      showPopup("Select booking and technician")
      return
    }

    const wasAssigned = !isUnassigned(selectedBooking)

    try {
      const updatedBooking = await apiRequest(
        `/api/bookings/${selectedBooking.id}/assign-technician/${selectedTechnicianId}`,
        { method: "PUT" }
      )

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      )

      setSelectedBooking(null)
      setSelectedTechnicianId("")
      showPopup(wasAssigned ? "Technician reassigned successfully" : "Technician assigned successfully")
    } catch (error) {
      console.error(error)
      showPopup(error.message || "Assignment failed")
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const updatedBooking = await apiRequest(
        `/api/bookings/${bookingId}/status/${encodeURIComponent(status)}`,
        { method: "PUT" }
      )

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      )

      showPopup(`Booking updated to ${statusLabel[status] || status}`)
    } catch (error) {
      console.error(error)
      showPopup(error.message || "Status update failed")
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

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  )

  const exportBookingsCsv = (rows) => {
    if (!rows.length) {
      showPopup("No bookings to export")
      return
    }

    const columns = ["id", "customerName", "customerEmail", "customerPhone", "serviceType", "bookingStatus", "paymentStatus", "technicianName", "bookingDate", "timeSlot", "country", "totalAmount", "paidAmount"]
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`
    const csv = [
      columns.join(","),
      ...rows.map((booking) => columns.map((column) => escape(booking[column])).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `gos-bookings-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    showPopup(`Exported ${rows.length} booking${rows.length === 1 ? "" : "s"}`)
  }

  const navItems = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Live Bookings", icon: BriefcaseBusiness },
    { title: "Assign Technician", icon: Wrench },
    { title: "Technicians", icon: Users },
    { title: "Customers", icon: Users },
    { title: "CRM", icon: ContactRound },
    { title: "Support", icon: Activity },
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

  const showPopup = useCallback((text) => {
    setPopup(text)
    if (popupTimer.current) window.clearTimeout(popupTimer.current)
    popupTimer.current = window.setTimeout(() => setPopup(""), 4500)
  }, [])

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
              <MiniInfo label="Pending" value={metrics.pending} />
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

  const OperationsDashboardSection = () => {
    const top = operationsSummary?.topMetrics || {}
    const system = operationsSummary?.systemSummary || {}
    const today = operationsSummary?.today || {}
    const yesterday = operationsSummary?.yesterday || {}
    const rows = [["Agents", system.agents], ["Customers", system.customers], ["Bookings", system.bookings], ["Technicians", system.technicians], ["Remote Sessions", system.remoteSessions], ["Support Requests", system.supportRequests]]
    const queue = bookingQueue.filter((booking) => {
      const keyword = searchTerm.trim().toLowerCase()
      return (statusFilter === "ALL" || booking.bookingStatus === statusFilter) && (modeFilter === "ALL" || getMode(booking) === modeFilter) && (!keyword || [booking.id, booking.customerName, booking.serviceType, booking.technicianName, booking.city, booking.country].some((value) => String(value || "").toLowerCase().includes(keyword)))
    })
    return <div className="space-y-4 text-slate-900">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <OperationsKpi title="Total Agents" value={top.totalAgents ?? agents.length} icon={Users} />
        <OperationsKpi title="Agents With Active Jobs" value={top.agentsWithActiveJobs ?? 0} icon={User} />
        <OperationsKpi title="Active Jobs" value={top.activeJobs ?? 0} icon={Activity} />
        <OperationsKpi title="Needs Attention" value={top.needsAttention ?? 0} icon={Clock3} alert />
      </div>
      <CompactSection title="System Summary"><div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-xs"><thead><tr className="bg-slate-100 text-left uppercase tracking-wider text-slate-600"><th className="px-3 py-2">Records</th><th className="px-3 py-2 text-right">Active</th><th className="px-3 py-2 text-right">Pending</th><th className="px-3 py-2 text-right">Total</th></tr></thead><tbody>{rows.map(([label, row]) => <tr key={label} className="border-t border-slate-200"><th className="px-3 py-2 text-left font-bold text-slate-700">{label}</th><td className="px-3 py-2 text-right font-black text-emerald-700">{row?.active ?? "—"}</td><td className="px-3 py-2 text-right font-black text-amber-700">{row?.pending ?? "—"}</td><td className="px-3 py-2 text-right font-black text-[#071d3d]">{row?.total ?? 0}</td></tr>)}</tbody></table></div></CompactSection>
      <div className="grid gap-4 xl:grid-cols-2"><PeriodStrip title="Total Stats for Today" data={today} timezone={operationsSummary?.timezone} /><PeriodStrip title="Total Stats for Yesterday" data={yesterday} timezone={operationsSummary?.timezone} /></div>
      <CompactSection title="Live Booking Queue" action={<button type="button" onClick={() => openTab("Live Bookings")} className="rounded px-2 py-1 text-xs font-black text-white hover:bg-white/10">View all</button>}>
        <div className="mb-3 flex flex-wrap gap-2"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded border border-slate-300 bg-white px-2 text-xs"><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="ASSIGNMENT_PENDING">Assignment pending</option><option value="TECHNICIAN_ASSIGNED">Assigned</option><option value="SERVICE_COMPLETED">Completed</option></select><select value={modeFilter} onChange={(event) => setModeFilter(event.target.value)} className="h-9 rounded border border-slate-300 bg-white px-2 text-xs"><option value="ALL">All modes</option><option value="ONSITE">Onsite</option><option value="REMOTE">Remote</option></select></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-xs"><thead><tr className="bg-slate-100 text-left uppercase text-slate-600"><th className="p-2">Booking</th><th className="p-2">Created</th><th className="p-2">Customer</th><th className="p-2">Location</th><th className="p-2">Service</th><th className="p-2">Mode</th><th className="p-2">Technician</th><th className="min-w-[142px] p-2">Status</th><th className="p-2">Actions</th></tr></thead><tbody>{queue.slice(0, 8).map((booking) => <tr key={booking.id} className="border-t border-slate-200"><td className="p-2 font-black">GOS-{booking.id}</td><td className="whitespace-nowrap p-2">{booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "—"}</td><td className="p-2 font-semibold">{booking.customerName || "Customer"}</td><td className="p-2">{[booking.city, booking.country].filter(Boolean).join(", ") || "—"}</td><td className="p-2">{booking.serviceType || "—"}</td><td className="p-2">{getMode(booking)}</td><td className="p-2">{booking.technicianName || "Unassigned"}</td><td className="min-w-[142px] whitespace-nowrap p-2"><StatusBadge status={booking.bookingStatus} /></td><td className="p-2"><div className="flex gap-2"><button type="button" onClick={() => setSelectedBooking(bookings.find((item) => item.id === booking.id) || booking)} className="font-bold text-cyan-700">View</button><button type="button" onClick={() => { setSelectedBooking(bookings.find((item) => item.id === booking.id) || booking); openTab("Assign Technician") }} className="font-bold text-[#071d3d]">Assign</button></div></td></tr>)}</tbody></table>{!queue.length && <p className="p-6 text-center text-sm text-slate-500">No matching bookings.</p>}</div>
      </CompactSection>
    </div>
  }

  const LiveBookingsSection = () => (
    <Panel
      title="Live Booking Queue"
      subtitle="Manage all backend bookings"
      actions={
        <button
          onClick={() => exportBookingsCsv(filteredBookings)}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      }
    >
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
    const availableCount = technicians.filter((tech) => tech.availabilityStatus === "AVAILABLE").length
    const isReassigning = Boolean(selectedBooking) && !isUnassigned(selectedBooking)
    // Only technicians approved for the selected booking's service mode are
    // shown, so the list can never offer one the backend would reject.
    const technicianKeyword = searchTerm.trim().toLowerCase()
    const eligibleTechnicians = selectedBooking
      ? technicians.filter((tech) => isTechnicianEligibleForBookingMode(tech, selectedBooking) && (!technicianKeyword || [tech.name, tech.email, tech.phone, tech.city, tech.country, tech.specialization, tech.availabilityStatus].some((value) => String(value || "").toLowerCase().includes(technicianKeyword))))
      : []

    return (
      <Panel title="Assign Technician" subtitle="Assign or reassign technicians for backend bookings">
        {isReassigning && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">Reassigning GOS-{selectedBooking.id}</p>
              <p className="mt-1 text-sm text-cyan-100/70">
                Currently with {selectedBooking.technicianName || "an assigned technician"}. Pick a new technician below.
              </p>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="rounded-xl border border-white/10 bg-[#0b1628] px-4 py-2 text-xs font-bold text-cyan-100/60"
            >
              Cancel
            </button>
          </div>
        )}
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
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-[10px] font-black uppercase tracking-wide text-cyan-100/40">Customer</p><p className="mt-1 font-bold text-cyan-100/80">{booking.customerName || "Customer"}</p></div><div><p className="text-[10px] font-black uppercase tracking-wide text-cyan-100/40">Technician</p><p className="mt-1 font-bold text-cyan-100/80">{booking.technicianName || "Unassigned"}</p></div><div><p className="text-[10px] font-black uppercase tracking-wide text-cyan-100/40">Service</p><p className="mt-1 text-cyan-100/70">{booking.serviceType || "Selected service"}</p></div><div><p className="text-[10px] font-black uppercase tracking-wide text-cyan-100/40">Mode</p><p className="mt-1 text-cyan-100/70">{getMode(booking)}</p></div></div>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-black">Technicians</h3>
              <span className="text-xs font-bold text-cyan-100/45">{availableCount} of {technicians.length} available</span>
            </div>

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
                  {eligibleTechnicians.length ? (
                    eligibleTechnicians.map((tech) => {
                      const available = tech.availabilityStatus === "AVAILABLE"
                      const selected = String(selectedTechnicianId) === String(tech.id)

                      return (
                        <label
                          key={tech.id}
                          className={`block rounded-2xl border p-4 ${
                            !available
                              ? "cursor-not-allowed border-white/10 bg-[#0b1628]"
                              : selected
                                ? "cursor-pointer border-cyan-400 bg-cyan-500/10"
                                : "cursor-pointer border-white/10 bg-[#071122]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="technician"
                            value={tech.id}
                            checked={selected}
                            disabled={!available}
                            onChange={(e) => setSelectedTechnicianId(e.target.value)}
                            className="hidden"
                          />

                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className={`font-black ${!available ? "text-cyan-100/60" : ""}`}>{tech.name}</h4>
                              <p className="text-sm text-cyan-100/45">{tech.email}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{tech.country || "Region N/A"}</Badge>
                                <Badge>{tech.city || "City N/A"}</Badge>
                                <span className={`rounded-xl border px-3 py-1 text-xs font-semibold ${available ? "border-green-500/20 bg-green-500/10 text-green-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}>
                                  {tech.availabilityStatus || "Status N/A"}
                                </span>
                                <Badge>{tech.specialization || "General IT"}</Badge>
                              </div>
                              {!available && (
                                <p className="mt-2 text-xs text-amber-300/80">Not selectable until this technician is marked available.</p>
                              )}
                            </div>

                            {selected && (
                              <CheckCircle2 className="h-6 w-6 text-cyan-300" />
                            )}
                          </div>
                        </label>
                      )
                    })
                  ) : technicians.length ? (
                    <EmptyState title="No technicians approved for this service mode" text={`No technician on file is approved for ${getMode(selectedBooking)} bookings.`} />
                  ) : (
                    <EmptyState title="No technicians on file" text="Approved technicians will appear here once they register." />
                  )}
                </div>

                <button
                  onClick={assignTechnician}
                  disabled={!selectedTechnicianId}
                  className="mt-6 w-full rounded-2xl bg-cyan-400 py-4 font-black text-black hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isReassigning ? "Reassign Technician" : "Assign Technician"}
                </button>
              </>
            )}
          </div>
        </div>
      </Panel>
    )
  }

  const TechniciansSection = () => {
    const keyword = searchTerm.trim().toLowerCase()
    const visibleTechnicians = technicians.filter((tech) => !keyword || [tech.name, tech.email, tech.phone, tech.city, tech.country, tech.specialization, tech.availabilityStatus, tech.serviceMode].some((value) => String(value || "").toLowerCase().includes(keyword)))
    return (
      <Panel title="Technician Directory" subtitle={`${technicians.length} registered technicians across GOS operations`}>
        <div className="mb-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-[#0b1628]">
          <MiniInfo label="Total" value={technicians.length} />
          <MiniInfo label="Available" value={technicians.filter((tech) => tech.availabilityStatus === "AVAILABLE").length} />
          <MiniInfo label="Verified" value={technicians.filter((tech) => tech.verificationStatus === "APPROVED").length} />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleTechnicians.length ? visibleTechnicians.map((tech) => {
            const available = tech.availabilityStatus === "AVAILABLE"
            return <article key={tech.id} className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-lg font-black text-cyan-300">{String(tech.name || "T").charAt(0).toUpperCase()}</div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="truncate text-lg font-black">{tech.name || "Technician"}</h3><span className={`rounded-full border px-3 py-1 text-[10px] font-black ${available ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : tech.availabilityStatus === "BUSY" ? "border-amber-400/25 bg-amber-400/10 text-amber-300" : "border-slate-400/20 bg-slate-400/10 text-slate-300"}`}>{tech.availabilityStatus || "OFFLINE"}</span></div><p className="mt-1 truncate text-sm font-semibold text-cyan-100/55">{tech.specialization || "General IT Support"}</p></div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2"><MiniInfo label="Service mode" value={tech.serviceMode || "Not set"} /><MiniInfo label="Experience" value={`${tech.experienceYears || 0} years`} /><MiniInfo label="Verification" value={tech.verificationStatus || "Pending"} /><MiniInfo label="Rating" value={tech.rating ? `${tech.rating} / 5` : "New"} /></div>
              <div className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2"><a href={tech.phone ? `tel:${tech.phone}` : undefined} className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 text-xs font-black text-cyan-200"><Phone size={14} className="shrink-0" /><span className="min-w-0 break-all">{tech.phone || "No phone"}</span></a><a href={`mailto:${tech.email}`} className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-cyan-100/70"><Mail size={14} className="shrink-0" /><span className="min-w-0 break-all">{tech.email}</span></a></div>
              <p className="mt-3 flex min-w-0 items-start gap-2 text-xs font-semibold text-cyan-100/45"><MapPin size={14} className="mt-0.5 shrink-0 text-cyan-300" /><span className="min-w-0 break-words">{[tech.city, tech.country].filter(Boolean).join(", ") || "Location not set"}</span></p>
            </article>
          }) : <EmptyState title="No technicians found" text="No technician matches the current search." />}
        </div>
      </Panel>
    )
  }

  const updateSupportStatus = async (messageId, status) => {
    try {
      const updated = await updateContactMessageStatus(messageId, status)
      setSupportMessages((items) => items.map((item) => item.id === messageId ? updated : item))
      showPopup(`Support case marked ${status.toLowerCase()}`)
    } catch (error) { showPopup(error.message || "Support case could not be updated") }
  }

  const SupportSection = () => (
    <Panel title="Support Cases" subtitle={`${supportMessages.filter((item) => item.status !== "RESOLVED").length} open customer enquiries`}>
      <div className="space-y-4">{supportMessages.length ? supportMessages.map((message) => <article key={message.id} className="rounded-3xl border border-white/10 bg-[#0b1628] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Case GOS-S-{message.id}</p><h3 className="mt-2 text-lg font-black">{message.subject}</h3><p className="mt-1 text-sm font-semibold text-cyan-100/55">{message.fullName} · {message.email}</p></div><StatusBadge status={message.status} /></div><p className="mt-4 rounded-2xl border border-white/10 bg-[#071122] p-4 text-sm leading-6 text-cyan-100/70">{message.message}</p><div className="mt-4 flex flex-wrap gap-2"><a href={`mailto:${message.email}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 text-xs font-black text-cyan-200"><Mail size={14} />Reply</a><button onClick={() => updateSupportStatus(message.id, "IN_PROGRESS")} className="min-h-10 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 text-xs font-black text-amber-200">In progress</button><button onClick={() => updateSupportStatus(message.id, "RESOLVED")} className="min-h-10 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 text-xs font-black text-emerald-200">Resolve</button></div></article>) : <EmptyState title="No support cases" text="Customer contact messages will appear here." />}</div>
    </Panel>
  )

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
      <Panel
        title="Agent Reports"
        subtitle="Calculated from backend bookings"
        actions={
          <button
            onClick={() => exportBookingsCsv(bookings)}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-300"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReportCard title="Completed" value={completed} />
          <ReportCard title="Paid Bookings" value={paid} />
          <ReportCard title="Total Revenue" value={`£/$${totalRevenue.toFixed(2)}`} />
          <ReportCard title="Avg Booking" value={`£/$${averageValue.toFixed(2)}`} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RevenueChart bookings={bookings} />
          <BookingChart bookings={bookings} />
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

  const OperationsReportsSection = () => {
    const lifecycle = operationsSummary?.bookingLifecycle || {}
    return <Panel title="Operations Reports" subtitle="Real booking lifecycle and service-mode totals">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><ReportCard title="Completed" value={lifecycle.SERVICE_COMPLETED || 0} /><ReportCard title="Pending" value={(lifecycle.PENDING || 0) + (lifecycle.ASSIGNMENT_PENDING || 0)} /><ReportCard title="Onsite" value={operationsSummary?.onsite?.total || 0} /><ReportCard title="Remote" value={operationsSummary?.remote?.total || 0} /></div>
      <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">{Object.entries(lifecycle).filter(([, value]) => value > 0).map(([status, count]) => <div key={status} className="flex items-center justify-between rounded border border-white/10 bg-[#0b1628] p-3 text-xs"><span>{statusLabel[status] || status}</span><strong className="text-cyan-300">{count}</strong></div>)}</div>
    </Panel>
  }

  const NotificationsSection = () => (
  <Panel
    title="Notifications"
    subtitle={unreadCount > 0 ? `${unreadCount} unread of ${notifications.length} total` : `${notifications.length} total`}
  >
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0b1628] p-3">
      <button type="button" onClick={toggleAgentNotifications} className="flex min-h-10 items-center gap-2 rounded-md px-2 text-xs font-black">
        {notificationsMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-cyan-300" />}
        {notificationsMuted ? "Live alerts muted" : "Live alerts on"}
      </button>
      <div className="flex gap-2">
        <button type="button" onClick={() => loadAgentNotifications(true)} disabled={notificationRefreshing} className="flex min-h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${notificationRefreshing ? "animate-spin" : ""}`} />Refresh</button>
        <button type="button" onClick={markAllAgentNotificationsRead} disabled={!unreadCount} className="min-h-10 rounded-md bg-cyan-400 px-3 text-xs font-black text-black disabled:opacity-40">Mark all read</button>
      </div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628]">
      {notifications.length ? (
        notifications.map((notification) => (
          <button
            type="button"
            onClick={() => openAgentNotification(notification)}
            key={notification.id}
            className={`flex w-full gap-4 border-b border-white/10 p-4 text-left transition last:border-b-0 hover:bg-white/[0.03] ${
              notification.isRead
                ? "bg-transparent"
                : "bg-cyan-500/[0.06]"
            }`}
          >
            <div className="relative shrink-0">
              <Bell className="h-5 w-5 text-cyan-300" />
              {!notification.isRead && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-black">
                {notification.title}
              </h3>

              <p className="mt-1 text-sm text-cyan-100/70">
                {notification.message}
              </p>

              <p className="mt-2 text-xs text-cyan-100/40">
                {notification.createdAt ? formatLocalDateTime(
                  notification.createdAt,
                  bookings.find((booking) => String(booking.id) === String(notification.bookingId)) || notification
                ) : ""}
              </p>
            </div>
          </button>
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
        <Info label="Company Email" value={agentProfile?.email || user?.email || "Not available"} />
        <Info label="Phone" value={agentProfile?.phone || user?.phone || "Not available"} />
        <Info label="Location" value={[agentProfile?.city, agentProfile?.country].filter(Boolean).join(", ") || "Not available"} />
        <Info label="Account Status" value={agentProfile?.status || "ACTIVE"} />
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
    void DashboardSection
    void ReportsSection
    if (activeTab === "CRM") return <AgentCrm notify={showPopup} onOpenBooking={(id) => { const booking = bookings.find((item) => item.id === id); if (booking) setSelectedBooking(booking) }} />
    if (activeTab === "Live Bookings") return <LiveBookingsSection />
    if (activeTab === "Assign Technician") return <AssignTechnicianSection />
    if (activeTab === "Technicians") return <TechniciansSection />
    if (activeTab === "Customers") return <CustomersSection />
    if (activeTab === "Support") return <SupportSection />
    if (activeTab === "Remote Sessions") return <RemoteSessionsSection />
    if (activeTab === "Reports") return <OperationsReportsSection />
    if (activeTab === "Notifications") return <NotificationsSection />
    if (activeTab === "Settings") return <SettingsSection />
    return <OperationsDashboardSection />
  }

  if (loading) {
    return (
      <DashboardLoader />
    )
  }

  return (
    <div className="gos-agent-portal flex h-dvh w-full overflow-hidden bg-slate-100 text-white">
      <StatusToast message={popup} />

      <aside className="hidden h-dvh w-[238px] shrink-0 flex-col border-r border-slate-700 bg-[#071d3d] lg:flex">
        <button
          onClick={() => navigate("/")}
          className="flex h-[76px] shrink-0 items-center border-b border-white/10 px-4 text-left"
          aria-label="Back to GeekOnSites home"
        >
          <img src={logo} alt="GeekOnSites Agent Center" className="h-auto w-[190px] max-w-full object-contain" />
        </button>

        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const showBadge = item.title === "Notifications" && unreadCount > 0

            return (
              <button
                key={item.title}
                onClick={() => openTab(item.title)}
                className={`flex min-h-10 w-full items-center gap-3 rounded px-3 py-2 text-xs ${
                  activeTab === item.title
                    ? "bg-cyan-400 font-black text-[#071d3d]"
                    : "font-semibold text-slate-200 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
                {showBadge && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => {
            logoutCustomer()
            navigate("/agent-login")
          }}
          className="m-2 flex min-h-10 items-center gap-3 rounded border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {mobileMenu && (
        <div className="agent-mobile-menu fixed inset-0 z-[90] overflow-y-auto overflow-x-hidden bg-[#edf2f5] pb-[max(1rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] text-gos-blue-deep lg:hidden">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gos-border bg-white px-4 py-3 shadow-sm">
            <button
              onClick={() => {
                setMobileMenu(false)
                navigate("/")
              }}
              className="flex items-center gap-3 text-left"
              aria-label="Back to GeekOnSites home"
            >
              <img src={logo} alt="GeekOnSites" className="h-auto w-36 shrink object-contain" />
              <span>
                <span className="block font-['Cormorant_Garamond'] text-xl font-bold leading-none text-gos-blue-deep">Geek<span className="text-gos-turquoise">On</span>Sites</span>
                <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.12em] text-gos-muted">Agent workspace</span>
              </span>
            </button>

            <button
              onClick={() => setMobileMenu(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gos-border bg-gos-off-white text-gos-blue"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 py-4">
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-gos-border bg-white p-3 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gos-blue-deep font-['Cormorant_Garamond'] text-xl font-bold text-white">{agentName.charAt(0).toUpperCase()}</div>
              <div className="min-w-0"><p className="truncate text-sm font-extrabold text-gos-blue-deep">{agentName}</p><p className="mt-0.5 truncate text-[10px] font-bold text-gos-muted">{agentProfile?.email || user?.email || "GOS agent"}</p></div>
            </div>
            <p className="mb-2 px-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-gos-muted">Operations</p>
            <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const showBadge = item.title === "Notifications" && unreadCount > 0

              return (
                <button
                  key={item.title}
                  onClick={() => openTab(item.title)}
                  className={`relative flex min-h-16 w-full items-center gap-3 rounded-lg border px-3 py-3 ${
                    activeTab === item.title
                      ? "border-gos-blue-deep bg-gos-blue-deep font-extrabold text-white shadow-sm"
                      : "border-gos-border bg-white font-bold text-gos-blue-deep"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${activeTab === item.title ? "text-gos-gold" : "text-gos-turquoise"}`} />
                  <span className="min-w-0 flex-1 text-left text-xs leading-4">{item.title}</span>
                  {showBadge && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
            </div>

            <button
              onClick={() => {
                logoutCustomer()
                navigate("/agent-login")
              }}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-xs font-extrabold text-red-700"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      <main className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 text-[#071d3d] md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0b1628] lg:hidden"
              aria-label="Back to GeekOnSites home"
            >
              <ArrowLeft className="h-5 w-5 text-cyan-300" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-black md:text-2xl">
                {activeTab}
              </h1>
              <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                Agent Center · {agentName} · {agentProfile?.status || "ACTIVE"}
              </p>
            </div>
          </div>

          <div className="hidden w-full max-w-[380px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-5 py-3 md:flex">
  <Search className="h-5 w-5 text-cyan-100/40" />
  <input
    type="search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search booking, customer, technician..."
    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-cyan-100/30"
  />
  {searchTerm && <button type="button" onClick={() => setSearchTerm("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-cyan-100/50 hover:text-white" aria-label="Clear search"><X size={16} /></button>}
</div>

          <button
            onClick={() => openTab("Notifications")}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] md:h-12 md:w-12"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5 text-cyan-300" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenu(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] lg:hidden"
          >
            <Menu className="h-5 w-5 text-cyan-300" />
          </button>
        </header>

        <div className="shrink-0 border-b border-cyan-500/10 bg-[#071122]/60 px-4 py-3 md:hidden">
          <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-4">
            <Search className="h-5 w-5 shrink-0 text-cyan-100/40" />
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search bookings or customers" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-cyan-100/30" />
            {searchTerm && <button type="button" onClick={() => setSearchTerm("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-cyan-100/50" aria-label="Clear search"><X size={16} /></button>}
          </label>
        </div>

        <div
          id="agent-main-content"
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-slate-100 p-3 pb-28 md:p-4 lg:pb-4"
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

function OperationsKpi({ title, value, icon: Icon, alert = false }) {
  return <div className="flex min-h-[76px] overflow-hidden rounded border border-slate-300 bg-white"><div className={`flex w-12 shrink-0 items-center justify-center ${alert ? "bg-amber-500" : "bg-[#0b4778]"}`}><Icon className="h-5 w-5 text-white" /></div><div className="min-w-0 px-3 py-2"><p className="text-2xl font-black leading-none text-[#071d3d]">{value ?? 0}</p><p className="mt-2 truncate text-[10px] font-black uppercase tracking-wide text-slate-500">{title}</p></div></div>
}

function CompactSection({ title, action, children }) {
  return <section className="overflow-hidden rounded border border-slate-300 bg-white"><header className="flex min-h-9 items-center justify-between bg-[#071d3d] px-3 py-2 !text-white"><h2 className="text-xs font-black uppercase tracking-[0.12em] !text-white">{title}</h2>{action}</header><div className="p-3">{children}</div></section>
}

function PeriodStrip({ title, data = {}, timezone }) {
  const fields = [["Total", data.created], ["Pending", data.pending], ["Assigned", data.assigned], ["Completed", data.completed], ["Onsite", data.onsite], ["Remote", data.remote]]
  return <CompactSection title={title}><div className="grid grid-cols-3 divide-x divide-y divide-slate-200 sm:grid-cols-6 sm:divide-y-0">{fields.map(([label, value]) => <div key={label} className="px-2 py-2 text-center"><p className="text-lg font-black text-[#071d3d]">{value ?? 0}</p><p className="text-[9px] font-bold uppercase text-slate-500">{label}</p></div>)}</div><p className="mt-2 text-right text-[9px] font-semibold text-slate-400">Calendar day · {timezone || "server timezone"}</p></CompactSection>
}


function Panel({ title, subtitle, actions, children }) {
  return (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black md:text-2xl">{title}</h2>
          <p className="mt-2 text-sm text-cyan-100/45">{subtitle}</p>
        </div>
        {actions}
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

          {!isUnassigned(booking) &&
            booking.bookingStatus !== "SERVICE_COMPLETED" &&
            booking.bookingStatus !== "CANCELLED" && (
              <button
                onClick={onAssign}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-300"
              >
                <Repeat className="h-4 w-4" />
                Reassign
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

          {!isUnassigned(booking) &&
            booking.bookingStatus !== "SERVICE_COMPLETED" &&
            booking.bookingStatus !== "CANCELLED" && (
              <button
                onClick={onAssign}
                className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 py-4 font-black text-cyan-300"
              >
                <Repeat className="h-5 w-5" />
                Reassign Technician
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
      ? "border-emerald-800 bg-emerald-700 text-white"
      : status === "PENDING" || status === "ASSIGNMENT_PENDING"
        ? "border-amber-700 bg-amber-500 text-slate-950"
        : status === "CANCELLED"
          ? "border-red-800 bg-red-700 text-white"
          : "border-cyan-800 bg-cyan-700 text-white"

  return (
    <span className={`inline-flex whitespace-nowrap rounded-md border px-3 py-1 text-xs font-bold leading-4 ${cls}`}>
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
