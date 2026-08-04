import { apiRequest } from "./api"

export const sendContactMessage = async (contactData) => {
  return apiRequest("/contact", {
    method: "POST",
    body: JSON.stringify(contactData),
  })
}

export const getAllContactMessages = async () => {
  return apiRequest("/contact", {
    method: "GET",
  })
}

export const getContactMessage = async (id) => {
  return apiRequest(`/contact/${id}`, {
    method: "GET",
  })
}

export const markContactMessageRead = async (id) => {
  return apiRequest(`/contact/${id}/read`, {
    method: "PUT",
  })
}

export const deleteContactMessage = async (id) => {
  return apiRequest(`/contact/${id}`, {
    method: "DELETE",
  })
}