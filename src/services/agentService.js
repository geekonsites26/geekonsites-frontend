import { apiRequest } from "./api"

export const getAllAgents = async () => {
  return apiRequest("/agents", {
    method: "GET",
  })
}

export const createAgent = async (data) => {
  return apiRequest("/agents", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const getAgentNotifications = async () => {
  return apiRequest("/agents/my-notifications", {
    method: "GET",
  })
}