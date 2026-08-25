export const normalizeBookingStatus = (booking = {}) => {
  const raw = String(booking.bookingStatus || booking.status || "PENDING").toUpperCase()
  if (raw === "ASSIGNED") return "TECHNICIAN_ASSIGNED"
  if (raw === "ACCEPTED") return "TECHNICIAN_ACCEPTED"
  return raw
}

export const TECHNICIAN_DECISION_STATUSES = ["TECHNICIAN_ASSIGNED"]
export const TECHNICIAN_ACTIVE_STATUSES = ["TECHNICIAN_ACCEPTED", "TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED", "REMOTE_SESSION_STARTED", "REMAINING_PAYMENT_PENDING"]

export const classifyTechnicianBooking = (booking = {}) => {
  const status = normalizeBookingStatus(booking)
  if (TECHNICIAN_DECISION_STATUSES.includes(status)) return "jobs"
  if (TECHNICIAN_ACTIVE_STATUSES.includes(status)) return "active"
  if (["SERVICE_COMPLETED", "COMPLETED", "CLOSED", "INVOICE_GENERATED", "FULLY_PAID", "BOOKING_CLOSED"].includes(status)) return "completed"
  return "other"
}
