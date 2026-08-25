const safeMessageByStatus = {
  400: "Please check the information provided and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don’t have permission to perform this action.",
  404: "The requested item could not be found.",
  409: "This item has already changed. Please refresh and try again.",
  500: "Something went wrong on our side. Please try again shortly.",
}

export const friendlyApiError = (error, context = "general") => {
  if (error?.name === "AbortError" || error?.code === "TIMEOUT") return "The request is taking longer than expected. Please try again."
  if (error?.code === "NETWORK_ERROR") return "We’re having trouble connecting right now. Please try again shortly."
  const source = String(error?.safeMessage || "").toLowerCase()
  if (context === "booking" && source.includes("not available") && source.includes("onsite")) return "This service isn’t available for onsite support. Please choose another service."
  if (context === "booking" && source.includes("not available") && source.includes("remote")) return "This service isn’t available for remote support. Please choose another service."
  if (context === "booking" && source.includes("service mode")) return "This service isn’t available for the selected support method. Please choose another service."
  return safeMessageByStatus[error?.status] || "Something went wrong. Please try again shortly."
}
