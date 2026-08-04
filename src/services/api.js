const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get("content-type")
  const isJson = contentType && contentType.includes("application/json")

  const data = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAuth()
    }

    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    )
  }

  return data
}