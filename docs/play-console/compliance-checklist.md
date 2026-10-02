# Compliance checklist (owner tasks)

What has to happen outside the code before MedAlarm goes to production.
Everything the code can do is done; these need your decisions, accounts or
legal details.

## Before the privacy policy goes live

- [ ] Fill every `[TO FILL]` in `docs/PRIVACY_POLICY.md`:
  - your full legal name as data controller
  - the transfer safeguard each US provider offers (check Render's and
    Anthropic's Data Processing Addendums: UK Extension to the EU-US Data
    Privacy Framework, or the UK International Data Transfer Addendum)
  - backup retention once you choose a database plan
  - the email provider, only if you switch on email reminders
- [ ] Regenerate the public page: `python scripts/privacy-policy-html.py`
  (or ask Claude), deploy, and check https://medalarmapp.com/privacy-policy.html
- [ ] Accept/sign Render's and Anthropic's Data Processing Addendums (both
  process personal data for you)

## UK data protection

- [ ] Pay the ICO data protection fee (most controllers processing personal
  data must; small organisations pay the lowest tier). Check with the ICO's
  self-assessment: https://ico.org.uk/for-organisations/data-protection-fee/
- [ ] Write a short Data Protection Impact Assessment (DPIA). Processing health
  data is a special category, so a DPIA is expected when it is likely to be high
  risk. The ICO has a template. The useful content is already in
  `docs/PRIVACY_POLICY.md` and the security sections of the Week 3 commits.
- [ ] Decide what happens to data if you stop running the service, and say so
  in the policy.

## Play Console

- [ ] Data safety form: answers in `docs/PLAY_DATA_SAFETY_WORKSHEET.md`
- [ ] App content (access, health declaration, ratings, audience):
  `docs/play-console/app-content.md`
- [ ] Set `MEDALARM_REVIEW_USERNAME`, `MEDALARM_REVIEW_EMAIL` and
  `MEDALARM_REVIEW_PASSWORD` on the Render backend (rotate the old password)
- [ ] Store listing text: `docs/play-console/en-GB/`
- [ ] Upload the 1.1.0 AAB (version code 2) to Internal testing, then Closed
  testing. Personal developer accounts need 12+ testers opted in for 14
  days before production access.

## Things that would change these answers

- Turning on analytics (GA) or crash reporting (Sentry): update the policy and
  Data safety first; web analytics also needs a cookie consent banner (PECR).
- Turning on email reminders: name the email provider in the policy.
- Changing the consent wording: bump `HealthDataConsent.CURRENT_VERSION` (server)
  and `HEALTH_DATA_CONSENT_VERSION` (frontend) so users are asked again.
