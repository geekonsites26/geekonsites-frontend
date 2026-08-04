import { apiRequest } from "./api"

export const getInvoice =
  async (invoiceId) => {
    return apiRequest(`/api/invoices/${invoiceId}`, {
      method: "GET",
    })
}
