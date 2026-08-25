export const validGoogleMeetLink = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === "meet.google.com" && /^\/[a-z0-9-]+\/?$/i.test(url.pathname) ? url.href : ""
  } catch {
    return ""
  }
}

export const remoteSessionReady = (booking = {}) =>
  booking.paymentStatus === "PAID" &&
  ["READY", "STARTED", "IN_PROGRESS"].includes(booking.remoteSessionStatus) &&
  Boolean(validGoogleMeetLink(booking.remoteSessionLink))
