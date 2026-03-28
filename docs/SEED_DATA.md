# Seed and Demo Data Strategy

## Local Development

- The backend seeds a single demo user on startup:
  - username: `demo`
  - password: `demo123`
- Use that account only for local development or quick smoke checks.

## Shared Staging

1. Avoid auto-seeding demo data in shared staging after launch.
2. Create demo users manually or through a one-off script so test data stays intentional.
3. Keep caregiver and patient demo accounts separate to validate authorization boundaries.

## Demo Dataset Guidelines

- Include at least one active medicine with auto-generated alarms.
- Include one expired medicine to validate expiry chips and alarm deactivation.
- Include adherence logs containing `TAKEN`, `SKIPPED`, and `SNOOZED`.
- Include one caregiver linked to one patient for read-only audit checks.

## Cleanup

- Reset staging demo accounts after demos or manual exploratory testing.
- Do not carry real user data into demo or seed environments.
