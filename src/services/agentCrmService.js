import { apiRequest } from "./api"

const query = (params) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value != null)).toString()

export const getCrmCustomers = (filters = {}) => apiRequest(`/api/agent-crm/customers?${query(filters)}`)
export const getCrmCustomer = (id) => apiRequest(`/api/agent-crm/customers/${id}`)
export const getCrmSummary = () => apiRequest("/api/agent-crm/summary")
export const getCrmEnquiries = () => apiRequest("/api/agent-crm/enquiries")
export const addCrmNote = (customerId, noteText) => apiRequest(`/api/agent-crm/customers/${customerId}/notes`, { method: "POST", body: JSON.stringify({ noteText }) })
export const addCrmFollowUp = (customerId, payload) => apiRequest(`/api/agent-crm/customers/${customerId}/follow-ups`, { method: "POST", body: JSON.stringify(payload) })
export const completeCrmFollowUp = (id) => apiRequest(`/api/agent-crm/follow-ups/${id}/complete`, { method: "PUT" })
