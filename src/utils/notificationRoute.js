const ROLE_ROUTES = {
  CUSTOMER: ["/notifications", "/customer-dashboard", "/remote-session", "/track-technician", "/invoice", "/remaining-payment", "/rate-booking"],
  TECHNICIAN: ["/technician-dashboard", "/remote-session", "/track-technician", "/session-summary"],
  AGENT: ["/agent-dashboard", "/remote-session", "/track-technician", "/invoice", "/session-summary"],
  ADMIN: ["/admin-dashboard", "/remote-session", "/track-technician", "/invoice", "/session-summary"],
}

export const notificationFallback = (role) => {
  const value = String(role || "CUSTOMER").toUpperCase()
  if (value === "TECHNICIAN") return "/technician-dashboard?view=notifications"
  if (value === "AGENT") return "/agent-dashboard?view=notifications"
  if (value === "ADMIN") return "/admin-dashboard?view=notifications"
  return "/notifications"
}

export const safeNotificationPath = (actionUrl, role) => {
  const fallback = notificationFallback(role)
  if (typeof actionUrl !== "string" || !actionUrl.startsWith("/") || actionUrl.startsWith("//")) return fallback
  let parsed
  try {
    parsed = new URL(actionUrl, "https://geekonsites.local")
  } catch {
    return fallback
  }
  if (parsed.origin !== "https://geekonsites.local") return fallback
  const allowed = ROLE_ROUTES[String(role || "CUSTOMER").toUpperCase()] || []
  return allowed.some((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`))
    ? `${parsed.pathname}${parsed.search}${parsed.hash}`
    : fallback
}
