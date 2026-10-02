# ADR 0002: Schedule reminders on the device with a pure planner and reconcile

- Status: Accepted
- Date: 2026-10-01

## Context

A medication reminder is useless if it is late or missing. The original app
scheduled notifications imperatively: each screen that changed data called
`schedule`/`cancel` for the notifications it thought were affected, and a
fingerprint cache skipped "unchanged" resyncs. Testing on an Android 14
emulator found:

- Marking one dose Taken cancelled every notification for that alarm for the
  whole week (39 pending → 18), and the fingerprint cache then stopped the
  next sync from restoring them.
- Any resync after a dose time wiped that dose's pending follow-up nudges.
- The cache could report "in sync" while Android had nothing pending.

Server-sent push (FCM) was the other option.

## Decision

1. The phone owns the schedule. The server never sends reminders.
2. A **pure planner** (`frontend/src/utils/notificationPlan.js`) takes
   medicines, alarms, logs and `now`, and returns every notification that
   should exist from yesterday to 7 days ahead: the main reminder plus nudges
   at +15 and +30 minutes, skipping doses already answered.
3. Each notification has a **deterministic id** packed from
   `(alarm id, local day, kind)`, and a signature of its time and text.
4. A **reconciler** (`syncNativeAlarmNotifications` in `reminderService.js`)
   reads `getPending()`, cancels what shouldn't exist or has changed, and
   schedules what's missing. Runs are serialised. Snoozes and test
   notifications are left alone unless their dose has been answered.

## Why

- **Works offline and when the server is down.** Push needs the network and
  the backend at the dose time; local alarms don't. The free Render backend
  was down for weeks during this project; reminders kept firing.
- **Idempotent by construction.** Running sync twice changes nothing. Any
  screen can call it after any change; no caller needs to know which
  notifications it affects.
- **Testable.** The planner is pure, so DST, midnight doses, answered doses and
  id collisions are unit tests with a fixed clock (24 planner tests, pinned to
  `Europe/London`). The reconciler is tested against an in-memory queue.
- **Self-healing.** If Android drops alarms (force-stop, a vendor battery
  killer), the next app open restores exactly the planned set.

## Consequences

- Android needs "Alarms & reminders" (`SCHEDULE_EXACT_ALARM`) for on-time
  delivery in Doze. Without it reminders were measured 68 s late, and alarms
  restored after reboot had a 1-hour window. The app asks for it, and
  Settings ▸ Reminder health shows its status.
- Force-stop cancels all alarms until the app is opened again. Android allows
  no workaround; the app explains it.
- Logging a dose on another device only cancels this phone's reminder the next
  time this phone syncs.
- The 7-day window means a phone left unopened for a week runs out of
  reminders. `BOOT_COMPLETED` restores pending alarms, not new days. A
  periodic WorkManager resync would close that gap.
- iOS allows 64 pending notifications; the planner caps at 60 there.

## Revisit if

Caregiver alerts for missed doses are added. Those need the server, so they
would add push alongside the local schedule, not replace it.
