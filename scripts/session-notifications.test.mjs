import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"

class MemoryStorage {
  values = new Map()
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) { this.values.set(key, String(value)) }
  removeItem(key) { this.values.delete(key) }
  clear() { this.values.clear() }
}

globalThis.localStorage = new MemoryStorage()
globalThis.window = { setTimeout, clearTimeout, dispatchEvent() {} }
if (!globalThis.CustomEvent) globalThis.CustomEvent = class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail } }

const api = await import("../src/services/api.js")
const { safeNotificationPath } = await import("../src/utils/notificationRoute.js")
const { normalizeNotifications } = await import("../src/utils/notifications.js")
const { classifyTechnicianBooking, normalizeBookingStatus } = await import("../src/utils/technicianJobs.js")
const { remoteSessionReady, validGoogleMeetLink } = await import("../src/utils/remoteSession.js")
const { createBooking } = await import("../src/services/bookingService.js")
const { getDashboardPathForRole } = await import("../src/utils/authRouting.js")
const { bookingAttemptKey, findBookingCreatedByAttempt } = await import("../src/utils/requestRecovery.js")

test("timeout maps to the production-safe friendly message", async () => {
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true })
  })
  await assert.rejects(
    api.apiRequest("/api/slow", { timeoutMs: 5 }),
    (error) => error.code === "TIMEOUT" && error.message === "The request is taking longer than expected. Please try again.",
  )
})

test("booking timeout reconciliation finds the authoritative created booking before retry", () => {
  const payload = { serviceMode: "ONSITE", serviceType: "Laptop Repair", bookingDate: "2026-08-25", timeSlot: "10:00 AM", customerId: 7 }
  const attempt = { key: bookingAttemptKey(payload), startedAt: Date.parse("2026-08-25T10:00:00Z") }
  const existing = { id: 91, ...payload, createdAt: "2026-08-25T10:00:02Z" }
  assert.equal(findBookingCreatedByAttempt([existing], attempt)?.id, 91)
  assert.equal(findBookingCreatedByAttempt([{ ...existing, createdAt: "2026-08-25T09:00:00Z" }], attempt), null)
})

test("tracking timeout preserves prior booking state and optional notification failures stay isolated", async () => {
  const trackingSource = await readFile(new URL("../src/pages/TrackTechnician.jsx", import.meta.url), "utf8")
  const dashboardSource = await readFile(new URL("../src/pages/TechnicianDashboard.jsx", import.meta.url), "utf8")
  assert.match(trackingSource, /setError\(requestError\?\.code === "TIMEOUT" \? "Updating live location…"/)
  assert.doesNotMatch(trackingSource, /catch[\s\S]{0,180}setBooking\(null\)/)
  assert.match(dashboardSource, /try \{[\s\S]*getTechnicianNotifications\(\)[\s\S]*\} catch/)
})

test("native tracking reuses canonical API configuration and keeps safe diagnostics", async () => {
  const trackingService = await readFile(new URL("../src/services/technicianTrackingService.js", import.meta.url), "utf8")
  const nativePlugin = await readFile(new URL("../android/app/src/main/java/com/asitech/geekonsites/TechnicianTrackingPlugin.java", import.meta.url), "utf8")
  assert.match(trackingService, /import \{ API_BASE_URL, getToken \} from "\.\/api"/)
  assert.doesNotMatch(trackingService, /import\.meta\.env\.VITE_API_BASE_URL/)
  for (const code of ["MISSING_BOOKING_ID", "MISSING_AUTH_TOKEN", "MISSING_API_BASE_URL", "INSECURE_API_BASE_URL", "LOCALHOST_API_BASE_URL"]) assert.match(nativePlugin, new RegExp(code))
  assert.doesNotMatch(nativePlugin, /" token=" \+ token/)
  assert.match(nativePlugin, /google\.navigation:q=/)
  assert.match(nativePlugin, /https:\/\/www\.google\.com\/maps\/dir/)
})

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

test("onsite balance due remains active until the customer pays", async () => {
  assert.equal(classifyTechnicianBooking({ bookingStatus: "REMAINING_PAYMENT_PENDING", paymentStatus: "BALANCE_PENDING" }), "active")
  assert.equal(classifyTechnicianBooking({ bookingStatus: "SERVICE_COMPLETED", paymentStatus: "PAID" }), "completed")
  const customerDashboard = await readFile(new URL("../src/pages/CustomerDashboard.jsx", import.meta.url), "utf8")
  const bookingPage = await readFile(new URL("../src/pages/BookService.jsx", import.meta.url), "utf8")
  assert.match(customerDashboard, /paymentType: "REMAINING"/)
  assert.match(customerDashboard, /"Pay remaining"/)
  assert.match(customerDashboard, /setInterval\(\(\) => loadBookings\(false\), 10000\)/)
  assert.match(customerDashboard, /window\.addEventListener\("focus", refresh\)/)
  assert.match(customerDashboard, /WORK_COMPLETED = new Set\(\[\.\.\.COMPLETED, "REMAINING_PAYMENT_PENDING"\]\)/)
  assert.match(customerDashboard, /\["SERVICE_COMPLETED", "REMAINING_PAYMENT_PENDING"\]\.includes/)
  assert.match(bookingPage, /geocodeServiceAddress/)
  assert.match(bookingPage, /customerLatitude: supportMode === "Onsite" \? resolvedCoordinates\.latitude/)
})

test("Maps loader selects the native key and replaces a stale mismatched script", async () => {
  const config = await readFile(new URL("../src/utils/googleMaps.js", import.meta.url), "utf8")
  const loader = await readFile(new URL("../src/services/locationService.js", import.meta.url), "utf8")
  assert.match(config, /VITE_GOOGLE_MAPS_ANDROID_WEBVIEW_API_KEY \|\| import\.meta\.env\.VITE_GOOGLE_MAPS_API_KEY/)
  assert.match(loader, /existingKey !== apiKey/)
  assert.match(loader, /existing\.remove\(\)/)
})

test("balance-pending invoice reads the persisted advance invoice without regenerating it", async () => {
  const source = await readFile(new URL("../src/pages/InvoiceDetails.jsx", import.meta.url), "utf8")
  assert.match(source, /const finalPaymentDue = Number\(finalBooking\.remainingAmount \|\| 0\) > 0/)
  assert.match(source, /if \(!finalPaymentDue\) await generateInvoiceByBookingId\(bookingId\)/)
  assert.match(source, /const storedInvoice = await getInvoiceByBookingId\(bookingId\)/)
})

test("remote sessions expose only ready backend Google Meet links", () => {
  const booking = { paymentStatus: "PAID", remoteSessionStatus: "READY", remoteSessionLink: "https://meet.google.com/abc-defg-hij" }
  assert.equal(remoteSessionReady(booking), true)
  assert.match(validGoogleMeetLink(booking.remoteSessionLink), /^https:\/\/meet\.google\.com\//)
  assert.equal(remoteSessionReady({ ...booking, paymentStatus: "PENDING" }), false)
  assert.equal(remoteSessionReady({ ...booking, remoteSessionLink: "https://evil.example/room" }), false)
  assert.equal(validGoogleMeetLink("javascript:alert(1)"), "")
})

test("successful account switching atomically replaces the previous role", () => {
  api.establishAuthSession("admin-token", { id: 1, role: "ADMIN", email: "admin@example.com" })
  api.establishAuthSession("customer-token", { id: 7, role: "CUSTOMER", email: "customer@example.com" })
  assert.equal(api.getToken(), "customer-token")
  assert.equal(api.getUser().role, "CUSTOMER")
  assert.equal(localStorage.getItem("gos_role"), "CUSTOMER")
  assert.equal(localStorage.getItem("gos_user_id"), "7")
})

test("customer booking creation cannot inherit stale technician identity", async () => {
  api.establishAuthSession("customer-token", { id: 7, role: "CUSTOMER", fullName: "Ashwik", email: "ashwik@example.com" })
  let sent
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body)
    return new Response(JSON.stringify({ id: 4, ...sent }), { status: 200, headers: { "content-type": "application/json" } })
  }
  await createBooking({ serviceType: "New PC Setup", technicianId: 99, technicianName: "Stale Jack", customerName: "Wrong" })
  assert.equal(sent.customerId, 7)
  assert.equal(sent.customerName, "Ashwik")
  assert.equal(sent.technicianId, null)
  assert.equal(sent.technicianName, null)
})

test("remote page separates Meet launch from technician service start and completion", async () => {
  const source = await readFile(new URL("../src/pages/RemoteSession.jsx", import.meta.url), "utf8")
  const joinHandler = source.slice(source.indexOf("const joinMeeting"), source.indexOf("const startRemoteService"))
  assert.doesNotMatch(joinHandler, /startTechnicianRemoteSession/)
  assert.match(source, /if \(!isTechnicianViewer\) \{\s*navigate\(-1\)\s*return/)
  assert.match(source, /booking\?\.remoteSessionStartedAt/)
  assert.match(source, /getBookingById\(authoritativeBookingId\)/)
})

test("technician opens a remote booking without implicitly starting it", async () => {
  const source = await readFile(new URL("../src/pages/TechnicianDashboard.jsx", import.meta.url), "utf8")
  const handler = source.slice(source.indexOf("const handleStartRemoteSession"), source.indexOf("const saveMeetingLink"))
  assert.match(handler, /openRemoteSession\(job\)/)
  assert.doesNotMatch(handler, /startTechnicianRemoteSession/)
  assert.match(source, /remote-session\?bookingId=/)
})

test("all four portal roles survive canonical session restoration metadata", () => {
  for (const [index, role] of ["CUSTOMER", "TECHNICIAN", "AGENT", "ADMIN"].entries()) {
    api.establishAuthSession(`${role.toLowerCase()}-token`, { id: index + 1, role, email: `${role.toLowerCase()}@example.com` })
    assert.equal(api.getToken(), `${role.toLowerCase()}-token`)
    assert.equal(api.getUser().role, role)
    assert.equal(localStorage.getItem("gos_role"), role)
  }
})

test("agent booking participants cannot repaint a customer session or return route", () => {
  const customer = { id: 42, role: "CUSTOMER", email: "customer@example.com" }
  api.establishAuthSession("customer-token", customer)
  const completedBooking = { id: 9, agentName: "ashwik", agent: { id: 3, role: "AGENT" }, bookingStatus: "SERVICE_COMPLETED" }
  localStorage.setItem("currentBooking", JSON.stringify(completedBooking))
  assert.equal(api.getToken(), "customer-token")
  assert.deepEqual(api.getUser(), customer)
  assert.equal(localStorage.getItem("gos_role"), "CUSTOMER")
  assert.equal(localStorage.getItem("gos_user_id"), "42")
  assert.equal(getDashboardPathForRole(localStorage.getItem("gos_role")), "/customer-dashboard")
})

test("booking UI blocks service modes not declared by its canonical catalog group", async () => {
  const source = await readFile(new URL("../src/pages/BookService.jsx", import.meta.url), "utf8")
  assert.match(source, /disabled=\{types\.length > 0 && !selectedModes\.has\("Remote"\)\}/)
  assert.match(source, /disabled=\{types\.length > 0 && !selectedModes\.has\("Onsite"\)\}/)
  assert.match(source, /if \(invalidMode\) return `This service isn’t available/)
  assert.match(source, /booking = await createBooking[\s\S]*navigate\("\/payment"/)
})
