import axios from "axios"

const API =
  `${import.meta.env.VITE_API_BASE_URL}/api/booking`

export const getTracking =
  async (bookingId) => {

    const response =
      await axios.get(
        `${API}/${bookingId}/tracking`
      )

    return response.data
}