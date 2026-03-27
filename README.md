# 💊 MedAlarm

A medicine reminder application with a Spring Boot backend and React frontend.

## Tech Stack

- **Backend:** Spring Boot 3.5, Spring Security, JWT, Spring Data JPA, H2 (dev) / PostgreSQL (prod)
- **Frontend:** React 18, Material UI (MUI), React Router, Axios
- **Auth:** JWT-based authentication with BCrypt password hashing
- **Docker:** Docker Compose with PostgreSQL

---

## Local Development (without Docker)

### Backend

**Prerequisites:** Java 17, Maven 3.9+

```bash
cd backend
mvn spring-boot:run
```

The backend runs on `http://localhost:8080`. H2 in-memory database is used by default.
H2 console available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:medalarm`).

A demo user is seeded on startup:
- **username:** `demo`
- **password:** `demo123`

### Frontend

**Prerequisites:** Node 18+

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`.

---

## Docker (Production)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

---

## Environment Variables

### Backend

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL JDBC URL | H2 (dev) |
| `DATABASE_USERNAME` | DB username | `sa` |
| `DATABASE_PASSWORD` | DB password | `` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | See `application.yml` |
| `SPRING_PROFILES_ACTIVE` | Set to `prod` for PostgreSQL | `dev` |

### Frontend

| Variable | Description | Default |
|---|---|---|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and get JWT token |

### Medicines
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/medicines/user/{userId}` | Get all medicines for a user |
| `POST` | `/api/medicines` | Create a medicine |
| `PUT` | `/api/medicines/{id}` | Update a medicine |
| `DELETE` | `/api/medicines/{id}` | Delete a medicine |

### Alarms
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alarms/user/{userId}` | Get all alarms for a user |
| `POST` | `/api/alarms` | Create an alarm |
| `POST` | `/api/alarms/generate` | Auto-generate alarms for a medicine |
| `PATCH` | `/api/alarms/{id}` | Toggle alarm active/inactive |
| `DELETE` | `/api/alarms/{id}` | Delete an alarm |

---

## Screenshots

> _Add screenshots here_
