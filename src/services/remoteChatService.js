import { apiRequest } from "./api"

export const getRemoteChatMessages = (bookingId) => apiRequest(`/api/remote-session-chat/${bookingId}/messages`, { method: "GET" })
export const sendRemoteChatMessage = (bookingId, message) => apiRequest(`/api/remote-session-chat/${bookingId}/messages`, { method: "POST", body: JSON.stringify({ message }) })
