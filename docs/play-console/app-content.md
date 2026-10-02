# App Content Answers

Draft answers for Play Console ▸ Policy ▸ App content, for release 1.1.0.

## Privacy policy

- URL: `https://medalarmapp.com/privacy-policy.html`
  (fill every `[TO FILL]` in `docs/PRIVACY_POLICY.md`, regenerate the HTML,
  and deploy before submitting)

## Ads

- Contains ads: `No`

## App access

MedAlarm opens in guest mode with no sign-in, but syncing, guest-data import,
caregiver sharing and label scanning need an account.

- Answer: `All or some functionality in my app is restricted`
- Instructions name: `Account features`
- Username / password: the review account set on the Render backend with
  `MEDALARM_REVIEW_USERNAME` / `MEDALARM_REVIEW_PASSWORD`
  (`ReviewAccountSeeder` creates or resets it on startup)
- Reviewer notes:
  `MedAlarm works without an account: open the app and add a medicine from the Medicines tab. To review account features, tap "Sign in to sync" and use the credentials above. On first sign-in the app asks for consent to store health data; tap "I agree". Caregiver sharing (Care tab) requires a second account to approve the request. "Scan label" sends a photo to our AI provider to read the label.`

## Target audience and content

- Target age group: `18 and over`
- Appeals to children: `No`

## Content rating

- Category: `Reference, News, or Educational`, or `Utility, Productivity,
  Communication, or Other` (pick the closest offered); answer `No` to every
  violence, sexual content, language, controlled substance promotion,
  gambling and user-interaction question.
- Note: the app records the user's own medicines; it does not sell, promote or
  give instructions for drugs.

## News apps

- News app: `No`

## Health apps declaration

- Health features: `Yes`
- Feature type: `Medication and treatment management` (reminders, dose
  logging, adherence history, refill tracking)
- Medical device / regulated software: `No`
- Clinical decision support, diagnosis or treatment advice: `No`
- Human-subjects research: `No`
- Government or public-health affiliation: `No`
- Health Connect: `Not used`
- Reviewer note:
  `MedAlarm is a consumer medication reminder and dose log. Users enter their own medicines; the app schedules reminders and records whether doses were taken. It does not diagnose, recommend treatment, or calculate doses. Health data stays on the device unless the user creates an account and gives explicit consent. A disclaimer that it is not medical advice appears at sign-up, in setup, in Settings and in the store listing.`

## Permissions reviewers will see

| Permission | Why |
|------------|-----|
| `POST_NOTIFICATIONS` | Shows dose reminders |
| `SCHEDULE_EXACT_ALARM` | User-granted "Alarms & reminders" so reminders fire at the dose time; without it they were measured arriving 68 s late in Doze and restored with a 1-hour window after reboot (`docs/DEVICE_QA.md`) |
| `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Restores reminders after a restart (from the notifications plugin) |
| `INTERNET` | Syncs account data |

If Play Console asks for an exact-alarm declaration, the core-functionality
answer is: medication reminders that must fire at the user's dose time.

## Data safety

See `docs/PLAY_DATA_SAFETY_WORKSHEET.md`.
