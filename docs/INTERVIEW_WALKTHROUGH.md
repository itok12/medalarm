# Interview walkthrough

A script for presenting MedAlarm in a SWE interview. Practise it out loud; be
ready to open any file named here.

## 30-second pitch

> MedAlarm is a medication reminder app for Android. It's React in Capacitor
> with a Spring Boot API. The interesting part is reliability: reminders are
> planned on the phone by a pure function and reconciled against what Android
> actually has pending, so they work offline, survive reboots, and I measured
> delivery in Doze, process death, force-stop and reboot. It works without an
> account; signing up moves your data to the server in one transaction, with
> UK GDPR consent for health data.

## 5-minute demo

1. **Guest first run** (Today): no login wall. Add a medicine with an 08:00
   dose.
2. **Notification**: Settings ▸ Reminder health ▸ *Send a test reminder*. Show
   the Taken / Snooze buttons.
3. **Reminder health**: notifications, exact timing, battery, next reminder.
   Explain why each row exists (68 s late without exact alarms).
4. **Today**: mark a dose Taken, show "Taken at 8:03", then Undo.
5. **History**: chart and Export CSV (share sheet).
6. **Sign in to sync**: register (consent checkbox), import guest data.

A screen recording is in `artifacts/demo/medalarm-tour.mp4` (not committed;
upload it to the README or a release if you want it public).

## Deep dives (pick one or two)

| Topic | Open | Key points |
|-------|------|-----------|
| Reminder engine | `frontend/src/utils/notificationPlan.js`, `services/reminderService.js` | Pure planner; deterministic ids; reconcile vs `getPending()`; why no cache; serial queue. [Case study](case-study-reminder-reliability.md) |
| Dose identity | `V4__dose_identity.sql`, `MedicationLogService` | `scheduledFor`; unique constraint makes retries idempotent; ±12 h fallback for old rows |
| Auth on mobile | `AuthController`, `nativeSession.js`, `AuthContext.js` | Cookies don't work across the WebView origin, so native clients get the refresh token in the body and keep it in Preferences; rotation; never downgrade to guest |
| Abuse protection | `LoginAttemptService`, `RateLimitFilter` | Per-account lockout + per-IP limit; why refresh is not rate-limited; `X-Forwarded-For` trust behind Render's proxy |
| Caregiver consent | `V5__caregiver_consent.sql`, `CaregiverService` | PENDING → ACCEPTED; patient can revoke; caregiver view hides email |
| Privacy | `HealthDataConsent`, `docs/DPIA.md` | Article 9 explicit consent with a version; guest data not "collected" |

## Questions to expect

**Why not React Native?** See [ADR 0001](adr/0001-capacitor-over-react-native.md).
The native work (alarms, battery) is the same either way; a rewrite would
replace a tested UI for no user-visible gain.

**Why not server push?** See [ADR 0002](adr/0002-on-device-scheduling.md).
Push needs the network and the server at dose time. The free backend was down
for weeks and local reminders kept working.

**How do you know it works?** 24 planner tests in `Europe/London`, including
both 2026–27 clock changes; reconciler tests; device measurements in
`docs/DEVICE_QA.md`.

**What would break at scale?** The server is a single Render instance; rate
limiting and login lockout are in memory, so they reset on deploy and don't
share across instances (Redis/Bucket4j-JCache would fix that). Logs are read
per user without pagination.

**What are you least happy with?**
- No physical-device testing on Samsung/Xiaomi.
- No WorkManager resync, so a phone unopened for over seven days runs out of
  planned reminders.
- Guest and API data paths duplicate rules.
- The CRA toolchain is deprecated; Vite is the next migration.

**What did you use AI for?** Be specific and honest. Say which parts you
designed, which you reviewed, and how you verified them (tests, emulator,
`dumpsys`). Make sure you can explain every line of the planner, reconciler
and auth flow without notes, because interviewers will ask.

## Numbers to remember

- 39 → 18 pending: the Taken bug. 42 → 39: after the fix.
- 68 s late in Doze without exact alarms; 1-hour window after reboot.
- 48 backend tests, 73 frontend tests, CI with zero lint warnings and an
  Android build.
- Flyway V4 (dose identity), V5 (caregiver consent), V6 (health-data consent).
