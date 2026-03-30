# Play Data Safety Worksheet

Use this worksheet to answer the Google Play `Data safety` form consistently with MedAlarm’s current implementation.

## Data Collected

### Personal info

- Email address: `Collected`
  - Purpose: account management, authentication, optional reminder email delivery
  - Required: yes for account-based use

### App activity

- App interactions: `Collected` only if analytics is enabled via deployment environment variables
  - Purpose: analytics
  - Required: no

### App info and performance

- Crash logs: `Collected` only if Sentry is enabled via deployment environment variables
  - Purpose: diagnostics
  - Required: no

### Health and fitness

- Medication schedule and adherence history: `Collected`
  - Purpose: core app functionality
  - Required: yes

## Data Shared

- Personal info: `Not shared`
- Health-related data: `Not shared`
- Caregiver-linked visibility: this is app-internal access control, not third-party sharing

## Security Practices

- Data is transmitted over HTTPS in deployed environments
- Passwords are stored as hashes on the backend
- JWT auth protects API access
- Caregiver access is read-only and explicitly linked

## Optional Telemetry

If these environment variables are empty, MedAlarm does not send that telemetry:

- `REACT_APP_GA_MEASUREMENT_ID`
- `REACT_APP_SENTRY_DSN`

If either integration is enabled in production, update the Data safety answers to reflect the actual deployment.

## Policy Notes

- MedAlarm is a consumer reminder app, not a medical device workflow
- Review the latest Play policy requirements before final submission
