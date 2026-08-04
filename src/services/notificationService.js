import { apiRequest } from "./api"

export const getMyNotifications = async () => {
  return apiRequest("/api/notifications/my-notifications", {
    method: "GET",
  })
}

export const markNotificationAsRead = async (notificationId) => {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
  })
}
