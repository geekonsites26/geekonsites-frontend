import { apiRequest } from "./api"

export const getInvoice =
  async (invoiceId) => {
    return apiRequest(`/api/invoices/${invoiceId}`, {
      method: "GET",
    })
  }

export const getInvoiceByBookingId = async (bookingId) => {
  return apiRequest(`/api/invoices/booking/${bookingId}`, {
    method: "GET",
  })
}

export const generateInvoiceByBookingId = async (bookingId) => {
  return apiRequest(`/api/invoices/booking/${bookingId}`, {
    method: "POST",
  })
}
