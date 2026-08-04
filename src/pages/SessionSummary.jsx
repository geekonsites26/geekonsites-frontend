import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { submitBookingRating } from "../services/bookingService"
import { useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Home,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Star,
  UserCheck,
  Wrench,
} from "lucide-react"

export default function SessionSummary() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const booking = state?.booking || {
    id: "GOS-1024",
    serviceType: "Laptop Repair",
    issueDescription: "Laptop is slow and not turning on properly.",
    customerName: "Tejaswi",
    sessionId: "GOS-RM-28472",
    invoiceNumber: "INV-GOS-1024",
    amountPaid: "£89.00",
    platformFee: "£12.00",
    paymentMethod: "Card",
  }

  const technician = state?.technician || {
    name: "Rahul Kumar",
    role: "Senior Remote Support Technician",
  }

  const sessionDuration = state?.sessionDuration || "00:18:42"

  const workPerformed = state?.workPerformed || [
    "Remote diagnostics completed",
    "System performance optimized",
    "Temporary files cleaned",
    "Security scan completed",
  ]

  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const resolutionNotes =
    "Technician reviewed the reported issue, performed remote diagnostics, optimized system startup, cleaned temporary files, and completed a basic security scan."

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] px-4 pb-20 pt-[95px] text-white sm:px-6 sm:pt-[120px] lg:pt-[145px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_34%)]" />

      <section className="relative mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          >
            <ChevronLeft size={21} />
          </button>

          <div className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
            Service Completed
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] border border-cyan-500/20 bg-[#071122]/95 p-7 text-center shadow-2xl shadow-cyan-500/10 sm:p-10"
        >
          <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
          </div>

          <h1 className="text-3xl font-black leading-tight sm:text-5xl">
            Session completed successfully
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Your remote support session has ended securely. Meeting access is
            closed, session details are saved, and your invoice is ready.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Tag text="Access Closed" green />
            <Tag text="Issue Resolved" />
            <Tag text="Invoice Ready" purple />
          </div>
        </motion.div>

        <div className="mt-7 grid gap-6 lg:grid-cols-3">
          <Card title="Customer Information" icon={UserCheck}>
            <Info label="Customer" value={booking.customerName || "Customer"} />
            <Info label="Booking ID" value={booking.id} />
            <Info label="Service" value={booking.serviceType} />
            <Info label="Support Ref" value={booking.sessionId || "GOS-RM-28472"} />
          </Card>

          <Card title="Session Details" icon={Clock3}>
            <Info label="Technician" value={technician.name} />
            <Info label="Role" value={technician.role} />
            <Info label="Duration" value={sessionDuration} />
            <Info label="Status" value="Completed Securely" />
          </Card>

          <Card title="Invoice Preview" icon={ReceiptText}>
            <Info label="Invoice No" value={booking.invoiceNumber || "INV-GOS-1024"} />
            <Info label="Amount Paid" value={booking.amountPaid || "£89.00"} />
            <Info label="Platform Fee" value={booking.platformFee || "£12.00"} />
            <Info label="Payment Method" value={booking.paymentMethod || "Card"} />
          </Card>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card title="Resolution Status" icon={ShieldCheck}>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5">
              <div className="flex gap-4">
                <CheckCircle2 className="h-7 w-7 shrink-0 text-green-400" />
                <div>
                  <h4 className="font-black text-green-300">
                    Issue Resolved
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-green-100/70">
                    Technician marked this session as completed and resolved.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-cyan-300" />
                <h4 className="font-black">Resolution Notes</h4>
              </div>

              <p className="text-sm leading-7 text-slate-400">
                {resolutionNotes}
              </p>
            </div>
          </Card>

          <Card title="Technician Work Summary" icon={Wrench}>
            <div className="space-y-3">
              {workPerformed.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0b1628] p-4"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                  <p className="text-sm text-white">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-cyan-300" />
                <h4 className="font-black">Issue Reported</h4>
              </div>

              <p className="text-sm leading-7 text-slate-400">
                {booking.issueDescription}
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <Card title="Rate Your Experience" icon={Star}>
            <p className="mb-4 text-sm leading-7 text-slate-400">
              Your feedback helps GeekOnSites improve technician quality and
              customer support.
            </p>

            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
                    rating >= star
                      ? "border-yellow-400 bg-yellow-500/20"
                      : "border-white/10 bg-[#0b1628]"
                  }`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-yellow-400"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={async () => {
               if (!rating) return

               try {
                 await submitBookingRating(
                 booking.id,
                 rating,
                 "Customer rated after service completion"
               )

                 setSubmitted(true)
                } catch (err) {
                  alert(err.message)
                }
              }}
              className="mt-5 rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black text-black transition hover:bg-cyan-300"
            >
              Submit Rating
            </button>

            {submitted && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm font-semibold text-green-400"
              >
                Thank you. Your rating has been submitted.
              </motion.p>
            )}
          </Card>

         <Card title="Next Actions" icon={CreditCard}>
  <div className="grid gap-3">

    {/* Invoice */}

    <button
      onClick={() =>
        navigate("/InvoiceDetails", {
          state: {
            booking,
            technician,
            sessionDuration,
            workPerformed,
            resolutionNotes,
          },
        })
      }
      className="flex items-center justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 font-bold text-white transition hover:bg-cyan-500/20"
    >
      <span className="flex items-center gap-3">
        <Download className="h-5 w-5 text-cyan-300" />
        View / Download Invoice
      </span>

      <ArrowRight size={18} />
    </button>

    {/* Remaining Payment */}

    {Number(booking.remainingAmount || 0) > 0 && (
      <button
        onClick={() =>
          navigate("/remaining-payment", {
            state: {
              booking,
            },
          })
        }
        className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 font-bold text-white transition hover:bg-yellow-500/20"
      >
        <span className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-yellow-300" />
          Pay Remaining Balance
        </span>

        <ArrowRight size={18} />
      </button>
    )}

    {/* Rebook */}

    <button
      onClick={() => navigate("/book-service")}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1628] p-4 font-bold text-white transition hover:bg-cyan-500/10"
    >
      <span className="flex items-center gap-3">
        <RotateCcw className="h-5 w-5 text-cyan-300" />
        Rebook Service
      </span>

      <ArrowRight size={18} />
    </button>

    {/* My Bookings */}

    <button
      onClick={() => navigate("/my-bookings")}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1628] p-4 font-bold text-white transition hover:bg-cyan-500/10"
    >
      <span className="flex items-center gap-3">
        <Home className="h-5 w-5 text-cyan-300" />
        My Bookings
      </span>

      <ArrowRight size={18} />
    </button>

  </div>
</Card>
        </div>
      </section>
    </main>
  )
}

function Card({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-[2rem] border border-cyan-500/20 bg-[#071122]/95 p-6 shadow-2xl shadow-cyan-500/10"
    >
      <div className="mb-5 flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-cyan-300" />}
        <h2 className="text-xl font-black">{title}</h2>
      </div>

      {children}
    </motion.div>
  )
}

function Info({ label, value }) {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-[#0b1628] p-5 last:mb-0">
      <p className="text-sm text-cyan-100/50">{label}</p>
      <h3 className="mt-1 text-base font-black text-white">{value}</h3>
    </div>
  )
}

function Tag({ text, green, purple }) {
  return (
    <div
      className={`rounded-2xl border px-5 py-3 text-sm font-bold ${
        green
          ? "border-green-500/20 bg-green-500/10 text-green-300"
          : purple
            ? "border-purple-500/20 bg-purple-500/10 text-purple-300"
            : "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
      }`}
    >
      {text}
    </div>
  )
}