import { apiRequest } from "./api"

export const getAllTechnicians = async () => {
  return apiRequest("/technicians", {
    method: "GET",
  })
}

export const getTechnicianById = async (id) => {
  return apiRequest(`/technicians/${id}`, {
    method: "GET",
  })
}

export const getTechnicianBookings = async () => {
  return apiRequest("/technicians/my-bookings", {
    method: "GET",
  })
}

// NEW
export const getTechnicianNotifications = async () => {
  return apiRequest("/technicians/my-notifications", {
    method: "GET",
  })
}

export const createTechnician = async (data) => {
  return apiRequest("/technicians", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const approveTechnician = async (id) => {
  return apiRequest(`/technicians/${id}/approve`, {
    method: "PUT",
  })
}

export const rejectTechnician = async (id) => {
  return apiRequest(`/technicians/${id}/reject`, {
    method: "PUT",
  })
}

export const acceptTechnicianJob = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/technician/accept`, {
    method: "PUT",
  })
}

export const rejectTechnicianJob = async (bookingId, reason = "") => {
  return apiRequest(`/bookings/${bookingId}/technician/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  })
}

export const technicianOnTheWay = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/technician/on-the-way`, {
    method: "PUT",
  })
}

export const updateTechnicianLiveLocation = async (
  bookingId,
  location
) => {
  return apiRequest(`/bookings/${bookingId}/technician/location`, {
    method: "PUT",
    body: JSON.stringify(location),
  })
}

export const startTechnicianService = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/technician/start-service`, {
    method: "PUT",
  })
}

export const startTechnicianRemoteSession = async (
  bookingId,
  remoteSessionLink
) => {
  return apiRequest(
    `/bookings/${bookingId}/technician/start-remote-session`,
    {
      method: "PUT",
      body: JSON.stringify({
        remoteSessionLink,
      }),
    }
  )
}

export const saveRemoteMeetingLink = async (bookingId, meetingLink) => {
  return apiRequest(`/bookings/${bookingId}/meeting-link`, {
    method: "PUT",
    body: JSON.stringify({ meetingLink }),
  })
}

export const completeTechnicianService = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/technician/complete-service`, {
    method: "PUT",
  })
}

export const markTechnicianArrived = async (bookingId) => {
  return apiRequest(`/bookings/${bookingId}/technician/arrived`, {
    method: "PUT",
  })
}