import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"
import { useCustomerAuth } from "../context/CustomerAuthContext"
import { registerPushDevice } from "../services/notificationService"
import { safeNotificationPath } from "../utils/notificationRoute"

export default function PushNotificationInitializer() {
  const navigate = useNavigate()
  const { isAuthenticated, customer } = useCustomerAuth()
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("gos_user") || "null") } catch { return null }
  })()
  const account = customer || storedUser
  const role = String(account?.role || localStorage.getItem("gos_role") || "").toUpperCase()

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isAuthenticated || !["CUSTOMER", "TECHNICIAN", "AGENT"].includes(role)) return undefined
    let active = true

    const start = async () => {
      await PushNotifications.removeAllListeners()

      await PushNotifications.addListener("registration", async ({ value }) => {
        if (!active || !value) return
        localStorage.setItem("gos_push_token", value)
        try { await registerPushDevice(value, Capacitor.getPlatform()) } catch (error) { console.error("Push token registration failed", error) }
      })

      await PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration failed", error)
      })

      await PushNotifications.addListener("pushNotificationReceived", (notification) => {
        window.dispatchEvent(new CustomEvent("gos:push-received", { detail: notification }))
        window.dispatchEvent(new CustomEvent("gos:notifications-updated", { detail: { refresh: true } }))
      })

      await PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
        navigate(safeNotificationPath(notification?.data?.actionUrl, role))
      })

      let permission = await PushNotifications.checkPermissions()
      if (permission.receive === "prompt") permission = await PushNotifications.requestPermissions()
      if (permission.receive === "granted") await PushNotifications.register()
    }

    start().catch((error) => console.error("Push notifications could not start", error))
    return () => {
      active = false
      PushNotifications.removeAllListeners().catch(() => undefined)
    }
  }, [isAuthenticated, navigate, role])

  return null
}
