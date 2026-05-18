# Store Submission Pack

## URLs

- Privacy policy URL: `https://medalarmapp.com/privacy-policy.html`
- Support URL: `https://medalarmapp.com/support.html`
- Marketing URL: `https://medalarmapp.com/`
- Support email: `support@medalarmapp.com`

## Apple App Store Copy

- App name: `MedAlarm`
- Subtitle: `Medicine reminders that stay calm and reliable`
- Promotional text:
  `Stay ahead of every dose with a focused Today screen, fast Taken and Snooze actions, and adherence history you can actually use.`
- Description:
  `MedAlarm helps you manage medicines, keep reminders on time, and review your adherence history without a cluttered dashboard. Add medicines, auto-generate schedules, log doses in seconds, and optionally share read-only adherence visibility with caregivers.`

## Google Play Copy

- Short description:
  `Medicine reminders, dose logging, and adherence history for daily routines.`
- Full description:
  `MedAlarm is a medication reminder and adherence tracking app built for everyday routines. Set up medicines, generate reminders from your schedule, log doses as taken, skipped, or snoozed, and review adherence history over time. You can also share read-only adherence visibility with a linked caregiver. The mobile app uses native local notifications for reliable reminders, while the web app stays installable as a PWA. MedAlarm is not a medical device and does not provide diagnosis, treatment recommendations, or professional medical advice. Always follow the guidance of your doctor, pharmacist, or other qualified healthcare professional.`

Google Play metadata files now live in `docs/play-console/en-GB/`.

## Review Notes

- The app uses local notifications for medicine reminders.
- Caregiver access is read-only in this version.
- Browser notifications are best-effort on the web; native reminders are used on iOS and Android.
- Account creation is required because medicines, alarms, and adherence logs sync to the authenticated user.
- Health declaration: `Medical` -> `Medication and treatment management`
- Medical device status: `No`
- Suggested reviewer note:
  `MedAlarm is a consumer medication reminder and adherence tracking app. It is not a medical device and does not provide diagnosis or treatment recommendations.`

## Permission Explanations

- Notification permission:
  `MedAlarm uses notifications to remind you when it is time to take your medicines.`
- Email reminders:
  `Email reminders are optional and only used when you enable them in settings.`

## Screenshot Brief

1. Today screen with next dose and quick actions
2. Medicines screen with add-medicine form and schedule list
3. History screen with adherence chart
4. Settings screen showing reminder defaults
5. Caregiver screen with linked patient history

## Launch Checklist

- Verify `https://medalarmapp.com/privacy-policy.html` and `https://medalarmapp.com/support.html` are live.
- Capture screenshots from a real device build, not the browser.
- Replace placeholder icon assets if you update the brand.
- Confirm notification permission text matches the store submission forms.
- Fill in the real support email in both Play Console and App Store Connect metadata.
- Upload the signed AAB from `frontend/android/app/build/outputs/bundle/release/app-release.aab`.
