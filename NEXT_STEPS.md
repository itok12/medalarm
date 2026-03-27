# ✅ Next Steps — After PR Delivery

This guide summarises exactly what to do now that the major feature PRs have been created.

---

## 1. Merge the Open Pull Requests

Go to **[github.com/itok12/medalarm/pulls](https://github.com/itok12/medalarm/pulls)** and merge each open PR.

For each PR:

```bash
git fetch
git checkout <pr-branch-name>
cd backend && ./mvnw spring-boot:run   # backend on :8080
cd frontend && npm install && npm start # frontend on :3000
```

Test the features described in the PR (see the checklist below), then merge.

> Merge PRs in order — earlier PRs may be dependencies of later ones.

---

## 2. Test the Full App Locally

After merging, pull `main` and run both services:

```bash
git checkout main && git pull
docker-compose up --build   # OR run backend + frontend separately (see README)
```

Work through this checklist end-to-end:

| Area | What to verify |
|------|----------------|
| **Auth — Register** | New account creates successfully, redirects to dashboard |
| **Auth — Login** | Correct credentials → JWT stored, incorrect credentials → error shown |
| **Auth — Refresh** | Leave app idle until token expires; session auto-renews without re-login |
| **Auth — Rate limit** | Send 10+ rapid `POST /api/auth/login` requests → HTTP 429 returned |
| **Medicines** | Add a medicine, edit name/dosage, delete it |
| **Alarms — auto** | Adding a medicine generates alarms at the correct times |
| **Alarms — manual** | Create a custom alarm, toggle active/inactive, delete it |
| **Medicine expiry** | Set an end date in the past → alarms auto-deactivate; "Expired" chip shown |
| **Log — Taken/Skip** | Click ✅ Taken and ⏭ Skip on an alarm → entries appear in the adherence chart |
| **Snooze** | When a notification fires, snooze it; verify alarm does not refire for 10 min |
| **Email reminders** | Set `MAIL_ENABLED=true` and valid SMTP creds, set an alarm 1 min from now, wait |
| **Dashboard chart** | 7-day bar chart shows TAKEN vs SKIPPED counts correctly |
| **Next Alarm Card** | Card shows the correct next alarm with a live countdown |
| **CSV export** | Click Export → browser downloads a valid `.csv` with log entries |
| **Profile page** | Change email and password; verify new credentials work on next login |
| **Caregiver mode** | Add a patient by username; view their adherence log |
| **Dark mode** | Toggle dark/light theme; preference survives a page refresh |
| **PWA install** | Open in Chrome/Edge → address bar shows "Install app" prompt |

---

## 3. Deploy with Render (recommended) or Docker

### Option A — Render (one-click)

1. Go to [render.com](https://render.com) → **New → Blueprint**
2. Connect the `itok12/medalarm` repository
3. Render detects `render.yaml` and provisions:
   - `medalarm-db` — PostgreSQL database
   - `medalarm-backend` — Spring Boot Docker service
   - `medalarm-frontend` — React/nginx Docker service
4. Set these environment variables in the Render dashboard:

   | Variable | Value |
   |----------|-------|
   | `JWT_SECRET` | Any 32-char random string |
   | `MAIL_ENABLED` | `false` (until SMTP is configured) |
   | `MAIL_USERNAME` | Your Gmail address (optional) |
   | `MAIL_PASSWORD` | Gmail App Password (optional) |

5. Click **Deploy** — the app will be live within a few minutes.

### Option B — Docker Compose (self-hosted)

```bash
docker-compose up --build -d
```

Set the variables above in a `.env` file at the project root before running.

---

## 4. Confirm CI Passes

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every push and PR.

To verify it is healthy:

1. Push any small change to `main` (or open a PR).
2. Open **Actions** tab → confirm both `backend` and `frontend` jobs are green.

If a job fails, click into it to read the logs. Common issues:
- **Backend** — compilation error or failing unit test → fix the Java code and push again.
- **Frontend** — `npm run build` error → fix the React code and push again.

---

## 5. Suggested Next Features

Once everything above is stable, consider these additions:

| Priority | Feature | Notes |
|----------|---------|-------|
| 🔴 High | **Medicine barcode scanner** | Use a JS barcode library to auto-fill medicine name from packaging |
| 🔴 High | **Push notifications (FCM)** | Replace browser notifications with Firebase Cloud Messaging for reliability on mobile |
| 🟡 Medium | **PDF/CSV adherence report** | Already CSV-exported; add a formatted PDF for doctor appointments |
| 🟡 Medium | **Integration tests** | `@SpringBootTest` tests for auth + medicine + alarm + log controllers |
| 🟡 Medium | **Internationalisation (i18n)** | Add multi-language support using `react-i18next` |
| 🟢 Nice | **Medication refill reminders** | Alert when stock count falls below a configurable threshold |
| 🟢 Nice | **Two-factor authentication** | TOTP-based 2FA for the login flow |
| 🟢 Nice | **Accessibility audit** | Run Lighthouse and fix any accessibility issues in the UI |

---

## Quick-reference commands

```bash
# Run backend tests only
cd backend && ./mvnw test

# Build production frontend
cd frontend && npm run build

# Rebuild and restart all containers
docker-compose down && docker-compose up --build

# Check CI status in the terminal (requires GitHub CLI)
gh run list --repo itok12/medalarm
```

---

*Generated by Copilot — last updated after all major feature PRs were delivered.*
