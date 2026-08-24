import assert from "node:assert/strict"
import test from "node:test"
import { formatLocalDateTime, parseUtcTimestamp, resolveTimeZone } from "../src/utils/dateTime.js"

const summer = "2026-08-24T23:35:00Z"

test("UK uses Europe/London and switches between GMT and BST", () => {
  assert.match(formatLocalDateTime(summer, { country: "UK" }), /25 Aug 2026 · 00:35 BST/)
  assert.match(formatLocalDateTime("2026-01-24T23:35:00Z", { country: "UK" }), /24 Jan 2026 · 23:35 GMT/)
})

test("US zones and daylight-saving abbreviations are location specific", () => {
  assert.match(formatLocalDateTime(summer, { timezone: "America/New_York" }), /7:35 PM EDT/)
  assert.match(formatLocalDateTime(summer, { state: "IL", country: "US" }), /6:35 PM CDT/)
  assert.match(formatLocalDateTime(summer, { state: "CO", country: "US" }), /5:35 PM MDT/)
  assert.match(formatLocalDateTime(summer, { state: "CA", country: "US" }), /4:35 PM PDT/)
  assert.match(formatLocalDateTime("2026-01-24T23:35:00Z", { state: "NY", country: "US" }), /6:35 PM EST/)
})

test("priority is booking zone, coordinates, user zone, then country fallback", () => {
  assert.equal(resolveTimeZone({ timezone: "America/Denver", state: "NY" }, { timezone: "America/Chicago" }), "America/Denver")
  assert.equal(resolveTimeZone({ customerLatitude: 34, customerLongitude: -118, country: "US" }, { timezone: "America/New_York" }), "America/Los_Angeles")
  assert.equal(resolveTimeZone({}, { timezone: "America/Chicago" }), "America/Chicago")
  assert.equal(resolveTimeZone({ country: "UK" }, {}), "Europe/London")
})

test("formatting never mutates or double-converts the UTC source", () => {
  const source = "2026-08-24T23:35:00Z"
  const before = source.slice()
  assert.equal(parseUtcTimestamp(source).getTime(), Date.parse(source))
  formatLocalDateTime(source, { timezone: "America/New_York" })
  assert.equal(source, before)
})
