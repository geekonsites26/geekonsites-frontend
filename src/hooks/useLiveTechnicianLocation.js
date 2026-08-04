import { useEffect, useRef, useState } from "react"
import { updateTechnicianLiveLocation } from "../services/technicianService"

export default function useLiveTechnicianLocation({
  bookingId,
  enabled,
  intervalMs = 7000,
}) {
  const [tracking, setTracking] = useState(false)
  const [error, setError] = useState("")
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!bookingId || !enabled) {
      stopTracking()
      return
    }

    startTracking()

    return () => stopTracking()
  }, [bookingId, enabled])

  const sendLocation = () => {
    if (!navigator.geolocation) {
      setError("Location is not supported on this device.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          await updateTechnicianLiveLocation(
  bookingId,
  {
    latitude,
    longitude,
    etaMinutes: null,
    remainingDistanceKm: null,
    speed:
      position.coords.speed != null
        ? Number((position.coords.speed * 3.6).toFixed(1))
        : null,
    heading: position.coords.heading ?? null,
    accuracy: position.coords.accuracy ?? null,
    currentRoad: "",
    liveTrackingStatus: "ON_THE_WAY",
    gpsTime: new Date().toISOString(),
  }
)

          setError("")
        } catch (err) {
          console.error(err)
          setError("Failed to update live location.")
        }
      },
      (geoError) => {
        console.error(geoError)
        setError("Please allow location permission for live tracking.")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )
  }

  const startTracking = () => {
    stopTracking()
    setTracking(true)

    sendLocation()

    intervalRef.current = setInterval(() => {
      sendLocation()
    }, intervalMs)
  }

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setTracking(false)
  }

  return {
    tracking,
    error,
    startTracking,
    stopTracking,
  }
}