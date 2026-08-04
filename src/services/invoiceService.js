import axios from "axios"

const API =
`${import.meta.env.VITE_API_BASE_URL}/api/invoices`

export const getInvoice =
  async (invoiceId) => {

    const response =
      await axios.get(
        `${API}/${invoiceId}`
      )

    return response.data
}