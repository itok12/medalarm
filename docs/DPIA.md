# Data Protection Impact Assessment (draft)

Status: **draft for the controller to review and sign off.** Written
2026-10-03 against release 1.1.0 (version code 3). It follows the structure
of the ICO's DPIA template. Revisit it whenever data handling changes.

| | |
|---|---|
| Controller | [TO FILL: your full legal name], trading as MedAlarm |
| Contact | support@medalarmapp.com |
| Signed off by / date | [TO FILL] |

## 1. Why a DPIA

MedAlarm stores the medicines a person takes and whether they took each dose.
That is health data, a special category under UK GDPR Article 9. The ICO
expects a DPIA for processing special-category data that is likely to be high
risk. MedAlarm processes it at small scale, but a DPIA is cheap, and it
records the decisions below.

## 2. The processing

**Nature.** An Android app (React + Capacitor) schedules reminders on the
phone. Guest mode keeps everything on the phone. An optional account syncs
data to a Spring Boot API with a Postgres database on Render.

**Data.**

| Data | Where | Why |
|------|-------|-----|
| Username, email, password hash (BCrypt) | Server | Sign-in |
| Medicines (name, dose, frequency, instructions, pill count), reminder times, dose log | Server (accounts); phone only (guests) | Core function |
| Health-data consent time and wording version | Server | Proof of explicit consent (Art. 9(2)(a)) |
| Caregiver links and their status | Server | Sharing the user approved |
| Medicine label photo | Server memory, then Anthropic | Read the label on request; not stored |
| IP address | Server memory, up to 15 minutes | Rate-limit sign-in |

**Scope.** Adults (18+), mainly UK. Expected volume: tens to low thousands of
users.

**Context.** Users may be older or managing long-term conditions. They expect
reminders to be accurate and their medicine list to stay private.

**Purpose.** Remind people to take their medicine and keep a dose history they
can share with a caregiver.

## 3. Lawful basis and necessity

- Article 6: contract (providing the service the user signs up for).
- Article 9: explicit consent, recorded at sign-up (`RegisterRequest`
  `@AssertTrue healthDataConsent`, Flyway V6). Accounts created before consent
  existed get a one-time dialog and cannot sync health data until they agree.
- Minimisation: no name, address, phone number, location, contacts, advertising
  ID, analytics or crash reporting. Guest mode needs no account at all.
- Users can export a CSV of their history and delete their account in the app
  or at https://medalarmapp.com/delete-account.html.

## 4. Risks

Likelihood and severity: Remote / Possible / Probable; Minimal / Significant /
Severe.

| # | Risk to individuals | Likelihood | Severity | Overall |
|---|---------------------|-----------|----------|---------|
| R1 | Medicine list exposed by a breach of the server or database | Possible | Significant | Medium |
| R2 | Account takeover by password guessing | Possible | Significant | Medium |
| R3 | Caregiver sees data the patient didn't approve | Remote | Significant | Low |
| R4 | A reminder doesn't fire, so a dose is missed | Possible | Severe | High |
| R5 | Label photo reveals more than the label (faces, addresses) | Possible | Minimal | Low |
| R6 | Data sent to the US without adequate safeguards | Remote | Significant | Low |
| R7 | Data kept after the user deletes their account | Remote | Significant | Low |
| R8 | Stolen phone exposes a stored session | Possible | Significant | Medium |

## 5. Measures

| Risk | Measures in place (evidence) | Residual |
|------|------------------------------|----------|
| R1 | HTTPS only; release builds block cleartext (`usesCleartextTraffic=false`). Render encrypts the database at rest (DPA Exhibit C). Passwords hashed with BCrypt; refresh tokens stored as SHA-256 hashes (`RefreshTokenService`). H2 console off in production; actuator shows health only. | Low |
| R2 | Account lockout after 5 failed sign-ins for 15 minutes (`LoginAttemptService`). Sign-in and register limited to 20 requests a minute per IP (`RateLimitFilter`). | Low |
| R3 | Caregiver links start PENDING; the patient must accept before any log is visible, and can revoke at any time (Flyway V5, `CaregiverService`, `CaregiverControllerTest`). Caregivers can't change medicines or reminders. | Low |
| R4 | Reminders are scheduled on the phone, so they fire offline and while the server is down. Exact alarms are requested and checked; reminders are restored after reboot; Settings ▸ Reminder health shows battery and notification problems with fix buttons. Measured on a device in `docs/DEVICE_QA.md`. A medical disclaimer says not to rely on the app alone. Force-stop cancels alarms (an Android rule), so the app explains it. | Medium (accepted: the OS can still block notifications) |
| R5 | Scan is opt-in, shown only to account users, with a disclosure before the camera opens. The photo is forwarded and not stored (`MedicineScanController`). Anthropic does not train on API data by default. | Low |
| R6 | Render: UK Extension to the EU-US Data Privacy Framework or UK Addendum SCCs, in its DPA. Anthropic: UK Addendum SCCs, in its DPA. | Low |
| R7 | Account deletion removes data from the live database at once (`AccountDeletionService`); backups expire within 7 days, as the policy says. | Low |
| R8 | Access tokens expire after 24 hours; refresh tokens rotate on every use and expire after 7 days. The refresh token is in app-private storage (Capacitor Preferences), which other apps can't read. Signing out revokes it server-side. | Medium (accepted: matches typical consumer apps; device lock is the main control) |

## 6. Open items

- [ ] Pay the ICO data protection fee.
- [ ] Choose a database plan and confirm its backup retention is 7 days or less,
  or update the policy.
- [ ] If analytics, crash reporting or email reminders are switched on, update
  this DPIA, the privacy policy and the Play Data safety answers first.
- [ ] Consider an app lock (device PIN/biometric) to reduce R8 further.

## 7. Outcome

The residual risk is acceptable: no item is high after the measures. Prior
consultation with the ICO is not needed.

| | |
|---|---|
| Approved by | [TO FILL] |
| Date | [TO FILL] |
| Review date | When data handling changes, or by 2027-10-03 |
