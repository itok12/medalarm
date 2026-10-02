# Play Data Safety answers

Answers for Play Console ▸ App content ▸ Data safety, traced to the code as of
release 1.1.0 (version code 2). Re-check this file whenever data handling
changes, and keep it consistent with `docs/PRIVACY_POLICY.md`.

Google's definitions that matter here:

- Data is **collected** when it leaves the device. Guest-mode data never
  leaves the device, so it is not collected.
- Sending data to a **service provider** that processes it for us (Render
  hosting, Anthropic label reading) is **not sharing**.
- Data handled **ephemerally** (only in memory, only to serve the request) can
  be declared as such.

## Overview questions

| Question | Answer | Why |
|----------|--------|-----|
| Does your app collect or share any of the required user data types? | **Yes** | Account users' data is stored on the server |
| Is all of the user data collected by your app encrypted in transit? | **Yes** | API is HTTPS only; release builds block cleartext (`usesCleartextTraffic="false"`) |
| Do you provide a way for users to request that their data is deleted? | **Yes** | In-app Profile ▸ Delete account, and https://medalarmapp.com/delete-account.html |

## Data types

Mark every type below as **Collected: yes, Shared: no**, and **Optional**
(the app works fully in guest mode without an account) unless noted.

### Personal info

| Type | Purposes | Notes |
|------|----------|-------|
| Email address | Account management, App functionality | Sign-in and optional reminder emails (`AuthController`, `EmailReminderService`) |
| User IDs | Account management, App functionality | Username chosen at sign-up; caregivers find a patient by username |

### Health and fitness

| Type | Purposes | Notes |
|------|----------|-------|
| Health info | App functionality | Medicines (name, dose, frequency, instructions, pill counts), reminder times, dose history. Stored only with explicit consent recorded at sign-up (`HealthDataConsent`, Flyway V6) |

### Photos and videos

| Type | Purposes | Notes |
|------|----------|-------|
| Photos | App functionality | Only when the user taps "Scan label". **Processed ephemerally**: the server forwards the photo to Anthropic to read the label and keeps nothing (`MedicineScanController`) |

### Not collected

Answer **No** for everything else, including: name, address, phone number,
location, contacts, messages, calendar, files, audio, app activity /
interactions, in-app search history, web browsing, app info and performance
(crash logs, diagnostics), device or other IDs, financial info, and fitness
info.

- No analytics or crash reporting is configured
  (`REACT_APP_GA_MEASUREMENT_ID` and `REACT_APP_SENTRY_DSN` are unset). If
  either is enabled, add "App interactions" / "Crash logs" and "Diagnostics",
  and update the privacy policy first.
- IP addresses are held only in server memory for up to 15 minutes to rate-limit
  sign-in attempts; they are not stored or used for location.
- Advertising ID: **not used**.

## Data security section

- Encrypted in transit: Yes
- Users can request deletion: Yes
- Committed to the Play Families Policy: No (adults only)
- Independent security review: No

## URLs

- Privacy policy: https://medalarmapp.com/privacy-policy.html
- Account deletion: https://medalarmapp.com/delete-account.html
- Support: https://medalarmapp.com/support.html
