import { Capacitor } from "@capacitor/core"

export const GOOGLE_MAPS_SCRIPT_ID = "geekonsites-google-maps"
export const GOOGLE_MAPS_AUTH_FAILURE_EVENT = "geekonsites:google-maps-auth-failure"

export const isAndroidWebView = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android"

export const getGoogleMapsApiKey = () => {
  if (isAndroidWebView()) {
    return import.meta.env.VITE_GOOGLE_MAPS_ANDROID_WEBVIEW_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  }
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
}

export const installGoogleMapsAuthFailureHandler = () => {
  if (typeof window === "undefined") return
  window.gm_authFailure = () => window.dispatchEvent(new Event(GOOGLE_MAPS_AUTH_FAILURE_EVENT))
}
