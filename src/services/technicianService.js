import { apiRequest, getToken } from "./api"

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "").replace(/\/api$/, "")

export const getAllTechnicians = async () => {
  return apiRequest("/api/technicians", {
    method: "GET",
  })
}

export const getTechnicianById = async (id) => {
  return apiRequest(`/api/technicians/${id}`, {
    method: "GET",
  })
}

export const getTechnicianBookings = async () => {
  return apiRequest("/api/technicians/my-bookings", {
    method: "GET",
  })
}

// NEW
export const getTechnicianNotifications = async () => {
  return apiRequest("/api/technicians/my-notifications", {
    method: "GET",
  })
}

export const createTechnician = async (data) => {
  return apiRequest("/api/technicians", {
    method: "POST",
    body: JSON.stringify(data),
    timeoutMs: 45000,
  })
}

export const approveTechnician = async (id) => {
  return apiRequest(`/api/technicians/${id}/approve`, {
    method: "PUT",
  })
}

export const rejectTechnician = async (id) => {
  return apiRequest(`/api/technicians/${id}/reject`, {
    method: "PUT",
  })
}

export const acceptTechnicianJob = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/technician/accept`, {
    method: "PUT",
  })
}

export const rejectTechnicianJob = async (bookingId, reason = "") => {
  return apiRequest(`/api/bookings/${bookingId}/technician/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason }),
  })
}

export const technicianOnTheWay = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/technician/on-the-way`, {
    method: "PUT",
  })
}

export const updateTechnicianLiveLocation = async (
  bookingId,
  location
) => {
  return apiRequest(`/api/bookings/${bookingId}/technician/location`, {
    method: "PUT",
    body: JSON.stringify(location),
  })
}

export const startTechnicianService = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/technician/start-service`, {
    method: "PUT",
  })
}

export const startTechnicianRemoteSession = async (
  bookingId,
  remoteSessionLink
) => {
  return apiRequest(
    `/api/bookings/${bookingId}/technician/start-remote-session`,
    {
      method: "PUT",
      body: JSON.stringify({
        remoteSessionLink,
      }),
    }
  )
}

export const saveRemoteMeetingLink = async (bookingId, meetingLink) => {
  return apiRequest(`/api/bookings/${bookingId}/meeting-link`, {
    method: "PUT",
    body: JSON.stringify({ meetingLink }),
  })
}

export const completeTechnicianService = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/technician/complete-service`, {
    method: "PUT",
  })
}

export const markTechnicianArrived = async (bookingId) => {
  return apiRequest(`/api/bookings/${bookingId}/technician/arrived`, {
    method: "PUT",
  })
}

export const resendTechnicianOnboarding = async (id) => {
  return apiRequest(`/api/technicians/${id}/resend-onboarding`, { method: "POST" })
}

export const setTechnicianOnboardingPassword = async (token, password) => {
  return apiRequest("/api/technicians/onboarding/set-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  })
}

export const getTechnicianProfile = async () => {
  return apiRequest("/api/technicians/me", { method: "GET" })
}

export const getTechnicianProfilePhoto = async () => {
  const response = await fetch(`${API_BASE_URL}/api/technicians/me/photo`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!response.ok) throw new Error("Profile photo could not be loaded")
  return URL.createObjectURL(await response.blob())
}

export const updateTechnicianAvailability = async (status) => {
  return apiRequest("/api/technicians/me/availability", {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export const openTechnicianVerificationEvidence = async (id, kind) => {
  const preview = window.open("about:blank", "_blank")
  if (!preview) throw new Error("Allow pop-ups to view technician documents")
  preview.opener = null
  preview.document.title = "Loading secure document"
  preview.document.body.innerHTML = '<p style="font:600 15px Arial;padding:24px;color:#123">Loading secure technician document...</p>'

  try {
    const response = await fetch(`${API_BASE_URL}/api/technicians/${id}/verification/${kind}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!response.ok) throw new Error("Verification evidence could not be opened")
    const url = URL.createObjectURL(await response.blob())
    preview.location.replace(url)
    window.setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000)
  } catch (error) {
    preview.close()
    throw error
  }
}
