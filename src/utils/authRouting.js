export const getDashboardPathForRole = (role) => {
  switch (String(role || "").toUpperCase()) {
    case "TECHNICIAN": return "/technician-dashboard"
    case "AGENT": return "/agent-dashboard"
    case "ADMIN": return "/admin-dashboard"
    case "CUSTOMER": return "/customer-dashboard"
    default: return "/"
  }
}
