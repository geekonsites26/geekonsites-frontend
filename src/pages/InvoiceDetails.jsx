import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
  generateInvoice,
  getBookingById,
} from "../services/bookingService"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Home,
  ReceiptText,
  ShieldCheck,
  UserCheck,
  Wrench,
} from "lucide-react"
import jsPDF from "jspdf"
import logo from "../assets/logo.png"

export default function InvoiceDetails() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { invoiceId } = useParams()
  const invoiceRef = useRef(null)

  const [invoice, setInvoice] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
  const loadInvoice = async () => {
    try {
      const stateBooking = state?.booking

     const bookingId =
      invoiceId ||
      stateBooking?.id

      if (!bookingId) {
        throw new Error("Booking ID not found")
      }

      const bookingData = await getBookingById(bookingId)

      const finalBooking =
        bookingData.invoiceGenerated
          ? bookingData
          : await generateInvoice(bookingId)

      const currencySymbol =
        finalBooking.currency === "USD" ? "$" : "£"

      const invoiceData = {
        invoiceNumber: finalBooking.invoiceNumber || `GOS-${String(finalBooking.id).padStart(6, "0")}`,
        bookingId: `GOS-${finalBooking.id}`,
        sessionId: finalBooking.remoteSessionLink ? `REMOTE-${finalBooking.id}` : `ONSITE-${finalBooking.id}`,
        customerName: finalBooking.customerName || "Customer",
        customerEmail: finalBooking.customerEmail || "N/A",
        technicianName: finalBooking.technicianName || "Technician Pending",
        technicianRole:
          finalBooking.serviceMode === "REMOTE"
          ? "Remote Support Specialist"
          : "Field Service Engineer",
        serviceType: finalBooking.serviceType || "Service",
        issueDescription: finalBooking.issueDescription || "Service completed successfully.",
        sessionDuration: finalBooking.remoteSessionStartedAt && finalBooking.remoteSessionEndedAt
          ? "Remote session completed"
          : "N/A",
        workPerformed: finalBooking.remoteSessionRequired
  ? [
      "Remote diagnostics completed",
      "Issue analyzed and resolved",
      "System tested successfully",
      "Remote session completed",
    ]
  : [
      "On-site technician visit completed",
      "Issue diagnosed and repaired",
      "System tested successfully",
      "Service completed",
    ],
        resolutionNotes:
          finalBooking.customerReview ||
          "Service has been processed and invoice generated based on the booking details.",
       currency: currencySymbol,

serviceAmount: Number(finalBooking.baseAmount || 0).toFixed(2),

platformFee: Number(finalBooking.platformFee || 0).toFixed(2),

advanceAmount: Number(finalBooking.advanceAmount || 0).toFixed(2),

remainingAmount: Number(finalBooking.remainingAmount || 0).toFixed(2),

totalAmount: Number(
  finalBooking.paidAmount || finalBooking.totalAmount || 0
).toFixed(2),

paymentMethod: finalBooking.paymentMethod || "Stripe Secure Checkout",

paymentType: finalBooking.paymentType || "FULL",

paymentStatus: finalBooking.paymentStatus || "PAID",
        invoiceDate: finalBooking.invoiceGeneratedAt
          ? new Date(finalBooking.invoiceGeneratedAt).toLocaleDateString("en-GB")
          : new Date().toLocaleDateString("en-GB"),
      }

      setInvoice(invoiceData)
    } catch (error) {
      console.error(error)
      alert(error.message || "Failed to load invoice.")
      navigate("/my-bookings")
    }
  }

  loadInvoice()
}, [invoiceId, state, navigate])

  const downloadInvoice = () => {
  if (!invoice) return

  setDownloading(true)

  try {
    const pdf = new jsPDF("p", "mm", "a4")

    pdf.setFillColor(7, 17, 34)
    pdf.rect(0, 0, 210, 297, "F")

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.text("GeekOnSites", 15, 20)

    pdf.setFontSize(11)
    pdf.setTextColor(34, 211, 238)
    pdf.text("Tech Experts at Your Doorstep", 15, 28)

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.text("INVOICE", 160, 20)

    pdf.setFontSize(10)
    pdf.text(`Invoice No: ${invoice.invoiceNumber}`, 15, 45)
    pdf.text(`Date: ${invoice.invoiceDate}`, 15, 52)
    pdf.text(`Booking ID: ${invoice.bookingId}`, 15, 59)
    pdf.text(`Session ID: ${invoice.sessionId}`, 15, 66)

    pdf.setTextColor(34, 211, 238)
    pdf.setFontSize(13)
    pdf.text("Customer Details", 15, 82)

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text(`Name: ${invoice.customerName}`, 15, 90)
    pdf.text(`Email: ${invoice.customerEmail}`, 15, 97)

    pdf.setTextColor(34, 211, 238)
    pdf.setFontSize(13)
    pdf.text("Technician Details", 110, 82)

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text(`Name: ${invoice.technicianName}`, 110, 90)
    pdf.text(`Role: ${invoice.technicianRole}`, 110, 97)

    pdf.setTextColor(34, 211, 238)
    pdf.setFontSize(13)
    pdf.text("Service Summary", 15, 115)

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text(`Service: ${invoice.serviceType}`, 15, 123)
    pdf.text(`Duration: ${invoice.sessionDuration}`, 15, 130)

    const issueLines = pdf.splitTextToSize(
      `Issue: ${invoice.issueDescription}`,
      180
    )
    pdf.text(issueLines, 15, 138)

    let y = 155

    pdf.setTextColor(34, 211, 238)
    pdf.setFontSize(13)
    pdf.text("Work Performed", 15, y)

    y += 8

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)

    invoice.workPerformed.forEach((item) => {
      pdf.text(`• ${item}`, 18, y)
      y += 7
    })

    y += 5

    pdf.setTextColor(34, 211, 238)
    pdf.setFontSize(13)
    pdf.text("Resolution Notes", 15, y)

    y += 8

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)

    const resolutionLines = pdf.splitTextToSize(
      invoice.resolutionNotes,
      180
    )
    pdf.text(resolutionLines, 15, y)

    y += resolutionLines.length * 6 + 10

    pdf.setTextColor(34, 211, 238)
    pdf.setFontSize(13)
    pdf.text("Payment Breakdown", 15, y)

    y += 10

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)

    pdf.text("Service Amount", 15, y)
pdf.text(`${invoice.currency}${invoice.serviceAmount}`, 170, y)

y += 8

pdf.text("Platform Fee", 15, y)
pdf.text(`${invoice.currency}${invoice.platformFee}`, 170, y)

y += 8

pdf.text("Advance Paid", 15, y)
pdf.text(`${invoice.currency}${invoice.advanceAmount}`, 170, y)

y += 8

if (Number(invoice.remainingAmount) > 0) {
  pdf.text("Remaining Balance", 15, y)
  pdf.text(`${invoice.currency}${invoice.remainingAmount}`, 170, y)
  y += 8
}

pdf.text("Payment Method", 15, y)
pdf.text(invoice.paymentMethod, 170, y)

y += 10

pdf.setFontSize(14)
pdf.setTextColor(74, 222, 128)
pdf.text(
  Number(invoice.remainingAmount) > 0 ? "AMOUNT PAID TODAY" : "TOTAL PAID",
  15,
  y
)
pdf.text(`${invoice.currency}${invoice.totalAmount}`, 165, y)

    y += 18

    pdf.setFontSize(10)
    pdf.setTextColor(160, 255, 190)
    pdf.text("Payment Status: PAID", 15, y)

    pdf.setTextColor(180, 180, 180)
    pdf.setFontSize(9)
    pdf.text(
      "This invoice was generated by GeekOnSites after secure remote service completion.",
      15,
      285
    )

    pdf.save(`${invoice.invoiceNumber || "GeekOnSites-Invoice"}.pdf`)
  } catch (error) {
    console.error("PDF download failed:", error)
    alert("PDF download failed. Please check console error.")
  } finally {
    setDownloading(false)
  }
}

  if (!invoice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020817] text-white">
        Loading Invoice...
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#020817] px-3 pb-24 pt-6 text-white sm:px-6 lg:px-8 lg:pt-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_34%)]" />

      <section className="relative mx-auto w-full max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
            Invoice Paid
          </div>
        </div>

        <div
          ref={invoiceRef}
          className="rounded-[1.4rem] border border-cyan-500/20 bg-[#071122] p-4 shadow-2xl shadow-cyan-500/10 sm:rounded-[2rem] sm:p-8 lg:p-10"
        >
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
  <img
    src={logo}
    alt="GeekOnSites Logo"
    className="h-20 w-auto object-contain"
  />

  <div>
    <h1 className="text-3xl font-black text-white sm:text-4xl">
      GeekOnSites
    </h1>

    <p className="mt-1 text-sm font-semibold text-cyan-300">
      Tech Experts at Your Doorstep
    </p>

    <div className="mt-4 space-y-1 text-sm leading-6 text-slate-400">
      <p>🌐 www.geekonsites.com</p>
      <p>📧 support@geekonsites.com</p>
      <p>📞 +1 (818) 934-4380</p>
      <p>📍 United States & United Kingdom</p>
    </div>
  </div>
</div>

            <div className="rounded-3xl border border-green-400/20 bg-green-400/10 p-5 text-left sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                Paid Invoice
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {invoice.invoiceNumber}
              </h2>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-400 px-4 py-2 text-xs font-black text-black">
                <CheckCircle2 size={16} />
                {invoice.paymentStatus}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <InfoCard
              icon={UserCheck}
              title="Customer"
              items={[
                ["Name", invoice.customerName],
                ["Email", invoice.customerEmail],
                ["Booking ID", invoice.bookingId],
              ]}
            />

            <InfoCard
              icon={Wrench}
              title="Technician"
              items={[
                ["Name", invoice.technicianName],
                ["Role", invoice.technicianRole],
                ["Session ID", invoice.sessionId],
              ]}
            />

            <InfoCard
              icon={Clock3}
              title="Session"
              items={[
                ["Date", invoice.invoiceDate],
                ["Duration", invoice.sessionDuration],
                ["Service", invoice.serviceType],
              ]}
            />
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/20 p-6">
            <div className="mb-5 flex items-center gap-3">
              <FileText className="h-5 w-5 text-cyan-300" />
              <h3 className="text-xl font-black">Service Summary</h3>
            </div>

            <p className="text-sm leading-7 text-slate-400">
              {invoice.issueDescription}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {invoice.workPerformed.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] p-4"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                  <p className="text-sm text-white">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Resolution Notes
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {invoice.resolutionNotes}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/20 p-6">
            <div className="mb-5 flex items-center gap-3">
              <ReceiptText className="h-5 w-5 text-cyan-300" />
              <h3 className="text-xl font-black">Payment Breakdown</h3>
            </div>
             
            <PriceRow
  label="Service Amount"
  value={`${invoice.currency}${invoice.serviceAmount}`}
/>

<PriceRow
  label="Platform Fee"
  value={`${invoice.currency}${invoice.platformFee}`}
/>

<PriceRow
  label="Advance Paid"
  value={`${invoice.currency}${invoice.advanceAmount}`}
/>

{Number(invoice.remainingAmount) > 0 && (
  <PriceRow
    label="Remaining Balance"
    value={`${invoice.currency}${invoice.remainingAmount}`}
  />
)}

<PriceRow
  label="Payment Method"
  value={invoice.paymentMethod}
/>

<PriceRow
  label={
    Number(invoice.remainingAmount) > 0
      ? "Amount Paid Today"
      : "Total Paid"
  }
  value={`${invoice.currency}${invoice.totalAmount}`}
  total
/>

          </div>

          <div className="mt-8 rounded-[2rem] border border-green-500/20 bg-green-500/10 p-5">
            <div className="flex gap-4">
              <ShieldCheck className="h-7 w-7 shrink-0 text-green-400" />
              <div>
                <h4 className="font-black text-green-300">
                  Secure Completion
                </h4>
                <p className="mt-1 text-sm leading-6 text-green-100/70">
                  Meeting access has been closed and invoice details are saved
                  in booking history.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <button
            onClick={downloadInvoice}
            disabled={downloading}
            className="flex items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-300 disabled:opacity-60"
          >
            <Download size={20} />
            {downloading ? "Generating PDF..." : "Download PDF"}
          </button>

          <button
            onClick={() => navigate("/my-bookings")}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-6 py-4 text-sm font-black text-white transition hover:bg-cyan-500/10"
          >
            <Home size={20} className="text-cyan-300" />
            My Bookings
          </button>

          <button
            onClick={() => navigate("/book-service")}
            className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0b1628] px-6 py-4 text-sm font-black text-white transition hover:bg-cyan-500/10"
          >
            <CreditCard size={20} className="text-cyan-300" />
            Book Again
          </button>
        </div>
      </section>
    </main>
  )
}

function InfoCard({ icon: Icon, title, items }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-cyan-300" />
        <h3 className="font-black text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map(([label, value], index) => (
          <div key={index}>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceRow({ label, value, total }) {
  return (
    <div
      className={`flex items-center justify-between border-b border-white/10 py-4 last:border-b-0 ${
        total ? "text-xl font-black text-white" : "text-sm text-slate-300"
      }`}
    >
      <span>{label}</span>
      <span className={total ? "text-green-300" : "text-white"}>{value}</span>
    </div>
  )
}
