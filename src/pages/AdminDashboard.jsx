import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllAgents, createAgent } from "../services/agentService"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import BrandLogo from "../components/common/BrandLogo"
import StatusToast from "../components/ui/StatusToast"
import DashboardLoader from "../components/ui/DashboardLoader"
import {
  getAdminDashboardStats,
  getAdminNotifications,
  getAdminRemoteSessions,
  provisionAdminRemoteSession,
  getAdminCustomers,
} from "../services/adminService"
import {
  getAllTechnicians,
  approveTechnician,
  rejectTechnician,
  resendTechnicianOnboarding,
  openTechnicianVerificationEvidence,
} from "../services/technicianService"
import {
  getAllBookings,
  assignTechnicianToBooking,
} from "../services/bookingService"
import { deleteContactMessage, getAllContactMessages, updateContactMessageStatus } from "../services/contactService"
import { executeAdminRefund, getAdminRefunds, rejectAdminRefund, reviewAdminRefund } from "../services/refundService"
import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
  X,
  PlusCircle,
  Inbox,
  Mail,
  MessageSquare,
  Trash2,
  Video,
  ExternalLink,
  RefreshCw,
} from "lucide-react"

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

const money = (currency, amount) => {
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : ""
  return `${symbol}${Number(amount || 0).toFixed(2)}`
}

const locationText = (item) =>
  [item.city, item.state, item.country].filter(Boolean).join(", ") || "N/A"

const technicianSupportsBooking = (technician, booking) => {
  const technicianMode = technician.serviceMode || "REMOTE_AND_ONSITE"
  const bookingMode = booking.serviceMode || (booking.remoteSessionRequired ? "REMOTE" : "ONSITE")
  if (bookingMode === "REMOTE") return technicianMode !== "ONSITE_ONLY"
  if (bookingMode === "ONSITE") return technicianMode !== "REMOTE_ONLY"
  return technicianMode === "REMOTE_AND_ONSITE"
}

const approvalEmailStatus = (legacyStatus) => {
  if (legacyStatus === "EMAIL_SENT") return "Sent"
  if (legacyStatus === "EMAIL_FAILED") return "Failed"
  return "Not sent"
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { logoutCustomer } = useCustomerAuth()

  const [activeTab, setActiveTab] = useState("Overview")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [popup, setPopup] = useState("")
  const [bookings, setBookings] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [selectedTechByBooking, setSelectedTechByBooking] = useState({})
  const [agents, setAgents] = useState([])
  const [registeredCustomers, setRegisteredCustomers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [contactMessages, setContactMessages] = useState([])
  const [remoteSessions, setRemoteSessions] = useState([])
  const [refunds, setRefunds] = useState([])
  const [refundDecisions, setRefundDecisions] = useState({})
  const [selectedMessage, setSelectedMessage] = useState(null)
 const [dashboardStats, setDashboardStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [techFilter, setTechFilter] = useState("ALL")
  const [technicianActions, setTechnicianActions] = useState({})
  const technicianActionLocks = useRef(new Set())
  const popupTimer = useRef(null)
  const [bookingFilter, setBookingFilter] = useState("ALL")
  const [creatingAgent, setCreatingAgent] = useState(false)

  const [agentForm, setAgentForm] = useState({
  name: "",
  email: "",
  password: "",
  phone: "+1",
  country: "US",
  city: "",
})

  useEffect(() => {
    const token = localStorage.getItem("gos_token")
    const role = localStorage.getItem("gos_role")

    if (!token || role !== "ADMIN") {
      navigate("/admin-login")
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
  statsData,
  notificationData,
  contactData,
  remoteSessionData,
  customerData,
  refundData,
] = await Promise.all([
  getAllBookings(),
  getAllTechnicians(),
  getAllAgents(),
  getAdminDashboardStats(),
  getAdminNotifications(),
  getAllContactMessages(),
  getAdminRemoteSessions(),
  getAdminCustomers(),
  getAdminRefunds(),
])

      setBookings(Array.isArray(bookingData) ? bookingData : [])
      setTechnicians(Array.isArray(technicianData) ? technicianData : [])
      setAgents(Array.isArray(agentData) ? agentData : [])
      setDashboardStats(statsData)

setNotifications(
  Array.isArray(notificationData)
    ? notificationData
    : []
)
      setContactMessages(Array.isArray(contactData) ? contactData : [])
      setRemoteSessions(Array.isArray(remoteSessionData) ? remoteSessionData : [])
      setRegisteredCustomers(Array.isArray(customerData) ? customerData : [])
      setRefunds(Array.isArray(refundData) ? refundData : [])

    } catch (error) {
      console.error(error)
      showPopup("Failed to load admin dashboard")
    } finally {
      setLoading(false)
    }
  }

  const showPopup = (text) => {
    setPopup(text)
    if (popupTimer.current) window.clearTimeout(popupTimer.current)
    popupTimer.current = window.setTimeout(() => setPopup(""), 4500)
  }

  const handleApproveTech = async (id) => {
    if (technicianActionLocks.current.has(id)) return
    technicianActionLocks.current.add(id)
    setTechnicianActions((current) => ({ ...current, [id]: "APPROVING" }))
    try {
      const updatedTechnician = await approveTechnician(id)
      if (updatedTechnician?.verificationStatus !== "APPROVED") {
        throw new Error("The technician was not approved. Please try again.")
      }
      setTechnicians((current) =>
        current.map((technician) =>
          String(technician.id) === String(id)
            ? { ...technician, ...updatedTechnician }
            : technician
        )
      )
      showPopup("Technician approved successfully")
    } catch (error) {
      console.error(error)
      showPopup(error?.message || "Failed to approve technician")
    } finally {
      technicianActionLocks.current.delete(id)
      setTechnicianActions((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  const handleRejectTech = async (id) => {
    if (technicianActionLocks.current.has(id)) return
    technicianActionLocks.current.add(id)
    setTechnicianActions((current) => ({ ...current, [id]: "REJECTING" }))
    try {
      const updatedTechnician = await rejectTechnician(id)
      if (updatedTechnician?.verificationStatus !== "REJECTED") {
        throw new Error("The technician was not rejected. Please try again.")
      }
      setTechnicians((current) =>
        current.map((technician) =>
          String(technician.id) === String(id)
            ? { ...technician, ...updatedTechnician }
            : technician
        )
      )
      showPopup("Technician rejected successfully")
    } catch (error) {
      console.error(error)
      showPopup(error?.message || "Failed to reject technician")
    } finally {
      technicianActionLocks.current.delete(id)
      setTechnicianActions((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  const handleResendOnboarding = async (id) => {
    if (technicianActionLocks.current.has(id)) return
    technicianActionLocks.current.add(id)
    setTechnicianActions((current) => ({ ...current, [id]: "RESENDING" }))
    try {
      const updatedTechnician = await resendTechnicianOnboarding(id)
      setTechnicians((current) => current.map((technician) =>
        String(technician.id) === String(id) ? { ...technician, ...updatedTechnician } : technician
      ))
      showPopup("Technician approval notice queued successfully")
    } catch (error) {
      showPopup(error?.message || "Failed to resend approval notice")
    } finally {
      technicianActionLocks.current.delete(id)
      setTechnicianActions((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
    }
  }

  const handleAssignTechnician = async (bookingId) => {
  const technicianId = selectedTechByBooking[bookingId]

  if (!technicianId) {
    showPopup("Please select a technician")
    return
  }

  try {
    await assignTechnicianToBooking(bookingId, technicianId)
    showPopup("Technician assigned successfully")
    loadDashboard()
  } catch (error) {
    console.error(error)
    showPopup("Failed to assign technician")
  }
}

  const handleCreateAgent = async (e) => {
  e.preventDefault()

  if (
    !agentForm.name.trim() ||
    !agentForm.email.trim() ||
    !agentForm.password.trim() ||
    !agentForm.phone.trim() ||
    !agentForm.city.trim()
  ) {
    showPopup("Please fill all fields")
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(agentForm.email)) {
    showPopup("Enter a valid email address")
    return
  }

  // US: +1 followed by 10 digits
  const usPhone = /^\+1\d{10}$/

  // UK: +44 followed by 10 digits
  const ukPhone = /^\+44\d{10}$/

  if (agentForm.country === "US" && !usPhone.test(agentForm.phone)) {
    showPopup("US number must be in format +1XXXXXXXXXX")
    return
  }

  if (agentForm.country === "UK" && !ukPhone.test(agentForm.phone)) {
    showPopup("UK number must be in format +44XXXXXXXXXX")
    return
  }

  if (agentForm.password.length < 8) {
    showPopup("Password must be at least 8 characters")
    return
  }

  try {
    setCreatingAgent(true)

    const payload = {
      name: agentForm.name.trim(),
      email: agentForm.email.trim(),
      password: agentForm.password,
      phone: agentForm.phone.trim(),
      country: agentForm.country,
      city: agentForm.city.trim(),
    }
    await createAgent(payload)

    showPopup("Agent created successfully")

    setAgentForm({
      name: "",
      email: "",
      password: "",
      phone: "+1",
      country: "US",
      city: "",
    })

    const refreshedAgents = await getAllAgents()
    setAgents(Array.isArray(refreshedAgents) ? refreshedAgents : [])
  } catch (err) {
    console.error(err)
    showPopup(err?.message || "Failed to create agent")
  } finally {
    setCreatingAgent(false)
  }
}

  const logout = () => {
  logoutCustomer()
  navigate("/admin-login")
}

  const openTab = (tab) => {
    setActiveTab(tab)
    setMobileMenu(false)
    setTimeout(() => {
      document
        .getElementById("admin-main-content")
        ?.scrollTo({ top: 0, behavior: "smooth" })
    }, 50)
  }

  const navItems = [
    { title: "Overview", icon: LayoutDashboard },
    { title: "Bookings", icon: CalendarCheck },
    { title: "Technicians", icon: Wrench },
    { title: "Agents", icon: Users },
    { title: "Customers", icon: UserCheck },
    { title: "Payments", icon: CreditCard },
    { title: "Refunds", icon: DollarSign },
    { title: "Remote Sessions", icon: Video },
    { title: "Reports", icon: BarChart3 },
    { title: "Notifications", icon: Bell },
    { title: "Support", icon: Inbox },
    { title: "Audit Logs", icon: FileText },
    { title: "Settings", icon: Settings },
  ]

  const mobileTabs = [
    { title: "Overview", icon: LayoutDashboard },
    { title: "Bookings", icon: CalendarCheck },
    { title: "Technicians", icon: Wrench },
    { title: "Agents", icon: Users },
    { title: "Support", icon: Inbox },
  ]

  const q = search.toLowerCase().trim()

  const bookingCustomers = useMemo(() => {
    const map = new Map()

    bookings.forEach((booking) => {
      if (!booking.customerId) return

      if (!map.has(booking.customerId)) {
        map.set(booking.customerId, {
          id: booking.customerId,
          name: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          city: booking.city,
          country: booking.country,
          bookings: 0,
          spent: 0,
          currency: booking.currency,
        })
      }

      const customer = map.get(booking.customerId)
      customer.bookings += 1
      customer.spent += Number(booking.paidAmount || 0)
    })

    return Array.from(map.values())
  }, [bookings])

  const customers = useMemo(() => registeredCustomers.map((customer) => {
    const activity = bookingCustomers.find((entry) => String(entry.id) === String(customer.id))
    return { ...customer, name: customer.fullName, bookings: activity?.bookings || 0, spent: activity?.spent || 0, currency: activity?.currency || (customer.country === "UK" ? "GBP" : "USD"), city: activity?.city || "" }
  }), [registeredCustomers, bookingCustomers])

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      const matchesSearch =
        !q ||
        tech.name?.toLowerCase().includes(q) ||
        tech.email?.toLowerCase().includes(q) ||
        tech.city?.toLowerCase().includes(q) ||
        tech.country?.toLowerCase().includes(q) ||
        tech.specialization?.toLowerCase().includes(q)

      const matchesFilter =
        techFilter === "ALL" || tech.verificationStatus === techFilter

      return matchesSearch && matchesFilter
    })
  }, [technicians, q, techFilter])

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        !q ||
        String(booking.id).includes(q) ||
        booking.customerName?.toLowerCase().includes(q) ||
        booking.customerEmail?.toLowerCase().includes(q) ||
        booking.serviceType?.toLowerCase().includes(q) ||
        booking.technicianName?.toLowerCase().includes(q) ||
        booking.agentName?.toLowerCase().includes(q)

      const mode = booking.serviceMode || (booking.remoteSessionRequired ? "REMOTE" : "ONSITE")

      const matchesFilter =
        bookingFilter === "ALL" ||
        booking.bookingStatus === bookingFilter ||
        mode === bookingFilter

      return matchesSearch && matchesFilter
    })
  }, [bookings, q, bookingFilter])

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      return (
        !q ||
        agent.name?.toLowerCase().includes(q) ||
        agent.email?.toLowerCase().includes(q) ||
        agent.city?.toLowerCase().includes(q) ||
        agent.country?.toLowerCase().includes(q)
      )
    })
  }, [agents, q])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      return (
        !q ||
        customer.name?.toLowerCase().includes(q) ||
        customer.email?.toLowerCase().includes(q) ||
        customer.phone?.toLowerCase().includes(q) ||
        customer.city?.toLowerCase().includes(q) ||
        customer.country?.toLowerCase().includes(q)
      )
    })
  }, [customers, q])

  const metrics = useMemo(() => {
    const revenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.paidAmount || 0),
      0
    )
    const usRevenue = bookings.filter((booking) => booking.country === "US" || booking.currency === "USD").reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)
    const ukRevenue = bookings.filter((booking) => booking.country === "UK" || booking.currency === "GBP").reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)

  return {
  customers: dashboardStats?.totalCustomers ?? customers.length,

  technicians:
    dashboardStats?.totalTechnicians ?? technicians.length,

  pendingTechs: technicians.filter(
    (t) => t.verificationStatus === "PENDING"
  ).length,

  approvedTechs: technicians.filter(
    (t) => t.verificationStatus === "APPROVED"
  ).length,

  rejectedTechs: technicians.filter(
    (t) => t.verificationStatus === "REJECTED"
  ).length,

  agents: dashboardStats?.totalAgents ?? agents.length,

  bookings: dashboardStats?.totalBookings ?? bookings.length,

  pendingBookings:
    dashboardStats?.pendingJobs ??
    bookings.filter(
      (b) =>
        b.bookingStatus === "PENDING" ||
        b.bookingStatus === "PAYMENT_COMPLETED" ||
        b.bookingStatus === "ASSIGNMENT_PENDING"
    ).length,

  completedBookings:
    dashboardStats?.completedJobs ??
    bookings.filter(
      (b) => b.bookingStatus === "SERVICE_COMPLETED"
    ).length,

  revenue:
    dashboardStats?.totalRevenue ?? revenue,
  usRevenue,
  ukRevenue,
}
  }, [dashboardStats, bookings, technicians, agents, customers])

  const auditLogs = useMemo(() => {
    const bookingLogs = bookings.slice(0, 8).map((booking) => ({
      id: `booking-${booking.id}`,
      text: `Booking GOS-${booking.id} is ${
        statusLabel[booking.bookingStatus] || booking.bookingStatus
      }`,
      time: booking.updatedAt || booking.createdAt || "Recently",
    }))

    const technicianLogs = technicians.slice(0, 8).map((tech) => ({
      id: `tech-${tech.id}`,
      text: `Technician ${tech.name} verification: ${
        tech.verificationStatus || "N/A"
      }`,
      time: "Recently",
    }))

    const agentLogs = agents.slice(0, 5).map((agent) => ({
      id: `agent-${agent.id}`,
      text: `Agent ${agent.name} is ${agent.status || "ACTIVE"}`,
      time: "Recently",
    }))

    return [...bookingLogs, ...technicianLogs, ...agentLogs]
  }, [bookings, technicians, agents])

  const OverviewSection = () => (
    <>
      <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-4">
        <StatCard title="Customers" value={metrics.customers} icon={UserCheck} />
        <StatCard title="Technicians" value={metrics.technicians} icon={Wrench} />
        <StatCard title="Agents" value={metrics.agents} icon={Users} />
        <StatCard title="Bookings" value={metrics.bookings} icon={CalendarCheck} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <Panel title="Operations Overview" subtitle="Backend-connected company snapshot">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <OverviewTile
              icon={ShieldCheck}
              label="Pending Technician Reviews"
              value={metrics.pendingTechs}
            />
            <OverviewTile
              icon={Bell}
              label="Pending Bookings"
              value={metrics.pendingBookings}
            />
            <OverviewTile icon={DollarSign} label="United States Revenue" value={`$${metrics.usRevenue.toFixed(2)}`} />
            <OverviewTile icon={DollarSign} label="United Kingdom Revenue" value={`£${metrics.ukRevenue.toFixed(2)}`} />
            <OverviewTile
              icon={CheckCircle2}
              label="Completed Bookings"
              value={metrics.completedBookings}
            />
          </div>
        </Panel>

        <Panel title="Today Alerts" subtitle="Priority admin actions">
          <div className="space-y-3">
            <AlertLine text={`${metrics.pendingTechs} technician applications pending`} />
            <AlertLine text={`${metrics.pendingBookings} bookings need attention`} />
            <AlertLine text={`${metrics.approvedTechs} technicians approved`} />
            <AlertLine text={`${bookings.filter((b) => b.remoteSessionRequired).length} remote session bookings`} />
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ReportCard title="Approved Techs" value={metrics.approvedTechs} />
        <ReportCard title="Rejected Techs" value={metrics.rejectedTechs} />
        <ReportCard title="Active Agents" value={metrics.agents} />
      </div>
    </>
  )

 const BookingSection = () => (
  <Panel title="Booking Management" subtitle="Search, filter, and monitor all bookings">
    <div className="mb-5 flex flex-wrap gap-3">
      {["ALL", "PENDING", "ASSIGNMENT_PENDING", "TECHNICIAN_ASSIGNED", "REMOTE", "ONSITE", "SERVICE_COMPLETED", "CANCELLED"].map((item) => (
        <FilterButton
          key={item}
          active={bookingFilter === item}
          onClick={() => setBookingFilter(item)}
        >
          {item}
        </FilterButton>
      ))}
    </div>

    <div className="space-y-4">
      {filteredBookings.length ? (
        filteredBookings.map((booking) => (
          <div key={booking.id} className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black">GOS-{booking.id}</h3>
                    <StatusBadge status={booking.bookingStatus} />
                    <StatusBadge status={booking.paymentStatus} />
                  </div>

                  <p className="mt-2 text-cyan-100/70">
                    {booking.customerName || "Customer N/A"}
                  </p>
                  <p className="text-sm text-cyan-100/45">
                    {booking.serviceType || "Service N/A"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{locationText(booking)}</Badge>
                    <Badge>{booking.serviceMode || (booking.remoteSessionRequired ? "REMOTE" : "ONSITE")}</Badge>
                    <Badge>{money(booking.currency, booking.totalAmount)}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MiniInfo label="Agent" value={booking.agentName || "Unassigned"} />
                  <MiniInfo label="Technician" value={booking.technicianName || "Unassigned"} />
                  <MiniInfo label="Paid" value={money(booking.currency, booking.paidAmount)} />
                </div>
              </div>

              {(booking.country === "UK" || booking.country === "GB" || booking.country === "United Kingdom") && (
                <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                  <MiniInfo label="UK early-service consent" value={booking.ukEarlyServiceConsent ? "Yes" : "No"} />
                  <MiniInfo label="Consent timestamp" value={booking.ukEarlyServiceConsentAt ? new Date(booking.ukEarlyServiceConsentAt).toLocaleString() : "Not provided"} />
                  <MiniInfo label="Consent text/version" value={booking.ukEarlyServiceConsentTextVersion || "Not provided"} />
                </div>
              )}

              {!booking.technicianId ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                  <select
                    value={selectedTechByBooking[booking.id] || ""}
                    onChange={(e) =>
                      setSelectedTechByBooking({
                        ...selectedTechByBooking,
                        [booking.id]: e.target.value,
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-[#071122] px-4 py-3 text-white outline-none"
                  >
                    <option value="">Select Technician</option>

                    {technicians
                      .filter(
                        (t) =>
                          t.verificationStatus === "APPROVED" &&
                          t.availabilityStatus === "AVAILABLE" &&
                          technicianSupportsBooking(t, booking)
                      )
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} • {t.specialization} • {t.city}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={() => handleAssignTechnician(booking.id)}
                    className="rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black hover:bg-cyan-300"
                  >
                    Assign
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-bold text-green-300">
                  Technician Assigned: {booking.technicianName}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <EmptyState title="No bookings found" />
      )}
    </div>
  </Panel>
)

   const TechnicianSection = () => (
  <Panel
    title="Technician Management"
    subtitle="Review, approve, reject, and monitor technicians"
  >
    <div className="mb-5 flex flex-wrap gap-3">
      {["ALL", "PENDING", "APPROVED", "REJECTED"].map((item) => (
        <FilterButton
          key={item}
          active={techFilter === item}
          onClick={() => setTechFilter(item)}
        >
          {item}
        </FilterButton>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {filteredTechnicians.length ? (
        filteredTechnicians.map((tech) => (
          <div
            key={tech.id}
            className="rounded-3xl border border-white/10 bg-[#0b1628] p-5"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-black">
                  {tech.name || "Technician"}
                </h3>

                <p className="mt-1 text-sm text-cyan-100/45">
                  Personal: {tech.personalEmail || tech.email || "Email N/A"}
                </p>

                {tech.companyEmail && <p className="mt-1 text-sm font-bold text-cyan-200">Company: {tech.companyEmail}</p>}

                <p className="mt-1 text-sm text-cyan-100/45">
                  {tech.phone || "Phone N/A"}
                </p>
              </div>

              <StatusBadge status={tech.verificationStatus || "PENDING"} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MiniInfo label="Country" value={tech.country || "N/A"} />
              <MiniInfo label="City" value={tech.city || "N/A"} />
              <MiniInfo
                label="Specialization"
                value={tech.specialization || "N/A"}
              />
              <MiniInfo
                label="Experience"
                value={`${tech.experienceYears || 0} years`}
              />
              <MiniInfo
                label="Availability"
                value={tech.availabilityStatus || "N/A"}
              />
              <MiniInfo label="Approval email status" value={approvalEmailStatus(tech.onboardingStatus)} />
              <MiniInfo
                label="Rating"
                value={tech.rating ? `${tech.rating} / 5` : "N/A"}
              />
              <MiniInfo label="Citizenship" value={tech.citizenshipStatus?.replaceAll("_", " ") || "Not submitted"} />
              <MiniInfo label="Identity document" value={tech.identityDocumentType?.replaceAll("_", " ") || "Not submitted"} />
              <MiniInfo label="Engagement" value={tech.employmentType?.replaceAll("_", " ") || "Not submitted"} />
              <MiniInfo label="Service mode" value={tech.serviceMode?.replaceAll("_", " ") || "Not submitted"} />
              <MiniInfo label="Right to work" value={tech.workAuthorizationType?.replaceAll("_", " ") || "Not submitted"} />
              <MiniInfo label="Work permission expiry" value={tech.workAuthorizationExpiry || "Not applicable"} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {tech.identityDocumentType && <button onClick={() => openTechnicianVerificationEvidence(tech.id, "identity-document").catch((error) => showPopup(error.message))} className="rounded-md border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-200">View ID</button>}
              {tech.identityDocumentType && <button onClick={() => openTechnicianVerificationEvidence(tech.id, "live-photo").catch((error) => showPopup(error.message))} className="rounded-md border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-200">View live photo</button>}
              {tech.workAuthorizationDocumentName && <button onClick={() => openTechnicianVerificationEvidence(tech.id, "work-authorization").catch((error) => showPopup(error.message))} className="rounded-md border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-200">Work authorisation</button>}
              {tech.addressProofName && <button onClick={() => openTechnicianVerificationEvidence(tech.id, "address-proof").catch((error) => showPopup(error.message))} className="rounded-md border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-200">Address proof</button>}
              {tech.drivingLicenseName && <button onClick={() => openTechnicianVerificationEvidence(tech.id, "driving-license").catch((error) => showPopup(error.message))} className="rounded-md border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-200">Driving licence</button>}
              {tech.vehicleInsuranceName && <button onClick={() => openTechnicianVerificationEvidence(tech.id, "vehicle-insurance").catch((error) => showPopup(error.message))} className="rounded-md border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-200">Vehicle insurance</button>}
              {tech.publicLiabilityName && <button onClick={() => openTechnicianVerificationEvidence(tech.id, "public-liability").catch((error) => showPopup(error.message))} className="rounded-md border border-cyan-500/30 px-4 py-2 text-xs font-bold text-cyan-200">Liability insurance</button>}
              {tech.verificationStatus !== "APPROVED" && (
                <button
                  type="button"
                  onClick={() => handleApproveTech(tech.id)}
                  disabled={Boolean(technicianActions[tech.id])}
                  aria-busy={technicianActions[tech.id] === "APPROVING"}
                  className="rounded-2xl bg-green-400 px-5 py-3 text-sm font-black text-black hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {technicianActions[tech.id] === "APPROVING"
                    ? "Approving..."
                    : tech.verificationStatus === "REJECTED"
                      ? "Approve again"
                      : "Approve"}
                </button>
              )}
              {tech.verificationStatus === "APPROVED" && !tech.companyEmail && (
                <button
                  type="button"
                  onClick={() => handleApproveTech(tech.id)}
                  disabled={Boolean(technicianActions[tech.id])}
                  aria-busy={technicianActions[tech.id] === "APPROVING"}
                  className="rounded-2xl bg-green-400 px-5 py-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {technicianActions[tech.id] === "APPROVING" ? "Approving..." : "Approve Technician"}
                </button>
              )}

              {tech.verificationStatus !== "REJECTED" && (
                <button
                  type="button"
                  onClick={() => handleRejectTech(tech.id)}
                  disabled={Boolean(technicianActions[tech.id])}
                  aria-busy={technicianActions[tech.id] === "REJECTING"}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {technicianActions[tech.id] === "REJECTING" ? "Rejecting..." : "Reject"}
                </button>
              )}
              {tech.verificationStatus === "APPROVED" && (
                <button
                  type="button"
                  onClick={() => handleResendOnboarding(tech.id)}
                  disabled={Boolean(technicianActions[tech.id])}
                  aria-busy={technicianActions[tech.id] === "RESENDING"}
                  className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-black text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {technicianActions[tech.id] === "RESENDING" ? "Sending..." : "Resend Approval Notice"}
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <EmptyState title="No technicians found" />
      )}
    </div>
  </Panel>
)

  const AgentSection = () => (
    <Panel title="Agent Management" subtitle="Create and monitor internal operations agents">
      <form
        onSubmit={handleCreateAgent}
        className="mb-7 rounded-3xl border border-cyan-500/10 bg-[#0b1628] p-5"
      >
        <div className="mb-5 flex items-center gap-3">
          <PlusCircle className="h-6 w-6 text-cyan-300" />
          <div>
            <h3 className="text-lg font-black">Add New Agent</h3>
            <p className="text-sm text-cyan-100/45">
              Creates both agent profile and login account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label="Agent Name"
            value={agentForm.name}
            onChange={(v) => setAgentForm({ ...agentForm, name: v })}
            placeholder="Operations Agent"
          />
          <Input
            label="Email"
            value={agentForm.email}
            onChange={(v) => setAgentForm({ ...agentForm, email: v })}
            placeholder="agent@gos.com"
          />
          <Input
            label="Temporary Password"
            value={agentForm.password}
            onChange={(v) => setAgentForm({ ...agentForm, password: v })}
            placeholder="Agent@123"
            type="password"
          />
          <Input
            label="Phone"
            value={agentForm.phone}
            onChange={(v) => {
  let phone = v

  if (agentForm.country === "US") {
    phone = "+1" + phone.replace(/\D/g, "").replace(/^1/, "")
    phone = phone.substring(0, 12)
  } else {
    phone = "+44" + phone.replace(/\D/g, "").replace(/^44/, "")
    phone = phone.substring(0, 13)
  }

  setAgentForm({
    ...agentForm,
    phone,
  })
}}
            placeholder={
  agentForm.country === "US"
    ? "+15551234567"
    : "+447700900123"
}

          />

          <div>
            <label className="text-xs text-cyan-100/45">Country</label>
            <select
              value={agentForm.country}
              onChange={(e) => {
            const country = e.target.value

             setAgentForm({
             ...agentForm,
             country,
            phone: country === "US" ? "+1" : "+44",
        })
    }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#071122] px-4 py-3 text-white outline-none"
            >
              <option style={{ backgroundColor: "#071122", color: "#fff" }} value="US">US</option>
              <option style={{ backgroundColor: "#071122", color: "#fff" }} value="UK">UK</option>
            </select>
          </div>

          <Input
            label="City"
            value={agentForm.city}
            onChange={(v) => setAgentForm({ ...agentForm, city: v })}
            placeholder="New York / London"
          />
        </div>

        <button
          disabled={creatingAgent}
          className="mt-5 rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black hover:bg-cyan-300 disabled:opacity-60"
        >
          {creatingAgent ? "Creating..." : "Create Agent"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredAgents.length ? (
          filteredAgents.map((agent) => (
            <div key={agent.id} className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
              <h3 className="text-lg font-black">{agent.name}</h3>
              <p className="mt-1 text-sm text-cyan-100/45">{agent.email}</p>
              <p className="mt-1 text-sm text-cyan-100/45">{agent.phone}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{agent.country || "N/A"}</Badge>
                <Badge>{agent.city || "N/A"}</Badge>
                <StatusBadge status={agent.status || "ACTIVE"} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No agents found" />
        )}
      </div>
    </Panel>
  )

  const CustomerSection = () => (
    <Panel title="Customer Management" subtitle="Customers calculated from bookings">
      <div className="space-y-4">
        {filteredCustomers.length ? (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
              <h3 className="text-lg font-black">{customer.name}</h3>
              <p className="mt-1 text-sm text-cyan-100/45">{customer.email}</p>
              <p className="mt-1 text-sm text-cyan-100/45">{customer.phone}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{customer.city || "N/A"}</Badge>
                <Badge>{customer.country || "N/A"}</Badge>
                <Badge>{customer.bookings} Bookings</Badge>
                <Badge>{money(customer.currency, customer.spent)}</Badge>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No customers found" />
        )}
      </div>
    </Panel>
  )

  const retryRemoteSession = async (bookingId) => {
    try {
      await provisionAdminRemoteSession(bookingId)
      showPopup("Remote session provisioning refreshed")
      await loadDashboard()
    } catch (error) {
      console.error(error)
      showPopup(error.message || "Could not provision remote session")
    }
  }

  const RemoteSessionsSection = () => {
    const visible = remoteSessions.filter((session) => !q || [
      `GOS-${session.id}`,
      session.customerName,
      session.customerEmail,
      session.serviceType,
      session.remoteSessionStatus,
      session.technicianName,
    ].some((value) => String(value || "").toLowerCase().includes(q)))

    return <Panel title="Remote Sessions" subtitle="Paid bookings, Google Meet provisioning, and session activity">
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniInfo label="All remote" value={remoteSessions.length} />
        <MiniInfo label="Meeting ready" value={remoteSessions.filter((item) => item.remoteSessionStatus === "READY").length} />
        <MiniInfo label="In progress" value={remoteSessions.filter((item) => item.bookingStatus === "REMOTE_SESSION_STARTED").length} />
        <MiniInfo label="Completed" value={remoteSessions.filter((item) => item.bookingStatus === "SERVICE_COMPLETED").length} />
      </div>
      <div className="space-y-3">
        {visible.length ? visible.map((session) => <article key={session.id} className="rounded-lg border border-white/10 bg-[#0b1628] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-['Cormorant_Garamond'] text-2xl font-bold">GOS-{session.id}</h3><StatusBadge status={session.remoteSessionStatus || "PAYMENT_PENDING"} /><StatusBadge status={session.bookingStatus} /></div><p className="mt-2 text-sm font-bold text-cyan-100/80">{session.customerName || "Customer"} · {session.serviceType || "Remote support"}</p><p className="mt-1 break-all text-xs text-cyan-100/45">{session.customerEmail || "No customer email"}</p></div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[460px]"><MiniInfo label="Payment" value={session.paymentStatus} /><MiniInfo label="Scheduled" value={session.remoteSessionScheduledStart ? new Date(session.remoteSessionScheduledStart).toLocaleString() : "Pending"} /><MiniInfo label="Technician" value={session.technicianName || "Unassigned"} /></div>
          </div>
          {session.remoteSessionProvisioningError && <p className="mt-3 rounded-md border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200">{session.remoteSessionProvisioningError}</p>}
          <div className="mt-4 flex flex-wrap gap-2">{session.remoteSessionLink && <a href={session.remoteSessionLink} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-cyan-400 px-4 text-xs font-black text-black"><ExternalLink size={14} /> Open Google Meet</a>}<button type="button" onClick={() => retryRemoteSession(session.id)} disabled={session.paymentStatus !== "PAID"} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-xs font-black text-cyan-100 disabled:opacity-40"><RefreshCw size={14} /> {session.remoteSessionLink ? "Refresh status" : "Provision meeting"}</button></div>
        </article>) : <EmptyState title="No remote sessions found" />}
      </div>
    </Panel>
  }

  const PaymentSection = () => (
    <Panel title="Payments & Payouts" subtitle="Payment data from bookings">
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title="US Revenue" value={`$${metrics.usRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatCard title="UK Revenue" value={`£${metrics.ukRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatCard title="Paid Bookings" value={bookings.filter((b) => b.paymentStatus === "PAID").length} icon={CreditCard} />
        <StatCard title="Partial Payments" value={bookings.filter((b) => b.paymentStatus === "PARTIALLY_PAID").length} icon={Activity} />
      </div>

      <div className="space-y-4">
        {filteredBookings.length ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
              <h3 className="text-lg font-black">GOS-{booking.id}</h3>
              <p className="mt-1 text-sm text-cyan-100/45">{booking.customerName}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{booking.paymentType || "Payment Type N/A"}</Badge>
                <Badge>{money(booking.currency, booking.paidAmount)}</Badge>
                <Badge>{booking.paymentTransactionId || "No TXN"}</Badge>
                <StatusBadge status={booking.paymentStatus || "N/A"} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No payments found" />
        )}
      </div>
    </Panel>
  )

  const updateRefundDecision = (id, field, value) => setRefundDecisions((current) => ({ ...current, [id]: { ...current[id], [field]: value } }))

  const processRefund = async (refund) => {
    const decision = refundDecisions[refund.id] || {}
    const amount = decision.amount || refund.suggestedMaximumRefundAmount
    if (!window.confirm(`Issue ${refund.currency} ${Number(amount).toFixed(2)} through Stripe for refund #${refund.id}?`)) return
    try {
      await reviewAdminRefund(refund.id)
      await executeAdminRefund(refund.id, amount, decision.note || "")
      showPopup("Refund processed securely")
      await loadDashboard()
    } catch (error) {
      showPopup(error.message || "Refund processing failed")
      await loadDashboard()
    }
  }

  const rejectRefund = async (refund) => {
    const note = refundDecisions[refund.id]?.note || ""
    if (!window.confirm(`Reject refund request #${refund.id}?`)) return
    try {
      await rejectAdminRefund(refund.id, note)
      showPopup("Refund request rejected")
      await loadDashboard()
    } catch (error) {
      showPopup(error.message || "Could not reject refund")
    }
  }

  const RefundsSection = () => (
    <Panel title="Refunds" subtitle="Country-aware cancellation review and Stripe execution">
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniInfo label="Pending" value={refunds.filter((item) => ["REQUESTED", "UNDER_REVIEW"].includes(item.refundStatus)).length} />
        <MiniInfo label="Processing" value={refunds.filter((item) => item.refundStatus === "PROCESSING").length} />
        <MiniInfo label="Refunded" value={refunds.filter((item) => ["REFUNDED", "PARTIALLY_REFUNDED"].includes(item.refundStatus)).length} />
        <MiniInfo label="Failed" value={refunds.filter((item) => item.refundStatus === "FAILED").length} />
      </div>
      <div className="space-y-4">{refunds.length ? refunds.map((refund) => {
        const booking = bookings.find((item) => item.id === refund.bookingId) || {}
        const actionable = ["REQUESTED", "UNDER_REVIEW", "FAILED"].includes(refund.refundStatus)
        return <article key={refund.id} className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:justify-between"><div><div className="flex flex-wrap gap-2"><h3 className="text-lg font-black">Refund #{refund.id} · GOS-{refund.bookingId}</h3><StatusBadge status={refund.refundStatus} /><Badge>{refund.country}</Badge></div><p className="mt-2 text-sm text-cyan-100/70">{booking.customerName || `Customer #${refund.customerId}`} · {booking.serviceType || "Service"}</p><p className="mt-1 text-xs text-cyan-100/45">Requested {refund.requestedAt ? new Date(refund.requestedAt).toLocaleString() : "N/A"}</p></div><div className="grid gap-2 sm:grid-cols-3"><MiniInfo label="Paid" value={money(refund.currency, refund.originalPaymentAmount)} /><MiniInfo label="Maximum" value={money(refund.currency, refund.suggestedMaximumRefundAmount)} /><MiniInfo label="Stage" value={booking.bookingStatus || "N/A"} /></div></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2"><MiniInfo label="Reason" value={refund.refundReason} /><MiniInfo label="Customer message" value={refund.customerMessage || "None"} /><MiniInfo label="UK consent" value={refund.country === "UK" ? (booking.ukEarlyServiceConsent ? "Yes" : "No") : "Not applicable"} /><MiniInfo label="Consent timestamp" value={booking.ukEarlyServiceConsentAt ? new Date(booking.ukEarlyServiceConsentAt).toLocaleString() : "Not provided"} /></div>
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-cyan-100/60">{refund.ruleContext}</p>
          {refund.failureReason && <p className="mt-3 text-xs text-red-300">{refund.failureReason}</p>}
          {actionable && <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto_auto]"><input type="number" min="0.01" step="0.01" max={refund.suggestedMaximumRefundAmount} value={refundDecisions[refund.id]?.amount ?? refund.suggestedMaximumRefundAmount} onChange={(event) => updateRefundDecision(refund.id, "amount", event.target.value)} className="rounded-xl border border-white/10 bg-[#071122] px-3 text-sm" aria-label="Approved refund amount" /><input value={refundDecisions[refund.id]?.note || ""} onChange={(event) => updateRefundDecision(refund.id, "note", event.target.value)} placeholder="Admin audit note" className="rounded-xl border border-white/10 bg-[#071122] px-3 text-sm" /><button type="button" onClick={() => processRefund(refund)} className="rounded-xl bg-cyan-400 px-4 py-3 text-xs font-black text-black">Approve & refund</button><button type="button" onClick={() => rejectRefund(refund)} className="rounded-xl border border-red-400/30 px-4 py-3 text-xs font-black text-red-300">Reject</button></div>}
          {refund.stripeRefundId && <p className="mt-3 text-xs text-slate-500">Stripe refund: {refund.stripeRefundId}</p>}
        </article>
      }) : <EmptyState title="No refund requests" />}</div>
    </Panel>
  )

  const ReportsSection = () => (
    <Panel title="Reports & Analytics" subtitle="Calculated from backend data">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard title="US Revenue" value={`$${metrics.usRevenue.toFixed(2)}`} />
        <ReportCard title="UK Revenue" value={`£${metrics.ukRevenue.toFixed(2)}`} />
        <ReportCard title="Completed" value={metrics.completedBookings} />
        <ReportCard title="Pending" value={metrics.pendingBookings} />
        <ReportCard title="Customers" value={metrics.customers} />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-[#0b1628] p-6">
        <h3 className="font-black text-cyan-100">Admin Export Center</h3>
        <p className="mt-2 text-sm text-cyan-100/45">
          PDF / Excel / CSV export can be connected later. For MVP, data is live and backend-connected.
        </p>
      </div>
    </Panel>
  )

  const NotificationsSection = () => (
  <Panel
    title="Notifications"
    subtitle="Live admin notifications"
  >
    <div className="space-y-4">
      {notifications.length > 0 ? (
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
        <EmptyState title="No notifications" />
      )}
    </div>
  </Panel>
)

  const AuditLogsSection = () => (
    <Panel title="Audit Logs" subtitle="Generated activity history">
      <div className="space-y-4">
        {auditLogs.length ? (
          auditLogs.map((log) => (
            <div key={log.id} className="flex gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-5">
              <Activity className="h-5 w-5 text-cyan-300" />
              <div>
                <p className="text-cyan-100/80">{log.text}</p>
                <p className="mt-1 text-xs text-cyan-100/35">{log.time}</p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title="No audit logs" />
        )}
      </div>
    </Panel>
  )

  const openSupportMessage = async (message) => {
    setSelectedMessage(message)
    if (message.status !== "NEW") return
    try {
      const updated = await updateContactMessageStatus(message.id, "READ")
      setSelectedMessage(updated)
      setContactMessages((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (error) {
      console.error(error)
      showPopup("Could not update support message")
    }
  }

  const resolveSupportMessage = async (message) => {
    try {
      const updated = await updateContactMessageStatus(message.id, "RESOLVED")
      setSelectedMessage(updated)
      setContactMessages((current) => current.map((item) => item.id === updated.id ? updated : item))
      showPopup("Support request resolved")
    } catch (error) {
      console.error(error)
      showPopup("Could not resolve support request")
    }
  }

  const removeSupportMessage = async (message) => {
    if (!window.confirm(`Delete support request GOS-S-${message.id}?`)) return
    try {
      await deleteContactMessage(message.id)
      setContactMessages((current) => current.filter((item) => item.id !== message.id))
      setSelectedMessage(null)
      showPopup("Support request deleted")
    } catch (error) {
      console.error(error)
      showPopup("Could not delete support request")
    }
  }

  const SupportSection = () => {
    const visibleMessages = contactMessages.filter((message) => !q || [message.fullName, message.email, message.subject, message.message, `GOS-S-${message.id}`].some((value) => String(value || "").toLowerCase().includes(q)))
    const unread = contactMessages.filter((message) => message.status === "NEW").length

    return <Panel title="Support Inbox" subtitle={`${unread} unread request${unread === 1 ? "" : "s"} | ${contactMessages.length} total`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)]">
        <div className="max-h-[62vh] space-y-2 overflow-y-auto pr-1">
          {visibleMessages.length ? visibleMessages.map((message) => <button key={message.id} type="button" onClick={() => openSupportMessage(message)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedMessage?.id === message.id ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-[#0b1628] hover:border-cyan-500/30"}`}>
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black text-white">{message.subject}</p><p className="mt-1 truncate text-xs text-cyan-100/50">{message.fullName} | {message.email}</p></div><SupportStatus status={message.status} /></div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-cyan-100/60">{message.message}</p><p className="mt-2 text-[10px] font-bold text-cyan-300">GOS-S-{message.id}</p>
          </button>) : <EmptyState title="No support messages" />}
        </div>

        <div className="min-h-72 rounded-2xl border border-white/10 bg-[#0b1628] p-4 md:p-5">
          {selectedMessage ? <><div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4"><div><p className="text-xs font-bold text-cyan-300">GOS-S-{selectedMessage.id}</p><h3 className="mt-2 text-xl font-black">{selectedMessage.subject}</h3></div><SupportStatus status={selectedMessage.status} /></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><MiniInfo label="Customer" value={selectedMessage.fullName} /><MiniInfo label="Account ID" value={selectedMessage.customerId ? `#${selectedMessage.customerId}` : "Guest"} /><MiniInfo label="Email" value={selectedMessage.email} /><MiniInfo label="Phone" value={selectedMessage.phone} /><MiniInfo label="Region" value={selectedMessage.country} /><MiniInfo label="Received" value={selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : "N/A"} /></div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#071122] p-4"><p className="text-xs font-bold text-cyan-100/40">Customer message</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-cyan-100/80">{selectedMessage.message}</p></div>
            <div className="mt-4 flex flex-wrap gap-2"><a href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject} [GOS-S-${selectedMessage.id}]`)}`} className="flex min-h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-xs font-black text-black"><Mail size={14} /> Reply</a>{selectedMessage.status !== "RESOLVED" && <button type="button" onClick={() => resolveSupportMessage(selectedMessage)} className="flex min-h-10 items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 text-xs font-black text-emerald-300"><CheckCircle2 size={14} /> Resolve</button>}<button type="button" onClick={() => removeSupportMessage(selectedMessage)} className="flex min-h-10 items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 text-xs font-black text-red-300"><Trash2 size={14} /> Delete</button></div>
          </> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><MessageSquare className="h-9 w-9 text-cyan-300/50" /><h3 className="mt-4 text-lg font-black">Select a support request</h3><p className="mt-2 max-w-xs text-sm text-cyan-100/45">Customer details and the complete message will appear here.</p></div>}
        </div>
      </div>
    </Panel>
  }

  const SettingsSection = () => (
    <Panel title="Settings" subtitle="Backend-connected admin portal">
      <Info label="Admin Auth" value="JWT role-based access enabled" />
      <Info label="Connected APIs" value="Bookings, Technicians, Agents" />
      <Info label="Launch Regions" value="US / UK" />
      <Info label="Platform Fee" value="$12 / £12 configured in booking flow" />

      <button
        onClick={logout}
        className="mt-5 w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-4 font-black text-red-300"
      >
        Logout
      </button>
    </Panel>
  )

  const renderContent = () => {
  if (activeTab === "Bookings") return BookingSection()
  if (activeTab === "Technicians") return TechnicianSection()
  if (activeTab === "Agents") return AgentSection()
  if (activeTab === "Customers") return CustomerSection()
  if (activeTab === "Payments") return PaymentSection()
  if (activeTab === "Refunds") return RefundsSection()
  if (activeTab === "Remote Sessions") return RemoteSessionsSection()
  if (activeTab === "Reports") return ReportsSection()
  if (activeTab === "Notifications") return NotificationsSection()
  if (activeTab === "Support") return SupportSection()
  if (activeTab === "Audit Logs") return AuditLogsSection()
  if (activeTab === "Settings") return SettingsSection()
  return OverviewSection()
}

  if (loading) {
    return (
      <DashboardLoader />
    )
  }

  return (
    <div className="gos-admin-portal flex h-screen w-full overflow-hidden bg-[#020817] text-white">
      <StatusToast message={popup} />

      <aside className="hidden h-screen w-[310px] shrink-0 flex-col border-r border-cyan-500/20 bg-[#071122] p-6 lg:flex">
        <div className="mb-8">
          <BrandLogo className="h-auto w-48" />
          <p className="mt-2 text-sm text-cyan-100/45">
            Admin Operations Portal
          </p>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.title}
                onClick={() => openTab(item.title)}
                className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition ${
                  activeTab === item.title
                    ? "bg-cyan-400 font-black text-black"
                    : "border border-white/5 bg-[#0b1628] text-cyan-100/70 hover:bg-cyan-500/10"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={logout}
          className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {mobileMenu && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#020817]/95 p-5 backdrop-blur-xl lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <BrandLogo className="h-auto w-40" />
              <p className="text-sm text-cyan-100/45">Admin Menu</p>
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
                      : "border border-white/5 bg-[#0b1628]"
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

      <main className="min-w-0 flex-1 overflow-hidden pb-20 lg:pb-0">
        <header className="flex h-[82px] items-center justify-between gap-4 border-b border-cyan-500/10 bg-[#071122]/95 px-4 md:h-[90px] md:px-6">
          <div>
            <h1 className="text-xl font-black md:text-2xl">{activeTab}</h1>
            <p className="mt-1 text-xs text-cyan-100/40 md:text-sm">
              Internal company operations panel
            </p>
          </div>

          <div className="hidden w-full max-w-[420px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-5 py-3 md:flex">
            <Search className="h-5 w-5 text-cyan-100/40" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings, techs, agents..."
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-cyan-100/30"
            />
            {search && <button type="button" onClick={() => setSearch("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-cyan-100/50 hover:text-white" aria-label="Clear search"><X size={16} /></button>}
          </div>

          <button
            onClick={() => setMobileMenu(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] lg:hidden"
          >
            <Menu className="h-5 w-5 text-cyan-300" />
          </button>
        </header>

        <div className="border-b border-cyan-500/10 bg-[#071122]/60 px-4 py-3 md:hidden">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-4 py-3">
            <Search className="h-5 w-5 text-cyan-100/40" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-cyan-100/30"
            />
            {search && <button type="button" onClick={() => setSearch("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-cyan-100/50" aria-label="Clear search"><X size={16} /></button>}
          </div>
        </div>

        <div
          id="admin-main-content"
          className="h-[calc(100vh-140px)] overflow-y-auto overflow-x-hidden p-4 pb-28 md:h-[calc(100vh-90px)] md:p-6 lg:pb-6"
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
                <span className="text-[10px]">{item.title}</span>
              </button>
            )
          })}
        </div>
      </nav>
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

function OverviewTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
      <Icon className="h-7 w-7 text-cyan-300" />
      <p className="mt-4 text-sm text-cyan-100/45">{label}</p>
      <h3 className="mt-2 text-3xl font-black">{value}</h3>
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

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071122] px-4 py-3">
      <p className="text-xs text-cyan-100/35">{label}</p>
      <p className="mt-1 text-sm font-bold text-cyan-100/80">
        {value || "N/A"}
      </p>
    </div>
  )
}

function AlertLine({ text }) {
  return (
    <div className="mb-4 flex gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-5">
      <Bell className="h-5 w-5 text-cyan-300" />
      <span className="text-cyan-100/75">{text}</span>
    </div>
  )
}

function EmptyState({ title }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-8 text-center">
      <BriefcaseBusiness className="mx-auto h-10 w-10 text-cyan-300/50" />
      <h3 className="mt-4 text-xl font-black">{title}</h3>
    </div>
  )
}


function SupportStatus({ status }) {
  const styles = status === "NEW" ? "border-amber-400/30 bg-amber-500/10 text-amber-300" : status === "RESOLVED" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" : "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
  return <span className={`shrink-0 rounded-lg border px-2 py-1 text-[9px] font-black ${styles}`}>{status || "NEW"}</span>
}

function Badge({ children }) {
  return (
    <span className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
      {children || "N/A"}
    </span>
  )
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-xs font-black ${
        active
          ? "bg-cyan-400 text-black"
          : "border border-white/10 bg-[#0b1628] text-cyan-100/60"
      }`}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }) {
  const cls =
    status === "APPROVED" ||
    status === "ACTIVE" ||
    status === "AVAILABLE" ||
    status === "SERVICE_COMPLETED" ||
    status === "PAYMENT_COMPLETED" ||
    status === "PAID"
      ? "border-green-500/20 bg-green-500/10 text-green-300"
      : status === "REJECTED" ||
          status === "SUSPENDED" ||
          status === "INACTIVE" ||
          status === "UNAVAILABLE" ||
          status === "CANCELLED"
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : status === "PENDING" ||
            status === "UNDER_REVIEW" ||
            status === "PARTIALLY_PAID"
          ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"

  return (
    <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${cls}`}>
      {statusLabel[status] || status || "N/A"}
    </span>
  )
}

function Info({ label, value }) {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-[#0b1628] p-4">
      <p className="text-xs text-cyan-100/35">{label}</p>
      <p className="mt-1 break-words font-bold text-cyan-100/85">
        {value || "N/A"}
      </p>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-cyan-100/45">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-[#071122] px-4 py-3 text-white outline-none placeholder:text-cyan-100/25 focus:border-cyan-400/60"
      />
    </div>
  )
}
