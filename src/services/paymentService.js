import { apiRequest } from "./api"

export const createStripeCheckoutSession = async (
  bookingId,
  paymentType
) => {
  return apiRequest("/payments/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({
      bookingId,
      paymentType,
    }),
  })
}