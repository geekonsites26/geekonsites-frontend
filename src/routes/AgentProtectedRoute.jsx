import { Navigate } from "react-router-dom"

export default function AgentProtectedRoute({ children }) {
  const token = localStorage.getItem("gos_token")
  const role = localStorage.getItem("gos_role")

  if (!token || role !== "AGENT") {
    return <Navigate to="/agent-login" replace />
  }

  return children
}