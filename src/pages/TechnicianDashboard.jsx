import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Capacitor } from "@capacitor/core"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import BrandLogo from "../components/common/BrandLogo"
import StatusToast from "../components/ui/StatusToast"
import DashboardLoader from "../components/ui/DashboardLoader"
import {
  getTechnicianBookings,
  getTechnicianNotifications,
  getTechnicianProfile,
  getTechnicianProfilePhoto,
  updateTechnicianAvailability,
  acceptTechnicianJob,
  rejectTechnicianJob,
  technicianOnTheWay,
  markTechnicianArrived,
  startTechnicianService,
  saveRemoteMeetingLink,
  completeTechnicianService,
} from "../services/technicianService"
import useLiveTechnicianLocation from "../hooks/useLiveTechnicianLocation"
import { hasNativeTechnicianTracking } from "../services/technicianTrackingService"
import { markAllNotificationsAsRead, markNotificationAsRead } from "../services/notificationService"
import { apiRequest } from "../services/api"
import { formatLocalDateTime } from "../utils/dateTime"
import { safeNotificationPath } from "../utils/notificationRoute"
import { normalizeNotifications } from "../utils/notifications"
import { classifyTechnicianBooking, normalizeBookingStatus, TECHNICIAN_ACTIVE_STATUSES, TECHNICIAN_DECISION_STATUSES } from "../utils/technicianJobs"
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
  RefreshCw,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
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
  REMAINING_PAYMENT_PENDING: "Awaiting Customer Payment",
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
  const bookingStatus = normalizeBookingStatus(booking)

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
      bookingStatus === "PENDING" ||
      bookingStatus === "ASSIGNMENT_PENDING"
        ? "High"
        : "Medium",
    status: statusToLabel[bookingStatus] || bookingStatus.replaceAll("_", " "),
    bookingStatus,
    bookingTimezone: booking.bookingTimezone || booking.timezone || booking.timeZone,
    country: booking.country,
    state: booking.state,
    customerLatitude: booking.customerLatitude,
    customerLongitude: booking.customerLongitude,
    supportType,
    paymentStatus: booking.paymentStatus || "PENDING",
    currency: getCurrencySymbol(booking.currency),
    amountPaid: Number(booking.paidAmount || booking.paymentAmount || 0).toFixed(2),
    platformFee: Number(booking.platformFee || 0).toFixed(2),
    serviceAmount: Number(booking.baseAmount || 0).toFixed(2),
    remainingAmount: Number(booking.remainingAmount || 0).toFixed(2),
    sessionId: `GOS-RM-${booking.id}`,
    remoteMeetingLink: booking.remoteSessionLink || "",
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
  const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

  const [activeTab, setActiveTab] = useState(() => {
    const view = new URLSearchParams(window.location.search).get("view")
    if (["jobs", "assigned"].includes(view)) return "Assigned Jobs"
    if (view === "active") return "Active Work"
    if (view === "completed") return "Completed Jobs"
    if (view === "notifications") return "Notifications"
    return "Dashboard"
  })
  const [availability, setAvailability] = useState("Offline")
  const [technicianProfile, setTechnicianProfile] = useState(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("")
  const [popup, setPopup] = useState("")
  const [mobileMenu, setMobileMenu] = useState(false)
  const [jobs, setJobs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTrackingJobId, setActiveTrackingJobId] = useState(null)
  const [journeyDisclosureJob, setJourneyDisclosureJob] = useState(null)
  const [meetingLink, setMeetingLink] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [notificationsMuted, setNotificationsMuted] = useState(() => localStorage.getItem("gos_technician_notifications_muted") === "true")
  const [notificationRefreshing, setNotificationRefreshing] = useState(false)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [rejectJob, setRejectJob] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const knownNotificationIds = useRef(new Set())
  const popupTimer = useRef(null)

  const technicianStatus = "APPROVED"
  const technicianName = user?.fullName || "Technician"
  const technicianPersonalEmail = user?.email || ""
  const technicianGosEmail = user?.email || ""

  const technicianState = {
    name: technicianName,
    role: "Senior GeekOnSites Technician",
    phone: technicianProfile?.phone || "",
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

  useEffect(() => () => {
    if (profilePhotoUrl) URL.revokeObjectURL(profilePhotoUrl)
  }, [profilePhotoUrl])

  const showPopup = (text) => {
    setPopup(text)
    if (popupTimer.current) window.clearTimeout(popupTimer.current)
    popupTimer.current = window.setTimeout(() => setPopup(""), 4500)
  }

  const loadTechnicianNotifications = async () => {
    try {
      setNotificationRefreshing(true)
      const data = await getTechnicianNotifications()
      setNotifications((previous) => {
        const next = normalizeNotifications(data, previous)
        if (!notificationsMuted && knownNotificationIds.current.size && next.some((item) => !item.isRead && !knownNotificationIds.current.has(String(item.id)))) showPopup("New job update received")
        knownNotificationIds.current = new Set(next.map((item) => String(item.id)))
        return next
      })
    } catch (error) {
      console.error(error)
    } finally {
      setNotificationRefreshing(false)
    }
  }

  const readNotification = async (notification) => {
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true, isRead: true } : item))
    if (!notification.isRead) {
      try { await markNotificationAsRead(notification.id) } catch { loadTechnicianNotifications() }
    }
    const assignmentAlert = notification.bookingId && /assign|booking|job/i.test(`${notification.type || ""} ${notification.title || ""}`)
    if (assignmentAlert) {
      await refreshJobs()
      setSearchTerm(`GOS-${notification.bookingId}`)
      openTab("Assigned Jobs")
      navigate(`/technician-dashboard?view=jobs&bookingId=${encodeURIComponent(notification.bookingId)}`, { replace: true })
      return
    }
    navigate(safeNotificationPath(notification.actionUrl, "TECHNICIAN"))
  }

  const readAllNotifications = async () => {
    await markAllNotificationsAsRead()
    setNotifications((items) => items.map((item) => ({ ...item, read: true, isRead: true })))
  }

  const toggleNotificationsMuted = () => {
    const next = !notificationsMuted
    setNotificationsMuted(next)
    localStorage.setItem("gos_technician_notifications_muted", String(next))
  }

  useEffect(() => {
    const refreshWhenVisible = () => document.visibilityState === "visible" && loadTechnicianNotifications()
    const interval = window.setInterval(loadTechnicianNotifications, 30000)
    window.addEventListener("gos:push-received", loadTechnicianNotifications)
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("gos:push-received", loadTechnicianNotifications)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [notificationsMuted])

  const loadTechnicianBookings = async () => {
    try {
      setLoading(true)

      const data = await getTechnicianBookings()
      const mappedJobs = Array.isArray(data) ? data.map(mapBookingToJob) : []
      setJobs(mappedJobs)
      const activeJourney = mappedJobs.find(
        (job) => job.supportType === "onsite" && job.bookingStatus === "TECHNICIAN_ON_THE_WAY"
      )
      setActiveTrackingJobId(activeJourney?.bookingId ?? null)

      const profile = await getTechnicianProfile()
      setTechnicianProfile(profile)
      try {
        const photoUrl = await getTechnicianProfilePhoto()
        setProfilePhotoUrl(photoUrl)
      } catch (error) {
        console.error(error)
      }
      setAvailability(
        profile?.availabilityStatus === "UNAVAILABLE"
          ? "Offline"
          : profile?.availabilityStatus === "BUSY"
            ? "Busy"
            : "Available"
      )

      try {
        const notificationData = await getTechnicianNotifications()
        setNotifications((previous) => normalizeNotifications(notificationData, previous))
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

  const changeAvailability = async (nextAvailability) => {
    try {
      setAvailabilitySaving(true)
      const profile = await updateTechnicianAvailability(
        nextAvailability === "Available"
          ? "AVAILABLE"
          : nextAvailability === "Busy"
            ? "BUSY"
            : "UNAVAILABLE"
      )
      setTechnicianProfile(profile)
      setAvailability(nextAvailability)
      showPopup(`Status changed to ${nextAvailability}`)
    } catch (error) {
      showPopup(error.message || "Could not change availability")
    } finally {
      setAvailabilitySaving(false)
    }
  }

  const refreshJobs = async () => {
    const data = await getTechnicianBookings()
    const mappedJobs = Array.isArray(data) ? data.map(mapBookingToJob) : []
    setJobs(mappedJobs)
    const activeJourney = mappedJobs.find(
      (job) => job.supportType === "onsite" && job.bookingStatus === "TECHNICIAN_ON_THE_WAY"
    )
    setActiveTrackingJobId(activeJourney?.bookingId ?? null)
  }

  useEffect(() => {
    const refreshOperationalData = () => {
      if (document.visibilityState === "visible") refreshJobs().catch((error) => console.error("Technician jobs could not be refreshed", error))
    }
    const timer = window.setInterval(refreshOperationalData, 15000)
    const openPushBooking = (event) => {
      const bookingId = event.detail?.bookingId
      if (bookingId) setSearchTerm(`GOS-${bookingId}`)
      setActiveTab(event.detail?.view === "active" ? "Active Work" : "Assigned Jobs")
      refreshOperationalData()
    }
    window.addEventListener("gos:push-received", refreshOperationalData)
    window.addEventListener("gos:technician-booking-open", openPushBooking)
    document.addEventListener("visibilitychange", refreshOperationalData)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("gos:push-received", refreshOperationalData)
      window.removeEventListener("gos:technician-booking-open", openPushBooking)
      document.removeEventListener("visibilitychange", refreshOperationalData)
    }
  }, [])

  const openTab = (tab) => {
    setActiveTab(tab)
    setSearchTerm("")
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
    navigate(`/remote-session?bookingId=${encodeURIComponent(job.bookingId)}`, {
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
          technicianPhone: technicianState.phone,
          rating: "N/A",
          status: job.status,
        },
      },
    })
  }

  const handleAcceptJob = async (job) => {
    try {
      const updated = await acceptTechnicianJob(job.bookingId)
      setJobs((current) => current.map((item) => String(item.bookingId) === String(job.bookingId) ? mapBookingToJob(updated || { ...item.raw, bookingStatus: "TECHNICIAN_ACCEPTED" }) : item))
      setActiveTab("Active Work")
      await refreshJobs()
      showPopup("Job accepted. Customer notified.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to accept job.")
    }
  }

  const handleRejectJob = (job) => {
    setRejectJob(job)
    setRejectReason("")
  }

  const confirmRejectJob = async () => {
    const reason = rejectReason.trim()
    if (!rejectJob || !reason || rejecting) return
    try {
      setRejecting(true)
      await rejectTechnicianJob(rejectJob.bookingId, reason)
      setJobs((current) => current.filter((item) => String(item.bookingId) !== String(rejectJob.bookingId)))
      setRejectJob(null)
      setRejectReason("")
      await refreshJobs()
      showPopup("Job rejected. Customer will be reassigned.")
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to reject job.")
    } finally {
      setRejecting(false)
    }
  }

  const beginJourney = async (job) => {
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

  // On native Android, foreground location tracking is about to start, so
  // this is shown as a proper in-app dialog instead of a browser
  // window.confirm(). On web there is no native foreground tracking to
  // disclose, so behavior there is unchanged: start immediately.
  const handleStartJourney = (job) => {
    if (hasNativeTechnicianTracking()) {
      setJourneyDisclosureJob(job)
      return
    }
    beginJourney(job)
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
    openRemoteSession(job)
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
          sessionDuration: job.raw?.sessionDuration || "N/A",
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

  const filteredJobs = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return jobs

    return jobs.filter((job) => [
      job.bookingId,
      `GOS-${job.bookingId}`,
      job.customerName,
      job.customerEmail,
      job.customerPhone,
      job.serviceType,
      job.status,
      job.bookingStatus,
      job.supportType,
      job.raw?.city,
      job.raw?.postalCode,
    ].some((value) => String(value || "").toLowerCase().includes(keyword)))
  }, [jobs, searchTerm])

  const unreadNotificationCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  )

  const serviceMode = technicianProfile?.serviceMode || "REMOTE_AND_ONSITE"
  const canWorkRemote = serviceMode === "REMOTE_ONLY" || serviceMode === "REMOTE_AND_ONSITE"
  const canWorkOnsite = serviceMode === "ONSITE_ONLY" || serviceMode === "REMOTE_AND_ONSITE"
  const availabilityStyle = availability === "Available"
    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
    : availability === "Busy"
      ? "border-amber-300 bg-amber-50 text-amber-800"
      : "border-slate-300 bg-slate-100 text-slate-700"

  const sidebar = [
    { title: "Dashboard", icon: LayoutDashboard },
    { title: "Assigned Jobs", icon: BriefcaseBusiness },
    ...(canWorkRemote ? [{ title: "Remote Services", icon: Laptop }, { title: "Remote Sessions", icon: Monitor }] : []),
    ...(canWorkOnsite ? [{ title: "On-site Services", icon: MapPinned }] : []),
    { title: "Customers", icon: Users },
    { title: "Earnings", icon: DollarSign },
    { title: "Ratings", icon: Star },
    { title: "Notifications", icon: Bell },
    { title: "Completed Jobs", icon: CheckCircle2 },
    { title: "Profile", icon: User },
    { title: "Settings", icon: Settings },
  ]

  const mobileTabs = [
    { title: "Dashboard", label: "Home", icon: LayoutDashboard },
    { title: "Assigned Jobs", label: "Jobs", icon: BriefcaseBusiness },
    { title: "Active Work", label: "Active", icon: Navigation },
    { title: "Notifications", label: "Updates", icon: Bell },
    { title: "Profile", label: "Profile", icon: User },
  ]
  const activeOnsiteJob = jobs.find((job) => job.supportType === "onsite" && ["TECHNICIAN_ACCEPTED", "TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED"].includes(job.bookingStatus))

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
      <DashboardLoader technician />
    )
  }

  const JobsSection = ({ mode = "all", title = "Assigned Jobs", statuses = null } = {}) => {
    const visibleJobs = filteredJobs.filter((job) => (mode === "all" || job.supportType === mode) && (!statuses || statuses.includes(job.bookingStatus)))
    return (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black md:text-2xl">{title}</h2>
          <p className="mt-2 text-sm text-cyan-100/50 md:text-base">
            Accept jobs, start journeys, confirm arrival, begin service, and complete requests.
          </p>
        </div>

        <span className="w-fit rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
          {visibleJobs.filter((job) => job.status === "New").length} New Requests
        </span>
      </div>

      <div className="space-y-5">
        {visibleJobs.length ? (
          visibleJobs.map((job) => (
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
            title={searchTerm ? "No matching jobs" : `No ${title.toLowerCase()}`}
            text={searchTerm ? "Try a different customer, service, status, or booking reference." : `${title} assigned to you will appear here.`}
          />
        )}
      </div>
    </section>
  )}

  const RemoteSessionsSection = () => {
    const remoteJobs = filteredJobs.filter((job) => job.supportType === "remote")

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

  const ServicesSection = ({ mode }) => {
    const selectedServices = String(technicianProfile?.specialization || "")
      .split(",")
      .map((service) => service.trim())
      .filter(Boolean)
    const isRemote = mode === "remote"

    return (
      <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-300">Approved capability</p>
          <h2 className="mt-2 text-xl font-black md:text-2xl">{isRemote ? "Remote Services" : "On-site Services"}</h2>
          <p className="mt-2 text-sm text-cyan-100/50">
            Services approved from your technician application for {isRemote ? "secure remote support" : "customer-site visits"}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {selectedServices.map((service) => (
            <div key={`${mode}-${service}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                {isRemote ? <Monitor size={19} /> : <MapPin size={19} />}
              </span>
              <div className="min-w-0">
                <h3 className="font-black">{service}</h3>
                <p className="mt-1 text-xs text-cyan-100/45">{isRemote ? "Remote" : "On-site"} approved</p>
              </div>
            </div>
          ))}
        </div>

        {!selectedServices.length && <EmptyCard title="No approved services" text="Your approved service skills will appear here." />}
      </section>
    )
  }

  const CustomersSection = () => (
    <section className="rounded-[28px] border border-cyan-500/10 bg-[#071122] p-4 md:rounded-[32px] md:p-7">
      <h2 className="mb-6 text-xl font-black md:text-2xl">Customers</h2>

      <div className="space-y-4">
        {filteredJobs.length ? (
          filteredJobs.map((job) => (
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
            title={searchTerm ? "No matching customers" : "No customers yet"}
            text={searchTerm ? "Try a different name, email, phone number, or booking reference." : "Customers from assigned jobs will appear here."}
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

        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={toggleNotificationsMuted} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] text-cyan-300" aria-label={notificationsMuted ? "Enable notification sounds" : "Mute notification sounds"}>{notificationsMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          <button onClick={loadTechnicianNotifications} disabled={notificationRefreshing} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1628] text-cyan-300 disabled:opacity-50" aria-label="Refresh notifications"><RefreshCw size={18} className={notificationRefreshing ? "animate-spin" : ""} /></button>
          {unreadNotificationCount > 0 && <button onClick={readAllNotifications} className="min-h-11 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 text-xs font-black text-cyan-200">Mark all read</button>}
        </div>
      </div>

      {notifications.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {notifications.map((notification) => (
            <button type="button" onClick={() => readNotification(notification)}
              key={notification.id}
              className={`relative flex w-full gap-3 border-b border-slate-200 px-3 py-3 text-left text-slate-900 transition last:border-b-0 hover:bg-slate-50 ${notification.isRead ? "bg-white" : "bg-cyan-50"}`}
            >
              {!notification.isRead && <span className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500" />}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50">
                <Bell className="h-4 w-4 text-cyan-700" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-sm font-black text-slate-900">{notification.title || "Notification"}</h3>

                  <p className="text-[10px] font-semibold text-slate-500">
                    {notification.createdAt ? formatLocalDateTime(
                      notification.createdAt,
                      jobs.find((job) => String(job.bookingId) === String(notification.bookingId)) || notification
                    ) : ""}
                  </p>
                </div>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                  {notification.message || ""}
                </p>
              </div>
            </button>
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
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt={`${technicianName} profile`} className="mx-auto h-24 w-24 rounded-full border-2 border-cyan-500/20 object-cover" />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10 text-4xl font-black text-cyan-300">
              {technicianName?.charAt(0)?.toUpperCase() || "T"}
            </div>
          )}

          <h3 className="mt-5 text-xl font-black">{technicianName}</h3>
          <p className="mt-1 text-cyan-100/50">Approved GOS Technician</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0b1628] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              ["Technician ID", technicianProfile?.id ? `GOS-T-${technicianProfile.id}` : null],
              ["Email", technicianPersonalEmail],
              ["Phone", technicianProfile?.phone],
              ["Location", [technicianProfile?.city, technicianProfile?.country].filter(Boolean).join(", ")],
              ["Verification", technicianProfile?.verificationStatus],
              ["Service mode", technicianProfile?.serviceMode === "REMOTE_ONLY" ? "Remote only" : "Remote & on-site"],
              ["Services", technicianProfile?.specialization],
              ["Rating", technicianProfile?.rating || "New"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-cyan-100/40">{label}</p>
                <p className="mt-1 break-words font-black">{value || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isNativeAndroid && <TechnicianChangePassword />}

      <button type="button" onClick={() => { logoutCustomer(); navigate("/technician-login", { replace: true }) }} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 text-sm font-black text-red-300"><LogOut size={17} /> Logout</button>
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

  const firstName = technicianName.trim().split(/\s+/)[0] || "there"
  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  })()
  const activeRemoteJob = jobs.find((job) => job.supportType === "remote" && job.remoteMeetingLink && ["TECHNICIAN_ACCEPTED", "REMOTE_SESSION_STARTED"].includes(job.bookingStatus))
  const nextAssignedJobs = jobs.filter((job) => job.status === "New").slice(0, 3)
  const journeyAction = (job) => {
    if (job.bookingStatus === "TECHNICIAN_ACCEPTED") return { label: "Start Journey", icon: Navigation, run: () => handleStartJourney(job) }
    if (job.bookingStatus === "TECHNICIAN_ON_THE_WAY") return { label: "I Have Arrived", icon: MapPin, run: () => handleArrived(job) }
    if (job.bookingStatus === "TECHNICIAN_ARRIVED") return { label: "Start Service", icon: Wrench, run: () => handleStartService(job) }
    if (job.bookingStatus === "SERVICE_STARTED") return { label: "Complete Service", icon: CheckCircle2, run: () => handleCompleteJob(job) }
    return null
  }

  const ActiveJobCard = ({ job }) => {
    const action = journeyAction(job)
    return (
      <div className="rounded-[24px] border border-cyan-500/20 bg-[#071122] p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-300">Active On-site Job</span>
          <span className="text-[10px] font-black uppercase tracking-wide text-cyan-100/40">{job.status}</span>
        </div>
        <h3 className="mt-3 text-lg font-black text-white">{job.customerName}</h3>
        <p className="mt-1 text-sm text-cyan-100/60">{job.serviceType}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-cyan-100/50"><MapPin size={13} className="shrink-0 text-cyan-300" />{job.location}</p>
        {job.bookingStatus === "TECHNICIAN_ON_THE_WAY" && (
          <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />Your location is being shared with the customer.</p>
        )}
        {action && <button type="button" onClick={action.run} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-black text-black"><action.icon size={17} />{action.label}</button>}
      </div>
    )
  }

  const RemoteActiveCard = () => (
    <div className="rounded-[24px] border border-cyan-500/20 bg-[#071122] p-5">
      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-300">Remote Support</span>
      <h3 className="mt-3 text-lg font-black text-white">{activeRemoteJob.customerName}</h3>
      <p className="mt-1 text-sm text-cyan-100/60">{activeRemoteJob.serviceType}</p>
      <button type="button" onClick={() => handleStartRemoteSession(activeRemoteJob)} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-black text-black"><Video size={17} /> Open Remote Session</button>
    </div>
  )

  const EmptyActiveCard = () => (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-[#071122] p-8 text-center">
      <p className="text-base font-black text-white">No active service</p>
      <p className="mt-2 text-sm text-cyan-100/45">Your accepted or in-progress jobs will appear here.</p>
    </div>
  )

  const PremiumHomeSection = () => {
    const currentJob = jobs.find((job) => ["TECHNICIAN_ACCEPTED", "TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED", "REMOTE_SESSION_STARTED"].includes(job.bookingStatus)) || jobs.find((job) => job.status === "New")
    const activeCount = jobs.filter((job) => classifyTechnicianBooking(job) === "active").length
    const serviceModeLabel = serviceMode === "REMOTE_ONLY" ? "Remote only" : serviceMode === "ONSITE_ONLY" ? "On-site only" : "Remote + on-site"
    return <div className="mx-auto max-w-5xl space-y-4 text-slate-900">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold text-slate-500">{greeting}</p><h1 className="truncate text-xl font-black text-[#071d3d]">{firstName}</h1><p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">{serviceModeLabel}</p></div><button type="button" onClick={() => openTab("Notifications")} className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-700" aria-label={`Updates, ${unreadNotificationCount} unread`}><Bell size={18} />{unreadNotificationCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span>}</button></div>
        <div className="mt-4"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-black text-[#071d3d]">Availability</p><p aria-live="polite" className="text-[10px] font-bold text-slate-500">{availabilitySaving ? "Saving…" : `${availability} · synced`}</p></div><div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" aria-label="Technician availability">{["Available", "Busy", "Offline"].map((item) => <button key={item} type="button" disabled={availabilitySaving} aria-pressed={availability === item} onClick={() => changeAvailability(item)} className={`min-h-10 rounded-lg border px-1 text-xs font-black transition disabled:opacity-60 ${availability === item ? item === "Available" ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : item === "Busy" ? "border-amber-500 bg-amber-500 text-white shadow-sm" : "border-slate-400 bg-slate-200 text-slate-800 shadow-sm" : "border-transparent bg-white text-slate-600"}`}>{item}</button>)}</div><p className="mt-2 text-[10px] leading-4 text-slate-500">Only Available technicians can be selected by an agent for a new assignment.</p></div>
      </section>
      <section className="grid grid-cols-2 gap-2" aria-label="Work summary">{[["Assigned", jobs.filter((job) => classifyTechnicianBooking(job) === "jobs").length, BriefcaseBusiness], ["Active", activeCount, Activity], ["Completed", jobs.filter((job) => classifyTechnicianBooking(job) === "completed").length, CheckCircle2], ["Unread", unreadNotificationCount, Bell]].map(([label, value, Icon]) => <button type="button" onClick={() => openTab(label === "Unread" ? "Notifications" : label === "Active" ? "Active Work" : label === "Completed" ? "Completed Jobs" : "Assigned Jobs")} key={label} className="flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700"><Icon size={17} /></span><span><strong className="block text-xl leading-none text-[#071d3d]">{value}</strong><span className="mt-1 block text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{label}</span></span></button>)}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="text-sm font-black text-[#071d3d]">{currentJob?.status === "New" ? "Next job" : "Current job"}</h2>{currentJob && <span className="rounded-full bg-cyan-50 px-2 py-1 text-[9px] font-black uppercase text-cyan-700">{currentJob.supportType === "remote" ? "Remote" : "On-site"}</span>}</div>
        {currentJob ? <div className="mt-3"><p className="text-[10px] font-black uppercase tracking-wide text-slate-500">GOS-{currentJob.bookingId} · {currentJob.status}</p><h3 className="mt-1 break-words text-base font-black text-[#071d3d]">{currentJob.serviceType}</h3><p className="mt-1 break-words text-xs text-slate-600">{currentJob.schedule}</p>{currentJob.supportType === "onsite" && <p className="mt-1 flex items-start gap-1 break-words text-xs text-slate-600"><MapPin size={13} className="mt-0.5 shrink-0" />{currentJob.location}</p>}<div className="mt-4 grid grid-cols-2 gap-2">{currentJob.status === "New" ? <><button type="button" onClick={() => handleRejectJob(currentJob)} className="min-h-10 rounded-lg bg-red-600 px-3 text-xs font-black text-white disabled:bg-red-300">Reject</button><button type="button" onClick={() => handleAcceptJob(currentJob)} className="min-h-10 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white disabled:bg-emerald-300">Accept Service</button></> : currentJob.supportType === "remote" ? <button type="button" onClick={() => handleStartRemoteSession(currentJob)} className="col-span-2 min-h-10 rounded-lg bg-emerald-600 px-4 text-xs font-black text-white">Open remote session</button> : <button type="button" onClick={() => currentJob.bookingStatus === "TECHNICIAN_ACCEPTED" ? handleStartJourney(currentJob) : openTab("Active Work")} className="col-span-2 min-h-11 rounded-xl bg-cyan-600 text-xs font-black text-white">{currentJob.bookingStatus === "TECHNICIAN_ACCEPTED" ? "On the way" : "Open active job"}</button>}</div></div> : <div className="py-7 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={28} /><p className="mt-2 text-sm font-black text-[#071d3d]">You’re all caught up</p><p className="mt-1 text-xs text-slate-500">New assigned jobs will appear here.</p></div>}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-black text-[#071d3d]">Quick actions</h2><div className="mt-3 grid grid-cols-4 gap-2">{[["Jobs", BriefcaseBusiness, "Assigned Jobs"], ["Active", Navigation, "Active Work"], ["Updates", Bell, "Notifications"], ["Profile", User, "Profile"]].map(([label, Icon, tab]) => <button key={label} type="button" onClick={() => openTab(tab)} className="min-w-0 rounded-xl bg-slate-50 px-1 py-3 text-center text-[10px] font-black text-[#071d3d]"><span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-cyan-700 shadow-sm"><Icon size={16} /></span>{label}</button>)}</div></section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><h2 className="text-sm font-black text-[#071d3d]">Recent updates</h2><button type="button" onClick={() => openTab("Notifications")} className="text-xs font-black text-cyan-700">View all</button></div>{notifications.slice(0, 3).map((notification) => <button key={notification.id} type="button" onClick={() => readNotification(notification)} className={`relative flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 ${notification.isRead ? "bg-white" : "bg-cyan-50"}`}>{!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-600" />}<span className="min-w-0 flex-1"><strong className="block truncate text-xs font-black text-[#071d3d]">{notification.title || "Job update"}</strong><span className="mt-0.5 block truncate text-[11px] text-slate-500">{notification.message || "Your work queue has been updated."}</span></span><ArrowRight size={14} className="shrink-0 text-slate-400" /></button>)}{!notifications.length && <div className="px-4 py-7 text-center text-xs font-semibold text-slate-500">No recent updates. New booking activity will appear here.</div>}</section>
    </div>
  }

  const HomeSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-cyan-100/60">{greeting}, {firstName}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Approved</span>
            <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-300">{availability}</span>
          </div>
        </div>
        <button type="button" onClick={() => openTab("Notifications")} className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0b1628] text-cyan-300" aria-label="Notifications">
          <Bell size={18} />
          {notifications.some((item) => !item.read) && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />}
        </button>
      </div>

      {activeOnsiteJob ? <ActiveJobCard job={activeOnsiteJob} /> : activeRemoteJob ? <RemoteActiveCard /> : <EmptyActiveCard />}

      <div className="grid grid-cols-4 gap-2">
        {[
          ["Assigned", jobs.length],
          ["Active", jobs.filter((job) => !["Completed", "Rejected"].includes(job.status)).length],
          ["Completed", jobs.filter((job) => job.status === "Completed").length],
          ["Remote", jobs.filter((job) => job.supportType === "remote").length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-[#0b1628] p-3 text-center">
            <p className="text-lg font-black text-white">{value}</p>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-cyan-100/40">{label}</p>
          </div>
        ))}
      </div>

      {nextAssignedJobs.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-black text-white">Next assigned jobs</h3><button type="button" onClick={() => openTab("Assigned Jobs")} className="text-xs font-bold text-cyan-300">View all</button></div>
          <div className="space-y-2">
            {nextAssignedJobs.map((job) => (
              <div key={job.bookingId} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-3.5">
                <div className="min-w-0"><p className="truncate text-sm font-bold text-white">{job.customerName}</p><p className="truncate text-xs text-cyan-100/45">{job.serviceType} · {job.supportType === "remote" ? "Remote" : "On-site"}</p></div>
                <span className="shrink-0 rounded-full bg-cyan-500/10 px-2.5 py-1 text-[9px] font-black uppercase text-cyan-300">{job.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const ActiveWorkSection = () => <JobsSection title="Active Work" statuses={TECHNICIAN_ACTIVE_STATUSES} />

  const CompletedJobsSection = () => {
    const completed = filteredJobs.filter((job) => classifyTechnicianBooking(job) === "completed")
    return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"><div className="border-b border-slate-200 px-4 py-4"><h2 className="text-lg font-black text-[#071d3d]">Completed Jobs</h2><p className="mt-1 text-xs text-slate-500">Your persisted technician service history.</p></div>{completed.map((job) => <button key={job.bookingId} type="button" onClick={() => navigate(`/session-summary?bookingId=${encodeURIComponent(job.bookingId)}`, { state: { booking: job.raw } })} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left last:border-0 hover:bg-slate-50"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={18} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#071d3d]">GOS-{job.bookingId} · {job.serviceType}</strong><span className="mt-1 block truncate text-xs text-slate-500">{job.customerName} · {job.supportType === "remote" ? "Remote" : "On-site"} · {job.paymentStatus}</span></span><span className="text-[10px] font-black text-cyan-700">View Details</span></button>)}{!completed.length && <div className="px-5 py-12 text-center text-sm font-semibold text-slate-500">Completed services will appear here after the backend confirms completion.</div>}</section>
  }

  // Keep the legacy desktop composition available while the mobile-first Home
  // is used for the Dashboard tab.
  void HomeSection

  const renderContent = () => {
    if (activeTab === "Dashboard") return <PremiumHomeSection />
    if (activeTab === "Active Work") return <ActiveWorkSection />
    if (activeTab === "Assigned Jobs") return <JobsSection statuses={TECHNICIAN_DECISION_STATUSES} />
    if (activeTab === "Remote Services") return <ServicesSection mode="remote" />
    if (activeTab === "On-site Services") return <ServicesSection mode="onsite" />
    if (activeTab === "Remote Sessions") return <RemoteSessionsSection />
    if (activeTab === "Customers") return <CustomersSection />
    if (activeTab === "Earnings") return <EarningsSection />
    if (activeTab === "Ratings") return <RatingsSection />
    if (activeTab === "Notifications") return <NotificationsSection />
    if (activeTab === "Completed Jobs") return <CompletedJobsSection />
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
                    onClick={() => changeAvailability(item)}
                    className={`rounded-2xl border p-4 text-left ${
                      availability === item
                        ? "border-cyan-300 bg-cyan-400 font-black text-black"
                        : "border-white/10 bg-[#0b1628] text-white"
                    }`}
                  >
                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item === "Available" ? "bg-emerald-500" : item === "Busy" ? "bg-amber-500" : "bg-slate-400"}`} />
                    {item}
                    <span className="mt-1 block pl-4 text-xs font-medium opacity-70">
                      {item === "Available" ? "Ready for new assignments" : item === "Busy" ? "Working or temporarily occupied" : "Not accepting assignments"}
                    </span>
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
    <div className="gos-technician-portal flex h-screen w-full overflow-hidden bg-[#020817] text-white">
      <StatusToast message={popup} />

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

      {journeyDisclosureJob && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="journey-disclosure-title">
          <div className="w-full rounded-t-[24px] border-t border-cyan-500/20 bg-[#0b1628] p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-sm sm:rounded-[24px] sm:border">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300"><MapPin size={20} /></span>
              <h2 id="journey-disclosure-title" className="text-lg font-black text-white">Location sharing during your visit</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-cyan-100/70">GeekOnSites uses your precise location while you're travelling to an on-site customer so they can follow your arrival. Location sharing continues while the app is minimized or the screen is locked and stops when the journey ends.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setJourneyDisclosureJob(null)} className="min-h-12 flex-1 rounded-xl border border-white/10 text-sm font-extrabold text-cyan-100/70">Cancel</button>
              <button
                type="button"
                onClick={() => { const job = journeyDisclosureJob; setJourneyDisclosureJob(null); beginJourney(job) }}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-black text-black"
              >
                <Navigation size={16} /> Start Journey
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectJob && <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/55 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="reject-job-title"><div className="w-full rounded-t-2xl bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))] text-slate-900 shadow-2xl sm:max-w-md sm:rounded-2xl"><h2 id="reject-job-title" className="text-lg font-black text-[#071d3d]">Reject GOS-{rejectJob.bookingId}</h2><p className="mt-1 text-xs leading-5 text-slate-500">Tell the operations team why you cannot take this assignment.</p><textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} maxLength={500} autoFocus placeholder="Required rejection reason" className="mt-4 min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-red-500" /><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => { setRejectJob(null); setRejectReason("") }} disabled={rejecting} className="min-h-11 rounded-lg border border-slate-300 text-xs font-black text-slate-700">Cancel</button><button type="button" onClick={confirmRejectJob} disabled={!rejectReason.trim() || rejecting} className="min-h-11 rounded-lg bg-red-600 text-xs font-black text-white disabled:opacity-45">{rejecting ? "Rejecting..." : "Reject Job"}</button></div></div></div>}

      <aside className="hidden w-[300px] shrink-0 flex-col border-r border-cyan-500/20 bg-[#071122] p-6 lg:flex">
        <div className="mb-8">
          <BrandLogo className="h-auto w-48" />
          <p className="mt-2 text-sm text-cyan-100/50">
            Technician Command Center
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-3">
            {profilePhotoUrl ? <img src={profilePhotoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-black text-cyan-300">{technicianName?.charAt(0)?.toUpperCase() || "T"}</span>}
            <div className="min-w-0">
              <p className="text-xs text-cyan-100/40">Registered Email</p>
              <p className="mt-1 truncate text-sm font-semibold text-cyan-200">{technicianGosEmail}</p>
            </div>
          </div>
          <div className={`mt-3 flex items-center justify-between rounded-md border px-3 py-2 text-xs font-black ${availabilityStyle}`}>
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${availability === "Available" ? "bg-emerald-500" : availability === "Busy" ? "bg-amber-500" : "bg-slate-500"}`} />
              {availability}
            </span>
            <span className="font-semibold opacity-70">Work status</span>
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
              <BrandLogo className="h-auto w-40" />
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
        <div className="flex min-h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 pb-2 pt-[max(10px,env(safe-area-inset-top))] text-slate-900 md:min-h-[78px] md:px-6">
          <div className="min-w-0">
            <BrandLogo className="h-6 w-auto max-w-[125px]" />
            <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Technician Workspace · {activeTab}</p>
          </div>

          <div className="hidden w-full max-w-[360px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-5 py-3 md:flex">
            <Search className="h-5 w-5 text-cyan-100/40" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search jobs, customers..."
              className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-cyan-100/30"
            />
            {searchTerm && <button type="button" onClick={() => setSearchTerm("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-cyan-100/50 hover:text-white" aria-label="Clear search"><X size={16} /></button>}
          </div>

          <div className="flex items-center gap-3">
            <span className={`hidden items-center gap-2 rounded-md border px-3 py-2 text-xs font-black sm:flex ${availabilityStyle}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${availability === "Available" ? "bg-emerald-500" : availability === "Busy" ? "bg-amber-500" : "bg-slate-500"}`} />
              {availability}
            </span>
            <button
              onClick={() => openTab("Notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 md:h-11 md:w-11"
            >
              <Bell className="h-5 w-5 text-cyan-700" />
              {unreadNotificationCount > 0 && (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-cyan-400" />
              )}
            </button>

            <button
              onClick={() => setMobileMenu(true)}
              className="technician-secondary-menu flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5 text-cyan-700" />
            </button>
          </div>
        </div>

        <div className="border-b border-cyan-500/10 bg-[#071122]/60 px-4 py-3 md:hidden">
          <label className="flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-4">
            <Search className="h-5 w-5 shrink-0 text-cyan-100/40" />
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search jobs or customers" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-cyan-100/30" />
            {searchTerm && <button type="button" onClick={() => setSearchTerm("")} className="flex h-8 w-8 shrink-0 items-center justify-center text-cyan-100/50" aria-label="Clear search"><X size={16} /></button>}
          </label>
        </div>

        <div
          id="technician-main-content"
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 lg:pb-6"
        >
          {renderContent()}
        </div>
      </main>

      <nav className="technician-mobile-nav fixed bottom-0 left-0 right-0 z-40 border-t border-cyan-500/20 bg-[#071122]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
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
                <span className="text-[10px] leading-none">{item.label}</span>
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
    job.bookingStatus === "TECHNICIAN_ACCEPTED"
  const canArrive = !isRemote && job.bookingStatus === "TECHNICIAN_ON_THE_WAY"
  const canStartService =
    !isRemote &&
    job.bookingStatus === "TECHNICIAN_ARRIVED"
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
    job.bookingStatus === "TECHNICIAN_ACCEPTED"
  )
  
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm md:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
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
              <h3 className="text-base font-black text-[#071d3d] md:text-lg">
                {job.customerName}
              </h3>
              {isTrackingThisJob && (
                <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-black text-black">
                  LIVE GPS
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-600">
              {job.serviceType}
            </p>
            <p className="mt-1 text-xs text-cyan-300">#GOS-{job.bookingId}</p>

            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {!isRemote && <span className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>}
              <span className="flex items-center gap-2 text-slate-500">
                <Clock3 className="h-4 w-4" />
                {job.schedule}
              </span>
            </div>
          </div>
        </div>

        <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          {job.issueDescription}
        </p>

        {job.bookingStatus === "REMAINING_PAYMENT_PENDING" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">
            Service work is finished. Waiting for the customer to pay the remaining balance before this booking is marked completed.
          </div>
        )}

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

        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
          {canAccept && (
            <>
              <button
                onClick={onAccept}
                className="min-h-10 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700"
              >
                Accept Service
              </button>

              <button
                onClick={onReject}
                className="min-h-10 rounded-lg bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700 disabled:bg-red-300"
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
              className="min-h-10 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white"
            >
              {isRemote ? "Complete Remote Service" : "Complete Service"}
            </button>
          )}

          {canRemote && (
            <button
              onClick={onRemote}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-black text-white hover:bg-cyan-700"
            >
              Open Remote Session
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
            className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700"
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
            ["Registered Personal Email", "On File"],
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
            After approval, GeekOnSites will enable dashboard access for your
            registered personal email and allow agents to assign customer jobs.
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

function TechnicianChangePassword() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [visible, setVisible] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const updatePassword = (field) => (event) => {
    setPasswords((current) => ({ ...current, [field]: event.target.value }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return

    const { currentPassword, newPassword, confirmPassword } = passwords
    setError("")
    setSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.")
      return
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Confirm password must match the new password.")
      return
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current password.")
      return
    }

    setLoading(true)
    try {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setVisible({})
      setSuccess("Password changed successfully.")
    } catch (requestError) {
      setError(requestError?.message || "We couldn't change your password right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    ["currentPassword", "Current password", "current-password"],
    ["newPassword", "New password", "new-password"],
    ["confirmPassword", "Confirm new password", "new-password"],
  ]

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-[#0b1628] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
          <KeyRound size={20} />
        </span>
        <div>
          <h3 className="font-black text-white">Change Password</h3>
          <p className="mt-0.5 text-xs text-cyan-100/50">Update your technician account password securely.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        {fields.map(([field, label, autoComplete]) => (
          <label key={field} className="block">
            <span className="mb-2 block text-xs font-bold text-cyan-100/70">{label}</span>
            <span className="flex min-h-12 items-center rounded-2xl border border-white/10 bg-[#071122] px-4 focus-within:border-cyan-400/60">
              <input
                type={visible[field] ? "text" : "password"}
                value={passwords[field]}
                onChange={updatePassword(field)}
                autoComplete={autoComplete}
                required
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-cyan-100/25"
              />
              <button
                type="button"
                onClick={() => setVisible((current) => ({ ...current, [field]: !current[field] }))}
                className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center text-cyan-100/55"
                aria-label={visible[field] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
              >
                {visible[field] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
        ))}

        {error && <p role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{error}</p>}
        {success && <p role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Changing password...</> : "Change Password"}
        </button>
      </form>
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

