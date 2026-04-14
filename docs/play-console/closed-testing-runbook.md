# Closed Testing Runbook

Use this checklist to run the MedAlarm closed test needed before applying for production access in Google Play.

## Goal

- Get at least 12 testers opted in to the closed test
- Keep the closed test running for at least 14 continuous days
- Collect enough real feedback to answer Google's production-access questions honestly

## Recommended tester target

Recruit 15 to 18 people, not just 12.

Reason:
- some people will forget to opt in
- some will install late
- some may uninstall before the 14-day window finishes

## Important tester instructions

Each tester should:
- open the Google Play opt-in link you send them
- join the MedAlarm closed test with the same Google account you added in Play Console
- install the app
- keep the app installed for the full 14-day test window
- open the app at least a few times during the test
- enable notifications
- report bugs or confusing parts

## Suggested schedule

Treat the day the release becomes available to testers as `Day 0`.

Example:
- If testers opt in on April 15, 2026, your earliest 14-day checkpoint is April 29, 2026
- If testers opt in on April 16, 2026, your earliest 14-day checkpoint is April 30, 2026

To keep things simple, try to get all testers opted in within the first 24 hours.

## Day-by-day plan

### Day 0

- Send the tester invite message
- Confirm at least 12 testers have received the opt-in link
- Ask everyone to install the app on the same day
- Ask testers to keep notifications enabled

### Day 1

- Check how many testers have opted in
- Follow up with anyone who has not joined
- Ask testers to complete the first-use flow:
  - register or sign in
  - add a medicine
  - generate reminders
  - confirm a notification permission prompt appears

### Day 3

- Ask testers to confirm:
  - reminders are appearing
  - alarms match expected times
  - taken, skipped, and snoozed actions work

### Day 7

- Ask for a short feedback check-in:
  - what worked
  - what felt confusing
  - whether they saw any missed or duplicate reminders

### Day 10

- Reconfirm tester count
- Make sure nobody has uninstalled unexpectedly
- Ask at least a few testers to try:
  - editing medicines
  - viewing adherence history
  - reopening the app after it was closed

### Day 14

- Confirm the test has run for the full period
- Summarize bugs found and fixed
- Write down how feedback improved the app
- Prepare answers for the production-access form

## What testers should actually test

- onboarding and sign-in
- adding the first medicine
- generating alarms from a schedule
- notification permission prompt
- reminder delivery at the expected time
- snooze, taken, and skipped logging
- history updates after logging
- reopening the app after backgrounding or force-close
- general clarity of the Today screen

## Feedback questions to ask testers

Use these when you check in:

1. Were reminders delivered when you expected them?
2. Was it easy to add and manage a medicine?
3. Did the Today screen make sense right away?
4. Did snooze, taken, and skipped actions behave as expected?
5. Did anything feel broken, confusing, or unreliable?

## Production application prep

When Google asks about your closed test, be ready to answer:
- who tested the app
- what kinds of feedback you received
- what bugs or UX problems were found
- what you changed or confirmed because of the test
- why the app is now ready for a wider audience

## MedAlarm notes

Have testers pay special attention to:
- reminder reliability
- notification timing
- timezone behavior
- ease of first medicine setup
- clarity of adherence history
