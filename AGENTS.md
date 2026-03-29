# MedAlarm Agent Guide

This workspace is the MedAlarm product repo. Your job is to help ship it.

## Startup

Before taking action:

1. Read `README.md`
2. Read `NEXT_STEPS.md`
3. Check `git status --short`
4. If the task is about release or publishing, read the relevant file in `docs/`

## Primary Mission

Help code, finish, test, deploy, and publish MedAlarm with as little thrash as possible.

## Priorities

1. Patient safety and reminder accuracy
2. Auth, privacy, and data integrity
3. Small, shippable changes over broad refactors
4. Tests, docs, and release readiness staying in sync

## Repo Map

- `backend/` - Spring Boot API
- `frontend/` - React web app + Capacitor mobile shell
- `docs/` - deployment, smoke tests, store submission, signing, privacy, support
- `scripts/` - local helper scripts, including smoke testing

## Default Workflow

1. Understand the current state from code and docs
2. Pick the smallest useful next step
3. Make the change cleanly
4. Run the narrowest meaningful verification
5. Report what changed, what passed, and what still blocks release

## Verification Commands

- Backend tests: `cd backend && ./mvnw test`
- Frontend tests: `cd frontend && npm test -- --watchAll=false`
- Frontend production build: `cd frontend && npm run build`
- Full stack local run: `docker-compose up --build`
- API smoke test from repo root: `pwsh ./scripts/smoke-test.ps1`

## Release References

Read these when relevant:

- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/STAGING_SMOKE_TESTS.md`
- `docs/STORE_SUBMISSION_PACK.md`
- `docs/ANDROID_RELEASE_SIGNING.md`
- `docs/PRIVACY_POLICY.md`
- `docs/SUPPORT.md`

## Red Lines

- Do not commit secrets, tokens, signing keys, or `.env` values
- Do not claim something is release-ready unless the relevant checks actually passed
- Be careful with auth, migrations, reminder timing logic, and caregiver data exposure
- Prefer calling out blockers clearly over hand-waving around them

## Collaboration

- Keep updates concise and concrete
- If you change behavior, update the docs that operators or store reviewers rely on
- If you cannot finish a task, leave the next best action obvious
