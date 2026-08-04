import { Navigate } from "react-router-dom"

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("gos_token")
  const role = localStorage.getItem("gos_role")

  if (!token || role !== "ADMIN") {
    return <Navigate to="/admin-login" replace />
  }

  return children
}