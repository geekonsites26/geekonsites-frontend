import { API_TIMEOUTS, apiRequest } from "./api"

export const getAdminDashboardStats = async () => {
  return apiRequest("/api/admin/dashboard-stats", {
    method: "GET",
  })
}

export const getAdminNotifications = async () => {
  return apiRequest("/api/admin/my-notifications", {
    method: "GET",
  })
}

export const getAdminRemoteSessions = async () => {
  return apiRequest("/api/admin/remote-sessions", { method: "GET" })
}

export const getAdminCustomers = async () => {
  return apiRequest("/api/admin/customers", { method: "GET" })
}

export const provisionAdminRemoteSession = async (bookingId) => {
  return apiRequest(`/api/admin/remote-sessions/${bookingId}/provision`, {
    method: "POST",
    timeoutMs: API_TIMEOUTS.CRITICAL,
  })
}
