export const bookingAttemptKey = (booking) => [
  booking?.serviceMode,
  booking?.serviceType,
  booking?.bookingDate,
  booking?.timeSlot,
  booking?.customerId,
].map((value) => String(value ?? "").trim()).join("|")

export const findBookingCreatedByAttempt = (bookings, attempt) => {
  if (!attempt?.key || !attempt?.startedAt || !Array.isArray(bookings)) return null
  return bookings.find((booking) => {
    const createdAt = Date.parse(booking?.createdAt)
    return bookingAttemptKey(booking) === attempt.key && Number.isFinite(createdAt) && createdAt >= attempt.startedAt - 5000
  }) || null
}

export const checkoutAttemptKey = (bookingId, paymentType) => `${bookingId}:${paymentType}`
