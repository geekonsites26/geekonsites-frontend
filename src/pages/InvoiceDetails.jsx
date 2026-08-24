import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Capacitor } from "@capacitor/core"
import { getBookingById } from "../services/bookingService"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Home,
  Globe2,
  Mail,
  MapPin,
  ReceiptText,
  Share2,
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
import { saveAndSharePdf } from "../services/nativeFile"
import { SkeletonInvoice } from "../components/ui/Skeleton"
import { formatLocalDateTime } from "../utils/dateTime"

export default function InvoiceDetails() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { invoiceId } = useParams()
  const invoiceRef = useRef(null)
  const nativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

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
        serviceMode: finalBooking.serviceMode === "REMOTE" ? "Remote Support" : "On-site Visit",
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
          ? formatLocalDateTime(storedInvoice.issuedAt || finalBooking.invoiceGeneratedAt, finalBooking)
          : formatLocalDateTime(new Date(), finalBooking),
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

    // Repaint the output with the same clean, card-based hierarchy as the
    // on-screen invoice. This intentionally leaves all invoice calculations
    // and values above untouched; only the final PDF presentation changes.
    renderInvoicePdf(pdf, invoice, logoData)

    const fileName = `GeekOnSites-Invoice-${invoice.invoiceNumber || "receipt"}`
    if (nativeAndroid) {
      // jsPDF's .save() relies on a browser download link, which does nothing
      // inside the Android WebView. Write the file and hand it to the native
      // share sheet instead so the customer can actually save or send it.
      await saveAndSharePdf(pdf, fileName, { title: "GeekOnSites Invoice", text: `Invoice ${invoice.invoiceNumber}` })
    } else {
      pdf.save(`${fileName}.pdf`)
    }
  } catch (error) {
    console.error("PDF download failed:", error)
    alert("PDF download failed. Please check console error.")
  } finally {
    setDownloading(false)
  }
}

  if (!invoice) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#edf2f5] px-5 text-gos-blue-deep">
        <div className="w-full max-w-sm">
          <img src={logo} alt="GeekOnSites" className="mx-auto h-auto w-40 object-contain" />
          <p className="mt-3 text-center text-sm font-extrabold">Preparing your invoice</p>
          <SkeletonInvoice dark={false} className="mt-4" />
        </div>
      </main>
    )
  }

  const isAdvanceInvoice =
    invoice.paymentStatus === "PARTIALLY_PAID" ||
    Number(invoice.remainingAmount) > 0

  if (nativeAndroid) {
    return (
      <main className="native-invoice-page min-h-[100dvh] overflow-x-hidden bg-[#f4f7f9] pb-[calc(4.75rem+env(safe-area-inset-bottom))] text-gos-charcoal">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#dfe8ed] bg-[#f8fbfc]/95 px-3 pb-3 pt-[max(10px,env(safe-area-inset-top))] backdrop-blur-xl">
          <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gos-off-white text-gos-blue-deep" aria-label="Go back"><ChevronLeft size={19} /></button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold leading-tight text-gos-blue-deep">Invoice {invoice.invoiceNumber}</p>
            <p className="truncate text-[11px] font-semibold text-gos-muted">{invoice.bookingId}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700"><CheckCircle2 size={11} />{isAdvanceInvoice ? "Advance Paid" : "Paid"}</span>
        </header>

        <div className="space-y-3 px-3 py-3.5">
          <section className="flex items-center gap-3 rounded-2xl border border-gos-border bg-white p-4">
            <img src={logo} alt="GeekOnSites" className="h-9 w-auto shrink-0 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-gos-blue-deep">{invoice.invoiceNumber}</p>
              <p className="truncate text-[11px] font-semibold text-gos-muted">{invoice.country === "UK" ? "United Kingdom" : "United States"} · {invoice.invoiceDate}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-gos-border bg-white p-3.5">
            <div className="mb-1 flex items-center gap-2 text-gos-blue-deep"><ReceiptText size={15} className="text-gos-turquoise" /><h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">Summary</h2></div>
            <NativePriceRow label="Service" value={invoice.serviceType} />
            <NativePriceRow label="Booking ID" value={invoice.bookingId} />
            <NativePriceRow label="Support mode" value={invoice.serviceMode} />
            {invoice.technicianName && invoice.technicianName !== "Technician Pending" && <NativePriceRow label="Technician" value={invoice.technicianName} />}
          </section>

          <InvoiceInfoRow icon={UserCheck} title="Customer" lines={[invoice.customerName, invoice.customerEmail]} />

          <section className="rounded-2xl border border-gos-border bg-white p-3.5">
            <div className="mb-2 flex items-center gap-2 text-gos-blue-deep"><FileText size={15} className="text-gos-turquoise" /><h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">Service summary</h2></div>
            <p className="text-xs font-semibold leading-6 text-gos-muted">{invoice.issueDescription}</p>
            <div className="mt-3 space-y-1.5">
              {invoice.workPerformed.map((item, index) => (
                <div key={index} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /><p className="text-xs font-semibold leading-5 text-gos-charcoal">{item}</p></div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gos-border bg-white p-3.5">
            <div className="mb-2 flex items-center gap-2 text-gos-blue-deep"><ReceiptText size={15} className="text-gos-turquoise" /><h2 className="text-xs font-extrabold uppercase tracking-[0.08em]">Payment breakdown</h2></div>
            <NativePriceRow label="Service amount" value={`${invoice.currency}${invoice.serviceAmount}`} />
            <NativePriceRow label="Platform fee" value={`${invoice.currency}${invoice.platformFee}`} />
            <NativePriceRow label="Advance paid" value={`${invoice.currency}${invoice.advanceAmount}`} />
            {Number(invoice.remainingAmount) > 0 && <NativePriceRow label="Remaining balance" value={`${invoice.currency}${invoice.remainingAmount}`} />}
            <NativePriceRow label="Payment method" value={invoice.paymentMethod} />
            <NativePriceRow label={Number(invoice.remainingAmount) > 0 ? "Amount paid today" : "Total paid"} value={`${invoice.currency}${invoice.totalAmount}`} total />
          </section>

          <section className="flex gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" />
            <p className="text-xs font-semibold leading-5 text-emerald-800">{isAdvanceInvoice ? "Your advance payment is confirmed and saved in booking history. The remaining balance is payable after service." : "Meeting access has been closed and this invoice is saved in your booking history."}</p>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gos-border bg-white/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
          <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
            <button onClick={downloadInvoice} disabled={downloading} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-gos-blue-deep text-[11px] font-black text-white disabled:opacity-60">
              {downloading ? <Download size={15} className="animate-pulse" /> : <Share2 size={15} />}
              {downloading ? "Preparing" : "Share / Save PDF"}
            </button>
            <button onClick={() => navigate("/my-bookings")} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-gos-border bg-white text-[11px] font-black text-gos-blue-deep"><Home size={15} className="text-gos-turquoise" />Bookings</button>
            <button onClick={() => navigate("/book-service")} className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-gos-border bg-white text-[11px] font-black text-gos-blue-deep"><CreditCard size={15} className="text-gos-turquoise" />Book Again</button>
          </div>
        </div>
      </main>
    )
  }

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

function InvoiceInfoRow({ icon: Icon, title, lines }) {
  return (
    <section className="flex items-center gap-3 rounded-2xl border border-gos-border bg-white p-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf7f5] text-gos-turquoise"><Icon size={16} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-gos-muted">{title}</p>
        {lines.filter(Boolean).map((line) => <p key={line} className="mt-0.5 truncate text-xs font-bold text-gos-blue-deep">{line}</p>)}
      </div>
    </section>
  )
}

function NativePriceRow({ label, value, total }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-gos-border py-2 last:border-b-0 ${total ? "text-sm font-black text-gos-blue-deep" : "text-xs font-semibold text-gos-muted"}`}>
      <span>{label}</span>
      <span className={total ? "text-emerald-600" : "text-gos-charcoal"}>{value}</span>
    </div>
  )
}

function renderInvoicePdf(pdf, invoice, logoData) {
  const pageWidth = 210
  const pageHeight = 297
  const margin = 8
  const contentWidth = pageWidth - margin * 2
  const navy = [8, 48, 82]
  const teal = [11, 145, 154]
  const green = [12, 123, 83]
  const border = [205, 221, 231]
  const pale = [247, 250, 252]
  const mint = [235, 249, 242]

  const pageBackground = () => {
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageWidth, pageHeight, "F")
  }
  const setText = (size = 8, color = navy, style = "normal") => {
    pdf.setFont("helvetica", style)
    pdf.setFontSize(size)
    pdf.setTextColor(...color)
  }
  const roundedCard = (x, y, width, height, fill = pale, stroke = border) => {
    pdf.setFillColor(...fill)
    pdf.setDrawColor(...stroke)
    pdf.setLineWidth(0.35)
    pdf.roundedRect(x, y, width, height, 1.5, 1.5, "FD")
  }
  const safeLines = (value, width) => pdf.splitTextToSize(String(value || "N/A"), width)
  const detailCard = (x, y, width, title, items) => {
    const wrapped = items.map(([label, value]) => [label, safeLines(value, width - 6)])
    const height = Math.max(35, 8 + wrapped.reduce((sum, [, lines]) => sum + 4 + lines.length * 3.4, 0))
    roundedCard(x, y, width, height)
    setText(7.2, teal, "bold")
    pdf.text(title, x + 3, y + 5)
    let lineY = y + 10
    wrapped.forEach(([label, lines]) => {
      setText(5.7, [83, 108, 126], "bold")
      pdf.text(label, x + 3, lineY)
      setText(6.7, navy, "bold")
      pdf.text(lines, x + 3, lineY + 3)
      lineY += 4 + lines.length * 3.4
    })
    return height
  }
  const sectionHeader = (title, x, y) => {
    setText(7.5, navy, "bold")
    pdf.text(title, x + 3, y + 6)
  }

  pageBackground()
  pdf.addImage(logoData, "PNG", margin, 8, 48, 13)
  setText(13, navy, "bold")
  pdf.text("GeekOnSites", 58, 13)
  setText(6.3, teal, "bold")
  pdf.text("Tech Experts at Your Doorstep", 58, 18)
  setText(5.8, [83, 108, 126])
  pdf.text(["www.geekonsites.com", "support@geekonsites.com", invoice.country === "UK" ? "United Kingdom" : "United States"], 58, 23)

  roundedCard(160, 7, 42, 25, mint, [168, 224, 193])
  setText(5.5, green, "bold")
  pdf.text(Number(invoice.remainingAmount) > 0 ? "ADVANCE INVOICE" : "PAID INVOICE", 181, 13, { align: "center" })
  setText(8.5, navy, "bold")
  pdf.text(safeLines(invoice.invoiceNumber, 36), 181, 19, { align: "center" })
  pdf.setFillColor(...green)
  pdf.roundedRect(171, 25, 20, 4.8, 2.2, 2.2, "F")
  setText(5.3, [255, 255, 255], "bold")
  pdf.text(String(invoice.paymentStatus || "PAID"), 181, 28.3, { align: "center" })
  pdf.setDrawColor(...border)
  pdf.line(margin, 36, pageWidth - margin, 36)

  const gap = 2
  const cardWidth = (contentWidth - gap * 2) / 3
  const cardsY = 40
  const heights = [
    detailCard(margin, cardsY, cardWidth, "Customer", [["Name", invoice.customerName], ["Email", invoice.customerEmail], ["Booking ID", invoice.bookingId]]),
    detailCard(margin + cardWidth + gap, cardsY, cardWidth, "Technician", [["Name", invoice.technicianName], ["Role", invoice.technicianRole], ["Session ID", invoice.sessionId]]),
    detailCard(margin + (cardWidth + gap) * 2, cardsY, cardWidth, "Session", [["Date", invoice.invoiceDate], ["Duration", invoice.sessionDuration], ["Service", invoice.serviceType]]),
  ]
  let y = cardsY + Math.max(...heights) + 3

  const issueLines = safeLines(invoice.issueDescription, contentWidth - 6)
  const workRows = invoice.workPerformed.map((item) => safeLines(item, (contentWidth - 14) / 2))
  const workHeight = Math.ceil(workRows.length / 2) * 7
  const resolutionLines = safeLines(invoice.resolutionNotes, contentWidth - 12)
  const serviceHeight = 18 + issueLines.length * 3.5 + workHeight + 9 + resolutionLines.length * 3.5
  roundedCard(margin, y, contentWidth, serviceHeight)
  sectionHeader("Service Summary", margin, y)
  setText(6.5, navy)
  pdf.text(issueLines, margin + 3, y + 11)
  let workY = y + 13 + issueLines.length * 3.5
  workRows.forEach((lines, index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = margin + 3 + column * (contentWidth / 2)
    const rowY = workY + row * 7
    pdf.setDrawColor(...border)
    pdf.line(x, rowY + 4.7, x + contentWidth / 2 - 5, rowY + 4.7)
    pdf.setDrawColor(...green)
    pdf.circle(x + 1.2, rowY + 1.5, 0.8, "S")
    setText(5.9, navy)
    pdf.text(lines, x + 3.2, rowY + 2.2)
  })
  const resolutionY = workY + workHeight
  roundedCard(margin + 3, resolutionY, contentWidth - 6, 6 + resolutionLines.length * 3.5, [239, 252, 252], [125, 211, 213])
  setText(5.4, teal, "bold")
  pdf.text("RESOLUTION NOTES", margin + 6, resolutionY + 3.3)
  setText(5.7, navy)
  pdf.text(resolutionLines, margin + 6, resolutionY + 6.5)
  y += serviceHeight + 3

  const rows = [
    ["Service Amount", `${invoice.currency}${invoice.serviceAmount}`],
    ["Platform Fee", `${invoice.currency}${invoice.platformFee}`],
    ["Advance Paid", `${invoice.currency}${invoice.advanceAmount}`],
    ...(Number(invoice.remainingAmount) > 0 ? [["Remaining Balance", `${invoice.currency}${invoice.remainingAmount}`]] : []),
    ["Payment Method", invoice.paymentMethod],
  ]
  const paymentHeight = 14 + rows.length * 7 + 9
  if (y + paymentHeight + 18 > pageHeight - 7) {
    pdf.addPage()
    pageBackground()
    y = 10
  }
  roundedCard(margin, y, contentWidth, paymentHeight)
  sectionHeader("Payment Breakdown", margin, y)
  let rowY = y + 11
  rows.forEach(([label, value]) => {
    setText(6.2, [83, 108, 126])
    pdf.text(label, margin + 3, rowY)
    setText(6.2, navy, "bold")
    pdf.text(safeLines(value, 75), pageWidth - margin - 3, rowY, { align: "right" })
    pdf.setDrawColor(...border)
    pdf.line(margin + 3, rowY + 2.5, pageWidth - margin - 3, rowY + 2.5)
    rowY += 7
  })
  setText(8.5, navy, "bold")
  pdf.text(Number(invoice.remainingAmount) > 0 ? "Amount Paid Today" : "Total Paid", margin + 3, rowY + 1)
  setText(9.5, green, "bold")
  pdf.text(`${invoice.currency}${invoice.totalAmount}`, pageWidth - margin - 3, rowY + 1, { align: "right" })
  y += paymentHeight + 3

  const completionText = Number(invoice.remainingAmount) > 0
    ? "Your advance payment is confirmed and saved in booking history. The remaining balance is payable after service."
    : "Meeting access has been closed and invoice details are saved in booking history."
  const completionLines = safeLines(completionText, contentWidth - 16)
  roundedCard(margin, y, contentWidth, 10 + completionLines.length * 3.3, mint, [168, 224, 193])
  setText(6.5, green, "bold")
  pdf.text(Number(invoice.remainingAmount) > 0 ? "Secure Advance Payment" : "Secure Completion", margin + 5, y + 5)
  setText(5.7, [41, 104, 77])
  pdf.text(completionLines, margin + 5, y + 9)
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
