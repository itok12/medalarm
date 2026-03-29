# MedAlarm

![CI](https://github.com/itok12/medalarm/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

MedAlarm is a full-stack medicine reminder app built with Spring Boot and React. It helps users manage medicines, generate alarm schedules, log adherence, and optionally share read-only adherence history with caregivers.

## Features

- JWT authentication with refresh token rotation and logout
- Actor-scoped APIs that resolve the current user from JWT instead of trusting client-supplied IDs
- Medicine management with explicit `startDate`, optional `endDate`, and computed status labels
- Auto-generated alarms anchored from the user's default alarm time
- Manual alarms with repeat-day scheduling
- Medication logging for `TAKEN`, `SKIPPED`, and `SNOOZED`
- Seven-day adherence chart and CSV export
- Browser notifications with snooze persistence in local storage
- Native mobile foundation for iOS and Android via Capacitor
- Mobile-first Today, Medicines, History, Caregiver, and Settings experience
- Server-backed profile settings for timezone, email reminders, and default alarm time
- Read-only caregiver access to linked patient adherence logs
- PWA manifest and service worker for installability and basic offline shell caching
- Flyway schema migrations, health checks, Docker Compose, and Render deployment support

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Spring Boot 3.5, Java 17 |
| Auth | JWT, BCrypt |
| Database | H2 for local/test, PostgreSQL for shared environments |
| ORM | Spring Data JPA / Hibernate |
| Migrations | Flyway |
| Frontend | React 18, React Router 6 |
| UI | Material UI 5 |
| Charts | Recharts |
| HTTP | Axios |
| Mobile Runtime | Capacitor |
| Containerization | Docker, Docker Compose |

## Application Routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create an account |
| `/` | Today screen with next dose and quick actions |
| `/medicines` | Medicines and alarm management |
| `/history` | Adherence chart and recent logs |
| `/profile` | Update email and password |
| `/settings` | Manage local and server-backed preferences |
| `/caregiver` | Link patients and review adherence logs |
| `/help` | FAQ and quick usage help |
| `/about` | Product overview |
| `/contact` | Feedback form |

## API Summary

### Auth

| Method | Endpoint |
| --- | --- |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/refresh` |
| `POST` | `/api/auth/logout` |

### Self-service

| Method | Endpoint |
| --- | --- |
| `GET` | `/api/users/me` |
| `PUT` | `/api/users/me` |
| `GET` | `/api/medicines` |
| `POST` | `/api/medicines` |
| `PUT` | `/api/medicines/{id}` |
| `DELETE` | `/api/medicines/{id}` |
| `GET` | `/api/alarms` |
| `POST` | `/api/alarms` |
| `POST` | `/api/alarms/generate` |
| `PATCH` | `/api/alarms/{alarmId}` |
| `DELETE` | `/api/alarms/{id}` |
| `GET` | `/api/logs` |
| `POST` | `/api/logs` |
| `GET` | `/api/logs/export` |

### Caregiver

| Method | Endpoint |
| --- | --- |
| `POST` | `/api/caregivers/patients` |
| `GET` | `/api/caregivers/patients` |
| `GET` | `/api/caregivers/patients/{patientId}/logs` |

## Local Development

### Without Docker

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm start
```

Native mobile sync:

```bash
cd frontend
npm run mobile:sync
```

### With Docker

```bash
docker-compose up --build
```

Default local endpoints:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- database: `localhost:5432`

## Environment Variables

Use [.env.example](./.env.example) as the baseline for local, staging, and production configuration.

Key variables:

- `JWT_SECRET`
- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `MAIL_ENABLED`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `CORS_ALLOWED_ORIGINS`
- `REACT_APP_API_BASE_URL`

## Testing

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm test -- --watchAll=false
npm run build
```

Mobile projects:

```bash
cd frontend
npm run mobile:sync
npm run mobile:open:android
npm run mobile:open:ios
```

API smoke test:

```powershell
pwsh ./scripts/smoke-test.ps1
```

## Deployment and Operations

- [Deployment checklist](./docs/DEPLOYMENT_CHECKLIST.md)
- [Staging smoke tests](./docs/STAGING_SMOKE_TESTS.md)
- [Backup and restore](./docs/BACKUP_AND_RESTORE.md)
- [Seed and demo data strategy](./docs/SEED_DATA.md)

## License

This project is licensed under the [MIT License](./LICENSE).
