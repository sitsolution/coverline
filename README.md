# Coverline

A healthcare staffing platform that connects hospitals and clinics with qualified medical professionals — doctors, nurses, OT technicians, and housekeeping staff — for locum (temporary) shifts.

---

## What's in this repo

| App | Tech stack | Purpose |
|---|---|---|
| `apps/mobile` | React Native (Expo ~54) + TypeScript | Staff-facing mobile app (iOS & Android) |
| `apps/web` | React + TypeScript + Tailwind CSS + Vite | Admin web dashboard |
| `backend` | FastAPI + SQLAlchemy + MySQL + Alembic | REST API shared by both apps |

---

## Prerequisites

Make sure the following are installed before running anything:

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18 or 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node |
| uv | Latest | Python package manager — [astral.sh/uv](https://astral.sh/uv). The setup script installs Python 3.12 automatically via `uv`. |
| MySQL | 8.0+ | Must be running locally. Create a database named `coverline` (or update `.env`) |
| Expo Go | Latest | Install on your phone from the App Store / Play Store to test the mobile app on a real device |

> **Windows users:** all `npm run` commands work on Windows — the scripts are cross-platform.

---

## First-time setup

Run this once from the repo root. It installs all Node dependencies and sets up the Python backend virtual environment:

```bash
npm run setup
```

This script:
1. Runs `npm install` for the workspace (mobile + web)
2. Creates a Python 3.12 virtual environment in `backend/.venv` using `uv`
3. Installs all Python dependencies from `backend/requirements.txt`
4. Runs database migrations with Alembic

---

## Environment variables

### Backend — `backend/.env`

Create this file before starting the backend:

```env
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/coverline
SECRET_KEY=replace-with-a-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> Generate a secure `SECRET_KEY` with: `openssl rand -hex 32`

### Mobile — `apps/mobile/.env`

Required when testing on a **real device** (Expo Go cannot reach `localhost`):

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

Replace `192.168.x.x` with your machine's local network IP address.

- **Mac:** System Settings → Wi-Fi → Details → IP Address
- **Windows:** `ipconfig` in terminal → look for IPv4 Address

> When running in an emulator, `localhost` works fine without this file.

---

## Running the apps

All commands are run from the **repo root**.

### Mobile app + API together

```bash
npm run app
```

This starts the Expo dev server (mobile) and the FastAPI backend concurrently.

Scan the QR code in the terminal with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

### Admin web dashboard + API together

```bash
npm run admin
```

This starts the Vite dev server (web) and the FastAPI backend concurrently.

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run each service individually

```bash
# Mobile only
npm run mobile

# Admin web only
npm run web

# Backend API only
npm run backend
```

---

## Database setup

The backend uses **MySQL** with Alembic for migrations.

1. Create the database:

```sql
CREATE DATABASE coverline CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Run migrations (the setup script does this automatically, but to run manually):

```bash
cd backend
.venv/bin/alembic upgrade head      # Mac / Linux
.venv\Scripts\alembic upgrade head  # Windows
```

3. To create a new migration after changing a model:

```bash
cd backend
.venv/bin/alembic revision --autogenerate -m "describe your change"
.venv/bin/alembic upgrade head
```

---

## API documentation

Once the backend is running, interactive API docs are available at:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health check:** [http://localhost:8000/health](http://localhost:8000/health)

### Conventions

- **Base path:** `/api/v1`
- **Casing:** the API speaks **camelCase** in request bodies, responses, query
  parameters and multipart form fields. Python stays snake_case internally.
- **Auth:** `Authorization: Bearer <accessToken>` on everything except
  `/auth/*` and `/support/faqs`.
- **Times:** ISO 8601 UTC. **Money:** plain numbers (INR). The app does the
  locale formatting — the server never returns pre-formatted strings like
  `"Today"` or `"₹9,500"`.
- **Validation errors** return `422` shaped for the mobile forms:

  ```json
  { "detail": "Password must contain at least one number",
    "fields": { "password": "Password must contain at least one number" } }
  ```

### Endpoints by screen

| Screen | Method & path |
|---|---|
| Sign Up (all 5 roles) | `POST /auth/register` |
| OTP Verification | `POST /auth/verify-otp` · `POST /auth/resend-otp` |
| Login | `POST /auth/login` · `POST /auth/refresh` |
| Forgot Password | `POST /auth/forgot-password` · `POST /auth/reset-password` |
| Dashboard (Home) | `GET /users/me/dashboard` |
| Available Shifts | `GET /shifts` · `GET /shifts/filters` |
| Recommended for You | `GET /shifts/recommended` |
| Shift Details | `GET /shifts/{id}` · `POST /shifts/{id}/apply` |
| Favourites (♡) | `POST`/`DELETE /shifts/{id}/favorite` · `GET /shifts/favorites` |
| My Applications | `GET /applications` · `GET /applications/{id}` · `POST /applications/{id}/cancel` |
| Calendar | `GET /calendar?year=&month=` · `GET /calendar/{date}` |
| Set Availability | `GET /availability` · `PUT /availability` |
| My Documents | `GET /documents` · `DELETE /documents/{id}` |
| Upload Document | `GET /documents/types` · `POST /documents` (multipart) · `GET /documents/{id}/file` |
| Profile | `GET /users/me` |
| Edit Profile | `PATCH /users/me` · `POST /users/me/avatar` |
| Notifications | `GET /notifications` · `GET /notifications/unread-count` · `POST /notifications/read-all` |
| My Earnings | `GET /earnings/summary` · `GET /earnings/trend` · `GET /earnings/transactions` |
| Withdraw / Payout | `POST /earnings/payouts` · `GET /earnings/payouts` |
| Settings | `GET`/`PATCH /users/me/settings` · `POST /auth/change-password` · `POST /auth/logout` |
| Push notifications | `POST`/`DELETE /users/me/device-token` |
| Help & Support | `GET /support/faqs` · `POST /support/tickets` |

`GET /shifts` accepts: `role`, `search`, `location`, `specialty`, `dateFrom`,
`dateTo`, `shiftType` (`Day`/`Night`/`Weekend`/`Urgent`), `minPay`, `maxPay`,
`urgentOnly`, `includeApplied`, `limit`, `offset`.

### Admin panel endpoints by page

Every route below sits under `/api/v1/admin` and is subject to two rules
(enforced in `app/core/admin.py`, not in each handler):

1. **Facility scoping** — a facility admin only ever sees data belonging to
   facilities they are a member of. A platform `super_admin` is unscoped.
   Out-of-scope records return **404**, not 403, so their existence is not
   confirmed.
2. **Permissions** — each screen maps to a permission (`shifts`, `staff`,
   `bookings`, `documents`, `reports`, `billing`). A facility `super_admin`
   implicitly holds all of them.

| Page | Method & path |
|---|---|
| Admin Login | `POST /auth/login` (shared with mobile) |
| Dashboard | `GET /admin/dashboard` |
| Shift Management | `GET /admin/shifts` |
| Create Shift | `GET /admin/shifts/form-options` · `POST /admin/shifts` |
| Shift Details | `GET /admin/shifts/{id}` · `PATCH /admin/shifts/{id}` |
| — assign / reject | `POST /admin/shifts/{id}/assign` · `POST /admin/shifts/{id}/applicants/{id}/reject` |
| — publish / duplicate | `POST /admin/shifts/{id}/publish` · `POST /admin/shifts/{id}/duplicate` |
| — cancel / complete | `POST /admin/shifts/{id}/cancel` · `POST /admin/shifts/{id}/complete` |
| Staff Database | `GET /admin/staff` · `GET /admin/staff/filter-options` · `POST /admin/staff/invite` |
| Staff Profile | `GET /admin/staff/{id}` |
| — tabs | `GET /admin/staff/{id}/shifts` · `/reviews` · `/notes` |
| — write | `POST /admin/staff/{id}/reviews` · `POST`/`DELETE /admin/staff/{id}/notes` |
| Bookings | `GET /admin/bookings` · `GET /admin/bookings/export` (CSV) |
| Booking Details | `GET /admin/bookings/{id}` · `POST /admin/bookings/{id}/messages` |
| — actions | `POST /admin/bookings/{id}/complete` · `POST /admin/bookings/{id}/cancel` |
| Document Verification | `GET /admin/documents` · `GET /admin/documents/{id}/file` |
| — review | `POST /admin/documents/{id}/verify` · `POST /admin/documents/{id}/reject` |
| Reports | `GET /admin/reports` |
| Calendar View | `GET /admin/calendar?year=&month=` |
| Notifications Centre | `GET /notifications?categories=…` (shared with mobile) |
| Settings → Facility | `GET`/`PATCH /admin/settings/facility` |
| Settings → Users | `GET /admin/settings/users` · `PATCH`/`DELETE /admin/settings/users/{memberId}` |
| Add Admin User | `GET /admin/settings/permissions` · `POST /admin/settings/users` |
| — invitee accepts | `POST /auth/accept-invitation` |
| Invoices & Billing | `GET /admin/invoices` · `GET /admin/invoices/{id}` |
| — actions | `POST /admin/invoices/{id}/pay` · `GET /admin/invoices/{id}/download` |

**Derived statuses.** Three states the UI shows are computed, never stored, so
they can never go stale: a shift is *Pending* when it is open and has
applicants; a booking is *Upcoming* when it is confirmed and its shift has not
started; an invoice is *Overdue* when it is unpaid past its due date.

**The admin panel closes the mobile loop.** Until a shift is assigned via
`POST /admin/shifts/{id}/assign`, applications stay pending forever; until a
booking is completed, no `Payment` row exists and the mobile Earnings screen
stays empty.

### Development data

```bash
npm run backend:seed
```

Creates four staff accounts (one per role), a facility admin, four facilities
and ~64 shifts. All accounts use the password `Password1`:

| Role | Email |
|---|---|
| Doctor | `ananya.rao@example.com` |
| Nurse | `sneha.kulkarni@example.com` |
| OT Technician | `vikram.nair@example.com` |
| Housekeeping | `meena.pawar@example.com` |
| Facility admin (super admin, all permissions) | `admin@apollo.example.com` |
| Facility admin (manager, shifts + bookings only) | `manager@apollo.example.com` |

> There is no SMS/email provider yet. While `DEBUG=true`, `POST /auth/register`
> and `POST /auth/resend-otp` return the code as `debugOtp` so the verification
> screen is testable. Set `DEBUG=false` in production and the field disappears.

### Running the tests

```bash
npm run backend:test
```

146 tests covering auth, shift search and filtering, applications, documents,
earnings, the full admin panel, and — most importantly — facility scoping and
permission gating. They run against in-memory SQLite, so no MySQL server is
needed.

---

## Project structure

```
coverline/
├── apps/
│   ├── mobile/                  # Expo React Native app
│   │   ├── src/
│   │   │   ├── components/ui/   # Shared UI components (Input, Button, Screen, etc.)
│   │   │   ├── navigation/      # Stack & tab navigators
│   │   │   ├── screens/
│   │   │   │   ├── auth/        # Splash, Login, SignUp, OTP screens
│   │   │   │   └── staff/       # Dashboard, Shifts, Calendar, Docs, Profile
│   │   │   ├── services/        # Axios API client
│   │   │   └── utils/           # Validation schemas (Yup)
│   │   ├── app.json             # Expo config (name, bundle ID, permissions)
│   │   └── App.tsx              # Root component
│   │
│   └── web/                     # Vite + React admin dashboard
│       └── src/
│           ├── components/      # Layout, sidebar, topbar, UI components
│           └── pages/           # Dashboard, Shifts, Staff, Bookings, etc.
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── api/v1/endpoints/    # Route handlers, one module per domain
│   │   │   └── admin/           # Admin panel routes (facility-scoped)
│   │   ├── core/                # Config, database, security, auth dependencies
│   │   │   ├── deps.py          # Authentication + role guards
│   │   │   └── admin.py         # Facility scoping + admin permissions
│   │   ├── models/              # SQLAlchemy ORM models + shared enums
│   │   ├── schemas/             # Pydantic request/response schemas (camelCase)
│   │   ├── services/            # OTP, file storage, notifications, serializers
│   │   ├── main.py              # App factory, CORS, error shaping
│   │   └── seed.py              # Development data
│   ├── migrations/              # Alembic (env.py reads DATABASE_URL from .env)
│   ├── tests/                   # pytest suite (in-memory SQLite)
│   └── requirements.txt
│
├── scripts/
│   ├── setup.js                 # First-time setup script
│   └── backend.js               # Backend start script (cross-platform)
│
└── package.json                 # Root workspace config
```

---

## Mobile app — key information

- **Platform:** iOS and Android via Expo managed workflow
- **Navigation:** React Navigation (bottom tabs + native stacks)
- **State:** Local `useState` — API integration pending
- **Validation:** Yup schemas in `src/utils/validation.ts`
- **Bundle ID:** `com.coverline.mobile` (both iOS and Android)

### Building for production

```bash
cd apps/mobile
npx expo build:android   # APK / AAB
npx expo build:ios       # IPA (requires Apple Developer account)
```

Or use **EAS Build** (recommended):

```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

---

## Admin web — key information

- **URL:** [http://localhost:5173](http://localhost:5173) in development
- **Login route:** `/login`
- **Tech:** React + React Router + Tailwind CSS + Recharts (charts) + TanStack Query (data fetching)

### Build for production

```bash
cd apps/web
npm run build
```

Output goes to `apps/web/dist/` — deploy to any static host (Netlify, Vercel, S3, etc.).

---

## User roles

| Role | App | Description |
|---|---|---|
| **Doctor** | Mobile | Registers with medical license, applies for shifts |
| **Nurse** | Mobile | Registers with nursing council registration number |
| **OT Technician** | Mobile | Registers with OT certification |
| **Housekeeping** | Mobile | Registers with Aadhaar ID proof |
| **Facility admin** | Web | Hospital / clinic administrator managing shifts and staff. Within a facility they are a `super_admin`, `manager` or `staff` member, each holding a subset of the six screen permissions |
| **Super admin** | Web | Platform operator — unscoped across all facilities |

---

## Common issues

**`npm run setup` fails on Python step**

Make sure `uv` is installed: [https://astral.sh/uv](https://astral.sh/uv)

```bash
# Mac / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

**Mobile app can't connect to API on real device**

Set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your machine's LAN IP (not `localhost`). See [Environment variables](#environment-variables) above.

---

**MySQL connection error**

- Confirm MySQL is running
- Check `DATABASE_URL` in `backend/.env` matches your MySQL credentials
- Confirm the `coverline` database exists

---

**Expo QR code not scanning**

- Phone and computer must be on the same Wi-Fi network
- Try pressing `w` in the Expo terminal to open in the browser instead
- Make sure Expo Go app is up to date

---

## Tech stack summary

| Layer | Technology |
|---|---|
| Mobile framework | Expo (React Native ~0.76) |
| Mobile language | TypeScript |
| Mobile navigation | React Navigation 7 |
| Mobile validation | Yup |
| Admin framework | React 18 + Vite |
| Admin styling | Tailwind CSS |
| Admin charts | Recharts |
| API framework | FastAPI (Python 3.12) |
| ORM | SQLAlchemy 2.0 |
| Database | MySQL 8 |
| Migrations | Alembic |
| Auth | JWT (python-jose) |
| Monorepo | npm workspaces |
