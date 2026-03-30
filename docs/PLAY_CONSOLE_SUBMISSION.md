# Play Console Submission

This checklist turns the signed Android release into a Play Console-ready submission package.

## Current Android Artifacts

- Signed AAB: `frontend/android/app/build/outputs/bundle/release/app-release.aab`
- Signed APK: `frontend/android/app/build/outputs/apk/release/app-release.apk`
- Version code: `1`
- Version name: `1.0.0`

## Package Contents To Prepare

1. The signed AAB for Play upload
2. Release notes for the `en-GB` default locale
3. Short and full store descriptions
4. Support and privacy URLs
5. Data safety answers
6. App content answers
7. Internal-testing and closed-testing plan
8. Support contact details

## Play Console Flow

1. Create the app in Play Console.
2. Set the default language and app name.
3. Upload the signed AAB to the internal testing track first.
4. Fill out the store listing using the metadata files in `docs/play-console/`.
5. Complete the `App content` section:
   - privacy policy
   - ads declaration
   - app access if required
   - target audience
   - news status
6. Complete the `Data safety` form using `docs/PLAY_DATA_SAFETY_WORKSHEET.md`.
7. Add at least the required screenshots and the high-res icon.
8. Start internal testing, then closed testing, then production once the account is eligible.

## MedAlarm-Specific Answers

- App category: `Medical`
- Ads: `No`
- Primary value: medicine reminders, logging adherence, and caregiver read-only visibility
- Account required: `Yes`, because schedules and logs are tied to the authenticated user
- Sensitive functionality: notifications and health-related routine tracking

## Required Links

- Privacy policy: `https://medalarm.app/privacy-policy.html`
- Support page: `https://medalarm.app/support.html`
- Marketing site: `https://medalarm.app/`
- Support email: `support@medalarm.app`

## Screenshot Set

Use real-device screenshots, not browser screenshots.

1. Today screen with the next upcoming dose
2. Medicine management with add form and schedule list
3. Adherence history chart and recent logs
4. Settings screen showing reminder defaults
5. Caregiver screen showing linked patient history

## Notes

- If this Play developer account is subject to extra testing requirements, complete those before planning a production date.
- Keep the keystore file and `keystore.properties` outside git.
- The helper script `scripts/prepare-play-console-package.ps1` can gather the current release materials into a local handoff folder.
