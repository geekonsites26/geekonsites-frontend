import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { getLocation } from "../utils/location"
import {
  CheckCircle2,
  Bot,
  UserCheck,
  Video,
  FileText,
  ArrowRight,
  ShieldCheck,
  Clock,
  Home,
  ReceiptText,
} from "lucide-react"

export default function BookingSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const booking = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentBooking"))
    } catch {
      return null
    }
  }, [])

  const country = booking?.country || getLocation().code
  const currency = booking?.currency || (country === "US" ? "USD" : "GBP")
  const symbol = currency === "USD" ? "$" : "\u00A3"

  const isRemote = Boolean(booking?.remoteSessionRequired)

  const bookingId = booking?.id ? `GOS-${booking.id}` : "GOS-PENDING"

  const totalAmount = Number(booking?.totalAmount || booking?.paymentAmount || 0)
  const remainingAmount = Number(booking?.remainingAmount || 0)
  const advanceAmount = Number(
    booking?.advanceAmount || booking?.paidAmount || totalAmount * 0.3
  )
  const isRemainingPayment =
    booking?.paymentType === "REMAINING" ||
    booking?.paymentStatus === "BALANCE_PAID"
  const amountPaidNow = isRemainingPayment
    ? Number(booking?.paymentAmount || totalAmount - advanceAmount)
    : isRemote
      ? Number(booking?.paidAmount || totalAmount)
      : advanceAmount

  const paymentStatus = booking?.paymentStatus || (isRemote ? "PAID" : "ADVANCE_PAID")

  const paymentType =
    booking?.paymentType || (isRemote ? "Full Payment" : "Advance Payment")

  const serviceName = booking?.serviceType || "Selected Service"

  const schedule =
    booking?.bookingDate && booking?.timeSlot
      ? formatSchedule(booking.bookingDate, booking.timeSlot)
      : "Schedule not selected"

  const locationText =
    [
      booking?.address,
      booking?.city,
      booking?.state,
      booking?.postalCode,
      booking?.country,
    ]
      .filter(Boolean)
      .join(", ") || "Location not provided"

  const mainActionText = isRemote ? "Continue to Remote Session" : "Track Technician"

  const mainActionRoute = isRemote ? "/remote-session" : "/technician-assigned"

  return (
    <main className="gos-service-flow booking-success-page relative min-h-screen overflow-hidden bg-[#070B12] pb-28 pt-20 text-white sm:pt-24 xl:pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />

      <section className="relative mx-auto max-w-7xl px-3 pb-16 sm:px-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 160 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-green-400/30 bg-green-500/10 sm:h-16 sm:w-16"
          >
            <CheckCircle2 size={34} className="text-green-400" />
          </motion.div>

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-green-400 sm:text-xs">
            BOOKING CONFIRMED
          </p>

          <div className="mt-4 flex justify-center">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px rgba(34,197,94,0.2)",
                  "0 0 35px rgba(34,197,94,0.5)",
                  "0 0 0px rgba(34,197,94,0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-3 rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2.5"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-green-400"
              />
              <span className="text-xs font-black text-green-300 sm:text-sm">
                TECHNICIAN ASSIGNMENT ACTIVE
              </span>
            </motion.div>
          </div>

          <h1 className="mt-5 font-['Cormorant_Garamond'] text-4xl font-bold leading-none text-gos-blue-deep sm:text-5xl">
            Booking Successfully Created
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            {isRemote
              ? "Your remote service booking is confirmed. Technician assignment and remote session preparation are now active."
              : "Your on-site booking is confirmed. Technician assignment will start after advance payment confirmation."}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="booking-status-banner mt-7 rounded-[2.5rem] border border-green-400/20 bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-5 sm:p-6"
        >
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div>
              <p className="text-sm font-black tracking-[0.3em] text-green-300">
                CURRENT STATUS
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                {isRemote
                  ? "Remote Technician Will Connect Shortly"
                  : "Technician Assignment Pending"}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
                Expected assignment time is 10-15 minutes. You can track updates
                from My Bookings and the technician status page.
              </p>
            </div>

            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500/15 sm:h-20 sm:w-20"
            >
              <CheckCircle2 size={40} className="text-green-400" />
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            className="booking-success-card min-w-0 rounded-[2.5rem] border border-white/10 bg-[#0A1020]/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <h2 className="text-2xl font-black">
              {isRemote ? "Remote Support Workflow" : "On-site Service Workflow"}
            </h2>

            <div className="mt-5 space-y-3">
              <Step
                icon={CheckCircle2}
                title={isRemote ? "Payment Completed" : "Advance Payment Completed"}
                text={
                  isRemote
                    ? "Your secure full payment has been received."
                    : "Your advance booking payment has been received."
                }
                active
              />

              <Step
                icon={Bot}
                title="Service Review Started"
                text="GeekOnSites is reviewing your selected issue and booking details."
                active
              />

              <Step
                icon={UserCheck}
                title="Technician Assignment"
                text="A verified technician will be assigned based on service, location, and availability."
                active
              />

              <Step
                icon={isRemote ? Video : Clock}
                title={isRemote ? "Remote Session Ready" : "Technician Visit"}
                text={
                  isRemote
                    ? "Session access will become available once the technician is ready."
                    : "Technician will visit your location at the selected time slot."
                }
              />

              <Step
                icon={FileText}
                title={isRemote ? "Service Summary & Invoice" : "Final Invoice & Balance"}
                text={
                  isRemote
                    ? "Your paid invoice is available now and remains saved with this booking."
                    : "Final invoice may include parts, accessories, extra repair work, or distance charges if applicable."
                }
              />
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            className="booking-success-card h-fit self-start rounded-2xl border border-white/10 bg-[#0A1020]/80 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4 xl:sticky xl:top-24"
          >
            <h2 className="text-xl font-black">Booking Details</h2>

            <motion.button
              onClick={() => navigate(mainActionRoute, { state: { booking } })}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-xs font-black text-black"
            >
              {isRemote ? <Video size={18} /> : <UserCheck size={18} />}
              {mainActionText}
              <ArrowRight size={17} />
            </motion.button>

            <div className="mt-3 divide-y divide-gos-border overflow-hidden rounded-xl border border-gos-border bg-white">
              <Info label="Booking ID" value={bookingId} />
              <Info label="Service" value={serviceName} />
              <Info label="Payment Type" value={paymentType} />
              <Info label="Payment Status" value={paymentStatus} />
              <Info label="Amount Paid Now" value={`${symbol}${amountPaidNow.toFixed(2)}`} />
              {!isRemote && (
                <Info
                  label="Balance After Service"
                  value={`${symbol}${remainingAmount.toFixed(2)}`}
                />
              )}
              <Info label="Schedule" value={schedule} />
              <Info label="Location" value={locationText} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/my-bookings")}
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-gos-border bg-white px-2 py-2 text-xs font-bold text-gos-blue-deep"
              >
                <ReceiptText size={16} />
                My Bookings
              </button>

              <button
                onClick={() => navigate("/invoice", { state: { booking } })}
                className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-gos-border bg-white px-2 py-2 text-xs font-extrabold text-gos-blue-deep"
              >
                <FileText size={16} />
                {!isRemote && remainingAmount > 0 ? "Advance Invoice" : "Invoice"}
              </button>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300"
            >
              <Home size={20} />
              Back to Website
            </button>

            <div className="mt-2.5 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <Clock size={16} className="text-cyan-300" />
              Waiting for technician assignment...
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  )
}

function formatSchedule(dateValue, timeSlot) {
  const date = new Date(`${dateValue}T00:00:00`)
  const formattedDate = Number.isNaN(date.getTime())
    ? dateValue
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date)
  const formattedTime = String(timeSlot).replace(/\b0(?=\d:)/g, "")
  return `${formattedDate}, ${formattedTime}`
}

function Step({ icon: Icon, title, text, active }) {
  return (
    <motion.div
      whileHover={{ x: 6 }}
      className={`flex gap-3 rounded-3xl border p-4 ${
        active
          ? "border-cyan-400/25 bg-cyan-500/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          active ? "bg-cyan-500/15 text-cyan-300" : "bg-white/10 text-gray-400"
        }`}
      >
        <Icon size={23} />
      </div>

      <div>
        <h3 className="font-black">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-gray-400">{text}</p>
      </div>
    </motion.div>
  )
}

function Info({ label, value }) {
  return (
    <div className="grid min-w-0 grid-cols-[92px_minmax(0,1fr)] items-start gap-2 px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gray-500">
        {label}
      </p>
      <p className="break-words text-right text-[11px] font-bold leading-4 text-gray-200">
        {value}
      </p>
    </div>
  )
}
