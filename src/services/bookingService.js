import { API_TIMEOUTS, apiRequest, getUser } from "./api.js"

export const createBooking = async (bookingData, options = {}) => {
  const user = getUser()
  if (String(user?.role || "").toUpperCase() !== "CUSTOMER" || !user?.id) {
    throw new Error("A valid customer session is required to create a booking")
  }

  const payload = {
    ...bookingData,
    customerId: user?.id || bookingData.customerId,
    customerName: user?.fullName || user?.name || bookingData.customerName,
    customerEmail: user?.email || bookingData.customerEmail,
    customerPhone: user?.phone || bookingData.customerPhone,
    technicianId: null,
    technicianName: null,
    assignedTechnicianId: null,
  }

  return apiRequest("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options.signal,
    timeoutMs: API_TIMEOUTS.CRITICAL,
  })
}

export const paymentSuccess = async (
  bookingId,
  transactionId,
  paymentMethod = "CARD"
) => {
  return apiRequest(
    `/api/bookings/${bookingId}/payment-success/${encodeURIComponent(transactionId)}?paymentMethod=${encodeURIComponent(paymentMethod.toUpperCase())}`,
    {
      method: "PUT",
      timeoutMs: API_TIMEOUTS.CRITICAL,
    }
  )
}

export const getMyBookings = async () => {
  return apiRequest("/api/bookings/my-bookings", {
    method: "GET",
  })
}

export const getCustomerBookings = async () => {
  return getMyBookings()
}

export const getAllBookings = async () => {
  return apiRequest("/api/bookings", {
    method: "GET",
  })
}

export const getBookingById = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}`, {
    method: "GET",
  })
}

export const assignTechnicianToBooking = async (bookingId, technicianId) => {
  return apiRequest(
    `/api/bookings/${bookingId}/assign-technician/${technicianId}`,
    {
      method: "PUT",
    }
  )
}

export const submitBookingRating = async (bookingId, rating, review = "") => {
  return apiRequest(`/api/bookings/${bookingId}/rating`, {
    method: "PUT",
    body: JSON.stringify({
      rating: String(rating),
      review,
    }),
  })
}

export const getBookingTracking = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/tracking`, {
    method: "GET",
    timeoutMs: API_TIMEOUTS.TRACKING,
  })
}

export const updateCustomerLocation = async (bookingId, latitude, longitude) => {
  return apiRequest(`/api/bookings/${bookingId}/customer-location`, {
    method: "PUT",
    body: JSON.stringify({
      latitude,
      longitude,
    }),
  })
}

export const generateInvoice = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/generate-invoice`, {
    method: "PUT",
  })
}

export const remainingPaymentSuccess = async (
  bookingId,
  transactionId,
  paymentMethod = "CARD"
) => {
  return apiRequest(
    `/api/bookings/${bookingId}/remaining-payment-success/${encodeURIComponent(transactionId)}?paymentMethod=${encodeURIComponent(paymentMethod.toUpperCase())}`,
    {
      method: "PUT",
      timeoutMs: API_TIMEOUTS.CRITICAL,
    }
  )
}

export const markTechnicianArrived = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/technician/arrived`, {
    method: "PUT",
  })
}

export const closeBooking = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/close`, {
    method: "PUT",
  })
}

export const provisionRemoteSession = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/remote-session/provision`, {
    method: "POST",
    timeoutMs: API_TIMEOUTS.CRITICAL,
  })
}
