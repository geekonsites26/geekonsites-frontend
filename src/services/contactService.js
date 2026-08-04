import { apiRequest } from "./api"

export const sendContactMessage = async (contactData) => {
  return apiRequest("/api/contact", {
    method: "POST",
    body: JSON.stringify(contactData),
  })
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
