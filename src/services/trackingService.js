import { apiRequest } from "./api"

export const getTracking =
  async (bookingId) => {
    return apiRequest(`/api/bookings/${bookingId}/tracking`, {
      method: "GET",
    })
}
