const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "")
  .replace(/\/+$/, "")

export const getToken = () => localStorage.getItem("gos_token")

export const setToken = (token) => {
  if (token) localStorage.setItem("gos_token", token)
}

export const setUser = (user) => {
  if (user) localStorage.setItem("gos_user", JSON.stringify(user))
}

export const getUser = () => {
  try {
    const user = localStorage.getItem("gos_user")
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const clearAuth = () => {
  localStorage.removeItem("gos_token")
  localStorage.removeItem("gos_user")
  localStorage.removeItem("gos_user_id")
  localStorage.removeItem("gos_role")
  localStorage.removeItem("customerLoggedIn")
  localStorage.removeItem("customerName")
  localStorage.removeItem("customerEmail")
  localStorage.removeItem("technicianLoggedIn")
  localStorage.removeItem("technicianAccount")
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  const { timeoutMs = 20000, ...fetchOptions } = options
  const timeoutController = fetchOptions.signal ? null : new AbortController()
  const timeoutId = timeoutController
    ? window.setTimeout(() => timeoutController.abort(), timeoutMs)
    : null

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
      signal: fetchOptions.signal || timeoutController.signal,
      headers,
    })
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The server is taking too long to respond. Please try again.", { cause: error })
    }
    throw error
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId)
  }

  const contentType = response.headers.get("content-type")
  const isJson = contentType && contentType.includes("application/json")

  const data = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "")

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuth()
    }

    const serverMessage = typeof data === "string" ? data.trim() : data?.message || data?.error
    throw new Error(serverMessage || `Request failed with status ${response.status}`)
  }

  return data
}
