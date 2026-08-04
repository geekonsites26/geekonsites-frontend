import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { createStripeCheckoutSession } from "../services/paymentService"
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MapPin,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react"

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const remainingPayment = location.state?.paymentType === "REMAINING"
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
 const [, forceUpdate] = useState(0)

useEffect(() => {
  const refresh = () => {
    forceUpdate((v) => v + 1)
  }

  window.addEventListener("gos-location-changed", refresh)

  return () =>
    window.removeEventListener(
      "gos-location-changed",
      refresh
    )
}, [])

  const booking = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentBooking"))
    } catch {
      return null
    }
  }, [])

 const selectedLocation = localStorage.getItem("gos_location") || "UK"

const country = booking?.country || selectedLocation

const currency =
  booking?.currency ||
  (selectedLocation === "US" ? "USD" : "GBP")

const symbol =
  selectedLocation === "US"
    ? "$"
    : "£"

  const isRemote = Boolean(booking?.remoteSessionRequired)

  const serviceFee = Number(
    booking?.baseAmount || booking?.serviceAmount || booking?.paymentAmount || 0
  )

  const addonsAmount = Number(booking?.addonsTotal || booking?.addonsAmount || 0)

  const protectionAmount = Number(
    booking?.antivirusTotal || booking?.antivirusAmount || 0
  )

  const platformFee = Number(booking?.platformFee || 12)

  const fullTotalAmount = Number(
    serviceFee + addonsAmount + protectionAmount + platformFee
  )

  const advancePercent = 0.3

  const amountPayableNow = remainingPayment
  ? Number(booking?.remainingAmount || 0)
  : isRemote
    ? fullTotalAmount
    : Number((fullTotalAmount * advancePercent).toFixed(2))

const remainingAmount = remainingPayment
  ? 0
  : isRemote
    ? 0
    : Number((fullTotalAmount - amountPayableNow).toFixed(2))

const paymentType = remainingPayment
  ? "Remaining Balance Payment"
  : isRemote
    ? "Full Payment"
    : "Advance Payment"

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

  const supportMethod = isRemote ? "Remote Support" : "On-Site Visit"

  const handlePayment = async () => {
    if (!booking?.id) {
      alert("Booking not found. Please book a service again.")
      navigate("/book-service")
      return
    }

    if (!acceptedTerms) {
      alert("Please accept Terms, Privacy Policy and Refund Policy.")
      return
    }

    try {
      setLoading(true)

    const paymentMode = remainingPayment
  ? "REMAINING"
  : isRemote
    ? "FULL"
    : "ADVANCE"

const session = await createStripeCheckoutSession(
  booking.id,
  paymentMode
)

window.location.href = session.checkoutUrl

    } catch (error) {
      console.error(error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111F] pb-32 pt-28 text-white lg:pt-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_35%)]" />

      <section className="relative mx-auto max-w-7xl px-4 pb-36 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-300">
            GEEKONSITES CHECKOUT
          </p>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            Secure Checkout
          </h1>

    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
  {remainingPayment
    ? "Your technician has completed the service. Please pay the remaining balance to close your booking and receive your final invoice."
    : isRemote
      ? "Remote services require full payment before the session starts."
      : "On-site services require an advance payment now. Remaining balance is payable after technician inspection or service completion."}
</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Booking Summary</p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {booking?.serviceType || "Selected Service"}
                  </h2>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">
                  {supportMethod}
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={UserRound}
                  label="Customer"
                  value={booking?.customerName || "Customer not provided"}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Date"
                  value={booking?.bookingDate || "Date not selected"}
                />

                <InfoItem
                  icon={Clock3}
                  label="Time Slot"
                  value={booking?.timeSlot || "Time not selected"}
                />

                <InfoItem icon={MapPin} label="Location" value={locationText} />
              </div>

              <div className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15">
                    <BadgeCheck className="text-amber-300" />
                  </div>

                  <div>
                    <h3 className="font-bold text-amber-100">
                      {remainingPayment
                        ? "Service Completed"
                       : isRemote
                        ? "Remote Session Access"
                       : "Technician Assignment ETA"}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-300">
  {remainingPayment
    ? "Your technician has completed the service. Complete the remaining payment to close the booking."
    : isRemote
      ? "Remote session access will be available after payment confirmation."
      : "A certified technician will be assigned within 10–15 minutes after advance payment confirmation."}
</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <ReceiptText className="text-cyan-300" />
                <h2 className="text-2xl font-bold">Price Breakdown</h2>
              </div>

              <div className="mt-6 space-y-4">
                <PriceRow label="Service Fee" value={`${symbol}${serviceFee.toFixed(2)}`} />
                <PriceRow label="Add-ons" value={`${symbol}${addonsAmount.toFixed(2)}`} />
                <PriceRow label="Protection Plan" value={`${symbol}${protectionAmount.toFixed(2)}`} />
                <PriceRow label="Platform Fee" value={`${symbol}${platformFee.toFixed(2)}`} />
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <PriceRow label="Total Service Amount" value={`${symbol}${fullTotalAmount.toFixed(2)}`} />

                {!isRemote && (
                  <>
                    <div className="mt-4">
                      <PriceRow
  label={
    remainingPayment
      ? "Remaining Balance"
      : "Advance Payable Now"
  }
  value={`${symbol}${amountPayableNow.toFixed(2)}`}
/>

{!remainingPayment && (
  <PriceRow
    label="Balance After Service"
    value={`${symbol}${remainingAmount.toFixed(2)}`}
  />
)}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-sm text-slate-400">{paymentType}</p>

                <p className="mt-2 text-4xl font-extrabold text-cyan-300">
                  {symbol}
                  {amountPayableNow.toFixed(2)}
                </p>
              </div>
            </Card>

           <Card>
  <div className="flex items-center gap-3">
    <LockKeyhole className="text-cyan-300" />
    <h2 className="text-2xl font-bold">Secure Stripe Checkout</h2>
  </div>

  <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
    <div className="flex items-start gap-4">
      <ShieldCheck className="mt-1 shrink-0 text-cyan-300" size={28} />

      <div>
        <h3 className="text-lg font-bold">
          Pay securely through Stripe
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-300">
          Clicking Pay Now opens GeekOnSites secure Stripe Checkout page.
          Stripe handles card payments securely, so GeekOnSites never stores
          raw card details.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            Credit & Debit Cards
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            Apple Pay / Google Pay when supported
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            PCI-DSS secure checkout
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            Encrypted payment processing
          </div>
        </div>
      </div>
    </div>
  </div>
</Card>

          </div>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <Card>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-cyan-300" />
                <h2 className="text-2xl font-bold">Payment Summary</h2>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-slate-400">
  {remainingPayment
    ? "Remaining Balance"
    : isRemote
      ? "Total Payable Now"
      : "Advance Payable Now"}
</p>

                <h3 className="mt-2 text-4xl font-extrabold text-cyan-300">
                  {symbol}
                  {amountPayableNow.toFixed(2)}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Currency: {currency}
                </p>
              </div>

              {!isRemote && (
                <div className="mt-5 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5">
                  <p className="text-sm font-bold text-amber-100">
                    Remaining Balance
                  </p>
                  <p className="mt-2 text-2xl font-extrabold">
                    {symbol}
                    {remainingAmount.toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Payable after technician inspection or service completion.
                    Parts, accessories, complex repairs, or long-distance travel
                    may change the final amount.
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <TrustItem text="SSL encrypted checkout" />
                <TrustItem text="US / UK payments only" />
                <TrustItem text="Secure refund support" />
                <TrustItem
                  text={isRemote ? "Remote session after payment" : "Technician assignment after advance"}
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-cyan-400"
                />

                <p className="text-sm leading-6 text-slate-400">
                  I agree to the GeekOnSites Terms of Service, Privacy Policy,
                  and Refund Policy. For on-site services, the first payment may
                  be treated as an advance booking payment. Taxes, regulatory
                  charges, parts, accessories, complex repair charges, or extra
                  distance fees may apply where required.
                </p>
              </div>

              <motion.button
                onClick={handlePayment}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-4 font-bold text-black shadow-xl shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                 {remainingPayment ? "Pay Remaining" : "Pay"} {symbol}
                 {amountPayableNow.toFixed(2)}
                   <ArrowRight size={18} />
                  </>
                )}
              </motion.button>

              <p className="mt-5 text-center text-xs leading-6 text-slate-500">
  {remainingPayment
    ? "After successful payment your booking will be closed automatically. Your final invoice will be available and you can rate your technician."
    : isRemote
      ? "After successful payment, your remote support flow will continue."
      : "After advance payment, technician assignment will start automatically."}
</p>
            </Card>
          </aside>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-16 z-[9999] border-t border-white/10 bg-[#07111F]/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">
              {remainingPayment
              ? "Remaining Due"
              : isRemote
             ? "Total Now"
             : "Advance Now"}
            </p>

            <p className="text-2xl font-extrabold text-cyan-300">
              {symbol}
              {amountPayableNow.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-extrabold text-black disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : remainingPayment
             ? "Pay Remaining"
               : "Pay Now"}
          </button>
        </div>
      </div>
    </main>
  )
}

function Card({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-white/10 bg-[#0D1B2A]/85 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7"
    >
      {children}
    </motion.div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-cyan-300" />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-3 font-semibold text-slate-100">{value}</p>
    </div>
  )
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <p className="text-slate-400">{label}</p>
      <p className="text-right font-bold">{value}</p>
    </div>
  )
}

function TrustItem({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <CheckCircle2 size={18} className="text-cyan-300" />
      <p className="text-sm text-slate-300">{text}</p>
    </div>
  )
}