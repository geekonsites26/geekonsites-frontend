import { Capacitor, registerPlugin } from "@capacitor/core"
import { getToken } from "./api"

const TechnicianTracking = registerPlugin("TechnicianTracking")
const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "").replace(/\/api$/, "")

export const hasNativeTechnicianTracking = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

export const startNativeTechnicianTracking = async (bookingId) => {
  const token = getToken()
  if (!hasNativeTechnicianTracking()) return { tracking: false, native: false }
  if (!token) throw new Error("Technician authentication is required for live tracking.")
  return TechnicianTracking.startTechnicianTracking({ bookingId: Number(bookingId), token, apiBaseUrl })
}

export const stopNativeTechnicianTracking = async () => {
  if (!hasNativeTechnicianTracking()) return
  await TechnicianTracking.stopTechnicianTracking()
}

export const getNativeTechnicianTrackingStatus = async () => {
  if (!hasNativeTechnicianTracking()) return { tracking: false, native: false }
  return TechnicianTracking.getTechnicianTrackingStatus()
}
