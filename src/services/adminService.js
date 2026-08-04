import { apiRequest } from "./api"

export const getAdminDashboardStats = async () => {
  return apiRequest("/admin/dashboard-stats", {
    method: "GET",
  })
}

export const getAdminNotifications = async () => {
  return apiRequest("/admin/my-notifications", {
    method: "GET",
  })
}