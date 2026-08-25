// Provider-neutral customer support-call service.
//
// Nothing in the customer UI should talk to a call-center provider directly.
// When VICIdial (or any other provider) is connected post-launch, it plugs
// in behind the methods below — their signatures stay the same, only the
// implementation changes. Until then this file only ever reflects reality:
// a real support number when one is configured, or an honest "not available
// yet" state. It never fabricates agent availability or a live call.

const VICIDIAL_ENABLED = String(import.meta.env.VITE_VICIDIAL_ENABLED || "").toLowerCase() === "true"

/**
 * Resolve how "Call Support" should behave right now.
 * `region` is the value returned by useRegion() (see src/utils/location.js).
 *
 * Returns one of:
 *   { mode: "phone", phone, phoneHref }   real number configured — dial it directly
 *   { mode: "unavailable", message }      nothing usable is configured yet
 */
export const getSupportAvailability = (region) => {
  if (VICIDIAL_ENABLED) {
    // Placeholder for the future VICIdial-backed live-agent availability
    // check. Until that integration exists, fail safe rather than claim an
    // agent is reachable.
    return { mode: "unavailable", message: "Phone support is temporarily unavailable." }
  }
  if (region?.phone && String(region?.phoneHref || "").startsWith("tel:")) {
    return { mode: "phone", phone: region.phone, phoneHref: region.phoneHref }
  }
  return { mode: "unavailable", message: "Phone support will be available shortly." }
}

/**
 * Minimum booking context a future call or callback request should carry.
 * Intentionally excludes anything beyond what a support agent needs to pick
 * up the booking (see integration notes below).
 */
export const buildSupportContext = (booking, customer, callbackPhone) => ({
  bookingId: booking?.id ?? null,
  customerId: customer?.id ?? null,
  serviceType: booking?.serviceType ?? null,
  serviceMode: booking?.serviceMode ?? null,
  bookingStatus: booking?.bookingStatus ?? null,
  callbackPhone: callbackPhone || customer?.phone || booking?.customerPhone || null,
})

/**
 * Future: request a callback for a booking. No backend endpoint exists yet,
 * so this intentionally rejects rather than pretend a callback was
 * scheduled. Wire this up to a real "support request" endpoint once one
 * exists, and only then surface a "Request Callback" action in the UI.
 */
export const requestCallback = async (booking, customer, callbackPhone) => {
  void buildSupportContext(booking, customer, callbackPhone)
  throw new Error("Callback requests are not available yet.")
}

/**
 * Future: hand off to VICIdial (or another provider) to start a live agent
 * call for this booking. Not implemented until a provider is configured
 * post-launch — see VICIDIAL_BASE_URL / VICIDIAL_API_USER /
 * VICIDIAL_API_PASSWORD in .env.example (backend-only, never VITE_-prefixed).
 */
export const startSupportCall = async (booking, customer) => {
  void buildSupportContext(booking, customer)
  throw new Error("Live agent calling is not available yet.")
}
