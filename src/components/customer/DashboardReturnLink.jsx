import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function DashboardReturnLink({ className = "", force = false, onClick, to = "/customer-dashboard" }) {
  const location = useLocation()
  const navigate = useNavigate()

  if (!force && !location.state?.fromCustomerDashboard) return null

  const destination = location.state?.fromCustomerDashboard ? "/customer-dashboard" : to
  const label = destination === "/customer-dashboard" ? "Back to dashboard" : "Back to home"

  return <button type="button" onClick={onClick || (() => navigate(destination))} className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-gos-blue transition hover:bg-white hover:text-gos-turquoise ${className}`} aria-label={label} title={label}><ArrowLeft size={18} strokeWidth={1.8} /></button>
}
