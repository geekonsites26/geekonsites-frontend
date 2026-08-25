import { createPortal } from "react-dom"
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import BrandLogo from "../common/BrandLogo"

const errorWords = /error|fail|could not|couldn't|cannot|can't|invalid|denied|rejected|not approved|not found|already exists|unable/i
const warningWords = /please|select|enter|required|pending|waiting|missing/i

function inferredType(message) {
  if (errorWords.test(message)) return "error"
  if (warningWords.test(message)) return "warning"
  return "success"
}

export default function StatusToast({ message, type, branded = false }) {
  if (!message || typeof document === "undefined") return null
  const severity = type || inferredType(String(message))
  const Icon = severity === "error" ? XCircle : severity === "warning" ? AlertTriangle : CheckCircle2

  return createPortal(
    <div className={`gos-status-toast gos-status-toast--${severity}`} role={severity === "error" ? "alert" : "status"} aria-live={severity === "error" ? "assertive" : "polite"}>
      {branded && <BrandLogo className="h-7 w-auto shrink-0 rounded bg-white px-1" />}
      <Icon aria-hidden="true" />
      <p>{message}</p>
    </div>,
    document.body
  )
}
