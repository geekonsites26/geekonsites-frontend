import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Headphones,
  Phone,
  ShieldCheck,
  Star,
  UserCheck,
  Video,
  Wrench,
} from "lucide-react"

export default function TechnicianAssigned() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const booking = state?.booking || {
    id: "GOS-1024",
    serviceType: "Laptop Repair",
    supportType: "remote",
    issueDescription: "Laptop is slow and not turning on properly.",
    date: "Today",
    timeSlot: "Ready Now",
    location: "Remote Session",
  }

  const technician = state?.technician || {
    name: "Rahul Kumar",
    role: "Senior Remote Support Technician",
    rating: "4.9",
    experience: "6+ Years",
    specialist: booking.serviceType,
    phone: "+44 7700 900123",
    eta: booking.supportType === "onsite" ? "45 - 60 mins" : "Ready Now",
  }

  const isRemote = booking.supportType !== "onsite"

  const initials = useMemo(() => {
    return technician.name
      .split(" ")
      .map((item) => item[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [technician.name])

  const handleContinue = () => {
    navigate(isRemote ? "/remote-session" : "/booking-success", {
      state: {
        booking,
        technician,
      },
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B12] pt-[95px] text-white sm:pt-[130px] lg:pt-[145px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_35%)]" />

      <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          >
            <ChevronLeft size={21} />
          </button>

          <p className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
            Technician Assigned
          </p>
        </div>

        <div className="grid items-center gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="order-1 text-left lg:order-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-cyan-300">
              <UserCheck size={15} />
              READY TO START
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Your GeekOnSites expert is ready
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Your payment is verified and your technician has accepted your
              service request. You can now continue securely.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-sm font-black shadow-xl shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
              >
                {isRemote ? <Video size={20} /> : <CalendarClock size={20} />}
                {isRemote ? "Join Remote Session" : "View Booking Status"}
                <ArrowRight size={18} />
              </motion.button>

              <button
                onClick={() => navigate("/my-bookings")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black text-slate-200 transition hover:bg-white/10"
              >
                My Bookings
              </button>
            </div>
          </motion.div>

          <ConnectionAnimation isRemote={isRemote} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-[2rem] border border-white/10 bg-[#0A1020]/85 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-3xl font-black text-cyan-300 shadow-xl shadow-cyan-500/10"
              >
                {initials}
              </motion.div>

              <h2 className="mt-5 text-2xl font-black">
                {technician.name}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {technician.role}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Badge text="Background Verified" />
                <Badge text="GOS Certified" />
                <Badge text="Identity Verified" />
              </div>

              <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
                <Info icon={Star} label="Rating" value={`${technician.rating} / 5`} />
                <Info icon={Clock} label="ETA" value={technician.eta} />
                <Info icon={Headphones} label="Specialist" value={technician.specialist} />
                <Info icon={ShieldCheck} label="Session" value="Encrypted" />
              </div>

              <a
                href={`tel:${technician.phone}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-green-400 px-6 py-4 text-sm font-black text-black transition hover:bg-green-300"
              >
                <Phone size={19} />
                Call Technician
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-[2rem] border border-white/10 bg-[#0A1020]/85 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Booking Status</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Booking ID: {booking.id}
                </p>
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-300">
                Active
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <div className="flex items-center gap-3">
                <Wrench className="text-cyan-300" size={21} />
                <h3 className="text-lg font-black">Customer Issue</h3>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Summary label="Service" value={booking.serviceType} />
                <Summary
                  label="Support Type"
                  value={isRemote ? "Remote Support" : "Onsite Visit"}
                />
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {booking.issueDescription}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Summary label="Schedule" value={`${booking.date} • ${booking.timeSlot}`} />
              <Summary label="Location" value={booking.location} />
            </div>

            <div className="mt-6 space-y-3">
              <Status active title="Payment Verified" text="Your service payment has been confirmed." />
              <Status active title="Technician Assigned" text="A verified technician accepted your request." />
              <Status active title={isRemote ? "Remote Desk Ready" : "Visit Scheduled"} text={isRemote ? "Secure remote session is ready to start." : "Technician will arrive based on the scheduled slot."} />
              <Status title={isRemote ? "Waiting For Customer" : "Service In Progress Soon"} text={isRemote ? "Click Join Remote Session to start support." : "Track the technician from My Bookings."} />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

function ConnectionAnimation({ isRemote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="order-2 rounded-[2rem] border border-cyan-400/20 bg-cyan-500/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl lg:order-1 sm:p-6"
    >
      <p className="mb-5 text-center text-[11px] font-black tracking-[0.22em] text-cyan-300">
        {isRemote ? "SECURE CONNECTION READY" : "TECHNICIAN DISPATCH READY"}
      </p>

      <div className="relative mx-auto flex h-40 items-center justify-between overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 px-5 sm:h-48 sm:px-8">
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="z-10 flex flex-col items-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-4xl sm:h-24 sm:w-24">
            💻
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Customer
          </p>
        </motion.div>

        <div className="absolute left-[31%] right-[31%] top-[66px] h-[2px] bg-white/10 sm:top-[78px]">
          <motion.div
            animate={{ x: ["-100%", "190%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            className="h-full w-1/2 bg-gradient-to-r from-cyan-400 to-green-400"
          />
        </div>

        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="z-10 flex flex-col items-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-400/20 bg-green-500/10 text-4xl sm:h-24 sm:w-24">
            👨‍🔧
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            Technician
          </p>
        </motion.div>
      </div>

      <div className="mt-5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          animate={{ x: ["-100%", "110%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-2 w-1/2 bg-gradient-to-r from-cyan-400 to-green-400"
        />
      </div>

      <p className="mt-4 text-center text-sm font-medium text-cyan-200">
        {isRemote ? "Technician is ready to connect." : "Technician details confirmed."}
      </p>
    </motion.div>
  )
}

function Badge({ text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-2 text-xs font-bold text-green-300">
      <BadgeCheck size={14} />
      {text}
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
      <Icon className="mb-3 text-cyan-300" size={19} />
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function Summary({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">
        {value || "Not available"}
      </p>
    </div>
  )
}

function Status({ title, text, active }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-green-400 text-black" : "bg-white/15 text-white/50"
        }`}
      >
        {active && <CheckCircle2 size={14} />}
      </div>

      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  )
}