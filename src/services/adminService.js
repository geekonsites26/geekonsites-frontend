import { apiRequest } from "./api"

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
