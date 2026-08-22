import { apiRequest } from "./api"

export const getMyRefunds = () => apiRequest("/api/refunds/my-refunds", { method: "GET" })
export const requestBookingRefund = (bookingId, reason, message) => apiRequest(`/api/refunds/bookings/${bookingId}`, { method: "POST", body: JSON.stringify({ reason, message }) })
export const getAdminRefunds = () => apiRequest("/api/admin/refunds", { method: "GET" })
export const reviewAdminRefund = (id) => apiRequest(`/api/admin/refunds/${id}/review`, { method: "PUT" })
export const executeAdminRefund = (id, amount, adminNote) => apiRequest(`/api/admin/refunds/${id}/execute`, { method: "POST", body: JSON.stringify({ amount: Number(amount), adminNote }) })
export const rejectAdminRefund = (id, adminNote) => apiRequest(`/api/admin/refunds/${id}/reject`, { method: "POST", body: JSON.stringify({ adminNote }) })
