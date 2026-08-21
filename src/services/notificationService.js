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

export const markAllNotificationsAsRead = async () => {
  return apiRequest("/api/notifications/read-all", {
    method: "PUT",
  })
}

export const registerPushDevice = async (token, platform) => {
  return apiRequest("/api/notifications/devices", {
    method: "POST",
    body: JSON.stringify({ token, platform }),
  })
}

export const unregisterPushDevice = async (token, platform = "android") => {
  return apiRequest("/api/notifications/devices", {
    method: "DELETE",
    body: JSON.stringify({ token, platform }),
  })
}
