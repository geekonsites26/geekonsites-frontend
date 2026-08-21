import { apiRequest } from "./api"

export const sendContactMessage = async (contactData) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 45000)

  try {
    return await apiRequest("/api/contact", {
      method: "POST",
      body: JSON.stringify(contactData),
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export const getAllContactMessages = async () => {
  return apiRequest("/api/contact", {
    method: "GET",
  })
}

export const getContactMessage = async (id) => {
  return apiRequest(`/api/contact/${id}`, {
    method: "GET",
  })
}

export const markContactMessageRead = async (id) => {
  return apiRequest(`/api/contact/${id}/read`, {
    method: "PUT",
  })
}

export const deleteContactMessage = async (id) => {
  return apiRequest(`/api/contact/${id}`, {
    method: "DELETE",
  })
}

export const updateContactMessageStatus = async (id, status) => {
  return apiRequest(`/api/contact/${id}/status?status=${encodeURIComponent(status)}`, {
    method: "PUT",
  })
}
