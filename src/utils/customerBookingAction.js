const normalize = (value) => String(value || "").trim().toUpperCase()

export const isRemoteBooking = (booking) => normalize(booking?.serviceMode) === "REMOTE"

export const customerServiceRoute = (booking) => isRemoteBooking(booking)
  ? "/remote-session"
  : `/track-technician/${booking?.id}`

export const onsiteTrackingAction = (booking) => {
  const status = normalize(booking?.bookingStatus || booking?.status)
  if (["TECHNICIAN_ACCEPTED", "ACCEPTED"].includes(status)) return { label: "Track Technician", canTrack: true, live: false }
  if (["TECHNICIAN_ON_THE_WAY", "ON_THE_WAY"].includes(status)) return { label: "Track Technician — live", canTrack: true, live: true }
  if (["TECHNICIAN_ARRIVED", "ARRIVED"].includes(status)) return { label: "Technician arrived", canTrack: true, live: true }
  if (["SERVICE_STARTED", "IN_PROGRESS"].includes(status)) return { label: "Service in progress", canTrack: true, live: true }
  if (["SERVICE_COMPLETED", "COMPLETED", "BOOKING_CLOSED", "FULLY_PAID"].includes(status)) return { label: "Service completed", canTrack: false, live: false }
  if (["TECHNICIAN_ASSIGNED", "ASSIGNED"].includes(status)) return { label: "Waiting for technician to accept", canTrack: false, live: false }
  return { label: "Technician assignment in progress", canTrack: false, live: false }
}

export const toRealPosition = (latitude, longitude) => {
  const lat = Number(latitude)
  const lng = Number(longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    ? { lat, lng }
    : null
}
