import { getLocation, setLocation } from "../utils/location"

let googleMapsLoader

const loadGoogleMaps = () => {
  if (window.google?.maps?.Geocoder) return Promise.resolve(window.google.maps)
  if (googleMapsLoader) return googleMapsLoader
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) return Promise.reject(new Error("Address lookup is unavailable."))
  googleMapsLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
    const script = existing || document.createElement("script")
    const finish = () => window.google?.maps?.Geocoder ? resolve(window.google.maps) : reject(new Error("Address lookup could not be loaded."))
    script.addEventListener("load", finish, { once: true })
    script.addEventListener("error", () => reject(new Error("Address lookup could not be loaded.")), { once: true })
    if (!existing) {
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
      (error) => {
        reject(error)
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

export const reverseGeocodeAddress = async (latitude, longitude) => {
  const maps = await loadGoogleMaps()
  const geocoder = new maps.Geocoder()
  let results
  for (let attempt = 0; attempt < 3; attempt += 1) {
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
      if (!retryable || attempt === 2) throw error
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
