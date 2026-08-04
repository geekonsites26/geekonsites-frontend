import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  ShieldCheck,
} from "lucide-react"
import {
  remainingPaymentSuccess,
  closeBooking,
} from "../services/bookingService"

export default function RemainingPayment() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const booking = state?.booking

  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState("CARD")

  const currency = booking?.currency || "£"
  const remaining = Number(booking?.remainingAmount || 0).toFixed(2)
  const paid = Number(booking?.paidAmount || booking?.amountPaid || 0).toFixed(2)
  const total = Number(booking?.totalAmount || 0).toFixed(2)

  const handlePayment = async () => {
    if (!booking?.id) {
      alert("Booking not found")
      return
    }

    try {
      setLoading(true)

      const transactionId = `GOS-BAL-${Date.now()}`

      await remainingPaymentSuccess(booking.id, transactionId, method)
      await closeBooking(booking.id)

      navigate("/my-bookings", {
        state: {
          message: "Remaining payment completed. Booking closed successfully.",
        },
      })
    } catch (error) {
      console.error(error)
      alert(error.message || "Remaining payment failed")
    } finally {
      setLoading(false)
    }
  }

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020817] px-4 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-8 text-center">
          <h1 className="text-2xl font-black">Booking not found</h1>
          <button
            onClick={() => navigate("/my-bookings")}
            className="mt-5 rounded-2xl bg-cyan-400 px-6 py-3 font-black text-black"
          >
            Go to My Bookings
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#020817] px-4 pb-20 pt-24 text-white sm:px-6 lg:pt-32">
      <section className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-cyan-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-cyan-500/20 bg-[#071122] p-6 shadow-2xl shadow-cyan-500/10 md:p-9"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                Final Payment
              </p>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">
                Pay Remaining Balance
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-100/55">
                Complete the remaining payment to close your GeekOnSites booking
                and finalize your invoice.
              </p>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-center">
              <p className="text-sm text-yellow-100/70">Balance Due</p>
              <h2 className="mt-2 text-4xl font-black text-yellow-300">
                {currency}
                {remaining}
              </h2>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#071122] p-6">
            <h2 className="mb-5 flex items-center gap-3 text-xl font-black">
              <FileText className="h-5 w-5 text-cyan-300" />
              Booking Summary
            </h2>

            <Info label="Booking ID" value={`GOS-${booking.id}`} />
            <Info label="Customer" value={booking.customerName || "Customer"} />
            <Info label="Service" value={booking.serviceType || "Service"} />
            <Info label="Total Amount" value={`${currency}${total}`} />
            <Info label="Already Paid" value={`${currency}${paid}`} />
            <Info label="Remaining Balance" value={`${currency}${remaining}`} />
          </div>

          <div className="rounded-[2rem] border border-cyan-500/20 bg-[#071122] p-6">
            <h2 className="mb-5 flex items-center gap-3 text-xl font-black">
              <CreditCard className="h-5 w-5 text-cyan-300" />
              Payment Method
            </h2>

            <div className="grid gap-3">
              {["CARD", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"].map((item) => (
                <button
                  key={item}
                  onClick={() => setMethod(item)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left font-bold ${
                    method === item
                      ? "border-cyan-400 bg-cyan-400 text-black"
                      : "border-white/10 bg-[#0b1628] text-white"
                  }`}
                >
                  {item.replace("_", " ")}
                  {method === item && <CheckCircle2 size={19} />}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-green-300" />
                <p className="text-sm leading-6 text-green-100/70">
                  Secure payment protected by GeekOnSites. Your booking will be
                  closed automatically after successful payment.
                </p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || Number(remaining) <= 0}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 py-4 font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock size={18} />
              {loading ? "Processing..." : `Pay ${currency}${remaining}`}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function Info({ label, value }) {
  return (
    <div className="mb-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4 last:mb-0">
      <p className="text-sm text-cyan-100/45">{label}</p>
      <p className="mt-1 font-black text-white">{value || "N/A"}</p>
    </div>
  )
}