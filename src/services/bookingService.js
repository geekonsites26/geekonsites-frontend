import { apiRequest, getUser } from "./api"

export const createBooking = async (bookingData) => {
  const user = getUser()

  const payload = {
    ...bookingData,
    customerId: user?.id || bookingData.customerId,
    customerName: user?.fullName || user?.name || bookingData.customerName,
    customerEmail: user?.email || bookingData.customerEmail,
    customerPhone: user?.phone || bookingData.customerPhone,
  }

  return apiRequest("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export const paymentSuccess = async (
  bookingId,
  transactionId,
  paymentMethod = "CARD"
) => {
  return apiRequest(
    `/bookings/${bookingId}/payment-success/${transactionId}?paymentMethod=${paymentMethod.toUpperCase()}`,
    {
      method: "PUT",
    }
  )
}

export const getMyBookings = async () => {
  return apiRequest("/bookings/my-bookings", {
    method: "GET",
  })
}

export const getCustomerBookings = async () => {
  return getMyBookings()
}

export const getAllBookings = async () => {
  return apiRequest("/bookings", {
    method: "GET",
  })
}

export const getBookingById = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}`, {
    method: "GET",
  })
}

export const assignTechnicianToBooking = async (bookingId, technicianId) => {
  return apiRequest(
    `/bookings/${bookingId}/assign-technician/${technicianId}`,
    {
      method: "PUT",
    }
  )
}

export const submitBookingRating = async (bookingId, rating, review = "") => {
  return apiRequest(`/bookings/${bookingId}/rating`, {
    method: "PUT",
    body: JSON.stringify({
      rating: String(rating),
      review,
    }),
  })
}

export const getBookingTracking = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/tracking`, {
    method: "GET",
  })
}

export const updateCustomerLocation = async (bookingId, latitude, longitude) => {
  return apiRequest(`/bookings/${bookingId}/customer-location`, {
    method: "PUT",
    body: JSON.stringify({
      latitude,
      longitude,
    }),
  })
}

export const generateInvoice = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/generate-invoice`, {
    method: "PUT",
  })
}

export const remainingPaymentSuccess = async (
  bookingId,
  transactionId,
  paymentMethod = "CARD"
) => {
  return apiRequest(
    `/bookings/${bookingId}/remaining-payment-success/${transactionId}?paymentMethod=${paymentMethod.toUpperCase()}`,
    {
      method: "PUT",
    }
  )
}

export const markTechnicianArrived = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/technician/arrived`, {
    method: "PUT",
  })
}

export const closeBooking = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/close`, {
    method: "PUT",
  })
}