# Deployment Checklist

## Staging First

1. Create a staging PostgreSQL database and duplicate the MedAlarm backend and frontend services in Render.
2. Point staging frontend `REACT_APP_API_BASE_URL` at the staging backend.
3. Set staging backend secrets from `.env.example`, especially `JWT_SECRET`, `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.
4. Keep `MAIL_ENABLED=false` in staging unless SMTP credentials are configured for test delivery.
5. Verify the backend health endpoint at `/actuator/health` before exposing the staging frontend.

## Render Blueprint Sync

1. In Render, open the Blueprint-backed MedAlarm project and sync it to the latest `main` commit.
2. Confirm the backend service receives `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` from the managed `medalarm-db` database.
3. Confirm the backend service includes `CORS_ALLOWED_ORIGINS=https://medalarmapp.com,https://www.medalarmapp.com,https://medalarm-frontend.onrender.com`.
4. Confirm the frontend service uses the live Render backend for startup and proxies custom-domain traffic through `/api`.
5. If Render shows pending custom-domain changes, apply them before switching DNS.

## Namecheap DNS

1. Remove any parking, redirect, or `AAAA` records for `medalarmapp.com`.
2. Point the root domain `@` to Render with an `A` record of `216.24.57.1`.
3. Point `www` to the Render frontend subdomain with a `CNAME` record.
4. Add `api` as a `CNAME` record pointing to the Render backend subdomain.
5. Wait for propagation, then verify `https://medalarmapp.com/`, `https://medalarmapp.com/delete-account.html`, and `https://medalarmapp.com/api/actuator/health`.

## Production Gate

1. Confirm Flyway migrations run cleanly on staging startup.
2. Run the smoke checks in [STAGING_SMOKE_TESTS.md](./STAGING_SMOKE_TESTS.md).
3. Confirm browser notifications, CSV export, and caregiver read-only access work end to end.
4. Verify backend CORS allows `https://medalarmapp.com` and frontend API traffic uses `https://medalarmapp.com/api`.
5. Verify the deployed frontend serves `https://medalarmapp.com/privacy-policy.html` and `https://medalarmapp.com/support.html`.
6. Confirm `https://medalarmapp.com/api/actuator/health` is healthy before switching traffic.
7. Rotate `JWT_SECRET` and confirm the production value is not the development default.
8. Enable mail only after SMTP credentials, sender identity, and timezone behavior are verified.
9. Promote the same image revisions that passed staging.

## Post Deploy

1. Recheck `/actuator/health`.
2. Register a fresh user, create a medicine, generate alarms, and log a taken dose.
3. Export CSV and confirm the file contents.
4. Review backend logs for authorization errors, mail failures, or migration warnings.
