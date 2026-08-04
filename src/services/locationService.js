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

  localStorage.setItem("gos_location", location.countryCode)
  localStorage.setItem("gos_country_name", location.countryName)
  localStorage.setItem("gos_city", location.city)
  localStorage.setItem("gos_latitude", String(location.latitude))
  localStorage.setItem("gos_longitude", String(location.longitude))

  return location
}