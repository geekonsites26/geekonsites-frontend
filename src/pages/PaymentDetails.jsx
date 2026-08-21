import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getBookingById } from "../services/bookingService"
import { confirmStripeCheckoutSession } from "../services/paymentService"
import { motion } from "framer-motion"
import { getLocation } from "../utils/location"
import {
  CheckCircle2,
  Clock3,
  FileText,
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
  const [confirming, setConfirming] = useState(true)
  const [confirmationError, setConfirmationError] = useState("")

  useEffect(() => {
  const loadLatestBooking = async () => {
    const params = new URLSearchParams(location.search)

    const bookingId = params.get("bookingId") || booking?.id
    const sessionId = params.get("session_id")

    if (!bookingId) {
      setConfirmationError("Booking details are missing. Return to your dashboard and open the booking again.")
      setConfirming(false)
      return
    }

    try {
      setConfirming(true)
      setConfirmationError("")
      const latestBooking = sessionId
        ? await confirmStripeCheckoutSession(sessionId)
        : await getBookingById(bookingId)
      setBooking(latestBooking)
      localStorage.setItem(
        "currentBooking",
        JSON.stringify(latestBooking)
      )
    } catch (error) {
      console.error(error)
      setConfirmationError(error.message || "Payment confirmation is still pending.")
    } finally {
      setConfirming(false)
    }
  }

  loadLatestBooking()
}, [location.search, booking?.id])

  const country = booking?.country || getLocation().code
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

  const remainingAmount = Number(booking?.remainingAmount || 0)

  const advanceAmount = Number(
    booking?.advanceAmount || booking?.paidAmount || totalAmount * 0.3
  )

  const amountPaidNow = isRemainingPayment
    ? Number(booking?.paymentAmount || totalAmount - advanceAmount)
    : isRemote
      ? Number(booking?.paidAmount || totalAmount)
      : advanceAmount

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

  if (confirming) {
    return <main className="flex min-h-screen items-center justify-center bg-gos-off-white px-4 pt-20"><div className="w-full max-w-md rounded-lg border border-gos-border bg-white p-7 text-center shadow-[var(--gos-shadow-md)]"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-gos-turquoise">Secure payment verification</p><h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">Confirming your payment.</h1><p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">Stripe is being verified securely. Keep this page open for a moment.</p></div></main>
  }

  if (confirmationError) {
    return <main className="flex min-h-screen items-center justify-center bg-gos-off-white px-4 pt-20"><div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-7 shadow-[var(--gos-shadow-md)]"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-red-600">Payment not confirmed</p><h1 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-bold text-gos-blue-deep">We could not verify this payment.</h1><p className="mt-3 text-sm font-semibold leading-6 text-gos-muted">{confirmationError}</p><button type="button" onClick={() => window.location.reload()} className="mt-6 min-h-11 w-full rounded-md bg-gos-blue-deep px-5 text-sm font-extrabold text-white">Try verification again</button></div></main>
  }

  return (
    <main className="gos-service-flow payment-confirmation-page relative min-h-screen overflow-hidden bg-[#07111F] pb-36 pt-20 text-white sm:pt-24 xl:pb-20 xl:pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_35%)]" />

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-cyan-300 sm:text-xs">
            PAYMENT CONFIRMED
          </p>

          <h1 className="mt-2 font-['Cormorant_Garamond'] text-4xl font-bold leading-none text-gos-blue-deep sm:text-5xl">
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

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-7">
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0 rounded-[2rem] border border-white/10 bg-[#0D1B2A]/85 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
          >
            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-black sm:h-12 sm:w-12">
                  <CheckCircle2 size={25} />
                </div>

                <div>
                  <h2 className="text-lg font-black leading-tight text-emerald-100 sm:text-xl">
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

            <div className="mt-5 rounded-[2rem] border border-white/10 bg-black/20 p-4 sm:p-5">
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

            <div className="mt-5 rounded-[2rem] border border-white/10 bg-black/20 p-4 sm:p-5">
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
                      ? `${booking.bookingDate} - ${booking.timeSlot}`
                      : "Not selected"
                  }
                />

                <InfoItem icon={MapPin} label="Location" value={locationText} />
              </div>
            </div>

            <div className="mt-5 rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-4 sm:p-5">
              <h3 className="font-black text-amber-100">
                {
                 isRemainingPayment
                 ? "Booking Completed"
                 : "Technician Assignment Pending"
                }
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                Expected assignment time is 10-15 minutes. You can track the
                booking status on the next screen.
              </p>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-fit rounded-[2rem] border border-white/10 bg-[#0D1B2A]/85 p-4 shadow-2xl backdrop-blur-xl sm:p-5 xl:sticky xl:top-28"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-cyan-300" />
              <h2 className="text-xl font-black">Receipt Summary</h2>
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

            {booking?.invoiceGenerated && (
              <button
                type="button"
                onClick={() => navigate("/invoice", { state: { booking } })}
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gos-border bg-white px-4 py-2.5 text-sm font-extrabold text-gos-blue-deep"
              >
                <FileText size={18} />
                {isRemote || isRemainingPayment ? "View Invoice" : "View Advance Invoice"}
              </button>
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
  className="mt-5 hidden min-h-12 w-full items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-black text-black xl:flex"
>
  Continue
</button>

            <p className="mt-5 text-center text-xs leading-6 text-slate-500">
              Your payment receipt and booking status are saved.
            </p>
          </motion.aside>
        </div>
      </section>

      <div className="payment-confirmation-bar fixed bottom-16 left-0 right-0 z-[9999] border-t border-white/10 bg-[#07111F]/95 p-3 backdrop-blur-xl xl:hidden">
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
  className="flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black"
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

      <p className="mt-3 break-all text-xs font-bold leading-5 text-slate-100 sm:text-sm">
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
