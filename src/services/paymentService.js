import { API_TIMEOUTS, apiRequest } from "./api"

export const createStripeCheckoutSession = async (
  bookingId,
  paymentType,
  ukEarlyServiceConsent = false
) => {
  return apiRequest("/api/payments/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({
      bookingId,
      paymentType,
      ukEarlyServiceConsent,
    }),
    timeoutMs: API_TIMEOUTS.CRITICAL,
  })
}

export const confirmStripeCheckoutSession = async (sessionId) => {
  return apiRequest(
    `/api/payments/confirm-checkout-session?sessionId=${encodeURIComponent(sessionId)}`,
    { method: "GET", timeoutMs: API_TIMEOUTS.CRITICAL }
  )
}
