import { apiRequest } from "./api"

export const getMyNotifications = async () => {
  return apiRequest("/notifications/my-notifications", {
    method: "GET",
  })
}

export const markNotificationAsRead = async (notificationId) => {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PUT",
  })
}