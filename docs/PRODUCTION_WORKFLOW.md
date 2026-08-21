# GeekOnSites Production Workflow

This document is the canonical workflow contract for the website, backend, database, and Android application.

## Customer

Register or log in -> select service -> choose Remote or On-Site -> choose issue and add-ons -> book service -> payment -> booking confirmed -> technician assigned -> live tracking or remote session -> service completed -> approve final charges -> final payment -> invoice -> rating and review.

## Technician

Register -> identity and document verification -> admin approval -> log in -> receive job -> accept or reject -> start journey -> live tracking -> mark arrived -> start service -> complete service -> submit parts and additional charges -> payment confirmation -> job closed.

## Admin and Agent

Log in -> manage customers and technicians -> verify or approve technicians -> view bookings -> assign technician -> monitor live jobs -> manage services and regional pricing -> manage payments and refunds -> manage invoices -> handle support and complaints -> reports and analytics -> dashboard.

## Booking State Order

1. `PENDING`
2. `PAYMENT_COMPLETED`
3. `ASSIGNMENT_PENDING`
4. `TECHNICIAN_ASSIGNED`
5. `TECHNICIAN_ACCEPTED` or `TECHNICIAN_REJECTED`
6. `TECHNICIAN_ON_THE_WAY` for on-site work
7. `TECHNICIAN_ARRIVED` for on-site work
8. `SERVICE_STARTED` or `REMOTE_SESSION_STARTED`
9. `SERVICE_COMPLETED`
10. `REMAINING_PAYMENT_PENDING` when a balance is due
11. `FULLY_PAID`
12. `INVOICE_GENERATED`
13. `BOOKING_CLOSED`
14. Rating and review may be submitted after service completion and only once per customer booking.

`CANCELLED` is a controlled terminal state. Cancellation and refund eligibility depend on the current state and actor.

## Required Enforcement

- The backend is authoritative for every workflow transition.
- Customers can access only their own bookings, payments, invoices, tracking, and reviews.
- Technicians can access only assigned jobs and cannot start work before accepting the assignment.
- Agents can operate bookings and assignments but cannot change protected admin or security settings.
- Administrators approve technicians, manage catalog pricing, refunds, complaints, and reporting.
- Region controls currency, pricing, phone validation, address validation, tax inputs, and technician eligibility.
- Payment webhooks, not browser redirects, confirm successful payments.
- Parts and additional charges require an itemized record and customer approval before final payment.
- Invoice generation follows confirmed payment and produces an immutable invoice record.
- Every sensitive change records actor, timestamp, previous state, and new state.
- Production OTP, email, payment, location, and notification failures must have bounded retries and clear recovery states.

## Launch Acceptance

- All three role journeys pass end-to-end on desktop web, mobile web, and Android WebView.
- Refreshing, closing, or reopening the application does not lose an active booking step.
- Duplicate clicks cannot create duplicate bookings, payments, invoices, assignments, or reviews.
- Unauthorized role and ownership requests return `403`; unauthenticated requests return `401`.
- US and UK region data remains consistent from registration through invoice.
- Live tracking stops when the job is completed, cancelled, or closed.
- No demo OTP, demo identity, hard-coded payment success, or hard-coded technician data exists in production.
