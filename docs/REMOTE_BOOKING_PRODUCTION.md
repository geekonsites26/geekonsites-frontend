# Remote booking production setup

The application finalizes remote bookings only after Stripe confirms payment. It then stores the invoice and provisions a Google Meet session through Google Calendar.

## Stripe

Configure these backend environment variables in Render:

```text
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=https://geekonsites.com/payment-success
STRIPE_CANCEL_URL=https://geekonsites.com/payment
```

Register the backend `/api/payments/webhook` URL in Stripe and subscribe it to `checkout.session.completed`.

## Google Calendar and Meet

1. Enable the Google Calendar API in the Google Cloud project.
2. Configure the OAuth consent screen for the GeekOnSites operations account.
3. Create an OAuth client and authorize Calendar access with offline access.
4. Store the resulting OAuth client JSON and refresh token only as Render secrets.
5. Set the calendar ID to the operations calendar that owns remote sessions.

```text
GOOGLE_CALENDAR_ENABLED=true
GOOGLE_CALENDAR_OAUTH_CLIENT_JSON={...full OAuth client JSON...}
GOOGLE_CALENDAR_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=primary
GOOGLE_CALENDAR_TIME_ZONE=UTC
```

Do not commit the OAuth JSON, refresh token, Stripe secrets, or Firebase service-account JSON.

When Calendar is not configured, paid remote bookings remain stored with `remoteSessionStatus=SETUP_REQUIRED`. After configuration, an administrator can provision or retry them from the Remote Sessions tab.

## Verification

Use a Stripe test payment and confirm all of the following:

- The payment is `PAID` only after server-side Stripe verification.
- An invoice row is stored and visible to the booking customer.
- The booking stores the Calendar event ID, Meet URL, scheduled start/end, and `READY` status.
- The customer Remote Session screen opens the stored Meet URL.
- The Admin Remote Sessions tab shows the same persisted session.
