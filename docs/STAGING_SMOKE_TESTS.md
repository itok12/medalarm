# Staging Smoke Tests

## Backend and Frontend

1. Start the full stack with Docker Compose or deploy the staging services in Render.
2. Confirm the backend health endpoint returns `UP` at `/actuator/health`.
3. Load the frontend and verify login and registration pages render.
4. Optionally run `pwsh ./scripts/smoke-test.ps1` against a local or staging backend base URL.

## Core Flow

1. Register a new user.
2. Add a medicine with `startDate` and optional `endDate`.
3. Generate alarms for that medicine and confirm times anchor from the saved default alarm time.
4. Create a manual alarm and confirm it appears alongside generated alarms.
5. Mark a dose as `TAKEN`, then `SKIPPED` or `SNOOZED`, and confirm the adherence chart updates.
6. Export the adherence CSV and verify the downloaded file contents.

## Settings and Notifications

1. Change timezone, default alarm time, and email reminder preference from Settings.
2. Refresh the page and confirm server-backed settings persist.
3. Change local-only settings such as compact view and snooze duration, then refresh and confirm they persist locally.
4. Allow browser notifications and confirm an active alarm triggers a notification and snooze persists across refresh.

## Caregiver Access

1. Register a second user as the patient.
2. Link the patient from the caregiver page using username.
3. Confirm the caregiver can read the patient adherence log.
4. Confirm the caregiver cannot edit the patient's medicines or alarms through the UI or API.
