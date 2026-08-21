import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { loginUser, registerUser } from "../services/authService"
import { clearAuth, getToken, getUser, setToken, setUser } from "../services/api"
import { getLocation, setLocation } from "../utils/location"
import { unregisterPushDevice } from "../services/notificationService"

const CustomerAuthContext = createContext(null)

const getDisplayName = (source = {}) => {
  const user = source.user || source.customer || source
  return user.fullName || user.name || user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || ""
}

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [token, setAuthToken] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const savedToken = getToken()
    const savedUser = getUser()

    if (savedToken && savedUser) {
      setAuthToken(savedToken)
      setCustomer(savedUser)
    }

    setAuthReady(true)
  }, [])

  const registerCustomer = async (data) => {
    try {
      const payload = {
        fullName: data.fullName || data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        country: data.country || getLocation().code,
        role: "CUSTOMER",
      }

      const result = await registerUser(payload)

      return {
        success: true,
        user: result,
        message: result?.message || "Registration successful",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      }
    }
  }

  const loginCustomer = async (email, password) => {
    try {
      const result = await loginUser(email, password)

      const userRole = (
        result?.role ||
        result?.user?.role ||
        ""
      ).toUpperCase()

      if (userRole !== "CUSTOMER") {
        clearAuth()
        setCustomer(null)
        setAuthToken(null)

        return {
          success: false,
          message: "This login is only for customers.",
        }
      }

      const jwtToken =
        result?.token ||
        result?.jwt ||
        result?.accessToken

      const userData = {
        id: result?.id || result?.userId || result?.user?.id,
        fullName: getDisplayName(result),
        name: getDisplayName(result),
        email: result?.email || result?.user?.email,
        phone: result?.phone || result?.user?.phone,
        country: result?.country || result?.user?.country || getLocation().code,
        role: userRole,
      }

      if (!jwtToken) {
        throw new Error("Login token missing from backend response")
      }

      if (!userData.id) {
        throw new Error("User ID missing from backend response")
      }

      setToken(jwtToken)
      setUser(userData)

      localStorage.setItem("gos_user_id", userData.id)
      localStorage.setItem("gos_role", userRole)
      setLocation(userData.country)

      setAuthToken(jwtToken)
      setCustomer(userData)

      return {
        success: true,
        customer: userData,
        user: userData,
        role: userRole,
        token: jwtToken,
        message: result?.message || "Login successful",
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || "Login failed",
      }
    }
  }

  const logoutCustomer = () => {
    const pushToken = localStorage.getItem("gos_push_token")
    if (pushToken) {
      unregisterPushDevice(pushToken).catch(() => undefined)
      localStorage.removeItem("gos_push_token")
    }
    clearAuth()

    localStorage.removeItem("gos_user_id")
    localStorage.removeItem("gos_role")
    localStorage.removeItem("customerLoggedIn")
    localStorage.removeItem("customerName")
    localStorage.removeItem("customerEmail")

    setCustomer(null)
    setAuthToken(null)
  }

  const updateCustomerProfile = (updates) => {
    setCustomer((current) => {
      if (!current) return current
      const updated = { ...current, ...updates }
      setUser(updated)
      return updated
    })
  }

  const value = useMemo(
    () => ({
      customer,
      user: customer,
      token,
      authReady,
      isAuthenticated: Boolean(customer && token),
      registerCustomer,
      loginCustomer,
      logoutCustomer,
      updateCustomerProfile,
    }),
    [customer, token, authReady]
  )

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)

  if (!context) {
    throw new Error("useCustomerAuth must be used inside CustomerAuthProvider")
  }

  return context
}
