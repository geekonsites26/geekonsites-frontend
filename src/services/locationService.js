import { getLocation, setLocation } from "../utils/location"
import { GOOGLE_MAPS_SCRIPT_ID, getGoogleMapsApiKey, installGoogleMapsAuthFailureHandler } from "../utils/googleMaps"

let googleMapsLoader

export const loadGoogleMaps = () => {
  const apiKey = getGoogleMapsApiKey()
  if (!apiKey) return Promise.reject(new Error("Address lookup is unavailable."))
  const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) || document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
  const existingKey = existing ? new URL(existing.src, window.location.href).searchParams.get("key") : null
  if (existing && existingKey !== apiKey) {
    existing.remove()
    googleMapsLoader = undefined
    if (window.google) delete window.google
  } else if (window.google?.maps?.Geocoder) {
    return Promise.resolve(window.google.maps)
  } else if (googleMapsLoader) {
    return googleMapsLoader
  }
  installGoogleMapsAuthFailureHandler()
  googleMapsLoader = new Promise((resolve, reject) => {
    const matchingScript = existingKey === apiKey ? existing : null
    const script = matchingScript || document.createElement("script")
    const finish = () => window.google?.maps?.Geocoder ? resolve(window.google.maps) : reject(new Error("Address lookup could not be loaded."))
    script.addEventListener("load", finish, { once: true })
    script.addEventListener("error", () => reject(new Error("Address lookup could not be loaded.")), { once: true })
    if (!matchingScript) {
      script.id = GOOGLE_MAPS_SCRIPT_ID
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })
  return googleMapsLoader
}

const component = (components, ...types) => {
  for (const type of types) {
    const match = components.find((item) => item.types.includes(type))
    if (match?.long_name) return match.long_name
  }
  return ""
}

const uniqueParts = (...parts) => [...new Set(parts.map((part) => part?.trim()).filter(Boolean))]
const retryableGeocoderStatuses = new Set(["UNKNOWN_ERROR", "OVER_QUERY_LIMIT", "ERROR"])
const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))
const locationOptions = { enableHighAccuracy: true, maximumAge: 0 }

const readCurrentPosition = (timeout) => new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(
    (position) => resolve({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : Number.POSITIVE_INFINITY,
    }),
    reject,
    { ...locationOptions, timeout }
  )
})

export const isSupportedCountry = (countryCode) => {
  return countryCode === "US" || countryCode === "GB" || countryCode === "UK"
}

export const normalizeCountryCode = (countryCode) => {
  if (countryCode === "GB") return "UK"
  return countryCode
}

export const getBrowserLocation = async () => {
  if (!navigator.geolocation) throw new Error("Geolocation is not supported by this browser.")
  const first = await readCurrentPosition(8000)
  if (first.accuracy <= 75) return first
  try {
    const second = await readCurrentPosition(5000)
    return second.accuracy < first.accuracy ? second : first
  } catch {
    return first
  }
}

export const isMateriallyDifferentOrBetterLocation = (previous, next) => {
  if (!previous || !next) return false
  const latitudeMeters = (next.latitude - previous.latitude) * 111320
  const longitudeMeters = (next.longitude - previous.longitude) * 111320 * Math.cos(previous.latitude * Math.PI / 180)
  const distanceMeters = Math.hypot(latitudeMeters, longitudeMeters)
  const materiallyBetter = Number.isFinite(next.accuracy) && (!Number.isFinite(previous.accuracy) || next.accuracy <= previous.accuracy * 0.8)
  return materiallyBetter || distanceMeters >= 15
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

export const reverseGeocodeAddress = async (latitude, longitude, { maxAttempts = 3 } = {}) => {
  const maps = await loadGoogleMaps()
  const geocoder = new maps.Geocoder()
  let results
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) await wait(attempt * 500)
    try {
      results = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (items, status) => {
          if (status === "OK" && items?.length) {
            resolve(items)
            return
          }
          const error = new Error(status === "ZERO_RESULTS" ? "No address was found for these coordinates." : "Address lookup failed.")
          error.geocoderStatus = status
          reject(error)
        })
      })
      break
    } catch (error) {
      const retryable = retryableGeocoderStatuses.has(error?.geocoderStatus)
      if (!retryable || attempt === maxAttempts - 1) throw error
    }
  }
  const components = results[0].address_components || []
  const countryEntry = components.find((item) => item.types.includes("country"))
  const route = component(components, "route")
  const locality = component(components, "locality")
  const area = component(components, "sublocality_level_1", "sublocality", "neighborhood")
  return {
    houseAddress: uniqueParts(component(components, "subpremise"), component(components, "premise"), component(components, "street_number")).join(", "),
    streetAddress: uniqueParts(route, area || (!route ? locality : "")).join(", "),
    city: locality || component(components, "postal_town", "administrative_area_level_2"),
    state: component(components, "administrative_area_level_1"),
    postalCode: component(components, "postal_code"),
    country: normalizeCountryCode(countryEntry?.short_name || ""),
    latitude,
    longitude,
  }
}

export const geocodeServiceAddress = async (address, countryCode) => {
  const maps = await loadGoogleMaps()
  const geocoder = new maps.Geocoder()
  const results = await new Promise((resolve, reject) => {
    geocoder.geocode({ address, componentRestrictions: { country: normalizeCountryCode(countryCode) === "UK" ? "GB" : "US" } }, (items, status) => {
      if (status === "OK" && items?.length) return resolve(items)
      reject(new Error(status === "ZERO_RESULTS" ? "We could not locate this service address. Please check it and try again." : "Address location lookup failed. Please try again."))
    })
  })
  const location = results[0]?.geometry?.location
  const latitude = location?.lat?.()
  const longitude = location?.lng?.()
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("The service address did not return valid map coordinates.")
  return { latitude, longitude }
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
