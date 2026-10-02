# ADR 0001: Ship the React web app in Capacitor, not React Native

- Status: Accepted
- Date: 2026-09-30

## Context

MedAlarm started as a React 18 web app (MUI, React Router, Axios) with a
Spring Boot API. To reach the Play Store it needed to be an Android app that
can schedule exact alarms, show actionable notifications and survive reboots.

The two realistic options were:

1. **Rewrite in React Native** (or Expo). Native UI components, a large
   ecosystem, and the usual choice for "React on mobile".
2. **Wrap the existing app in Capacitor.** The same React code runs in a
   WebView; native features come from plugins (`@capacitor/local-notifications`,
   `preferences`, `filesystem`, `share`) and small app-local Java plugins.

## Decision

Use Capacitor. Keep one React codebase for web and Android.

## Why

- **The hard part is native either way.** Reminder reliability depends on
  `AlarmManager`, `SCHEDULE_EXACT_ALARM`, `BOOT_COMPLETED` and battery
  optimisation. Capacitor's local-notifications plugin covers the first three;
  battery status needed a small Java plugin (`ReminderHealthPlugin.java`).
  React Native would need the same native work through a different library.
- **A rewrite would cost weeks and fix nothing users had reported.** Every
  screen, the guest store and 73 tests are already in React DOM + MUI.
  React Native would replace all of it (no DOM, no MUI) for a performance gain
  this app doesn't need: it is forms and lists, not animation.
- **Web stays free.** The same build serves https://medalarmapp.com.

## Consequences

- The UI is a WebView. Scrolling and transitions feel slightly less native.
  Accessibility relies on correct HTML semantics and ARIA labels, verified in
  the Android accessibility tree (`docs/DEVICE_QA.md`).
- The WebView must be configured for production: an https scheme, no cleartext
  (`usesCleartextTraffic=false`), an absolute API URL checked at build time
  (`frontend/scripts/assert-native-config.js`). Missing this broke the first
  release candidate.
- Browser features that work on the web can silently fail in the WebView
  (blob downloads did; CSV export now uses Filesystem + Share).
- iOS is possible later from the same code, within the 64-pending-notification
  limit the planner already respects.

## Revisit if

The UI needs heavy native interaction (widgets, complex gestures), or WebView
performance becomes a measured problem on low-end phones.
