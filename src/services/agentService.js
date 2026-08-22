import { apiRequest } from "./api"

export const getAllAgents = async () => {
  return apiRequest("/api/agents", {
    method: "GET",
  })
}

export const createAgent = async (data) => {
  return apiRequest("/api/agents", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const getAgentNotifications = async () => {
  return apiRequest("/api/agents/my-notifications", {
    method: "GET",
  })
}

export const getAgentProfile = async () => {
  return apiRequest("/api/agents/me", { method: "GET" })
}

export const getAgentDashboardSummary = () =>
  apiRequest("/api/agents/dashboard-summary", { method: "GET" })

export const getAgentBookingQueue = (page = 0, size = 25) =>
  apiRequest(`/api/agents/booking-queue?page=${page}&size=${Math.min(100, Math.max(1, size))}`, { method: "GET" })
