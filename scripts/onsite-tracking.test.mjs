import test from "node:test"
import assert from "node:assert/strict"
import { customerServiceRoute, isRemoteBooking, onsiteTrackingAction, toRealPosition } from "../src/utils/customerBookingAction.js"

test("ONSITE routes to tracking and REMOTE routes to remote session", () => {
  assert.equal(customerServiceRoute({ id: 17, serviceMode: "ONSITE" }), "/track-technician/17")
  assert.equal(customerServiceRoute({ id: 17, serviceMode: "REMOTE" }), "/remote-session")
})

test("serviceMode is authoritative over stale remote flags", () => {
  assert.equal(isRemoteBooking({ serviceMode: "ONSITE", remoteSessionRequired: true, supportType: "remote" }), false)
})

test("unassigned and assigned onsite jobs cannot open tracking", () => {
  assert.deepEqual(onsiteTrackingAction({ bookingStatus: "ASSIGNMENT_PENDING" }), { label: "Technician assignment in progress", canTrack: false, live: false })
  assert.deepEqual(onsiteTrackingAction({ bookingStatus: "TECHNICIAN_ASSIGNED" }), { label: "Waiting for technician to accept", canTrack: false, live: false })
})

test("accepted and on-the-way jobs expose correct tracking actions", () => {
  assert.deepEqual(onsiteTrackingAction({ bookingStatus: "TECHNICIAN_ACCEPTED" }), { label: "Track Technician", canTrack: true, live: false })
  assert.deepEqual(onsiteTrackingAction({ bookingStatus: "TECHNICIAN_ON_THE_WAY" }), { label: "Track Technician — live", canTrack: true, live: true })
})

test("arrival, service, and completion actions are state-correct", () => {
  assert.equal(onsiteTrackingAction({ bookingStatus: "TECHNICIAN_ARRIVED" }).label, "Technician arrived")
  assert.equal(onsiteTrackingAction({ bookingStatus: "SERVICE_STARTED" }).label, "Service in progress")
  assert.deepEqual(onsiteTrackingAction({ bookingStatus: "SERVICE_COMPLETED" }), { label: "Service completed", canTrack: false, live: false })
})

test("only real valid coordinates become map positions", () => {
  assert.deepEqual(toRealPosition("51.5074", "-0.1278"), { lat: 51.5074, lng: -0.1278 })
  assert.equal(toRealPosition(undefined, undefined), null)
  assert.equal(toRealPosition("not-a-number", "-0.1278"), null)
  assert.equal(toRealPosition(95, 20), null)
})
