# Next steps

Status on 2026-10-03. The code for the six-week plan is done; what's left is
merging, hosting and Play Console work.

## 1. Merge the stacked branches, in order

| Branch | PR |
|--------|----|
| `week1/consolidate` | #19 |
| `week2/alarm-engine` | #20 |
| `week3/data-security` | #21 |
| `week4/ux-qa` | #22 |
| `week5/compliance` | open from `week5/compliance` → `main` |
| `week6/interview-pack` | open after Week 5 |

Merging to `main` deploys to Render and runs Flyway V4–V6 on the production
database. Back it up first (`docs/BACKUP_AND_RESTORE.md`).

## 2. Bring the backend back

`https://medalarm-backend-1jax.onrender.com` is not responding (the free
Postgres has likely expired), and GitHub disabled the keep-alive workflow
after 60 days without repository activity. Choose a paid database or another
host, set the environment variables in `.env.example`, deploy, and run
`pwsh ./scripts/smoke-test.ps1`.

## 3. Compliance and Play Console

Follow `docs/play-console/compliance-checklist.md`: your legal name in the
privacy policy, the ICO fee, DPIA sign-off, the review account, the Data
safety form, and the 1.1.0 AAB (version code 3) to internal then closed
testing (12+ testers for 14 days on a personal developer account).

## 4. Physical-device QA

Run the scenarios in `docs/DEVICE_QA.md` on a Samsung and a Xiaomi/Oppo phone,
and check the UK clock change on Sun 25 Oct 2026.
