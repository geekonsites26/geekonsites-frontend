export const isSupportedCountry = (countryCode) => {
  return countryCode === "US" || countryCode === "GB" || countryCode === "UK"
}

export const normalizeCountryCode = (countryCode) => {
  if (countryCode === "GB") return "UK"
  return countryCode
}

export const getBrowserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by this browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        reject("Location permission denied.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

export const detectCountryFromCoordinates = async (latitude, longitude) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  )

  if (!response.ok) {
    throw new Error("Unable to detect country.")
  }

  const data = await response.json()

  return {
    countryCode: normalizeCountryCode(data.countryCode),
    countryName: data.countryName,
    city: data.city || data.locality || "",
    latitude,
    longitude,
  }
}

export const autoDetectUserLocation = async () => {
  const coords = await getBrowserLocation()
  const location = await detectCountryFromCoordinates(
    coords.latitude,
    coords.longitude
  )

  localStorage.setItem("gos_country_name", location.countryName)
  localStorage.setItem("gos_city", location.city)
  localStorage.setItem("gos_latitude", String(location.latitude))
  localStorage.setItem("gos_longitude", String(location.longitude))

  if (isSupportedCountry(location.countryCode)) setLocation(location.countryCode, "detected")
  return location
}

export const initializeUserRegion = async () => {
  if (localStorage.getItem("gos_location_source") === "manual") return getLocation()

  const detectedAt = Number(localStorage.getItem("gos_location_detected_at") || 0)
  if (detectedAt && Date.now() - detectedAt < 24 * 60 * 60 * 1000) return getLocation()

  try {
    const detected = await autoDetectUserLocation()
    if (!isSupportedCountry(detected.countryCode)) {
      localStorage.setItem("gos_unsupported_country", "true")
      localStorage.setItem("gos_detected_country", detected.countryCode || "")
    } else {
      localStorage.removeItem("gos_unsupported_country")
    }
    return getLocation()
  } catch {
    const language = navigator.language || ""
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    const fallback = language.toLowerCase().includes("gb") || timeZone === "Europe/London" ? "UK" : "US"
    return setLocation(fallback, "fallback")
  }
}
import { getLocation, setLocation } from "../utils/location"
