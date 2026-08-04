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
