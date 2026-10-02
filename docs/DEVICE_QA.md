# Device QA: reminder delivery

How MedAlarm's reminders behave in the states that usually break medication
apps. Each test schedules a probe notification a known number of seconds
ahead, puts the device in the state under test, and records when the
notification is actually posted (`adb shell dumpsys notification`).

- Device: Android emulator, API 34 (Android 14), Pixel image, `com.medalarm.app` debug build
- Date: 2026-10-02, branch `week4/ux-qa`
- Probe helper: schedules a notification in the test id range through the app's WebView (`LocalNotifications.schedule`, `allowWhileIdle: true`)

## Results

| # | Scenario | How it was produced | Target | Posted | Result |
|---|----------|---------------------|--------|--------|--------|
| 1 | Deep Doze, exact alarms **not** allowed (Android 14 default) | screen off, `dumpsys deviceidle force-idle` | 14:39:20 | 14:40:28 | **68 s late** (inexact `setAndAllowWhileIdle`) |
| 2 | Deep Doze, exact alarms allowed | same, after granting "Alarms & reminders" | 14:42:18 | 14:42:19 | On time |
| 3 | App process killed by the system | app in background, `am kill com.medalarm.app` | 14:43:33 | 14:43:34 | On time; Android started the process to deliver it |
| 4 | App force-stopped from Settings | `am force-stop com.medalarm.app` | 14:44:48 | never | **Not delivered.** Android removes a force-stopped app's alarms. Reopening the app rescheduled all 18 dose reminders (as exact alarms). |
| 5 | Reboot, app not opened | `adb reboot` | — | — | All 18 reminders re-registered by the plugin's `BOOT_COMPLETED` receiver without opening the app |

### What the results mean

- **Exact timing matters.** Without the "Alarms & reminders" permission
  Android treats reminders as inexact: in Doze they waited for a maintenance
  window (68 s here; real devices can wait much longer), and the alarms
  restored after reboot had a **1-hour delivery window** (`window=+1h` in
  `dumpsys alarm`), so an 08:00 reminder could arrive at 09:00. The app
  prompts for the permission on the Today screen and in Settings ▸ Reminder
  health.
- **Force-stop is the one case the app cannot recover from by itself.** Reminder
  health tells users that force-stopping cancels reminders until they open the
  app again.
- **Unverified:** on this emulator the exact-alarm grant reverted to "default"
  after `adb reboot` (both when granted with `cmd appops` and through the
  Settings screen), so restored alarms came back inexact. This may be an
  emulator/app-ops persistence artifact; recheck on a physical phone. If it
  reproduces, the app should resync when it next opens (it already does) and
  Reminder health will show exact timing as "Not allowed".

## Accessibility and large text

- Android font size at **200%**: the WebView scales text (body 16 → 32 px). The
  bottom navigation now shows icons with only the selected label at large text
  sizes (labels previously overlapped).
- Accessible names verified in the Android accessibility tree
  (`uiautomator dump`), e.g. "Delete 8:00 AM alarm for Lisinopril",
  "Mark 8:00 AM Lisinopril dose as taken", "Switch to light mode", "More options".
- Not yet done: a full TalkBack walkthrough on a physical device.

## Still to test on physical phones

- Samsung and Xiaomi/Oppo (aggressive battery managers) with battery
  optimization on and off.
- Do Not Disturb with the reminder channel's importance.
- UK clock change on **Sun 25 Oct 2026**: keep an alarm at 01:30, which occurs
  twice; the planner schedules it once (covered by unit tests).
