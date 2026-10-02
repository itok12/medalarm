# Compliance checklist (owner tasks)

What has to happen outside the code before MedAlarm goes to production.
Everything the code can do is done; these need your decisions, accounts or
legal details.

## Before the privacy policy goes live

- [ ] Put your full legal name in the one remaining `[TO FILL]` in
  `docs/PRIVACY_POLICY.md` (data controller). Transfers and backup retention
  are filled in (2026-10-03, from Render's DPA of 19 Dec 2024 and Anthropic's
  DPA). Name the email provider only if you switch on email reminders.
- [ ] Regenerate the public page: `python scripts/privacy-policy-html.py`
  (or ask Claude), deploy, and check https://medalarmapp.com/privacy-policy.html
- [x] Data Processing Addendums: nothing to sign. Render's DPA "supplements
  the Render Terms of Service" and both parties are deemed to have signed its
  SCCs and UK Addendum; Anthropic's DPA is incorporated into its Commercial
  Terms. Keep a dated PDF of each for your records.
- [ ] Backups: the policy promises deletion from backups within 7 days. Render
  free Postgres has no backups; paid plans keep point-in-time recovery for
  3-7 days. If you choose a plan with longer retention, update the policy.

## UK data protection

- [ ] Pay the ICO data protection fee (most controllers processing personal
  data must; small organisations pay the lowest tier). Check with the ICO's
  self-assessment: https://ico.org.uk/for-organisations/data-protection-fee/
- [ ] Review and sign off the draft DPIA in `docs/DPIA.md` (add your name and
  date; revisit it when data handling changes).
- [ ] Decide what happens to data if you stop running the service, and say so
  in the policy.

## Play Console

- [ ] Data safety form: answers in `docs/PLAY_DATA_SAFETY_WORKSHEET.md`
- [ ] App content (access, health declaration, ratings, audience):
  `docs/play-console/app-content.md`
- [ ] Set `MEDALARM_REVIEW_USERNAME`, `MEDALARM_REVIEW_EMAIL` and
  `MEDALARM_REVIEW_PASSWORD` on the Render backend (rotate the old password)
- [ ] Store listing text: `docs/play-console/en-GB/`
- [ ] Upload the 1.1.0 AAB (version code 3) to Internal testing, then Closed
  testing. Personal developer accounts need 12+ testers opted in for 14
  days before production access.

## Things that would change these answers

- Turning on analytics (GA) or crash reporting (Sentry): update the policy and
  Data safety first; web analytics also needs a cookie consent banner (PECR).
- Turning on email reminders: name the email provider in the policy.
- Changing the consent wording: bump `HealthDataConsent.CURRENT_VERSION` (server)
  and `HEALTH_DATA_CONSENT_VERSION` (frontend) so users are asked again.
