import assert from "node:assert/strict"
import test from "node:test"

class MemoryStorage {
  values = new Map()
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  clear() { this.values.clear() }
}

globalThis.localStorage = new MemoryStorage()
globalThis.window = { setTimeout, clearTimeout }

const api = await import("../src/services/api.js")
const { safeNotificationPath } = await import("../src/utils/notificationRoute.js")
const { normalizeNotifications } = await import("../src/utils/notifications.js")
const { classifyTechnicianBooking, normalizeBookingStatus } = await import("../src/utils/technicianJobs.js")
const { remoteSessionReady, validGoogleMeetLink } = await import("../src/utils/remoteSession.js")

test("token and role metadata persist without a password", () => {
  api.setToken("controlled-test-jwt")
  api.setUser({ id: 7, role: "TECHNICIAN", email: "tech@example.com", password: "NeverStore1!" })
  assert.equal(api.getToken(), "controlled-test-jwt")
  const saved = api.getUser()
  assert.equal(saved.role, "TECHNICIAN")
  assert.equal(saved.password, undefined)
  assert.doesNotMatch(localStorage.getItem("gos_user"), /NeverStore1/)
})

test("403 preserves a valid session while 401 clears it", async () => {
  api.setToken("controlled-test-jwt")
  globalThis.fetch = async () => new Response("Forbidden", { status: 403 })
  await assert.rejects(api.apiRequest("/api/protected"))
  assert.equal(api.getToken(), "controlled-test-jwt")

  globalThis.fetch = async () => new Response("Unauthorized", { status: 401 })
  await assert.rejects(api.apiRequest("/api/protected"))
  assert.equal(api.getToken(), null)
})

test("notification routes are role-aware and reject external or cross-role paths", () => {
  assert.equal(safeNotificationPath("/technician-dashboard?view=active", "TECHNICIAN"), "/technician-dashboard?view=active")
  assert.equal(safeNotificationPath("https://evil.example/steal", "TECHNICIAN"), "/technician-dashboard?view=notifications")
  assert.equal(safeNotificationPath("/admin-dashboard", "CUSTOMER"), "/notifications")
  assert.equal(safeNotificationPath("//evil.example/steal", "AGENT"), "/agent-dashboard?view=notifications")
})

test("notification read aliases normalize and duplicate IDs collapse", () => {
  const items = normalizeNotifications([
    { id: 11, title: "Assigned", read: false },
    { id: 11, title: "Assigned", is_read: true },
    { notificationId: 12, title: "Payment", isRead: false },
  ])
  assert.equal(items.length, 2)
  assert.equal(items.find((item) => item.id === 11).isRead, true)
  assert.equal(items.find((item) => item.id === 11).read, true)
})

test("a stale refresh cannot repaint an optimistically read notification", () => {
  const previous = [{ id: 21, title: "Booking assigned", isRead: true, read: true }]
  const refreshed = normalizeNotifications([{ id: 21, title: "Booking assigned", read: false }], previous)
  assert.equal(refreshed[0].isRead, true)
  assert.equal(refreshed[0].read, true)
})

test("technician assigned bookings remain in Jobs until accepted", () => {
  assert.equal(classifyTechnicianBooking({ bookingStatus: "TECHNICIAN_ASSIGNED" }), "jobs")
  assert.equal(classifyTechnicianBooking({ status: "ASSIGNED" }), "jobs")
  assert.equal(normalizeBookingStatus({ status: "ASSIGNED" }), "TECHNICIAN_ASSIGNED")
  assert.equal(classifyTechnicianBooking({ bookingStatus: "TECHNICIAN_ASSIGNED" }), "jobs")
})

test("accepted remote and onsite bookings classify as Active, not Completed", () => {
  for (const status of ["TECHNICIAN_ACCEPTED", "TECHNICIAN_ON_THE_WAY", "TECHNICIAN_ARRIVED", "SERVICE_STARTED", "REMOTE_SESSION_STARTED"]) {
    assert.equal(classifyTechnicianBooking({ bookingStatus: status }), "active")
  }
  assert.equal(classifyTechnicianBooking({ bookingStatus: "SERVICE_COMPLETED" }), "completed")
})

test("remote sessions expose only ready backend Google Meet links", () => {
  const booking = { paymentStatus: "PAID", remoteSessionStatus: "READY", remoteSessionLink: "https://meet.google.com/abc-defg-hij" }
  assert.equal(remoteSessionReady(booking), true)
  assert.match(validGoogleMeetLink(booking.remoteSessionLink), /^https:\/\/meet\.google\.com\//)
  assert.equal(remoteSessionReady({ ...booking, paymentStatus: "PENDING" }), false)
  assert.equal(remoteSessionReady({ ...booking, remoteSessionLink: "https://evil.example/room" }), false)
  assert.equal(validGoogleMeetLink("javascript:alert(1)"), "")
})
