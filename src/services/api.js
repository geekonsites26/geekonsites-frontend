const PRODUCTION_API_BASE_URL = "https://geekonsites-v2-backend.onrender.com"

export const API_BASE_URL = String(import.meta.env?.VITE_API_BASE_URL || (import.meta.env?.PROD ? PRODUCTION_API_BASE_URL : ""))
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "")
  .replace(/\/+$/, "")

export const getToken = () => localStorage.getItem("gos_token")

export const API_TIMEOUTS = Object.freeze({
  NORMAL: 30000,
  OPTIONAL: 20000,
  TRACKING: 25000,
  CRITICAL: 60000,
})

export const isTimeoutError = (error) => error?.code === "TIMEOUT"

export const getTokenRole = (token = getToken()) => {
  try {
    const payload = JSON.parse(atob(String(token).split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    const claim = payload.role || payload.roles?.[0] || payload.authorities?.[0]
    return claim ? String(claim).replace(/^ROLE_/, "").toUpperCase() : ""
  } catch {
    return ""
  }
}

export const setToken = (token) => {
  if (token) localStorage.setItem("gos_token", token)
}

export const setUser = (user) => {
  if (user) {
    const safeUser = { ...user }
    delete safeUser.password
    delete safeUser.currentPassword
    delete safeUser.newPassword
    localStorage.setItem("gos_user", JSON.stringify(safeUser))
  }
}

export const getUser = () => {
  try {
    const user = localStorage.getItem("gos_user")
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const clearAuth = ({ notify = true } = {}) => {
  localStorage.removeItem("gos_token")
  localStorage.removeItem("gos_user")
  localStorage.removeItem("gos_user_id")
  localStorage.removeItem("gos_role")
  localStorage.removeItem("customerLoggedIn")
  localStorage.removeItem("customerName")
  localStorage.removeItem("customerEmail")
  localStorage.removeItem("technicianLoggedIn")
  localStorage.removeItem("technicianAccount")
  localStorage.removeItem("agentLoggedIn")
  localStorage.removeItem("agentName")
  localStorage.removeItem("agentEmail")
  localStorage.removeItem("adminLoggedIn")
  localStorage.removeItem("currentBooking")
  if (notify) window.dispatchEvent?.(new CustomEvent("gos-auth-changed"))
}

export const establishAuthSession = (token, user) => {
  const role = String(user?.role || "").toUpperCase()
  const id = user?.id
  if (!token || !id || !["CUSTOMER", "TECHNICIAN", "AGENT", "ADMIN"].includes(role)) {
    clearAuth({ notify: false })
    throw new Error("Authenticated session identity is incomplete")
  }
  const tokenRole = getTokenRole(token)
  if (tokenRole && tokenRole !== role) {
    clearAuth({ notify: false })
    throw new Error("Authenticated token role does not match the user session")
  }
  clearAuth({ notify: false })
  setToken(token)
  setUser({ ...user, role })
  localStorage.setItem("gos_role", role)
  localStorage.setItem("gos_user_id", String(id))
  window.dispatchEvent?.(new CustomEvent("gos-auth-changed", { detail: { role, id } }))
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  const { timeoutMs = API_TIMEOUTS.NORMAL, ...fetchOptions } = options
  const externalSignal = fetchOptions.signal
  const timeoutController = new AbortController()
  let timedOut = false
  const forwardAbort = () => timeoutController.abort(externalSignal?.reason)
  if (externalSignal) {
    if (externalSignal.aborted) forwardAbort()
    else externalSignal.addEventListener("abort", forwardAbort, { once: true })
  }
  const timeoutId = window.setTimeout(() => {
    timedOut = true
    timeoutController.abort(new DOMException("Request timeout", "TimeoutError"))
  }, timeoutMs)

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: timeoutController.signal,
      headers,
    })
  } catch (error) {
    if (timedOut || error?.name === "AbortError") {
      throw Object.assign(new Error("The request is taking longer than expected. Please try again."), { code: "TIMEOUT", cause: error })
    }
    throw Object.assign(new Error("We’re having trouble connecting right now. Please try again shortly."), { code: "NETWORK_ERROR", cause: error })
  } finally {
    window.clearTimeout(timeoutId)
    externalSignal?.removeEventListener?.("abort", forwardAbort)
  }

  const contentType = response.headers.get("content-type")
  const isJson = contentType && contentType.includes("application/json")

  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "")

  if (!response.ok) {
    // 401 means the stored credentials are missing/invalid. A 403 means the
    // authenticated account is not allowed to perform this particular action;
    // clearing the shared token on 403 left the dashboard mounted and caused
    // every subsequent admin request to be sent without Authorization.
    if (response.status === 401) {
      clearAuth()
    }

    const serverMessage = typeof data === "string" ? data.trim() : data?.message || data?.error
    const safeFallback = response.status === 401
      ? "Incorrect email or password. Please try again."
      : response.status === 403
        ? "You don’t have permission to perform this action."
        : response.status === 404
          ? "The requested item could not be found."
          : response.status === 409
            ? "This item has already changed. Please refresh and try again."
            : response.status >= 500
              ? "Something went wrong on our side. Please try again shortly."
              : "Please check the information provided and try again."
    throw Object.assign(new Error(safeFallback), {
      status: response.status,
      code: typeof data === "object" ? data?.code : undefined,
      safeMessage: serverMessage,
    })
  }

  return data
}
