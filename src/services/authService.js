import { apiRequest, setToken, setUser, clearAuth } from "./api"

export const loginUser = async (email, password) => {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  const token = data.token || data.jwt || data.accessToken

  if (!token) {
    throw new Error("Login successful but token missing from backend response")
  }

  setToken(token)

  setUser({
    id: data.id || data.userId,
    fullName: data.fullName || data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
  })

  return data
}

export const registerUser = async (payload) => {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export const logoutUser = () => {
  clearAuth()
}