# 💊 MedAlarm - Medicine Reminder App

![CI](https://github.com/itok12/medalarm/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A full-stack medicine reminder application that helps users manage their medications and never miss a dose. Built with Spring Boot and React.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with BCrypt password hashing and refresh tokens
- 💊 **Medicine Management** — Add, edit, and delete medicines with dosage and frequency info
- ⏰ **Alarm Scheduling** — Auto-generate alarms based on medicine frequency, custom alarm times, repeat days
- ✅ **Medication Logging** — Mark doses as Taken, Skipped, or Snoozed; full adherence history
- 📊 **Adherence Chart** — 7-day bar chart of taken vs. skipped doses (powered by Recharts)
- ⏰ **Next Alarm Card** — Shows your next upcoming alarm with live countdown
- 🔔 **Browser Notifications** — Real-time browser push notifications when alarm time arrives
- ⏰ **Snooze Support** — Snooze alarms for 10 minutes from the notification
- 📧 **Email Reminders** — Optional scheduled email reminders via Spring Mail
- 🔄 **Token Refresh** — Automatic JWT refresh on expiry; seamless session handling
- 🛡️ **Rate Limiting** — Bucket4j-based rate limiting on auth endpoints (10 req/min per IP)
- 📱 **PWA Support** — Installable as a Progressive Web App on mobile and desktop
- 🐳 **Docker Support** — Full Docker Compose setup for local development
- 🚀 **Render Deployment** — Ready-to-deploy render.yaml configuration
- 👤 **Profile Page** — Change password and email from a dedicated profile page
- ⚙️ **Settings Page** — Customize notification sound, snooze duration, alarm tone, default alarm time, date format, and compact view preference (persisted to localStorage)
- ℹ️ **About Page** — Learn about MedAlarm's mission, feature highlights, and tech stack
- 📬 **Contact & Feedback Page** — Submit bug reports, feature requests, and general feedback; includes GitHub links
- ❓ **Help & FAQ Page** — Answers to common questions and usage tips; links to About and Contact
- ⏳ **Medicine Expiry Tracking** — Track start/end dates; auto-deactivate alarms after duration expires; Expired/Expiring Soon chips in the UI
- 🌙 **Dark Mode** — Toggle between light and dark themes; preference persisted to localStorage
- 📥 **CSV Export** — Export full adherence log as CSV from the dashboard
- 👨‍👩‍👧 **Caregiver Mode** — Add patients by username; view their adherence logs with caregiver authorization
- 📲 **Responsive Navigation** — Hamburger menu on mobile with full drawer navigation and active link highlighting

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.5, Java 17 |
| Auth | JWT (jjwt 0.11.5), BCrypt |
| Database | H2 (dev), PostgreSQL (prod) |
| ORM | Spring Data JPA / Hibernate |
| Email | Spring Boot Mail (JavaMailSender) |
| Rate Limiting | Bucket4j 7.6.0 |
| Frontend | React 18, React Router 6 |
| UI | Material UI (MUI) v5 |
| Charts | Recharts 2.8 |
| HTTP Client | Axios |
| Containerization | Docker, Docker Compose |

---

## 📸 Screenshots

> Add screenshots here

---

## 🗺️ Application Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Sign In | Login with username and password |
| `/register` | Register | Create a new account |
| `/` | Dashboard | Overview of medicines, alarms, adherence chart, and next alarm |
| `/profile` | Profile | Change password and email |
| `/settings` | Settings | Customize notification sound, snooze duration, alarm tone, default alarm time, date format, and compact view |
| `/caregiver` | Caregiver | Add patients and view their medication adherence logs |
| `/help` | Help & FAQ | Frequently asked questions and quick tips |
| `/about` | About | App mission, feature highlights, and tech stack |
| `/contact` | Contact & Feedback | Submit bug reports, feature requests, or general feedback |

---

## 🚀 Local Development

### Without Docker

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# App available at http://localhost:3000
```

### With Docker

```bash
docker-compose up --build
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
# Database: PostgreSQL on port 5432
```

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for signing JWTs | `medalarm-super-secret-key-...` |
| `DATABASE_URL` | PostgreSQL JDBC URL (prod) | — |
| `DATABASE_USERNAME` | Database username (prod) | — |
| `DATABASE_PASSWORD` | Database password (prod) | — |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USERNAME` | SMTP username/email | — |
| `MAIL_PASSWORD` | SMTP password/app password | — |
| `MAIL_ENABLED` | Enable email reminders | `false` |
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT + refresh token |
| POST | `/api/auth/refresh` | Refresh JWT using refresh token |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines/user/{userId}` | Get all medicines for a user |
| POST | `/api/medicines` | Create a medicine |
| PUT | `/api/medicines/{id}` | Update a medicine |
| DELETE | `/api/medicines/{id}` | Delete a medicine |

### Alarms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alarms/user/{userId}` | Get all alarms for a user |
| POST | `/api/alarms` | Create a custom alarm |
| POST | `/api/alarms/generate` | Auto-generate alarms for a medicine |
| PATCH | `/api/alarms/{alarmId}` | Toggle alarm active/inactive |
| DELETE | `/api/alarms/{id}` | Delete an alarm |

### Medication Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logs` | Log a medication action (TAKEN/SKIPPED/SNOOZED) |
| GET | `/api/logs/user/{userId}` | Get all logs for a user |
| GET | `/api/logs/user/{userId}/export` | Export adherence log as CSV |
| GET | `/api/logs/patient/{patientId}?caregiverId={id}` | Get patient logs (caregiver only) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/{id}` | Get user by ID |
| PUT | `/api/users/{id}/profile` | Update password or email |

### Caregivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/caregivers` | Add a patient by username |
| GET | `/api/caregivers/{caregiverId}/patients` | List all patients for a caregiver |

---

## 🧪 Integration Tests

The backend includes integration tests using `@SpringBootTest` with an in-memory H2 database:

- **`AuthControllerTest`** — register, duplicate username, login, wrong password
- **`MedicineControllerTest`** — create with JWT, create without JWT (401), get medicines list

---

## ☁️ Deployment on Render

1. Fork or push the repository to GitHub
2. Connect the repository to [Render](https://render.com)
3. Render will detect `render.yaml` and create:
   - `medalarm-backend` (Docker web service)
   - `medalarm-frontend` (Docker web service)
   - `medalarm-db` (PostgreSQL database, free plan)
4. Set any required environment variables in the Render dashboard
5. Deploy!

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
