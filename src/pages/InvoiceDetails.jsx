import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { getBookingById } from "../services/bookingService"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Home,
  Globe2,
  Mail,
  MapPin,
  ReceiptText,
  ShieldCheck,
  UserCheck,
  Wrench,
} from "lucide-react"
import jsPDF from "jspdf"
import logo from "../assets/geekonsites-logo.png"
import {
  generateInvoiceByBookingId,
  getInvoiceByBookingId,
} from "../services/invoiceService"

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

      await generateInvoiceByBookingId(bookingId)
      const finalBooking = await getBookingById(bookingId)
      const storedInvoice = await getInvoiceByBookingId(bookingId)

      const currencySymbol = finalBooking.currency === "GBP" || finalBooking.country === "UK" ? "\u00A3" : "$"

      const invoiceData = {
        invoiceNumber: storedInvoice.invoiceNumber || finalBooking.invoiceNumber || `GOS-${String(finalBooking.id).padStart(6, "0")}`,
        bookingId: `GOS-${finalBooking.id}`,
        sessionId: finalBooking.remoteSessionLink ? `REMOTE-${finalBooking.id}` : `ONSITE-${finalBooking.id}`,
        customerName: finalBooking.customerName || "Customer",
        customerEmail: finalBooking.customerEmail || "N/A",
        country: finalBooking.country === "UK" || finalBooking.currency === "GBP" ? "UK" : "US",
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

        totalAmount: Number(storedInvoice.paidAmount || finalBooking.paidAmount || finalBooking.totalAmount || 0).toFixed(2),

paymentMethod: storedInvoice.paymentMethod || finalBooking.paymentMethod || "Stripe Secure Checkout",

paymentType: finalBooking.paymentType || "FULL",

paymentStatus: storedInvoice.paymentStatus || finalBooking.paymentStatus || "PAID",
        invoiceDate: storedInvoice.issuedAt || finalBooking.invoiceGeneratedAt
          ? new Date(storedInvoice.issuedAt || finalBooking.invoiceGeneratedAt).toLocaleDateString("en-GB")
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

  const downloadInvoice = async () => {
  if (!invoice) return

  setDownloading(true)

  try {
    const pdf = new jsPDF("p", "mm", "a4")

    pdf.setFillColor(7, 17, 34)
    pdf.rect(0, 0, 210, 297, "F")

    const logoData = await imageDataUrl(logo)
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(12, 8, 74, 24, 1.5, 1.5, "F")
    pdf.addImage(logoData, "PNG", 15, 11, 68, 18)

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
      <main className="flex min-h-dvh items-center justify-center bg-[#edf2f5] px-5 text-gos-blue-deep"><div className="w-full max-w-sm rounded-lg border border-gos-border bg-white p-6 text-center shadow-sm"><img src={logo} alt="GeekOnSites" className="mx-auto h-auto w-48 object-contain" /><div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-gos-border"><span className="block h-full w-1/2 animate-pulse rounded-full bg-gos-turquoise" /></div><p className="mt-4 text-sm font-extrabold">Preparing your invoice</p></div></main>
    )
  }

  const isAdvanceInvoice =
    invoice.paymentStatus === "PARTIALLY_PAID" ||
    Number(invoice.remainingAmount) > 0

  return (
    <main className="gos-service-flow invoice-details-page relative min-h-screen overflow-x-hidden bg-[#edf2f5] px-3 pb-20 pt-14 text-gos-charcoal sm:px-5 sm:pt-16 lg:px-8 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.1),transparent_34%)]" />

      <section className="relative mx-auto w-full max-w-5xl">
        <div className="mb-2.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={21} />
          </button>

          <div className="rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-bold text-green-300">
            {isAdvanceInvoice ? "Advance Paid" : "Invoice Paid"}
          </div>
        </div>

        <div
          ref={invoiceRef}
          className="invoice-document rounded-xl border border-cyan-500/20 bg-[#071122] p-3.5 shadow-xl shadow-cyan-500/10 sm:p-5 lg:p-7"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between lg:pb-7">
            <div className="flex items-start gap-3 sm:gap-4">
  <img
    src={logo}
    alt="GeekOnSites Logo"
    className="h-12 w-auto object-contain sm:h-16"
  />

  <div>
    <h1 className="text-2xl font-black text-white sm:text-3xl">
      GeekOnSites
    </h1>

    <p className="mt-1 text-sm font-semibold text-cyan-300">
      Tech Experts at Your Doorstep
    </p>

    <div className="mt-3 space-y-1.5 text-xs leading-5 text-slate-400 sm:text-sm">
      <p className="flex items-center gap-2"><Globe2 size={14} className="shrink-0 text-gos-turquoise" />www.geekonsites.com</p>
      <p className="flex items-center gap-2 whitespace-nowrap"><Mail size={14} className="shrink-0 text-gos-turquoise" />support@geekonsites.com</p>
      <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-gos-turquoise" /><span>{invoice.country === "UK" ? "United Kingdom" : "United States"}</span></p>
    </div>
  </div>
</div>

            <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-left sm:text-right sm:p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                {isAdvanceInvoice ? "Advance Invoice" : "Paid Invoice"}
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {invoice.invoiceNumber}
              </h2>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-400 px-4 py-2 text-xs font-black text-black">
                <CheckCircle2 size={16} />
                {invoice.paymentStatus}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2.5 lg:grid-cols-3">
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

          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3.5 sm:p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-black">Service Summary</h3>
            </div>

            <p className="text-sm font-semibold leading-6 text-slate-400">
              {invoice.issueDescription}
            </p>

            <div className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
              {invoice.workPerformed.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 border-b border-gos-border py-2 last:border-b-0 sm:last:border-b"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <p className="text-xs font-semibold leading-5 text-white">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                Resolution Notes
              </p>
              <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-300">
                {invoice.resolutionNotes}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3.5 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-black">Payment Breakdown</h3>
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

          <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
            <div className="flex gap-4">
              <ShieldCheck className="h-7 w-7 shrink-0 text-green-400" />
              <div>
                <h4 className="font-black text-green-300">
                  {isAdvanceInvoice ? "Secure Advance Payment" : "Secure Completion"}
                </h4>
                <p className="mt-1 text-sm leading-6 text-green-100/70">
                  {isAdvanceInvoice
                    ? "Your advance payment is confirmed and this receipt is saved in booking history. The remaining balance is payable after service."
                    : "Meeting access has been closed and invoice details are saved in booking history."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="invoice-actions mx-auto mt-3 grid w-full max-w-xl grid-cols-3 gap-2">
          <button
            onClick={downloadInvoice}
            disabled={downloading}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-cyan-400 px-2 py-2 text-[11px] font-black text-black transition hover:bg-cyan-300 disabled:opacity-60 sm:text-xs"
          >
            <Download size={16} />
            {downloading ? "Preparing..." : "PDF"}
          </button>

          <button
            onClick={() => navigate("/my-bookings")}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-[#0b1628] px-2 py-2 text-[11px] font-black text-white transition hover:bg-cyan-500/10 sm:text-xs"
          >
            <Home size={16} className="text-cyan-300" />
            Bookings
          </button>

          <button
            onClick={() => navigate("/book-service")}
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-white/10 bg-[#0b1628] px-2 py-2 text-[11px] font-black text-white transition hover:bg-cyan-500/10 sm:text-xs"
          >
            <CreditCard size={16} className="text-cyan-300" />
            Book Again
          </button>
        </div>
      </section>
    </main>
  )
}

function InfoCard({ icon: Icon, title, items }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-300" />
        <h3 className="font-black text-white">{title}</h3>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-3 lg:block lg:space-y-2">
        {items.map(([label, value], index) => (
          <div key={index}>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-0.5 break-words text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PriceRow({ label, value, total }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-white/10 py-2.5 last:border-b-0 ${
        total ? "text-lg font-black text-white" : "text-sm text-slate-300"
      }`}
    >
      <span>{label}</span>
      <span className={total ? "text-green-300" : "text-white"}>{value}</span>
    </div>
  )
}

function imageDataUrl(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext("2d").drawImage(image, 0, 0)
      resolve(canvas.toDataURL("image/png"))
    }
    image.onerror = reject
    image.src = source
  })
}
