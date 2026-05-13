# SkyWings Airline Booking — Project Plan

## Stack

```
Frontend    →  React 18 + TypeScript + Tailwind CSS + React Router
Backend     →  Python 3.12 + FastAPI + SQLAlchemy 2.0 + Alembic
Database    →  PostgreSQL 16
Infra       →  Docker Compose (dev) + Dockerfiles (prod-ready)
Auth        →  JWT (access + refresh tokens) via python-jose + passlib
```

---

## 1. Project Directory Structure

```
skywings/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py                  # FastAPI entry, CORS, lifespan
│       ├── config.py                # Pydantic Settings (env-driven)
│       ├── database.py              # engine, SessionLocal, Base
│       ├── dependencies.py          # get_db, get_current_user
│       │
│       ├── models/
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── flight.py
│       │   ├── booking.py
│       │   └── payment.py
│       │
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── user.py
│       │   ├── flight.py
│       │   ├── booking.py
│       │   └── payment.py
│       │
│       ├── routers/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── users.py
│       │   ├── flights.py
│       │   ├── bookings.py
│       │   └── payments.py
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── auth_service.py
│       │   ├── flight_service.py
│       │   ├── booking_service.py
│       │   └── payment_service.py
│       │
│       └── utils/
│           ├── __init__.py
│           ├── security.py          # JWT encode/decode, password hashing
│           └── reference.py         # Booking reference generator
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── index.html
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                  # Router + AuthProvider
│       ├── api/
│       │   ├── client.ts            # Axios instance with interceptors
│       │   ├── auth.ts
│       │   ├── flights.ts
│       │   ├── bookings.ts
│       │   └── payments.ts
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useFlights.ts
│       │   └── useBooking.ts
│       │
│       ├── context/
│       │   └── AuthContext.tsx
│       │
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── SearchPage.tsx
│       │   ├── ResultsPage.tsx
│       │   ├── DateTimePage.tsx
│       │   ├── BaggagePage.tsx
│       │   ├── PaymentPage.tsx
│       │   └── ConfirmationPage.tsx
│       │
│       ├── components/
│       │   ├── Layout.tsx           # Navbar + StepIndicator + Footer
│       │   ├── StepIndicator.tsx
│       │   ├── FlightCard.tsx
│       │   ├── DatePicker.tsx
│       │   ├── TimeSlotPicker.tsx
│       │   ├── BaggageCard.tsx
│       │   ├── PaymentMethodCard.tsx
│       │   ├── BookingSummary.tsx
│       │   ├── ProtectedRoute.tsx
│       │   └── UI/                 # Button, Input, Modal, etc.
│       │
│       ├── types/
│       │   ├── user.ts
│       │   ├── flight.ts
│       │   ├── booking.ts
│       │   └── payment.ts
│       │
│       └── utils/
│           ├── format.ts           # Currency, date formatting
│           └── validators.ts
```

---

## 2. Database Schema (PostgreSQL)

```sql
-- ── Users ──
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(30),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);

-- ── Flights (seed data + admin CRUD) ──
CREATE TABLE flights (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number   VARCHAR(10) NOT NULL UNIQUE,
    airline         VARCHAR(100) NOT NULL,
    from_code       VARCHAR(3) NOT NULL,          -- e.g. JFK
    from_city       VARCHAR(100) NOT NULL,
    to_code         VARCHAR(3) NOT NULL,           -- e.g. LHR
    to_city         VARCHAR(100) NOT NULL,
    departure       TIMESTAMPTZ NOT NULL,
    arrival         TIMESTAMPTZ NOT NULL,
    duration_min    INTEGER NOT NULL,
    stops           INTEGER NOT NULL DEFAULT 0,
    cabin_class     VARCHAR(30) NOT NULL,          -- Economy / Premium / Business / First
    base_price      NUMERIC(10,2) NOT NULL,
    seats_total     INTEGER NOT NULL,
    seats_available INTEGER NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_flights_route ON flights(from_code, to_code);
CREATE INDEX idx_flights_date  ON flights(departure);

-- ── Bookings ──
CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flight_id           UUID NOT NULL REFERENCES flights(id),
    booking_reference   VARCHAR(10) NOT NULL UNIQUE,  -- e.g. SW-ABC123
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
                        -- pending | confirmed | cancelled | expired
    passengers          INTEGER NOT NULL DEFAULT 1,
    selected_date       DATE NOT NULL,
    selected_time       TIME NOT NULL,
    baggage_type        VARCHAR(20) NOT NULL DEFAULT 'carryon',
    extra_bags          INTEGER NOT NULL DEFAULT 0,
    flight_price        NUMERIC(10,2) NOT NULL,
    baggage_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_price         NUMERIC(10,2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_user     ON bookings(user_id);
CREATE INDEX idx_bookings_ref      ON bookings(booking_reference);
CREATE INDEX idx_bookings_status   ON bookings(status);

-- ── Payments ──
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id),
    method              VARCHAR(30) NOT NULL,      -- card / paypal / apple_pay / google_pay / bank_transfer
    amount              NUMERIC(10,2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
                        -- pending | completed | failed | refunded
    transaction_id      VARCHAR(100),              -- external gateway tx ID
    gateway_response    JSONB,                     -- raw gateway response
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user    ON payments(user_id);
```

### Entity Relationship

```
users 1───* bookings *───1 flights
                │
                1
                │
                *
             payments
```

---

## 3. API Endpoints

### Auth

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/auth/register` | `{ full_name, email, password, phone? }` | `{ user, access_token, refresh_token }` | Hash password, return JWT |
| POST | `/api/auth/login` | `{ email, password }` | `{ user, access_token, refresh_token }` | Verify credentials |
| POST | `/api/auth/refresh` | `{ refresh_token }` | `{ access_token, refresh_token }` | Rotate tokens |
| POST | `/api/auth/logout` | — | `{ message }` | Invalidate refresh token |
| GET  | `/api/auth/me` | — | `{ user }` | Current user profile |

### Flights

| Method | Path | Query Params | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/flights` | `from, to, date, passengers, cabin_class, sort_by, min_price, max_price, stops` | `{ flights: [...], total, page, limit }` | Core search endpoint with filtering & pagination |
| GET | `/api/flights/:id` | — | `{ flight }` | Single flight detail |
| GET | `/api/flights/popular-routes` | — | `{ routes: [...] }` | Popular city pairs for quick-pick |

### Bookings

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| GET | `/api/bookings` | — | `{ bookings: [...] }` | Auth required — user's bookings |
| GET | `/api/bookings/:id` | — | `{ booking }` | Single booking detail |
| POST | `/api/bookings` | `{ flight_id, passengers, selected_date, selected_time, baggage_type, extra_bags }` | `{ booking }` | Create pending booking with reference |
| PUT | `/api/bookings/:id/cancel` | — | `{ booking }` | Cancel booking (if allowed) |

### Payments

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/payments` | `{ booking_id, method }` | `{ payment, booking }` | Process payment, confirm booking |
| GET | `/api/payments/:id` | — | `{ payment }` | Payment details |

---

## 4. React Component Tree & Routes

```
App
├── AuthProvider (context)
│
├── /login          → LoginPage
│   └── LoginForm
│
├── /register       → RegisterPage
│   └── RegisterForm
│
├── ProtectedRoute (checks auth, redirects to /login)
│   │
│   ├── Layout
│   │   ├── Navbar (logo, user name, logout)
│   │   ├── StepIndicator (active step highlight)
│   │   │
│   │   ├── /search        → SearchPage
│   │   │   ├── RouteHero (from, to, swap, autocomplete)
│   │   │   ├── PopularRoutes
│   │   │   └── SearchFilters (date, passengers, cabin)
│   │   │
│   │   ├── /results       → ResultsPage
│   │   │   ├── ResultsControls (sort, stops, price range)
│   │   │   ├── FlightCard[]
│   │   │   └── ContinueButton
│   │   │
│   │   ├── /booking/datetime → DateTimePage
│   │   │   ├── DatePicker
│   │   │   └── TimeSlotPicker
│   │   │
│   │   ├── /booking/baggage → BaggagePage
│   │   │   ├── BaggageCard[] (carryon / light / standard / heavy)
│   │   │   └── ExtraBagsSelector
│   │   │
│   │   ├── /booking/payment → PaymentPage
│   │   │   ├── BookingSummary
│   │   │   ├── PaymentMethodCard[]
│   │   │   ├── CardDetailsForm (conditional)
│   │   │   └── PayButton
│   │   │
│   │   └── /booking/confirmed → ConfirmationPage
│   │       ├── BookingReference
│   │       ├── ItineraryDetails
│   │       └── ActionButtons
```

### State Management (React Context + useReducer)

```typescript
// BookingWizardContext — tracks the multi-step flow
interface BookingState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  search: {
    from: string;
    to: string;
    departDate: string;
    returnDate: string | null;
    passengers: number;
    cabinClass: string;
  };
  selectedFlight: Flight | null;
  dateTime: {
    selectedDate: string;
    selectedTime: string;
  };
  baggage: {
    type: 'carryon' | 'light' | 'standard' | 'heavy';
    extraBags: number;
  };
  payment: {
    method: string;
    cardDetails?: object;
  };
  bookingResult: {
    reference: string;
    total: number;
  } | null;
}
```

---

## 5. Data Flow

### Booking Flow (end-to-end)

```
User                   Frontend (React)              Backend (FastAPI)           DB (PostgreSQL)
 │                          │                              │                          │
 │  Enter credentials       │                              │                          │
 │ ──────────────────────►  │  POST /api/auth/login        │                          │
 │                          │ ────────────────────────────►  │  Verify credentials     │
 │                          │                              │ ───────────────────────► │
 │                          │                              │ ◄─────────────────────── │
 │  ◄──────────────────────  │  ◄── { access_token, user }  │                          │
 │                          │                              │                          │
 │  Search: JFK → LHR      │                              │                          │
 │ ──────────────────────►  │  GET /api/flights?from=JFK&to=LHR&date=...  │          │
 │                          │ ────────────────────────────►  │  Query flights         │
 │                          │                              │ ───────────────────────► │
 │                          │                              │ ◄─────────────────────── │
 │  ◄── Flight list ──────  │  ◄── { flights: [...] }      │                          │
 │                          │                              │                          │
 │  Select flight #4       │                              │                          │
 │ ──────────────────────►  │  (stored in local state)     │                          │
 │                          │                              │                          │
 │  Pick date & time       │                              │                          │
 │ ──────────────────────►  │  (stored in local state)     │                          │
 │                          │                              │                          │
 │  Choose baggage         │                              │                          │
 │ ──────────────────────►  │  (stored in local state)     │                          │
 │                          │                              │                          │
 │  Confirm & Pay          │                              │                          │
 │ ──────────────────────►  │  POST /api/bookings          │                          │
 │                          │ ────────────────────────────►  │  Create booking (pend) │
 │                          │                              │ ───────────────────────► │
 │                          │                              │ ◄── booking_id, ref ─── │
 │                          │  ◄── { booking }              │                          │
 │                          │                              │                          │
 │                          │  POST /api/payments           │                          │
 │                          │ ────────────────────────────►  │  Process payment       │
 │                          │                              │  UPDATE booking=confirm  │
 │                          │                              │ ───────────────────────► │
 │                          │                              │ ◄─────────────────────── │
 │  ◄── Confirmed! ──────  │  ◄── { payment, booking }     │                          │
 │                          │                              │                          │
```

---

## 6. Docker Architecture

```yaml
docker-compose.yml

services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    env_file: .env

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres]
    env_file: .env
    volumes: ["./backend:/app"]        # hot-reload in dev
    command: uvicorn app.main:app --host 0.0.0.0 --reload

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    depends_on: [backend]
    volumes: ["./frontend:/app"]       # hot-reload in dev
    command: npm run dev

  # Production: nginx reverse-proxy serving built frontend + proxying /api
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
    depends_on: [backend, frontend]
```

### Dockerfiles

**backend/Dockerfile**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir .
COPY app/ app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
```

---

## 7. Implementation Phases

### Phase 1 — Foundation (Days 1-2)
- [ ] Docker Compose with all 3 services talking to each other
- [ ] PostgreSQL schema + Alembic migrations
- [ ] FastAPI app skeleton with CORS, health check, config
- [ ] React app scaffold with Vite + Tailwind + Router
- [ ] Running in Docker with hot-reload

### Phase 2 — Auth (Days 2-3)
- [ ] User model & migration
- [ ] POST `/api/auth/register` + `/login` + `/refresh`
- [ ] JWT access/refresh token logic in `security.py`
- [ ] `AuthContext` + `ProtectedRoute` + LoginPage + RegisterPage in React

### Phase 3 — Flights (Days 3-4)
- [ ] Flights model & migration + seed data (50+ realistic flights)
- [ ] GET `/api/flights` with filtering, sorting, pagination
- [ ] Autocomplete endpoint for city search
- [ ] Popular routes endpoint
- [ ] SearchPage with route hero + autocomplete + popular pills
- [ ] ResultsPage with FlightCard, sorting, filters

### Phase 4 — Booking Wizard (Days 4-6)
- [ ] DateTimePage — date picker + time slot picker
- [ ] BaggagePage — baggage tier cards + extra bags
- [ ] Booking model & migration
- [ ] POST `/api/bookings` — create pending booking
- [ ] BookingWizardContext to carry state between steps

### Phase 5 — Payments & Confirmation (Days 6-7)
- [ ] Payments model & migration
- [ ] POST `/api/payments` — process payment, confirm booking
- [ ] PaymentPage with method selection + card form
- [ ] ConfirmationPage with reference + receipt
- [ ] Email notification placeholder

### Phase 6 — Polish (Days 7-8)
- [ ] Loading states, error handling, empty states
- [ ] Form validation (front + back)
- [ ] Responsive design audit
- [ ] API docs via FastAPI auto-generated Swagger
- [ ] Production Dockerfiles + nginx config
- [ ] README with setup instructions

---

## 8. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API style** | REST (not GraphQL) | Simple, well-understood, sufficient for this scope |
| **ORM** | SQLAlchemy 2.0 | Mature, async support, Alembic migrations built-in |
| **Auth** | JWT with refresh tokens | Stateless, works well with Docker scaling |
| **State mgmt** | React Context + useReducer | Enough complexity for a wizard; Redux would be overkill |
| **Styling** | Tailwind CSS | Rapid prototyping, small bundle, easy theming |
| **API client** | Axios with interceptors | Token refresh interceptor simplifies auth |
| **Migrations** | Alembic | Version-controlled, reversible DB changes |
| **DB driver** | asyncpg | Native async Postgres driver for FastAPI |
| **Payment** | Mock gateway first | Integrate real Stripe/PayPal later as a drop-in |

---

## 9. Environment Variables (.env)

```bash
# Database
POSTGRES_DB=skywings
POSTGRES_USER=skywings
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql+asyncpg://skywings:changeme@postgres:5432/skywings

# Auth
JWT_SECRET=generate-a-random-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Backend
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=info

# Frontend (Vite)
VITE_API_URL=http://localhost:8000/api
```

---

## 10. Next Steps

Ready to start coding? The phases are designed to be built in order, with each phase producing a working increment you can test in Docker.

I suggest we begin with **Phase 1** — spinning up the containers, getting FastAPI to return a health check, and React to show "Hello SkyWings" — all wired through Docker Compose. Want me to start building?
