# Play Testing Plan

## Internal Testing

Use internal testing first for:

- signed AAB install
- login and registration
- medicine creation
- alarm generation
- notification permission prompt
- scheduled local reminder fire
- snooze
- taken and skipped logging
- offline reopen behavior

## Closed Testing

After internal testing passes, move to closed testing with real users across:

- at least one Pixel or stock Android device
- one Samsung device
- one older Android version still within target support

## Test Scenarios

1. Fresh install and onboarding completion
2. Add one medicine and auto-generate alarms
3. Receive a local notification at the expected time
4. Snooze and confirm it fires later
5. Mark taken and verify history updates
6. Change timezone and verify future alarms
7. Force-stop and reopen the app

## Exit Criteria

- No blocker in reminder timing
- No auth/session loss
- No crash during onboarding, medicine creation, or logging
- Privacy and support URLs are live before production review
