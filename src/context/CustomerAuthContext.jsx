import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { loginUser, registerUser } from "../services/authService"
import { clearAuth, getToken, getUser, setToken, setUser } from "../services/api"

const CustomerAuthContext = createContext(null)

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
        fullName:
          result?.fullName ||
          result?.name ||
          result?.user?.fullName ||
          result?.user?.name,
        name:
          result?.fullName ||
          result?.name ||
          result?.user?.fullName ||
          result?.user?.name,
        email: result?.email || result?.user?.email,
        phone: result?.phone || result?.user?.phone,
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
    clearAuth()

    localStorage.removeItem("gos_user_id")
    localStorage.removeItem("gos_role")
    localStorage.removeItem("customerLoggedIn")
    localStorage.removeItem("customerName")
    localStorage.removeItem("customerEmail")

    setCustomer(null)
    setAuthToken(null)
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