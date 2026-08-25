import { apiRequest, establishAuthSession, clearAuth } from "./api"

const persistLogin = (data) => {
  const token = data.token || data.jwt || data.accessToken

  if (!token) {
    throw new Error("Login successful but token missing from backend response")
  }

  const user = data.user || data.customer || data
  const fullName = user.fullName || user.name || user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || ""

  establishAuthSession(token, {
    id: user.id || data.id || data.userId,
    fullName,
    name: fullName,
    email: user.email || data.email,
    phone: user.phone || data.phone,
    role: String(user.role || data.role || "").toUpperCase(),
  })

  return data
}

const loginAt = async (endpoint, email, password, expectedRole) => {
  const data = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  const actualRole = String(data?.user?.role || data?.role || "").toUpperCase()
  if (expectedRole && actualRole !== expectedRole) {
    throw new Error(`This login is only for ${expectedRole.toLowerCase()} accounts.`)
  }

  return persistLogin(data)
}

export const loginUser = (email, password, expectedRole) => loginAt("/api/auth/login", email, password, expectedRole)

export const loginAdmin = (email, password) => loginAt("/api/admin/auth/login", email, password, "ADMIN")

export const registerUser = async (payload) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export const logoutUser = () => {
  clearAuth()
}

export const requestPasswordReset = async (email, options = {}) => {
  return apiRequest("/api/auth/forgot-password", {
    method: "POST",
    signal: options.signal,
    body: JSON.stringify({
      email,
      resetUrl: "https://geekonsites.com/reset-password",
    }),
  })
}

export const resetPassword = async (token, password) => {
  return apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  })
}
