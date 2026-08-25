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
