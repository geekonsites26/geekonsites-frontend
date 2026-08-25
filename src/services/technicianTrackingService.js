import { Capacitor, registerPlugin } from "@capacitor/core"
import { API_BASE_URL, getToken } from "./api"

const TechnicianTracking = registerPlugin("TechnicianTracking")
export const hasNativeTechnicianTracking = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

export const startNativeTechnicianTracking = async (bookingId) => {
  const token = getToken()
  if (!hasNativeTechnicianTracking()) return { tracking: false, native: false }
  if (!token) throw new Error("Technician authentication is required for live tracking.")
  return TechnicianTracking.startTechnicianTracking({ bookingId: Number(bookingId), token, apiBaseUrl: API_BASE_URL })
}

export const openNativeCustomerNavigation = async (latitude, longitude) => {
  if (!hasNativeTechnicianTracking()) return { opened: false, native: false }
  return TechnicianTracking.openCustomerNavigation({ latitude: Number(latitude), longitude: Number(longitude) })
}

export const stopNativeTechnicianTracking = async () => {
  if (!hasNativeTechnicianTracking()) return
  await TechnicianTracking.stopTechnicianTracking()
}

export const getNativeTechnicianTrackingStatus = async () => {
  if (!hasNativeTechnicianTracking()) return { tracking: false, native: false }
  return TechnicianTracking.getTechnicianTrackingStatus()
}
