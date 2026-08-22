import { apiRequest } from "./api"

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
  })
}

export const confirmStripeCheckoutSession = async (sessionId) => {
  return apiRequest(
    `/api/payments/confirm-checkout-session?sessionId=${encodeURIComponent(sessionId)}`,
    { method: "GET" }
  )
}
