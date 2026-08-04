import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import {
  getTechnicianBookings,
  getTechnicianNotifications,
  acceptTechnicianJob,
  rejectTechnicianJob,
  technicianOnTheWay,
  markTechnicianArrived,
  startTechnicianService,
  startTechnicianRemoteSession,
  saveRemoteMeetingLink,
  completeTechnicianService,
} from "../services/technicianService"
import useLiveTechnicianLocation from "../hooks/useLiveTechnicianLocation"
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileCheck2,
  Laptop,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Monitor,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Star,
  User,
  Users,
  Video,
  Wifi,
  Wrench,
  X,
  ArrowRight,
  Home,
  Navigation,
  MapPinned,
} from "lucide-react"

const statusToLabel = {
  PENDING: "New",
  PAYMENT_COMPLETED: "New",
  ASSIGNMENT_PENDING: "New",
  TECHNICIAN_ASSIGNED: "New",
  TECHNICIAN_ACCEPTED: "Accepted",
  TECHNICIAN_REJECTED: "Rejected",
  TECHNICIAN_ON_THE_WAY: "On The Way",
  TECHNICIAN_ARRIVED: "Arrived",
  SERVICE_STARTED: "Service Started",
  REMOTE_SESSION_STARTED: "Service Started",
  SERVICE_COMPLETED: "Completed",
  REMAINING_PAYMENT_PENDING: "Completed",
  INVOICE_GENERATED: "Completed",
  FULLY_PAID: "Completed",
  BOOKING_CLOSED: "Completed",
  CANCELLED: "Rejected",
}

const getCurrencySymbol = (currency) => {
  if (currency === "USD") return "$"
  if (currency === "GBP") return "£"
  return "$"
}

const getSupportType = (booking) => {
  if (booking.serviceMode === "REMOTE" || booking.remoteSessionRequired) return "remote"
  return "onsite"
}

const mapBookingToJob = (booking) => {
  const supportType = getSupportType(booking)

  return {
    bookingId: booking.id,
    customerName: booking.customerName || "Customer",
    customerPhone: booking.customerPhone || "",
    customerEmail: booking.customerEmail || "",
    serviceType: booking.serviceType || "Selected Service",
    issueDescription: booking.issueDescription || "No issue description provided.",
    location:
      [booking.city, booking.state, booking.country].filter(Boolean).join(", ") ||
      "Location not provided",
    schedule:
      booking.bookingDate && booking.timeSlot
        ? `${booking.bookingDate} • ${booking.timeSlot}`
        : "Schedule not selected",
    priority:
      booking.bookingStatus === "PENDING" ||
      booking.bookingStatus === "ASSIGNMENT_PENDING"
        ? "High"
        : "Medium",
    status: statusToLabel[booking.bookingStatus] || "New",
    bookingStatus: booking.bookingStatus || "PENDING",
    supportType,
    paymentStatus: booking.paymentStatus || "PENDING",
    currency: getCurrencySymbol(booking.currency),
    amountPaid: Number(booking.paidAmount || booking.paymentAmount || 0).toFixed(2),
    platformFee: Number(booking.platformFee || 0).toFixed(2),
    serviceAmount: Number(booking.baseAmount || 0).toFixed(2),
    remainingAmount: Number(booking.remainingAmount || 0).toFixed(2),
    sessionId: `GOS-RM-${booking.id}`,
    remoteMeetingLink:
      booking.remoteSessionLink || `https://remote.geekonsites.com/session/${booking.id}`,
    invoiceNumber: booking.invoiceNumber || `INV-GOS-${booking.id}`,
    trackingEnabled: Boolean(booking.trackingEnabled),
    technicianArrived: Boolean(booking.technicianArrived),
    etaMinutes: booking.etaMinutes,
    remainingDistanceKm: booking.remainingDistanceKm,
    currentRoad: booking.currentRoad,
    raw: booking,
  }
}

export default function TechnicianDashboard() {
  const navigate = useNavigate()
  const { user, logoutCustomer } = useCustomerAuth()

  const [activeTab, setActiveTab] = useState("Dashboard")
  const [availability, setAvailability] = useState("Available")
  const [popup, setPopup] = useState("")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [jobs, setJobs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTrackingJobId, setActiveTrackingJobId] = useState(null)
  const [startingRemote, setStartingRemote] = useState(false)
  const [meetingLink, setMeetingLink] = useState("")

  const technicianStatus = "APPROVED"
  const technicianName = user?.fullName || "Technician"
  const technicianPersonalEmail = user?.email || ""
  const technicianGosEmail = user?.email || ""

  const technicianState = {
    name: technicianName,
    role: "Senior GeekOnSites Technician",
    phone: "+447700900123",
  }

  const {
    tracking: liveTracking,
    error: liveTrackingError,
  } = useLiveTechnicianLocation({
    bookingId: activeTrackingJobId,
    enabled: Boolean(activeTrackingJobId),
    intervalMs: 7000,
  })

  useEffect(() => {
    const token = localStorage.getItem("gos_token")
    const role = localStorage.getItem("gos_role")

    if (!token || role !== "TECHNICIAN") {
      navigate("/technician-login")
      return
    }

    loadTechnicianBookings()
  }, [navigate])

  const showPopup = (text) => {
    setPopup(text)
    setTimeout(() => setPopup(""), 2400)
  }

  const loadTechnicianBookings = async () => {
    try {
      setLoading(true)

      const data = await getTechnicianBookings()
      setJobs(Array.isArray(data) ? data.map(mapBookingToJob) : [])

      try {
        const notificationData = await getTechnicianNotifications()
        setNotifications(Array.isArray(notificationData) ? notificationData : [])
      } catch (error) {
        console.error(error)
      }
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to load technician jobs.")
    } finally {
      setLoading(false)
    }
  }

  const refreshJobs = async () => {
    const data = await getTechnicianBookings()
    setJobs(Array.isArray(data) ? data.map(mapBookingToJob) : [])
  }

  const openTab = (tab) => {
    setActiveTab(tab)
    setMobileMenu(false)

    setTimeout(() => {
      document
        .getElementById("technician-main-content")
        ?.scrollTo({ top: 0, behavior: "smooth" })
    }, 50)
  }

  const buildBookingState = (job) => ({
    ...job.raw,
    id: job.bookingId,
    serviceType: job.serviceType,
    issueDescription: job.issueDescription,
    customerName: job.customerName,
    customerEmail: job.customerEmail,
    customerPhone: job.customerPhone,
    supportType: job.supportType,
    location: job.location,
    date: job.schedule,
    bookingStatus: job.bookingStatus,
    sessionId: job.sessionId,
    remoteMeetingLink: job.remoteMeetingLink,
    invoiceNumber: job.invoiceNumber,
    amountPaid: job.amountPaid,
    serviceAmount: job.serviceAmount,
    platformFee: job.platformFee,
    remainingAmount: job.remainingAmount,
    currency: job.currency,
    paymentMethod: job.raw?.paymentMethod || "CARD",
  })

  const openRemoteSession = (job) => {
    navigate("/remote-session", {
      state: {
        booking: buildBookingState(job),
        technician: technicianState,
      },
    })
  }

  const openTrack = (job) => {
    navigate(`/track-technician/${job.bookingId}`, {
      state: {
        booking: {
          ...buildBookingState(job),
          technicianName,
          technicianRole: "Senior GeekOnSites Technician",
          technicianPhone: "+447700900123",
          rating: "N/A",
          status: job.status,
        },
      },
    })
  }

  const handleAcceptJob = async (job) => {
    try {
      await acceptTechnicianJob(job.bookingId)
      await refreshJobs()
      showPopup("Job accepted. Customer notified.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to accept job.")
    }
  }

  const handleRejectJob = async (job) => {
    try {
      const reason = window.prompt("Reason for rejecting this job?") || ""
      await rejectTechnicianJob(job.bookingId, reason)
      await refreshJobs()
      showPopup("Job rejected. Customer will be reassigned.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to reject job.")
    }
  }

  const handleStartJourney = async (job) => {
    try {
      await technicianOnTheWay(job.bookingId)
      setActiveTrackingJobId(job.bookingId)
      await refreshJobs()
      showPopup("Journey started. Live GPS tracking is active.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to start journey.")
    }
  }

  const handleArrived = async (job) => {
    try {
      await markTechnicianArrived(job.bookingId)
      setActiveTrackingJobId(null)
      await refreshJobs()
      showPopup("Arrival confirmed. Customer notified.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to mark arrived.")
    }
  }

  const handleStartService = async (job) => {
    try {
      await startTechnicianService(job.bookingId)
      setActiveTrackingJobId(null)
      await refreshJobs()
      showPopup("Service started.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to start service.")
    }
  }

  const handleStartRemoteSession = async (job) => {
  try {
    const updatedBooking = await startTechnicianRemoteSession(
      job.bookingId,
      job.remoteMeetingLink
    )

    await refreshJobs()

    openRemoteSession({
      ...job,
      raw: updatedBooking,
      remoteMeetingLink:
        updatedBooking.remoteSessionLink || job.remoteMeetingLink,
      bookingStatus: updatedBooking.bookingStatus,
    })

    showPopup("Remote session started.")
  } catch (error) {
    console.error(error)
    alert(error.message || "Failed to start remote session.")
  }
}

const saveMeetingLink = async (job) => {
  if (!meetingLink.trim()) {
    alert("Please paste Google Meet link first.")
    return
  }

  if (!meetingLink.includes("meet.google.com")) {
    alert("Please enter a valid Google Meet link.")
    return
  }

  try {
    const updatedBooking = await saveRemoteMeetingLink(
      job.bookingId,
      meetingLink.trim()
    )

    await refreshJobs()

    setMeetingLink("")

    showPopup("Google Meet link saved successfully.")

    openRemoteSession({
      ...job,
      raw: updatedBooking,
      remoteMeetingLink: updatedBooking.remoteSessionLink,
      bookingStatus: updatedBooking.bookingStatus,
    })
  } catch (error) {
    console.error(error)
    alert(error.message || "Failed to save meeting link.")
  }
}
  const handleCompleteJob = async (job) => {
    try {
      await completeTechnicianService(job.bookingId)
      setActiveTrackingJobId(null)
      await refreshJobs()
      showPopup("Service completed. Customer notified.")

      navigate("/session-summary", {
        state: {
          booking: buildBookingState({
            ...job,
            bookingStatus: "SERVICE_COMPLETED",
          }),
          technician: technicianState,
          sessionDuration: job.supportType === "remote" ? "00:22:10" : "01:10:00",
          workPerformed: [
            "Issue diagnosis completed",
            "Customer support completed",
            "Service status updated",
            "Invoice ready for customer",
          ],
          resolutionNotes:
            "Technician completed the assigned service and marked the booking as resolved.",
        },
      })
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to complete job.")
    }
  }

  const stats = useMemo(() => {
    const activeJobs = jobs.filter(
      (job) => job.status !== "Completed" && job.status !== "Rejected"
    )

    const completedJobs = jobs.filter((job) => job.status === "Completed")
    const todayEarnings = completedJobs.reduce(
      (sum, job) => sum + Number(job.amountPaid || 0),
      0
    )

    return [
      {
        title: "Assigned Jobs",
        value: jobs.length,
        icon: BriefcaseBusiness,
      },
      {
        title: "Active Jobs",
        value: activeJobs.length,
        icon: Activity,
      },
      {
        title: "Average Rating",
        value: "N/A",
        icon: Star,
      },
      {
        title: "Today Earnings",
        value: jobs.length
          ? `${jobs[0].currency}${todayEarnings.toFixed(2)}`
          : "$0.00",
        icon: DollarSign,
      },
    ]
  }, [jobs])

  const sidebar = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Assigned Jobs", icon: BriefcaseBusiness },
    { title: "Remote Sessions", icon: Monitor },
    { title: "Customers", icon: Users },
    { title: "Earnings", icon: DollarSign },
    { title: "Ratings", icon: Star },
    { title: "Notifications", icon: Bell },
    { title: "Profile", icon: User },
    { title: "Settings", icon: Settings },
  ]

  const mobileTabs = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Assigned Jobs", icon: BriefcaseBusiness },
    { title: "Remote Sessions", icon: Monitor },
    { title: "Earnings", icon: DollarSign },
    { title: "Profile", icon: User },
  ]

  if (technicianStatus !== "APPROVED") {
    return (
      <PendingApprovalDashboard
        navigate={navigate}
        technicianName={technicianName}
        technicianPersonalEmail={technicianPersonalEmail}
        technicianGosEmail={technicianGosEmail}
        logoutCustomer={logoutCustomer}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-[#020817] px-4 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-8 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-4 font-black text-cyan-300">Loading technician jobs...</p>
        </div>
      </div>
    )
  }

  const JobsSection = () => (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black md:text-2xl">Assigned Jobs</h2>
          <p className="mt-2 text-sm text-cyan-100/50 md:text-base">
            Accept jobs, start journeys, confirm arrival, begin service, and complete requests.
          </p>
        </div>

        <span className="w-fit rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
          {jobs.filter((job) => job.status === "New").length} New Requests
        </span>
      </div>

      <div className="space-y-5">
        {jobs.length ? (
          jobs.map((job) => (
            <JobCard
              key={job.bookingId}
              job={job}
              activeTrackingJobId={activeTrackingJobId}
              onAccept={() => handleAcceptJob(job)}
              onReject={() => handleRejectJob(job)}
              onStartJourney={() => handleStartJourney(job)}
              onArrived={() => handleArrived(job)}
              onStartService={() => handleStartService(job)}
              onComplete={() => handleCompleteJob(job)}
              onRemote={() => handleStartRemoteSession(job)}
              onTrack={() => openTrack(job)}
            />
          ))
        ) : (
          <EmptyCard
            title="No assigned jobs"
            text="Assigned technician bookings will appear here."
          />
        )}
      </div>
    </section>
  )

  const RemoteSessionsSection = () => {
    const remoteJobs = jobs.filter((job) => job.supportType === "remote")

    return (
      <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
        <h2 className="mb-6 text-xl font-black md:text-2xl">Remote Sessions</h2>

        <div className="grid gap-6 xl:grid-cols-2">
          {remoteJobs.length ? (
            remoteJobs.map((job) => (
              <div
                key={job.bookingId}
                className="rounded-3xl border border-white/10 bg-[#0b1628] p-5 md:p-6"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                  <Monitor className="h-8 w-8 text-green-400" />
                </div>

                <h3 className="text-xl font-black">{job.customerName}</h3>
                <p className="mt-2 text-sm text-cyan-100/50">{job.serviceType}</p>
                <p className="mt-2 text-xs text-cyan-300">#GOS-{job.bookingId}</p>

                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => handleStartRemoteSession(job)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black hover:bg-cyan-300"
                  >
                    Start Remote Session
                    <Video className="h-5 w-5" />
                  </button>
                  <div className="mt-4 space-y-3">
  
  <input
  type="text"
  placeholder="Paste Google Meet Link here"
  value={meetingLink}
  onChange={(e) => setMeetingLink(e.target.value)}
  className="w-full rounded-xl border border-white/10 bg-[#071122] px-4 py-3 text-white outline-none focus:border-cyan-400"
/>

  <button
  onClick={() => saveMeetingLink(job)}
  className="w-full rounded-xl bg-green-500 py-3 font-bold text-white hover:bg-green-600"
>
  Save Meeting Link
</button>
</div>

                  <a
                    href={job.customerPhone ? `tel:${job.customerPhone}` : undefined}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#071122] px-6 py-3 font-bold text-white"
                  >
                    <Phone className="h-5 w-5 text-cyan-300" />
                    Call Customer
                  </a>
                </div>
              </div>
            ))
          ) : (
            <EmptyCard
              title="No remote sessions"
              text="Remote jobs assigned to you will appear here."
            />
          )}

          <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-5 md:p-6">
            <h3 className="mb-5 text-xl font-black">Session Tools</h3>

            <div className="space-y-4">
              {[
                { text: "Open Support Chat", icon: MessageCircle },
                { text: "Run Diagnostics Checklist", icon: Activity },
                { text: "Secure Session Verified", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.text}
                    onClick={() => showPopup(`${item.text} opened`)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-[#071122] p-4 hover:border-cyan-500/30"
                  >
                    <Icon className="h-5 w-5 text-cyan-300" />
                    <span>{item.text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const CustomersSection = () => (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <h2 className="mb-6 text-xl font-black md:text-2xl">Customers</h2>

      <div className="space-y-4">
        {jobs.length ? (
          jobs.map((job) => (
            <div
              key={job.bookingId}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="font-black">{job.customerName}</h3>
                <p className="mt-1 text-sm text-cyan-100/50">{job.customerEmail}</p>
                <p className="mt-1 text-sm text-cyan-100/50">{job.serviceType}</p>
              </div>

              <div className="flex gap-3">
                <a
                  href={job.customerPhone ? `tel:${job.customerPhone}` : undefined}
                  className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-black"
                >
                  Call
                </a>

                <button
                  onClick={() => openTrack(job)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white"
                >
                  View Booking
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyCard
            title="No customers yet"
            text="Customers from assigned jobs will appear here."
          />
        )}
      </div>
    </section>
  )

  const EarningsSection = () => {
    const completedJobs = jobs.filter((job) => job.status === "Completed")
    const totalEarned = completedJobs.reduce(
      (sum, job) => sum + Number(job.amountPaid || 0),
      0
    )

    return (
      <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
        <h2 className="mb-6 text-xl font-black md:text-2xl">Earnings</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <MetricCard label="Completed Jobs" value={completedJobs.length} />
          <MetricCard
            label="Total Paid Value"
            value={jobs.length ? `${jobs[0].currency}${totalEarned.toFixed(2)}` : "$0.00"}
          />
          <MetricCard label="Pending Jobs" value={jobs.length - completedJobs.length} />
        </div>

        <div className="mt-7 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5 md:p-6">
          <h3 className="font-black text-cyan-300">Payout Status</h3>
          <p className="mt-2 text-sm text-cyan-100/60 md:text-base">
            Weekly payout is scheduled after service verification.
          </p>
        </div>
      </section>
    )
  }

  const RatingsSection = () => (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <h2 className="mb-6 text-xl font-black md:text-2xl">Ratings & Reviews</h2>

      <EmptyCard
        title="Ratings coming soon"
        text="Verified customer ratings from completed bookings will appear here."
      />
    </section>
  )

  const NotificationsSection = () => (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black md:text-2xl">Notifications</h2>
          <p className="mt-2 text-sm text-cyan-100/50">
            Job assignment, service, and customer update alerts.
          </p>
        </div>

        <button
          onClick={loadTechnicianBookings}
          className="rounded-2xl border border-white/10 bg-[#0b1628] px-4 py-3 text-sm font-bold text-cyan-300"
        >
          Refresh
        </button>
      </div>

      {notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
                <Bell className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-black">{notification.title || "Notification"}</h3>

                  <p className="text-xs text-cyan-100/40">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>

                <p className="mt-2 text-sm leading-6 text-cyan-100/55">
                  {notification.message || ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyCard
          title="No notifications"
          text="Technician notifications from the backend will appear here."
        />
      )}
    </section>
  )

  const ProfileSection = () => (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <h2 className="mb-6 text-xl font-black md:text-2xl">Technician Profile</h2>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10 text-4xl font-black text-cyan-300">
            {technicianName?.charAt(0)?.toUpperCase() || "T"}
          </div>

          <h3 className="mt-5 text-xl font-black">{technicianName}</h3>
          <p className="mt-1 text-cyan-100/50">Approved GOS Technician</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["Personal Email", technicianPersonalEmail],
              ["GOS Email", technicianGosEmail],
              ["Location", "US / UK Service Area"],
              ["Verification", "Approved"],
              ["Work Type", "Remote + Onsite"],
              ["Rating", "N/A"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-cyan-100/40">{label}</p>
                <p className="mt-1 break-words font-black">{value || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )

  const SettingsSection = () => (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <h2 className="mb-6 text-xl font-black md:text-2xl">Settings</h2>

      {[
        "Job Notifications",
        "Remote Session Alerts",
        "Weekly Payout Emails",
        "Customer Message Alerts",
      ].map((item) => (
        <div
          key={item}
          className="mb-4 flex justify-between gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-5"
        >
          <span>{item}</span>
          <span className="text-green-300">Enabled</span>
        </div>
      ))}

      <button
        onClick={() => {
          logoutCustomer()
          navigate("/technician-login")
        }}
        className="mt-4 w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-4 font-black text-red-300"
      >
        Logout
      </button>
    </section>
  )

  const renderContent = () => {
    if (activeTab === "Assigned Jobs") return <JobsSection />
    if (activeTab === "Remote Sessions") return <RemoteSessionsSection />
    if (activeTab === "Customers") return <CustomersSection />
    if (activeTab === "Earnings") return <EarningsSection />
    if (activeTab === "Ratings") return <RatingsSection />
    if (activeTab === "Notifications") return <NotificationsSection />
    if (activeTab === "Profile") return <ProfileSection />
    if (activeTab === "Settings") return <SettingsSection />

    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-cyan-500/10 bg-[#071122] p-5 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-cyan-100/50">{item.title}</p>
                    <h2 className="mt-3 text-3xl font-black md:text-4xl">
                      {item.value}
                    </h2>
                  </div>
                  <Icon className="h-8 w-8 text-cyan-300" />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <JobsSection />

          <section className="space-y-6">
            <div className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-5 md:rounded-[32px] md:p-7">
              <h2 className="mb-5 text-xl font-black md:text-2xl">Availability</h2>

              <div className="grid gap-3">
                {["Available", "Busy", "Offline"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setAvailability(item)}
                    className={`rounded-2xl border p-4 text-left ${
                      availability === item
                        ? "border-cyan-300 bg-cyan-400 font-black text-black"
                        : "border-white/10 bg-[#0b1628] text-white"
                    }`}
                  >
                    {item === "Available" && "🟢 "}
                    {item === "Busy" && "🟡 "}
                    {item === "Offline" && "🔴 "}
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-5 md:rounded-[32px] md:p-7">
              <h2 className="mb-5 text-xl font-black md:text-2xl">Today Summary</h2>

              {[
                `${jobs.length} jobs assigned`,
                `${jobs.filter((j) => j.supportType === "remote").length} remote jobs`,
                `${jobs.filter((j) => j.status === "Completed").length} completed jobs`,
                `${jobs.filter((j) => j.status === "On The Way").length} active journeys`,
                `${jobs.filter((j) => j.status === "Arrived").length} arrivals confirmed`,
              ].map((item) => (
                <div
                  key={item}
                  className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#020817] text-white">
      {popup && (
        <div className="fixed bottom-24 right-4 z-50 rounded-2xl border border-cyan-500/20 bg-[#071122] px-5 py-4 shadow-2xl md:bottom-6 md:right-6">
          <p className="font-medium text-cyan-100">{popup}</p>
        </div>
      )}

      {liveTracking && (
        <div className="fixed bottom-24 left-4 z-50 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm font-bold text-green-300 shadow-2xl md:bottom-6">
          Live GPS tracking active
        </div>
      )}

      {liveTrackingError && (
        <div className="fixed bottom-40 left-4 z-50 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300 shadow-2xl md:bottom-24">
          {liveTrackingError}
        </div>
      )}

      <aside className="hidden w-[300px] shrink-0 flex-col border-r border-cyan-500/20 bg-[#071122] p-6 lg:flex">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-cyan-300">GOS</h1>
          <p className="mt-2 text-sm text-cyan-100/50">
            Technician Command Center
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1628] p-4">
            <p className="text-xs text-cyan-100/40">Official Email</p>
            <p className="mt-1 truncate text-sm font-semibold text-cyan-200">
              {technicianGosEmail}
            </p>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1">
          {sidebar.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.title}
                onClick={() => openTab(item.title)}
                className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition ${
                  activeTab === item.title
                    ? "bg-cyan-400 font-black text-black"
                    : "border border-white/5 bg-[#0b1628] hover:bg-cyan-500/10"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => {
            logoutCustomer()
            navigate("/technician-login")
          }}
          className="mt-5 flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300 hover:bg-red-500/20"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#020817]/95 p-5 backdrop-blur-xl lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-cyan-300">GOS</h1>
              <p className="text-sm text-cyan-100/50">Technician Menu</p>
            </div>

            <button
              onClick={() => setMobileMenu(false)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#071122]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0b1628] px-5 py-4 font-bold"
          >
            <Home className="h-5 w-5 text-cyan-300" />
            Back to Website
          </button>

          <div className="space-y-3">
            {sidebar.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.title}
                  onClick={() => openTab(item.title)}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition ${
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

      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-cyan-500/10 bg-[#071122]/90 px-4 md:h-[90px] md:px-6">
          <div>
            <h1 className="text-xl font-black md:text-2xl">{activeTab}</h1>
            <p className="mt-1 text-xs text-cyan-100/40 md:text-sm">
              Approved technician workspace
            </p>
          </div>

          <div className="hidden w-full max-w-[360px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-5 py-3 md:flex">
            <Search className="h-5 w-5 text-cyan-100/40" />
            <input
              placeholder="Search jobs, customers..."
              className="w-full bg-transparent text-white outline-none placeholder:text-cyan-100/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openTab("Notifications")}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] md:h-12 md:w-12"
            >
              <Bell className="h-5 w-5 text-cyan-300" />
              {notifications.length > 0 && (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-cyan-400" />
              )}
            </button>

            <button
              onClick={() => setMobileMenu(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] lg:hidden"
            >
              <Menu className="h-5 w-5 text-cyan-300" />
            </button>
          </div>
        </div>

        <div
          id="technician-main-content"
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 lg:pb-6"
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
                  {item.title === "Assigned Jobs"
                    ? "Jobs"
                    : item.title === "Remote Sessions"
                      ? "Remote"
                      : item.title}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function JobCard({
  job,
  activeTrackingJobId,
  onAccept,
  onReject,
  onStartJourney,
  onArrived,
  onStartService,
  onComplete,
  onRemote,
  onTrack,
}) {
  const isRemote = job.supportType === "remote"
  const isTrackingThisJob = String(activeTrackingJobId) === String(job.bookingId)

  const canAccept = job.bookingStatus === "TECHNICIAN_ASSIGNED"
  const canStartJourney =
    !isRemote &&
    (job.bookingStatus === "TECHNICIAN_ACCEPTED" ||
      job.bookingStatus === "TECHNICIAN_ASSIGNED")
  const canArrive = !isRemote && job.bookingStatus === "TECHNICIAN_ON_THE_WAY"
  const canStartService =
    !isRemote &&
    (job.bookingStatus === "TECHNICIAN_ARRIVED" ||
      job.bookingStatus === "TECHNICIAN_ON_THE_WAY")
  const canComplete =
    job.bookingStatus === "SERVICE_STARTED" ||
    job.bookingStatus === "REMOTE_SESSION_STARTED"
  const canTrack =
    !isRemote &&
    (job.bookingStatus === "TECHNICIAN_ON_THE_WAY" ||
      job.bookingStatus === "TECHNICIAN_ARRIVED" ||
      job.bookingStatus === "SERVICE_STARTED")
  
      const canRemote =
  isRemote &&
  (
    job.bookingStatus === "TECHNICIAN_ASSIGNED" ||
    job.bookingStatus === "TECHNICIAN_ACCEPTED"
  )
  
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-4 md:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
            {job.serviceType.includes("Laptop") ? (
              <Laptop className="h-7 w-7 text-cyan-300" />
            ) : job.serviceType.includes("WiFi") ||
              job.serviceType.includes("Network") ? (
              <Wifi className="h-7 w-7 text-cyan-300" />
            ) : (
              <Wrench className="h-7 w-7 text-cyan-300" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-white md:text-xl">
                {job.customerName}
              </h3>
              {isTrackingThisJob && (
                <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-black text-black">
                  LIVE GPS
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-cyan-100/60 md:text-base">
              {job.serviceType}
            </p>
            <p className="mt-1 text-xs text-cyan-300">#GOS-{job.bookingId}</p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs md:text-sm">
              <span className="flex items-center gap-2 text-cyan-100/45">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-2 text-cyan-100/45">
                <Clock3 className="h-4 w-4" />
                {job.schedule}
              </span>
            </div>
          </div>
        </div>

        <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-slate-400">
          {job.issueDescription}
        </p>

        {!isRemote && (
          <div className="grid gap-3 md:grid-cols-4">
            <TrackingMini label="ETA" value={job.etaMinutes ? `${job.etaMinutes} min` : "N/A"} />
            <TrackingMini
              label="Distance"
              value={
                job.remainingDistanceKm != null
                  ? `${Number(job.remainingDistanceKm).toFixed(2)} km`
                  : "N/A"
              }
            />
            <TrackingMini label="Road" value={job.currentRoad || "N/A"} />
            <TrackingMini label="Arrival" value={job.technicianArrived ? "Arrived" : "Pending"} />
          </div>
        )}

        <WorkflowSteps job={job} isRemote={isRemote} />

        <div className="flex flex-wrap gap-2 md:gap-3">
          <Badge type={job.priority}>{job.priority}</Badge>
          <Badge>{isRemote ? "Remote" : "Onsite"}</Badge>
          <Badge>{job.paymentStatus}</Badge>
          <Badge type={job.status}>{job.status}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap">
          {canAccept && (
            <>
              <button
                onClick={onAccept}
                className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-black hover:bg-cyan-300"
              >
                Accept
              </button>

              <button
                onClick={onReject}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20"
              >
                Reject
              </button>
            </>
          )}

          {canStartJourney && (
            <button
              onClick={onStartJourney}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-black"
            >
              <Navigation className="h-4 w-4" />
              Start Journey
            </button>
          )}

          {canArrive && (
            <button
              onClick={onArrived}
              className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black"
            >
              <MapPinned className="h-4 w-4" />
              Arrived
            </button>
          )}

          {canStartService && (
            <button
              onClick={onStartService}
              className="rounded-xl bg-green-400 px-4 py-3 text-sm font-black text-black"
            >
              Start Service
            </button>
          )}

          {canComplete && (
            <button
              onClick={onComplete}
              className="rounded-xl bg-green-400 px-4 py-3 text-sm font-black text-black"
            >
              Complete Job
            </button>
          )}

          {canRemote && (
            <button
              onClick={onRemote}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-[#071122] px-4 py-3 text-sm font-bold text-cyan-300 hover:border-cyan-400/40"
            >
              Remote
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {canTrack && (
            <button
              onClick={onTrack}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071122] px-4 py-3 text-sm font-bold text-white"
            >
              <Navigation className="h-4 w-4 text-cyan-300" />
              Track
            </button>
          )}

          <a
            href={job.customerPhone ? `tel:${job.customerPhone}` : undefined}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#071122] px-4 py-3 text-sm text-cyan-100/80"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        </div>
      </div>
    </div>
  )
}

function WorkflowSteps({ job, isRemote }) {
  const onsiteSteps = [
    ["TECHNICIAN_ASSIGNED", "Assigned"],
    ["TECHNICIAN_ACCEPTED", "Accepted"],
    ["TECHNICIAN_ON_THE_WAY", "Journey"],
    ["TECHNICIAN_ARRIVED", "Arrived"],
    ["SERVICE_STARTED", "Service"],
    ["SERVICE_COMPLETED", "Done"],
  ]

  const remoteSteps = [
    ["TECHNICIAN_ASSIGNED", "Assigned"],
    ["TECHNICIAN_ACCEPTED", "Accepted"],
    ["REMOTE_SESSION_STARTED", "Remote"],
    ["SERVICE_COMPLETED", "Done"],
  ]

  const steps = isRemote ? remoteSteps : onsiteSteps
  const currentIndex = steps.findIndex(([status]) => status === job.bookingStatus)

  return (
    <div className="rounded-2xl border border-white/10 bg-[#071122] p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {steps.map(([status, label], index) => {
          const active = index <= currentIndex
          return (
            <div key={status} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                  active ? "bg-cyan-400 text-black" : "bg-white/10 text-cyan-100/40"
                }`}
              >
                {active ? "✓" : index + 1}
              </span>
              <span
                className={`text-xs font-bold ${
                  active ? "text-cyan-200" : "text-cyan-100/35"
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrackingMini({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#071122] p-3">
      <p className="text-xs text-cyan-100/35">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-cyan-100/80">{value}</p>
    </div>
  )
}

function PendingApprovalDashboard({
  navigate,
  technicianName,
  technicianPersonalEmail,
  technicianGosEmail,
  logoutCustomer,
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#020817] px-4 py-6 text-white">
      <div className="absolute left-5 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-[130px] md:left-20" />
      <div className="absolute bottom-10 right-5 h-96 w-96 rounded-full bg-blue-600/10 blur-[150px] md:right-20" />

      <div className="relative w-full max-w-4xl rounded-[32px] border border-cyan-500/20 bg-[#071122]/95 p-5 shadow-2xl sm:p-8 md:rounded-[38px] md:p-10">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10">
            <ShieldCheck className="h-10 w-10 text-cyan-300" />
          </div>

          <h1 className="mt-6 text-3xl font-black md:text-5xl">
            Application Under Admin Review
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-cyan-100/55">
            GeekOnSites HR/Admin will verify your identity, documents, service
            skills, and eligibility.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoTile icon={User} label="Applicant" value={technicianName} />
          <InfoTile icon={Mail} label="Personal Email" value={technicianPersonalEmail} />
          <InfoTile icon={Lock} label="GOS Email" value={technicianGosEmail} />
        </div>

        <div className="mt-8 grid gap-4">
          {[
            ["Application Submitted", "Completed"],
            ["Documents Received", "Completed"],
            ["Identity Verification", "In Progress"],
            ["Manager Approval", "Pending"],
            ["Official @gos.com Email", "Pending"],
            ["Dashboard Access", "Locked"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-4"
            >
              <span className="text-cyan-100/60">{label}</span>
              <span
                className={`font-black ${
                  value === "Completed"
                    ? "text-green-300"
                    : value === "In Progress"
                      ? "text-yellow-300"
                      : "text-cyan-300"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <p className="text-sm leading-relaxed text-cyan-100/60">
            After approval, GeekOnSites will create your official company email,
            enable dashboard access, and allow agents to assign customer jobs.
          </p>
        </div>

        <button
          onClick={() => {
            logoutCustomer()
            navigate("/technician-login")
          }}
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-black text-black"
        >
          Back to Technician Login
        </button>
      </div>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-5 md:p-6">
      <p className="text-sm text-cyan-100/45">{label}</p>
      <h3 className="mt-3 text-3xl font-black md:text-4xl">{value}</h3>
    </div>
  )
}

function Badge({ children, type }) {
  const style =
    type === "Urgent"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : type === "High"
        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
        : type === "Accepted" ||
            type === "Completed" ||
            type === "Paid" ||
            type === "Service Started" ||
            type === "Arrived"
          ? "border-green-500/20 bg-green-500/10 text-green-300"
          : type === "On The Way"
            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
            : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"

  return (
    <span className={`rounded-xl border px-3 py-2 text-xs md:px-4 md:text-sm ${style}`}>
      {children}
    </span>
  )
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-5">
      <Icon className="h-6 w-6 text-cyan-300" />
      <p className="mt-4 text-sm text-cyan-100/40">{label}</p>
      <p className="mt-1 truncate font-black">{value}</p>
    </div>
  )
}

function EmptyCard({ title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-8 text-center">
      <BriefcaseBusiness className="mx-auto h-10 w-10 text-cyan-300/60" />
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm text-cyan-100/45">{text}</p>
    </div>
  )
}