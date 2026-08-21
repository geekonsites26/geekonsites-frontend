import { useEffect, useState } from "react"

export const REGION_PROFILES = {
  US: { code: "US", country: "United States", currency: "USD", symbol: "$", locale: "en-US", dialCode: "+1", phone: "+1 (818) 934-4380", phoneHref: "tel:+18189344380", coverage: "United States service coverage" },
  UK: { code: "UK", country: "United Kingdom", currency: "GBP", symbol: "\u00A3", locale: "en-GB", dialCode: "+44", phone: "Email support", phoneHref: "mailto:support@geekonsites.com", coverage: "United Kingdom service coverage" },
}

export const normalizeRegionCode = (value) => {
  const normalized = String(value || "").trim().toUpperCase().replaceAll("_", " ")
  if (["UK", "GB", "GBR", "GBP", "UNITED KINGDOM", "GREAT BRITAIN"].includes(normalized)) return "UK"
  return "US"
}

export const getLocation = () => REGION_PROFILES[normalizeRegionCode(localStorage.getItem("gos_location"))]

export const setLocation = (code, source = "manual") => {
  const profile = REGION_PROFILES[normalizeRegionCode(code)]
  localStorage.setItem("gos_location", profile.code)
  localStorage.setItem("gos_country", profile.country)
  localStorage.setItem("gos_currency", profile.currency)
  localStorage.setItem("gos_symbol", profile.symbol)
  localStorage.setItem("gos_locale", profile.locale)
  localStorage.setItem("gos_dial_code", profile.dialCode)
  localStorage.setItem("gos_location_source", source)
  localStorage.removeItem("gos_unsupported_country")
  if (source === "detected") localStorage.setItem("gos_location_detected_at", String(Date.now()))
  window.dispatchEvent(new Event("gos-location-changed"))
  return profile
}

export const useRegion = () => {
  const [region, setRegion] = useState(getLocation)
  useEffect(() => {
    const update = () => setRegion(getLocation())
    window.addEventListener("gos-location-changed", update)
    return () => window.removeEventListener("gos-location-changed", update)
  }, [])
  return region
}
