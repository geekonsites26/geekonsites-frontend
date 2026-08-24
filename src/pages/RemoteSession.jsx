import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Browser } from "@capacitor/browser"
import { Capacitor } from "@capacitor/core"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  FileText,
  FolderOpen,
  Laptop,
  MessageCircle,
  Phone,
  Power,
  Shield,
  Upload,
  Video,
  Wifi,
  X,
} from "lucide-react"
import { getBookingById, provisionRemoteSession } from "../services/bookingService"
import { getRemoteChatMessages, sendRemoteChatMessage } from "../services/remoteChatService"
import { formatLocalTime } from "../utils/dateTime"

export default function RemoteSession() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

  const storedBooking = (() => {
    try { return JSON.parse(localStorage.getItem("currentBooking")) } catch { return null }
  })()
  const [booking, setBooking] = useState(state?.booking || storedBooking)
  // The technician dashboard navigates here with `state.technician` set to the
  // TECHNICIAN'S OWN profile (for its own use elsewhere), not the customer's.
  // Reusing it unconditionally previously showed a technician viewer their own
  // name/phone as "the person you are meeting". Derive the counterparty from
  // the viewer's own role instead so each side always sees the other party.
  const viewerRole = String(localStorage.getItem("gos_role") || "CUSTOMER").toUpperCase()
  const isTechnicianViewer = viewerRole === "TECHNICIAN"
  const technician = isTechnicianViewer
    ? { name: booking?.customerName || "Customer", role: "Service customer", phone: booking?.customerPhone || "" }
    : (state?.technician || { name: booking?.technicianName || "GeekOnSites support team", role: "Verified remote support professional", phone: booking?.technicianPhone || "" })

  const [seconds, setSeconds] = useState(0)
  const [meetingJoined, setMeetingJoined] = useState(false)
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [provisioning, setProvisioning] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [chatError, setChatError] = useState("")
  const provisionAttempted = useRef(false)

  const [chat, setChat] = useState([])
  const currentRole = localStorage.getItem("gos_role") || "CUSTOMER"

  useEffect(() => {
    if (!meetingJoined) return undefined

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [meetingJoined])

  useEffect(() => {
    if (!booking?.id) return
    let active = true

    const refreshBooking = () => getBookingById(booking.id)
      .then((latest) => {
        if (!active) return
        setBooking(latest)
        localStorage.setItem("currentBooking", JSON.stringify(latest))
      })
      .catch(console.error)

    refreshBooking()
    const refreshTimer = setInterval(refreshBooking, 7000)

    return () => {
      active = false
      clearInterval(refreshTimer)
    }
  }, [booking?.id])

  useEffect(() => {
    if (!booking?.id || booking?.paymentStatus !== "PAID") return undefined
    let active = true
    const loadMessages = async () => {
      try {
        const messages = await getRemoteChatMessages(booking.id)
        if (active) {
          setChat(Array.isArray(messages) ? messages : [])
          setChatError("")
        }
      } catch (error) {
        if (active) setChatError(error.message || "Chat could not be refreshed.")
      }
    }
    loadMessages()
    const timer = window.setInterval(loadMessages, 4000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [booking?.id, booking?.paymentStatus])

  const prepareMeeting = async () => {
    if (!booking?.id || booking?.paymentStatus !== "PAID" || provisioning) return

    setProvisioning(true)
    try {
      const latest = await provisionRemoteSession(booking.id)
      setBooking(latest)
      localStorage.setItem("currentBooking", JSON.stringify(latest))
    } catch (error) {
      console.error("Meeting provisioning failed:", error)
    } finally {
      setProvisioning(false)
    }
  }

  useEffect(() => {
    if (
      booking?.id &&
      booking?.paymentStatus === "PAID" &&
      !booking?.remoteSessionLink &&
      !provisionAttempted.current
    ) {
      provisionAttempted.current = true
      prepareMeeting()
    }
  }, [booking?.id, booking?.paymentStatus, booking?.remoteSessionLink])

  const sessionTime = useMemo(() => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0")
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
    const secs = String(seconds % 60).padStart(2, "0")
    return `${hrs}:${mins}:${secs}`
  }, [seconds])

  const workNotes = [
    "Video meeting ready for customer and technician",
    "Customer issue details shared with technician",
    "Session activity will be recorded in booking history",
  ]

  const paymentRequired = booking?.paymentStatus !== "PAID"
  const meetingPending = paymentRequired || !booking?.remoteSessionLink || booking?.remoteSessionStatus !== "READY"
  const meetingFailed = ["FAILED", "SETUP_REQUIRED", "PROVISIONING_FAILED"].includes(booking?.remoteSessionStatus)
  const meetingStatusLabel = paymentRequired
    ? "Payment Required"
    : meetingFailed
      ? "Meeting Needs Attention"
      : meetingPending
        ? "Preparing Meeting"
        : "Meeting Ready"

  const joinMeeting = async () => {
    if (paymentRequired) {
      // Only the customer can pay; a technician viewing an unpaid booking has
      // nothing to complete here and must wait for the customer instead.
      if (!isTechnicianViewer) navigate("/payment", { state: { booking } })
      return
    }

    if (meetingPending) {
      return
    }

    setMeetingJoined(true)
    try {
      await Browser.open({ url: booking.remoteSessionLink })
    } catch (error) {
      console.error("Unable to open Google Meet externally:", error)
      window.location.href = booking.remoteSessionLink
    }
  }

  const copyMeetingLink = async () => {
    if (paymentRequired || meetingPending) {
      alert("Meeting link is not ready yet.")
      return
    }

    await navigator.clipboard.writeText(booking.remoteSessionLink)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1800)
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    setUploadedFiles((prev) => [...prev, ...files])
    event.target.value = ""
  }

  const removeUploadedFile = (indexToRemove) => {
    setUploadedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    )
  }

  const sendMessage = async () => {
    const text = message.trim()
    if (!text || chatSending || paymentRequired) return
    try {
      setChatSending(true)
      setChatError("")
      const saved = await sendRemoteChatMessage(booking.id, text)
      setChat((previous) => previous.some((item) => item.id === saved.id) ? previous : [...previous, saved])
      setMessage("")
    } catch (error) {
      setChatError(error.message || "Message was not sent. Please retry.")
    } finally {
      setChatSending(false)
    }
  }

  const endSession = () => {
    navigate("/session-summary", {
      state: {
        booking,
        technician,
        sessionDuration: sessionTime,
        meetingJoined,
        workPerformed: workNotes,
        uploadedFiles: uploadedFiles.map((file) => file.name),
      },
    })
  }

  const goToMeetingPanel = () => {
    document.getElementById("google-meet-panel")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  if (!booking) {
    return <main className="flex min-h-screen items-center justify-center bg-gos-off-white px-4 pt-20"><div className="w-full max-w-md rounded-lg border border-gos-border bg-white p-7 text-center shadow-[var(--gos-shadow-md)]"><h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">Remote booking unavailable.</h1><p className="mt-3 text-sm font-semibold text-gos-muted">Open the remote session from your customer dashboard after payment is confirmed.</p><button type="button" onClick={() => navigate("/customer-dashboard?view=bookings")} className="mt-6 min-h-11 rounded-md bg-gos-blue-deep px-5 text-sm font-extrabold text-white">View my bookings</button></div></main>
  }

  const fileInputs = (
    <>
      <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      <input id="file-share-upload" type="file" className="hidden" multiple onChange={handleFileUpload} />
    </>
  )

  if (nativeAndroid) {
    const quickActions = [
      technician.phone ? { icon: Phone, label: "Call", action: () => { window.location.href = `tel:${technician.phone}` } } : null,
      { icon: Upload, label: "Photo", action: () => document.getElementById("screenshot-upload")?.click() },
      { icon: FolderOpen, label: "Files", action: () => document.getElementById("file-share-upload")?.click() },
      { icon: MessageCircle, label: "Chat", action: () => document.getElementById("live-chat-box")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
    ].filter(Boolean)

    return (
      <main className="native-remote-session min-h-[100dvh] overflow-x-hidden bg-[#f4f7f9] pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-gos-charcoal">
        {fileInputs}

        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#dfe8ed] bg-[#f8fbfc]/95 px-3 pb-3 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-xl">
          <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gos-off-white text-gos-blue-deep" aria-label="Go back"><ChevronLeft size={19} /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold leading-tight text-gos-blue-deep">Remote Support Session</p>
            <p className="truncate text-[11px] font-semibold text-gos-muted">Booking GOS-{booking.id} · {booking.serviceType}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${meetingFailed ? "bg-red-50 text-red-700" : meetingPending ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{meetingStatusLabel}</span>
        </header>

        <div className="space-y-3 px-3 py-3.5">
          <section className="flex items-center gap-3 rounded-2xl border border-gos-border bg-white p-4 shadow-[0_4px_14px_rgba(8,43,91,.06)]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eaf7f5] text-lg font-black text-gos-turquoise">{technician.name.charAt(0)}</span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm text-gos-blue-deep">{technician.name}</strong>
              <span className="mt-0.5 block truncate text-xs font-semibold text-gos-muted">{technician.role}</span>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Online</span>
          </section>

          <button
            type="button"
            onClick={joinMeeting}
            disabled={(!paymentRequired && meetingPending) || (paymentRequired && isTechnicianViewer)}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gos-blue-deep px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(8,43,91,.22)] transition disabled:cursor-wait disabled:opacity-60"
          >
            {paymentRequired ? <CreditCard size={19} /> : <Video size={19} />}
            {paymentRequired ? (isTechnicianViewer ? "Awaiting Customer Payment" : "Complete Payment") : meetingPending ? (provisioning ? "Creating Meet Link..." : "Preparing Meeting") : "Join Google Meet"}
            {!paymentRequired && !meetingPending && <ExternalLink size={16} />}
          </button>

          {!paymentRequired && meetingPending && (
            <div className={`rounded-xl border p-3 text-xs font-semibold leading-5 ${meetingFailed ? "border-amber-200 bg-amber-50 text-amber-800" : "border-gos-border bg-white text-gos-muted"}`}>
              {meetingFailed
                ? "The secure meeting could not be created automatically. You do not need to pay again."
                : "Payment confirmed. The secure meeting is being created and this screen refreshes automatically."}
              {meetingFailed && <button type="button" onClick={prepareMeeting} disabled={provisioning} className="remote-meeting-retry mt-2 flex min-h-10 w-full items-center justify-center rounded-lg bg-gos-blue-deep px-4 text-xs font-extrabold text-white disabled:opacity-60">{provisioning ? "Creating Meet Link..." : "Retry Meet Link"}</button>}
            </div>
          )}

          {!meetingPending && booking.remoteSessionLink && (
            <button type="button" onClick={copyMeetingLink} className="remote-copy-link flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gos-border bg-white text-xs font-extrabold text-gos-blue-deep">
              <Copy size={15} />{copied ? "Meeting link copied" : "Copy meeting link"}
            </button>
          )}

          <section className="grid grid-cols-4 gap-1 rounded-2xl border border-gos-border bg-white p-2.5">
            {quickActions.map(({ icon: Icon, label, action }) => (
              <button key={label} type="button" onClick={action} className="flex flex-col items-center gap-1.5 rounded-xl py-2 text-gos-blue-deep active:bg-gos-off-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf7f5] text-gos-turquoise"><Icon size={17} /></span>
                <span className="text-[9px] font-bold">{label}</span>
              </button>
            ))}
          </section>

          {uploadedFiles.length > 0 && (
            <section className="rounded-2xl border border-gos-border bg-white p-3.5">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-gos-muted">Uploaded files</p>
              <div className="space-y-1.5">
                {uploadedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-gos-off-white px-3 py-2">
                    <p className="min-w-0 truncate text-xs font-semibold text-gos-charcoal">{file.name}</p>
                    <button type="button" onClick={() => removeUploadedFile(index)} className="shrink-0 text-gos-muted"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-gos-border bg-white p-3.5">
            <div className="mb-2 flex items-center gap-2 text-gos-blue-deep"><FileText size={15} className="text-gos-turquoise" /><h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">Issue notes</h2></div>
            <p className="text-xs font-semibold leading-6 text-gos-muted">{booking.issueDescription}</p>
          </section>

          <section id="live-chat-box" className="scroll-mt-16 rounded-2xl border border-gos-border bg-white p-3.5">
            <div className="mb-3 flex items-center gap-2 text-gos-blue-deep"><MessageCircle size={16} className="text-gos-turquoise" /><h2 className="text-sm font-extrabold">Live Chat</h2></div>
            <div className="h-[220px] space-y-2.5 overflow-y-auto rounded-xl border border-gos-border bg-gos-off-white p-3">
              {chat.length === 0 && <p className="py-8 text-center text-xs font-semibold text-gos-muted">No messages yet. Start the booking conversation here.</p>}
              {chat.map((item) => (
                <div key={item.id} className={`flex ${item.senderRole === currentRole ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${item.senderRole === currentRole ? "bg-gos-blue-deep text-white" : "border border-gos-border bg-white text-gos-charcoal"}`}>
                    <p className="mb-1 text-[9px] font-black uppercase tracking-wide opacity-65">{item.senderRole === currentRole ? "You" : item.senderRole === "TECHNICIAN" ? "Technician" : "Customer"}</p>
                    <p>{item.message}</p>
                    <p className="mt-1 text-[9px] opacity-60">{item.createdAt ? formatLocalTime(item.createdAt, booking) : ""}</p>
                  </div>
                </div>
              ))}
            </div>
            {chatError && <p className="mt-2 text-xs font-semibold text-red-600">{chatError}</p>}
            <div className="mt-3 flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage() } }}
                placeholder="Type message..."
                className="min-h-11 w-full rounded-xl border border-gos-border bg-white px-3.5 text-sm text-gos-charcoal outline-none placeholder:text-gos-muted focus:border-gos-turquoise"
              />
              <button onClick={sendMessage} disabled={!message.trim() || chatSending || paymentRequired} className="min-h-11 shrink-0 rounded-xl bg-gos-turquoise px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
                {chatSending ? "..." : "Send"}
              </button>
            </div>
          </section>

          <section className="flex gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
            <Shield size={17} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-xs font-semibold leading-5 text-emerald-800">This meeting is unique to this booking. Do not share it outside this support session, and never share OTPs or passwords.</p>
          </section>

          <button type="button" onClick={endSession} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-sm font-extrabold text-red-700">
            <Power size={16} /> End Session
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="gos-service-flow remote-session-page relative min-h-screen overflow-hidden bg-[#020817] px-3 pb-20 pt-16 text-white sm:px-5 sm:pt-20 lg:px-6 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_34%)]" />

      <section className="relative mx-auto max-w-7xl">
        {fileInputs}

        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          >
            <ChevronLeft size={21} />
          </button>

          <div className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
            {meetingStatusLabel}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-cyan-500/20 bg-[#071122]/95 p-5 shadow-2xl shadow-cyan-500/10">
            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/20 text-xl font-black text-cyan-300">
                  {technician.name.charAt(0)}
                </div>

                <div>
                  <h3 className="font-bold text-white">{technician.name}</h3>
                  <p className="text-sm text-cyan-100/60">{technician.role}</p>
                  <p className="mt-1 text-xs font-bold text-green-400">
                    ● Online
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={paymentRequired ? joinMeeting : goToMeetingPanel}
                disabled={paymentRequired && isTechnicianViewer}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-wait disabled:opacity-55"
              >
                {paymentRequired ? <CreditCard size={20} /> : <Video size={20} />}
                {paymentRequired ? (isTechnicianViewer ? "Awaiting Customer Payment" : "Complete Payment") : meetingPending ? "View Meeting Status" : "Go to Google Meet"}
              </button>

              {technician.phone && <a
                href={`tel:${technician.phone}`}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm font-black text-green-300 transition hover:bg-green-400/15"
              >
                <Phone size={19} />
                Call {isTechnicianViewer ? "Customer" : "Technician"}
              </a>}

              <button
                onClick={() =>
                  document.getElementById("screenshot-upload")?.click()
                }
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500/10"
              >
                <Upload className="h-5 w-5 text-cyan-300" />
                Upload Screenshot
              </button>

              <button
                onClick={() =>
                  document.getElementById("file-share-upload")?.click()
                }
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500/10"
              >
                <FolderOpen className="h-5 w-5 text-cyan-300" />
                Share Files
              </button>

              <button
                onClick={() => {
                  const chatBox = document.getElementById("live-chat-box")
                  chatBox?.scrollIntoView({ behavior: "smooth" })
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500/10"
              >
                <MessageCircle className="h-5 w-5 text-cyan-300" />
                Live Chat
              </button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Uploaded Files
                </p>

                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"
                    >
                      <p className="truncate text-sm text-white">
                        {file.name}
                      </p>

                      <button
                        onClick={() => removeUploadedFile(index)}
                        className="shrink-0 text-slate-400 hover:text-red-300"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <Shield className="h-5 w-5 shrink-0 text-green-400" />
              <p className="text-sm leading-6 text-green-100/75">
                This meeting is unique for this booking only. Do not share it
                with anyone outside this support session.
              </p>
            </div>

            <div className="mt-4 flex gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-300" />
              <p className="text-sm leading-6 text-yellow-100/75">
                Never share OTP, banking passwords, or private files during the
                session.
              </p>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-cyan-500/20 bg-[#071122]/95 p-5 shadow-2xl shadow-cyan-500/10 sm:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h1 className="text-2xl font-black md:text-3xl">
                    Remote Support Session
                  </h1>

                  <p className="mt-2 text-sm text-cyan-100/60">
                    Booking {booking.id} • {booking.serviceType}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <SessionPill icon={Clock3} text={meetingJoined ? sessionTime : "Not Started"} />
                  <SessionPill icon={Wifi} text="Secure" green />
                  <SessionPill icon={Shield} text="Unique Meet Link" />

                  <button
                    onClick={endSession}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/25"
                  >
                    <Power className="h-4 w-4" />
                    End Session
                  </button>
                </div>
              </div>
            </div>

            <section id="google-meet-panel" className="relative scroll-mt-24 overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[#06101f] p-6 sm:p-8">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-green-400/20 blur-3xl" />
              </div>

              <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
                    <CheckCircle2 size={15} />
                    {meetingStatusLabel}
                  </div>

                  <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                    Join secure video, voice, and screen-share support
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    Your private Google Meet link appears here after payment.
                    Open it to join the assigned technician and begin support.
                  </p>

                  {paymentRequired && (
                    <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100/80">
                      {isTechnicianViewer
                        ? "Waiting for the customer to complete payment. The Google Meet session will be created automatically once payment is confirmed."
                        : "Complete the secure payment to confirm this booking and generate its Google Meet session."}
                    </div>
                  )}

                  {!paymentRequired && meetingPending && (
                    <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100/80">
                      <p>{meetingFailed
                        ? "The secure meeting could not be created automatically. You do not need to pay again."
                        : "Payment is confirmed. The secure meeting is being created and this page refreshes automatically."}</p>
                      {meetingFailed && (
                        <button
                          type="button"
                          onClick={prepareMeeting}
                          disabled={provisioning}
                          className="remote-meeting-retry mt-3 min-h-10 rounded-lg bg-gos-blue-deep px-4 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          {provisioning ? "Creating Meet Link..." : "Retry Meet Link"}
                        </button>
                      )}
                    </div>
                  )}

                  {!meetingPending && booking.remoteSessionLink && (
                    <div className="mt-5 rounded-xl border border-green-500/25 bg-green-500/10 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-green-300">
                        Google Meet Ready
                      </p>
                      <a
                        href={booking.remoteSessionLink}
                        className="mt-2 block break-all text-sm font-bold text-gos-blue-deep underline decoration-gos-turquoise underline-offset-4"
                      >
                        {booking.remoteSessionLink}
                      </a>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={joinMeeting}
                      disabled={(!paymentRequired && meetingPending) || (paymentRequired && isTechnicianViewer)}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-wait disabled:opacity-55"
                    >
                      {paymentRequired ? <CreditCard size={20} /> : <Video size={20} />}
                      {paymentRequired ? (isTechnicianViewer ? "Awaiting Customer Payment" : "Continue to Payment") : meetingPending ? "Creating Meet Link" : "Join Google Meet"}
                      <ExternalLink size={18} />
                    </button>

                    <button
                      onClick={copyMeetingLink}
                      disabled={meetingPending}
                      className="remote-copy-link inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Copy size={18} />
                      {copied ? "Copied" : "Copy Link"}
                    </button>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-black/25 p-5">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                    <Video className="h-8 w-8 text-cyan-300" />
                  </div>

                  <InfoRow label="Session ID" value={`GOS-RM-${booking?.id || "PENDING"}`} />
                  <InfoRow label="Meeting Provider" value="Google Meet" />
                  <InfoRow
                    label="Meeting Status"
                    value={
                      meetingPending
                        ? provisioning ? "Creating Google Meet Link" : "Meet Link Pending"
                        : meetingJoined
                          ? "Opened by Customer"
                          : "Ready"
                    }
                  />
                  <InfoRow label="Access" value="Booking Members Only" />
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <InfoCard
                icon={CalendarClock}
                title="Session Information"
                items={[
                  ["One Booking", "One Meet Link"],
                  ["Support Team", "Same Meeting"],
                  ["Reuse Link", "Not Allowed"],
                ]}
              />

              <InfoCard
                icon={Laptop}
                title="Customer Device"
                items={[
                  ["Device", "Customer Laptop"],
                  ["Support", "Voice / Video / Screen Share"],
                  ["Status", meetingJoined ? "Meeting Opened" : "Waiting"],
                ]}
              />

              <InfoCard
                icon={FileText}
                title="Technician Notes"
                items={workNotes.map((item, index) => [
                  `Step ${index + 1}`,
                  item,
                ])}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <section className="rounded-[2rem] border border-cyan-500/20 bg-[#071122]/95 p-6">
                <h3 className="mb-5 text-xl font-black">Live Activity</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    meetingPending
                      ? "Waiting for backend Meet link"
                      : "Meeting link created for this booking",
                    "Technician is online",
                    meetingJoined
                      ? "Customer opened Google Meet"
                      : "Waiting for customer to join",
                    uploadedFiles.length > 0
                      ? `${uploadedFiles.length} file(s) attached`
                      : "No files attached yet",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          item.includes("Waiting") || item.includes("No files")
                            ? "text-yellow-300"
                            : "text-green-400"
                        }`}
                      />
                      <p className="text-sm text-white">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-cyan-300" />
                    <h4 className="font-black">Issue Notes</h4>
                  </div>

                  <p className="text-sm leading-7 text-slate-400">
                    {booking.issueDescription}
                  </p>
                </div>
              </section>

              <section
                id="live-chat-box"
                className="rounded-[2rem] border border-cyan-500/20 bg-[#071122]/95 p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-cyan-300" />
                  <h3 className="text-lg font-black">Live Chat</h3>
                </div>

                <div className="h-[250px] space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
                  {chat.length === 0 && <p className="py-8 text-center text-xs text-slate-500">No messages yet. Start the booking conversation here.</p>}
                  {chat.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${
                        item.senderRole === currentRole
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          item.senderRole === currentRole
                            ? "bg-cyan-500 text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <p className="mb-1 text-[10px] font-black uppercase tracking-wide opacity-65">{item.senderRole === currentRole ? "You" : item.senderRole === "TECHNICIAN" ? "Technician" : "Customer"}</p>
                        <p>{item.message}</p>
                        <p className="mt-1 text-[9px] opacity-60">{item.createdAt ? formatLocalTime(item.createdAt, booking) : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {chatError && <p className="mt-2 text-xs font-semibold text-red-300">{chatError}</p>}

                <div className="mt-4 flex gap-2">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage() }
                    }}
                    placeholder="Type message..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || chatSending || paymentRequired}
                    className="rounded-2xl bg-cyan-400 px-5 text-sm font-black text-black hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {chatSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </section>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function SessionPill({ icon: Icon, text, green }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${
        green
          ? "border-green-500/20 bg-green-500/10 text-green-300"
          : "border-white/10 bg-white/5 text-white"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-bold">{text}</span>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-white/10 py-3 last:border-b-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  )
}

function InfoCard({ icon: Icon, title, items }) {
  return (
    <div className="rounded-[2rem] border border-cyan-500/20 bg-[#071122]/95 p-5">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-cyan-300" />
        <h3 className="font-black text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map(([label, value], index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
