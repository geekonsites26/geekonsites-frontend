import { useRef, useState } from "react"
import { Phone } from "lucide-react"
import { useRegion } from "../../utils/location"
import { getSupportAvailability } from "../../services/supportCallService"
import StatusToast from "../ui/StatusToast"

// Compact, provider-neutral "Call Support" action for the customer
// dashboard. Dials the real GeekOnSites number when one is configured for
// the customer's region; otherwise it is an honest, non-blocking notice —
// never a fabricated agent connection. See src/services/supportCallService.js
// for the future VICIdial plug-in point.
export default function SupportCallAction({ booking, className = "" }) {
  const region = useRegion()
  const availability = getSupportAvailability(region)
  const [notice, setNotice] = useState("")
  const noticeTimer = useRef(null)

  const showNotice = (message) => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(""), 4500)
  }

  const baseClass = `flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-gos-border px-3 text-[10px] font-extrabold transition ${className}`

  if (availability.mode === "phone") {
    return (
      <a
        href={availability.phoneHref}
        aria-label={`Call GeekOnSites support at ${availability.phone}${booking?.id ? ` about booking GOS-${booking.id}` : ""}`}
        className={`${baseClass} text-gos-blue hover:border-gos-turquoise hover:text-gos-turquoise`}
      >
        <Phone size={13} /> Call Support
      </a>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => showNotice(availability.message)}
        aria-label="Call Support — currently unavailable"
        className={`${baseClass} text-gos-muted hover:border-gos-turquoise hover:text-gos-blue`}
      >
        <Phone size={13} /> Call Support
      </button>
      <StatusToast message={notice} type="warning" />
    </>
  )
}
