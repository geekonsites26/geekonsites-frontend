import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
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

export default function RemoteSession() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const booking = state?.booking || {
    id: "GOS-1024",
    serviceType: "Laptop Repair",
    issueDescription: "Laptop is slow and not turning on properly.",
    remoteMeetingLink: "https://meet.google.com/abc-defg-hij",
    sessionId: "GOS-RM-28472",
  }

  const technician = state?.technician || {
    name: "Rahul Kumar",
    role: "Senior Remote Support Technician",
    phone: "+44 7700 900123",
  }

  const [seconds, setSeconds] = useState(0)
  const [meetingJoined, setMeetingJoined] = useState(false)
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const [chat, setChat] = useState([
    {
      sender: "technician",
      text: "Hello, I’m ready. Please join the secure video meeting.",
    },
    {
      sender: "customer",
      text: "Okay, joining now.",
    },
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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

  const isDemoMeetLink =
    !booking.remoteMeetingLink ||
    booking.remoteMeetingLink.includes("abc-defg-hij")

  const joinMeeting = () => {
    if (isDemoMeetLink) {
      alert("Meeting link is not ready yet. Backend will generate a real Google Meet link for this booking.")
      return
    }

    setMeetingJoined(true)
    window.open(booking.remoteMeetingLink, "_blank", "noopener,noreferrer")
  }

  const copyMeetingLink = async () => {
    if (isDemoMeetLink) {
      alert("Meeting link is not ready yet.")
      return
    }

    await navigator.clipboard.writeText(booking.remoteMeetingLink)
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

  const sendMessage = () => {
    if (!message.trim()) return

    setChat((prev) => [
      ...prev,
      {
        sender: "customer",
        text: message.trim(),
      },
    ])

    setMessage("")
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] px-4 pb-20 pt-[95px] text-white sm:px-6 sm:pt-[120px] lg:pt-[145px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_34%)]" />

      <section className="relative mx-auto max-w-7xl">
        <input
          id="screenshot-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <input
          id="file-share-upload"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileUpload}
        />

        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          >
            <ChevronLeft size={21} />
          </button>

          <div className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
            {isDemoMeetLink ? "Meeting Pending" : "Meeting Ready"}
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
                onClick={joinMeeting}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
              >
                <Video size={20} />
                Join Video / Voice Meeting
              </button>

              <a
                href={`tel:${technician.phone}`}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm font-black text-green-300 transition hover:bg-green-400/15"
              >
                <Phone size={19} />
                Call Technician
              </a>

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
                  <SessionPill icon={Clock3} text={sessionTime} />
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

            <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[#06101f] p-6 sm:p-8">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-green-400/20 blur-3xl" />
              </div>

              <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.8fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
                    <CheckCircle2 size={15} />
                    {isDemoMeetLink ? "Google Meet Pending" : "Google Meet Ready"}
                  </div>

                  <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                    Join secure video, voice, and screen-share support
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    Each booking gets one unique Google Meet link. The customer,
                    assigned technician, and approved support team members join
                    the same session.
                  </p>

                  {isDemoMeetLink && (
                    <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm leading-6 text-yellow-100/80">
                      Demo link is not real. Backend will generate a real Google
                      Meet link automatically after technician assignment.
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={joinMeeting}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
                    >
                      <Video size={20} />
                      Join Meeting
                      <ExternalLink size={18} />
                    </button>

                    <button
                      onClick={copyMeetingLink}
                      className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-black text-slate-200 transition hover:bg-white/10"
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

                  <InfoRow label="Session ID" value={booking.sessionId} />
                  <InfoRow label="Meeting Provider" value="Google Meet" />
                  <InfoRow
                    label="Meeting Status"
                    value={
                      isDemoMeetLink
                        ? "Waiting For Backend Link"
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
                    isDemoMeetLink
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
                  {chat.map((item, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        item.sender === "customer"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          item.sender === "customer"
                            ? "bg-cyan-500 text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") sendMessage()
                    }}
                    placeholder="Type message..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                  />

                  <button
                    onClick={sendMessage}
                    className="rounded-2xl bg-cyan-400 px-5 text-sm font-black text-black hover:bg-cyan-300"
                  >
                    Send
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