# ADR 0003: Guest mode first; accounts are optional and import atomically

- Status: Accepted
- Date: 2026-10-02

## Context

The app used to open on a login wall. Medication apps lose many users at
sign-up, and many users only want reminders on one phone. Health data is also
special-category data under UK GDPR: storing it on a server needs explicit
consent, a lawful basis and a privacy policy that matches.

## Decision

- The app opens in **guest mode**. Medicines, alarms and logs live in
  Capacitor Preferences on the phone (`guestDataService.js`), with the same
  shapes and rules as the server API, including idempotent dose logs and pill
  counts.
- An **account is optional**. It adds sync, caregiver sharing and label scan.
- Signing up from guest mode offers to move the guest data with
  `POST /api/import/guest`, which runs in **one transaction**: all medicines,
  alarms and logs import, or none do. The guest store is cleared only after
  the server confirms.
- Accounts require **explicit consent** to store health data, recorded with
  its wording version (Flyway V6). Guest data never leaves the phone, so it
  needs none.

## Why

- Zero-friction first run: the first reminder can be set in under a minute.
- Privacy by default: no server, no consent screen and nothing to breach until
  the user asks for sync.
- Atomic import avoids half-migrated users: a dropped connection mid-import
  leaves the guest data intact, ready to retry.
- The Play Data safety answers stay honest and simple: guest data is not
  collected.

## Consequences

- Two data paths (guest store and API) must behave the same. `api.js` routes
  to `guestDataService` in guest mode; both have tests for the same rules.
- Guest data is lost if the app is uninstalled. The UI says "Your data is
  saved on this device only" next to a "Sign in to sync" button.
- An expired session must never quietly fall back to guest mode, or the user
  would see an empty app and think their data was gone. `AuthContext` keeps
  the signed-in user and shows "session expired" instead (fixed in Week 2).
