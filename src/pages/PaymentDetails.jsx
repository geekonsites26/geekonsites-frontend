import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getBookingById } from "../services/bookingService"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MapPin,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react"

export default function PaymentDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const [booking, setBooking] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("currentBooking"))
  } catch {
    return null
  }
})

  useEffect(() => {
  const loadLatestBooking = async () => {
    const params = new URLSearchParams(location.search)

    const bookingId =
      params.get("bookingId") || booking?.id

    if (!bookingId) return

    try {
      const latestBooking = await getBookingById(bookingId)
      setBooking(latestBooking)
      localStorage.setItem(
        "currentBooking",
        JSON.stringify(latestBooking)
      )
    } catch (error) {
      console.error(error)
    }
  }

  loadLatestBooking()
}, [location.search])

  const country = booking?.country || "UK"
  const currency = booking?.currency || (country === "US" ? "USD" : "GBP")
  const symbol = currency === "USD" ? "$" : "£"

  const isRemote = Boolean(booking?.remoteSessionRequired)

  const isRemainingPayment =
  booking?.paymentType === "REMAINING" ||
  booking?.paymentStatus === "BALANCE_PAID"

  const serviceFee = Number(
    booking?.baseAmount || booking?.serviceAmount || booking?.totalAmount || 0
  )

  const addonsAmount = Number(booking?.addonsTotal || booking?.addonsAmount || 0)

  const protectionAmount = Number(
    booking?.antivirusTotal || booking?.antivirusAmount || 0
  )

  const platformFee = Number(booking?.platformFee || 12)

  const totalAmount = Number(
    booking?.totalAmount ||
      serviceFee + addonsAmount + protectionAmount + platformFee
  )

  const amountPaidNow = Number(
    booking?.amountPaidNow || booking?.paymentAmount || totalAmount
  )

  const remainingAmount = Number(booking?.remainingAmount || 0)

  const paymentType = booking?.paymentType || (isRemote ? "Full Payment" : "Advance Payment")

  const paymentMethod = "Stripe Secure Checkout"

  const transactionId = booking?.paymentTransactionId || "TXN-PENDING"

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111F] pb-28 pt-28 text-white lg:pt-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_35%)]" />

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10">
          <p className="text-sm font-black tracking-[0.35em] text-cyan-300">
            PAYMENT CONFIRMED
          </p>

          <h1 className="mt-4 text-3xl font-black sm:text-5xl">
            Payment Successful
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            {
              isRemainingPayment
                ? "Your remaining payment has been received successfully. Your booking is now closed and your final invoice is available."
                : "Your GeekOnSites payment has been confirmed. Technician assignment will start automatically."
            }
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2rem] border border-white/10 bg-[#0D1B2A]/85 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-black">
                  <CheckCircle2 size={30} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-emerald-100">
                    {
                      isRemainingPayment
                        ? "Booking Successfully Closed"
                        : "Payment Confirmed"
                    }
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {isRemote
                      ? "Your remote support payment is complete. Remote session access will be prepared next."
                      : "Your advance payment is complete. A technician will be assigned for your on-site visit."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/20 p-6">
              <h3 className="font-black">Payment Details</h3>
              <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
  <div className="flex items-center gap-3">
    <ShieldCheck className="text-cyan-300" />

    <div>
      <h4 className="font-bold">
        Secure Payment
      </h4>

      <p className="mt-1 text-sm leading-6 text-slate-300">
        Your payment was securely processed through Stripe using encrypted
        PCI-DSS compliant checkout. GeekOnSites never stores your card
        information.
      </p>
    </div>
  </div>
</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={ReceiptText}
                  label="Transaction ID"
                  value={transactionId}
                />

                <InfoItem
              icon={ReceiptText}
             label="Payment Type"
             value={paymentType}
           />

                <InfoItem
                icon={LockKeyhole}
                label="Payment Gateway"
                value={paymentMethod}
             />

                <InfoItem
                  icon={ShieldCheck}
                  label="Payment Status"
                  value={booking?.paymentStatus || "PAID"}
                />
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/20 p-6">
              <h3 className="font-black">Booking Details</h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Customer"
                  value={booking?.customerName || "Customer"}
                />

                <InfoItem
                  icon={ReceiptText}
                  label="Service"
                  value={booking?.serviceType || "Selected Service"}
                />

                <InfoItem
                  icon={Clock3}
                  label="Schedule"
                  value={
                    booking?.bookingDate && booking?.timeSlot
                      ? `${booking.bookingDate} • ${booking.timeSlot}`
                      : "Not selected"
                  }
                />

                <InfoItem icon={MapPin} label="Location" value={locationText} />
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-6">
              <h3 className="font-black text-amber-100">
                {
                 isRemainingPayment
                 ? "Booking Completed"
                 : "Technician Assignment Pending"
                }
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                Expected assignment time is 10–15 minutes. You can track the
                booking status on the next screen.
              </p>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-fit rounded-[2rem] border border-white/10 bg-[#0D1B2A]/85 p-6 shadow-2xl backdrop-blur-xl lg:sticky lg:top-32"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-cyan-300" />
              <h2 className="text-2xl font-black">Receipt Summary</h2>
            </div>

            <div className="mt-6 space-y-4">
              <PriceRow label="Service Fee" value={`${symbol}${serviceFee.toFixed(2)}`} />
              <PriceRow label="Add-ons" value={`${symbol}${addonsAmount.toFixed(2)}`} />
              <PriceRow label="Protection Plan" value={`${symbol}${protectionAmount.toFixed(2)}`} />
              <PriceRow label="Platform Fee" value={`${symbol}${platformFee.toFixed(2)}`} />
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <p className="text-sm text-slate-400">
                {isRemainingPayment
                  ? "Final Payment"
                  : isRemote
                  ? "Total Paid"
                  : "Advance Paid"}
              </p>

              <h3 className="mt-2 text-4xl font-black text-cyan-300">
                {symbol}
                {amountPaidNow.toFixed(2)}
              </h3>

              <p className="mt-2 text-xs font-semibold text-slate-500">
                Currency: {currency}
              </p>
            </div>

            {!isRemote && (
              <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                <p className="text-sm font-bold text-amber-100">
                  Balance After Service
                </p>

                <p className="mt-2 text-2xl font-black">
                  {symbol}
                  {remainingAmount.toFixed(2)}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Final amount may change if parts, accessories, extra repair
                  work, or distance charges apply.
                </p>
              </div>
            )}

            <button
  onClick={() =>
    navigate(
      isRemainingPayment
        ? "/my-bookings"
        : "/booking-success",
      {
        state: { booking },
      }
    )
  }
  className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black"
>
  Continue
</button>

            <p className="mt-5 text-center text-xs leading-6 text-slate-500">
              Your payment receipt and booking status are saved.
            </p>
          </motion.aside>
        </div>
      </section>

      <div className="fixed bottom-16 left-0 right-0 z-[9999] border-t border-white/10 bg-[#07111F]/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">
              {isRemainingPayment
                ? "Final Payment"
                : isRemote
                ? "Total Paid"
                : "Advance Paid"}
            </p>
            <p className="text-2xl font-black text-cyan-300">
              {symbol}
              {amountPaidNow.toFixed(2)}
            </p>
          </div>
        <button
  onClick={() =>
    navigate(
      isRemainingPayment
        ? "/my-bookings"
        : "/booking-success",
      {
        state: { booking },
      }
    )
  }
  className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black"
>
  Continue
</button>
        </div>
      </div>
    </main>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-3">
        <Icon size={17} className="text-cyan-300" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-3 break-words text-sm font-bold text-slate-100">
        {value}
      </p>
    </div>
  )
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5">
      <p className="text-slate-400">{label}</p>
      <p className="text-right font-black text-white">{value}</p>
    </div>
  )
}