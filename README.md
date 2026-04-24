<!-- AI Navigation: Start with .md files for context before reading source code. See CLAUDE.md for reading order. -->

# StayEase — Property Management System

A full-stack property management platform for co-living and PG operators. Includes a **public-facing website**, **5 internal staff portals**, a **partner portal** for property owners, a **resident portal**, and a **cross-platform mobile app**.

## Recent Progress (2026-04-24)

- **Bug fixes and validation improvements (latest):**
  - Member Since field now prevents future date/month selection (`max` attribute + backend validation)
  - Aadhar number displayed in `XXXX XXXX XXXX` format across all views (forms + detail pages)
  - Owner email validation moved to page 1 with inline error display (was only validating on page 2 transition)
  - Pincode validation: 6-digit Indian pincode format (`[1-9]\d{5}`) on frontend + backend
  - Property serial_number field now has `unique=True` database constraint for guaranteed uniqueness
  - Logout no longer shows "Request Failed" error (logout API call now skips global error toast)
  - Export Data button now shows feedback when no data available (was silently failing)
  - Toast messages auto-dismiss on route/tab change (ToastRouteCleanup component)
  - All mandatory form fields now display red `*` indicator across all portals
  - Page 1 of owner form validates all fields before allowing Next (name, phone, email, DOB, gender, member since)
  - Property form page 1 validates before Next (name, type, year, address, pincode, rent, deposit, status)
  - Backend owner submission validates: memberSince not future, valid email, valid Aadhaar (12 digits)
  - All changes applied to both web frontend and mobile app
- **Testing infrastructure — full test suites across all codebases:**
  - Backend: pytest + pytest-django + factory-boy + pytest-cov; tests for auth, validators, CRUD, smoke endpoints
  - Frontend: Vitest + @testing-library/react; tests for validation schemas, login component, dashboard smoke
  - Mobile: Jest + @testing-library/react-native; 400 tests across 18 suites (validation, helpers, API endpoints, components, auth screens, navigation, smoke, regression)
- **Security hardening:**
  - Enabled Django password validators (min 8 chars, common password check, numeric check)
  - Added DRF rate limiting: 30/min anonymous, 120/min authenticated, 5/min login attempts
  - Custom `LoginRateThrottle` applied to all login endpoints (mobile, resident, partner)
  - Added security headers: XSS filter, content-type nosniff, X-Frame-Options DENY
  - Secure cookies in production (SESSION_COOKIE_SECURE, CSRF_COOKIE_SECURE)
  - Removed leaked credentials from settings.py comments
- **Input validation — Zod schemas (frontend + mobile) and backend validators:**
  - Created shared Zod validation schemas for phone, email, amounts, Aadhaar, PAN, IFSC, pincode
  - Form-level schemas for login, owner, property, resident, vendor, expense, lead forms
  - Backend validators.py: phone, email, financial amount, identity docs, file upload validation
- **Documentation:** Added TESTING.md, SECURITY.md for both main project and mobile app
- **Dashboard quick actions standardized to "View" only** across all portals (web + mobile):
  - Accounts: View Vendors, View Expenses, View Rawdata, View Other Files, View Liabilities
  - Operations: View Beds, View Checklists, View Expenses, View Complaints, View KYC Pending
  - Sales: View Beds, View Leads, View Expenses, View Documents
  - Supply: View Owners, View Properties, View Rooms, View Expenses
  - Mobile dashboards updated to match: Supply, Sales, Accounts, Operations
- **Listing page alignment consistency** across all portals:
  - Changed Operations and Sales listing pages from `max-w-6xl` to `w-[100%] lg:w-[98%]` to match Supply/Accounts
- **Supply portal fixes:**
  - Fixed duplicate property IDs: serial_number generation now always creates unique IDs
  - Added duplicate name+location validation (same name in same area/city blocked)
  - Fixed dashboard metrics not reflecting (wrong API endpoint + response key mismatch)
  - Rewrote property details page with card-based layout, null-safe file handling, tab navigation
  - Fixed property form: wrong placeholders (rating, status label)
  - Fixed "Basement -1" → "Basement 1" label formatting
- **UI improvements — website enquiry form & footer:**
  - Enquiry form restyled with dark theme (`#111111` bg, `#1a1a1a` inputs) to match site aesthetic
  - Footer: moved "Resident Login" link from copyright section into "Services" column
- **Mobile app — property form floor/basement fields:**
  - Added floor and basement counter sections to PropertyFormScreen (StayEase-Mobile)
  - Matches web form data structure: `floorNos`, `roomsPerFloor`, `basementNos`, `roomsPerBasement`
- **Completed resident refactoring** across all code, migrations, and database (formerly "tenant")
- Frontend build validation: passed (2352 modules)
- Backend system checks: 0 issues

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Mobile App](#mobile-app)
- [Deployment](#deployment)
- [Brand Guidelines](#brand-guidelines)

---

## Overview

StayEase is a multi-portal property management system built for co-living/PG businesses. It handles the full lifecycle of property management — from acquiring properties and onboarding residents to collecting rent, tracking expenses, handling complaints, and paying out owners.

### What the Platform Does

| Area | Description |
|------|-------------|
| **Website** | Public marketing site with property listings, blog, enquiry forms |
| **Supply** | Onboard property owners, manage properties, rooms, and beds |
| **Sales** | Manage resident onboarding, bed assignments, rent collection, leads tracking |
| **Accounts** | Track expenses, vendor payments, owner payouts (fixed expenses), liabilities (deposit refunds), bank rawdata reconciliation |
| **Operations** | Move-in/move-out checklists, property complaints, service requests, vendor assignments |
| **Partners** | Owner-facing portal — view earnings, deductions, property occupancy, profile info |
| **resident** | resident-facing portal — profile, KYC documents, rent history, complaints, lease agreements |
| **Admin** | Superuser dashboard with cross-portal visibility |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Clients                           │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Website  │  │ Staff Portal │  │  Mobile App   │  │
│  │ (Public)  │  │  (React SPA) │  │ (React Native)│  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘  │
│       │               │                  │           │
│       └───────────────┼──────────────────┘           │
│                       │                              │
│              ┌────────▼────────┐                     │
│              │  Django Backend │                     │
│              │   (REST API)   │                     │
│              └────────┬────────┘                     │
│                       │                              │
│              ┌────────▼────────┐                     │
│              │   PostgreSQL    │                     │
│              └─────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

- **Staff web portals** communicate via **session-based auth** (cookies + CSRF)
- **resident portal** communicates via **JWT bearer tokens** (access + refresh)
- **Mobile app** communicates via **JWT bearer tokens** (access + refresh)
- All clients share the same Django REST backend and PostgreSQL database

---

## User Roles

| Role | Login Method | Access |
|------|-------------|--------|
| **Admin** | Username + Password | All portals, cross-portal dashboard |
| **Accounts** | Username + Password | Vendors, expenses, payouts, liabilities, rawdata, files |
| **Operations** | Username + Password | Checklists, complaints, service requests |
| **Sales** | Username + Password | Beds, residents, rent, leads |
| **Supply** | Username + Password | Owners, properties, rooms, beds |
| **Partners** | Phone + OTP | Own properties, earnings, deductions (read-only) |
| **resident** | Phone + Password | Profile, KYC upload, rent history, complaints, lease |

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.14 | Runtime |
| Django | 5.1.4 | Web framework |
| Django REST Framework | 3.15.2 | REST API |
| djangorestframework-simplejwt | 5.5.1 | JWT authentication (mobile) |
| PostgreSQL | — | Database |
| psycopg | 3.2.10 | PostgreSQL adapter |
| django-cors-headers | 4.6.0 | CORS for mobile app |
| WhiteNoise | 6.8.2 | Static file serving |
| django-storages + boto3 | — | AWS S3 file storage (optional) |
| Gunicorn | 23.0.0 | Production WSGI server |

### Web Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | UI library |
| Vite | — | Build tool & dev server |
| Tailwind CSS | 4.2.2 | Utility-first styling |
| React Router | 7.14.0 | Client-side routing |
| Axios | 1.15.0 | HTTP client |
| Framer Motion | 12.38.0 | Animations |
| Leaflet | 1.9.4 | Maps |

### Mobile App
| Technology | Version | Purpose |
|-----------|---------|---------|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo SDK | 54 | Build tooling & native APIs |
| React Navigation | 7.x | Navigation (tabs, stacks) |
| Axios | 1.15.0 | HTTP client |
| expo-secure-store | — | Encrypted token storage |
| expo-notifications | — | Push notifications |
| expo-image-picker | — | Camera/gallery uploads |
| expo-document-picker | — | File uploads |

---

## Project Structure

```
PMS_Stayease/
├── .env                          # Environment variables (git-ignored)
├── .gitignore
├── package.json                  # Root scripts (dev, build, deploy)
├── README.md                     # ← You are here
│
├── backend/                      # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── stayease_project/         # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── stayease_accounts/        # Accounts module (vendors, expenses, liabilities)
│   ├── stayease_operations/      # Operations module (checklists, complaints)
│   ├── stayease_sales/           # Sales module (residents, rent, leads)
│   ├── stayease_supply/          # Supply module (owners, properties, rooms)
│   ├── stayease_partners/        # Partners module (owner portal)
│   ├── stayease_resident/          # resident portal (dashboard, KYC, rent, complaints, lease)
│   ├── stayease_app/             # Website & catch-all routes
│   ├── property_details/         # Property contracts
│   └── resident_details/           # resident contracts
│
├── frontend/                     # React SPA (Vite + Tailwind)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── Routing.jsx           # All client-side routes
│       ├── auth/                 # Login, AuthContext, ProtectedRoute
│       ├── shared/               # Navbar, Sidebar, Dashboard
│       ├── accounts/             # Accounts portal components
│       ├── operations/           # Operations portal components
│       ├── sales/                # Sales portal components
│       ├── supply/               # Supply portal components
│       ├── partners/             # Partners portal components
│       ├── resident/              # resident portal components
│       └── website/              # Public website components
│
└── _legacy/                      # Previous separate React apps (archived)
```

**Mobile app** (separate repository):
```
StayEase-Mobile/                  # /Users/swamy/Project/StayEase-Mobile/
├── App.js                        # Entry point
├── app.json                      # Expo configuration
├── package.json
├── tasks/                        # Build tracking (todo.md, lessons.md)
└── src/
    ├── api/                      # HTTP client & endpoint functions
    │   ├── client.js             # Axios + JWT auto-refresh interceptor
    │   └── endpoints.js          # 80+ API endpoint functions
    ├── context/
    │   └── AuthContext.js        # Auth state, login/logout, SecureStore
    ├── theme/
    │   └── index.js              # Colors, typography, spacing, shadows
    ├── utils/
    │   ├── helpers.js            # Formatters, error handlers
    │   └── notifications.js      # Push notification setup
    ├── components/               # 8 shared UI components
    │   ├── ScreenWrapper.js
    │   ├── Button.js
    │   ├── Input.js
    │   ├── Card.js
    │   ├── Badge.js
    │   ├── DataList.js
    │   ├── FileUploadField.js
    │   └── Overlays.js           # LoadingOverlay, ConfirmDialog, Picker
    ├── navigation/
    │   ├── AppNavigator.js       # Root: auth check → role routing
    │   ├── AuthStack.js          # Login screens
    │   └── RoleNavigators.js     # Tab + stack navigators per role
    └── screens/                  # 53 screens total
        ├── auth/                 # StaffLogin, PartnerLogin, residentLogin
        ├── admin/                # AdminDashboard
        ├── accounts/             # 13 screens
        ├── operations/           # 7 screens
        ├── sales/                # 7 screens
        ├── supply/               # 10 screens
        ├── partners/             # 4 screens
        └── resident/              # 8 screens
```

---

## Getting Started

### Prerequisites

- **Python 3.12+** (tested with 3.14)
- **Node.js 18+** and npm
- **PostgreSQL** running locally or remotely
- **Expo CLI** (`npx expo`) for mobile development

### 1. Clone the Repository

```bash
git clone <repo-url> PMS_Stayease
cd PMS_Stayease
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Django
SECRET_KEY=your-django-secret-key
DEBUG=True

# Database (PostgreSQL)
NAME=stayease_local
USER=your_db_user
PASSWORD=your_db_password
HOST=localhost
PORT=5432

# Email (Gmail SMTP)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (optional, for file storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Zoho eSign (optional)
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_REGION=
```

### 3. Backend Setup

```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Start dev server
python manage.py runserver
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev          # Starts Vite dev server at http://localhost:5173
```

### 5. Mobile App Setup

```bash
cd /path/to/StayEase-Mobile
npm install
npx expo start       # Opens Expo dev tools
# Press 'i' for iOS simulator, 'a' for Android emulator
```

---

## Running the Application

### Development (all services)

From the project root:

```bash
# Terminal 1: Backend
source .venv/bin/activate && cd backend && python manage.py runserver

# Terminal 2: Frontend
cd frontend && npm run dev
```

Or use the root convenience script:

```bash
npm run dev   # Runs both concurrently
```

### Production Build

```bash
cd frontend && npm run build    # Outputs to frontend/build/
# Copy build to backend for WhiteNoise serving:
cp -r frontend/build backend/build
cd backend && python manage.py collectstatic --noinput
```

---

## API Documentation

### Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/accounts/login-data/` | POST | None | Staff login (session-based, web) |
| `/accounts/logout/` | POST | Session | Staff logout |
| `/api/token/` | POST | None | Staff login (JWT, mobile) |
| `/api/token/refresh/` | POST | None | Refresh JWT access token |
| `/api/partner-login/` | POST | None | Partner OTP login (JWT, mobile) |
| `/api/resident-login/` | POST | None | Resident login (phone + password, JWT) |
| `/partners/send-otp/` | POST | None | Send OTP to partner phone |
| `/partners/verify-otp/` | POST | None | Verify OTP (session-based, web) |

### Accounts (`/accounts/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/accounts/get-vendor-data/` | GET | List all vendors |
| `/accounts/vendor-form-submit/` | POST | Create vendor |
| `/accounts/vendor-data-update/<id>/` | PUT | Update vendor |
| `/accounts/get-expense-data/` | GET | List expenses with categories |
| `/accounts/expense-form-submit/` | POST | Create expense (multipart) |
| `/accounts/accounts-form-update/<id>/` | PUT | Update expense category |
| `/accounts/accounts-form-delete/<id>/` | DELETE | Delete expense/category |
| `/accounts/get-fixed-expense-data/` | GET | List owner payouts |
| `/accounts/fixed-expense-form-submit/` | POST | Create owner payout |
| `/accounts/accounts-fixed-expense-update/<id>/` | PUT | Update payout |
| `/accounts/accounts-fixed-expense-delete/<id>/` | DELETE | Delete payout |
| `/accounts/get-liability-data/` | GET | List liabilities |
| `/accounts/liability-form-submit/` | POST | Create liability |
| `/accounts/liability-data-update/<id>/` | PUT | Update liability |
| `/accounts/get-rawdata-file/` | GET | List bank rawdata files |
| `/accounts/rawdata-file-upload/` | POST | Upload rawdata file |
| `/accounts/get-rawdata-content/<id>/` | GET | Get file entries |
| `/accounts/rawdata-file-delete/<id>/` | DELETE | Delete rawdata file |
| `/accounts/get-other-files/` | GET | List misc files |
| `/accounts/other-files-upload/` | POST | Upload misc file |
| `/accounts/other-file-delete/<id>/` | DELETE | Delete misc file |
| `/accounts/get-beds-data/` | GET | Beds with resident + liability info |
| `/accounts/get-owner-data/` | GET | Owners with rent + expense totals |
| `/accounts/get-user-activity-data/` | GET | User login/logout activity |

### Operations (`/operations/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/operations/get-checklistfeedback-data/` | GET | All checklists & feedbacks |
| `/operations/moveinchecklist-form-submit/` | POST | Submit move-in checklist |
| `/operations/moveinfeedback-form-submit/` | POST | Submit move-in feedback |
| `/operations/moveoutchecklist-form-submit/` | POST | Submit move-out checklist |
| `/operations/moveoutfeedback-form-submit/` | POST | Submit move-out feedback |
| `/operations/get-propertycomplaint-data/` | GET | All complaints with categories |
| `/operations/propertycomplaint-form-submit/` | POST | Submit complaint |
| `/operations/operations-form-update/<id>/` | PUT | Update complaint category |
| `/operations/feedback-form-submit/` | POST | Submit complaint feedback |
| `/operations/get-room-data/` | GET | Rooms & beds data |
| `/operations/kyc-pending/` | GET | List residents by KYC status |
| `/operations/kyc-approve/<id>/` | POST | Approve resident KYC |
| `/operations/kyc-reject/<id>/` | POST | Reject resident KYC (with reason) |

### Sales (`/sales/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sales/get-beds-data/` | GET | Beds with resident + rent records |
| `/sales/resident-form-submit/` | POST | Create resident (multipart) |
| `/sales/resident-data-update/<id>/` | PUT | Update resident (multipart) |
| `/sales/rent-data-update/<id>/` | PUT | Update rent record |
| `/sales/get-leads-data/` | GET | List leads |
| `/sales/leads-form-submit/` | POST | Create lead |
| `/sales/leads-data-update/<id>/` | PUT | Update lead |
| `/sales/leads-data-delete/<id>/` | DELETE | Delete lead |
| `/sales/send/` | POST | Send doc for e-signature (Zoho) |
| `/sales/documents/` | GET | List e-sign documents |

### Supply (`/supply/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/supply/get-owner-data/` | GET | List owners |
| `/supply/owner-form-submit/` | POST | Create owner (multipart) |
| `/supply/owner-form-update/<id>/` | PUT | Update owner (multipart) |
| `/supply/owner-form-delete/<id>/` | DELETE | Delete owner |
| `/supply/get-property-data/<id>/` | GET | Properties (0 = all) |
| `/supply/property-data-submit/<id>/` | POST | Create property (multipart) |
| `/supply/property-form-update/<id>/` | PUT | Update property |
| `/supply/property-form-delete/<id>/` | DELETE | Delete property |
| `/supply/get-room-data/<id>/` | GET | Rooms (0 = all) |
| `/supply/room-form-submit/<id>/` | POST | Create room with beds |
| `/supply/room-data-update/<id>/` | PUT | Update room |

### Partners (`/partners/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/partners/get-expense-data/?phone=` | GET | Owner's deductions |
| `/partners/get-overall-data/?phone=` | GET | Owner's portfolio overview |
| `/partners/get-owner-data/?phone=` | GET | Owner profile + financials |
| `/partners/get-property-data/?phone=` | GET | Owner's properties + occupancy |

### Resident Portal (`/resident-portal/`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/resident-portal/dashboard/` | GET | JWT | Resident dashboard (stats, property info) |
| `/resident-portal/profile/` | GET | JWT | Resident profile details |
| `/resident-portal/profile/update/` | POST | JWT | Update resident profile |
| `/resident-portal/change-password/` | POST | JWT | Change resident password |
| `/resident-portal/kyc/upload/` | POST | JWT | Upload KYC documents (multipart) |
| `/resident-portal/kyc/status/` | GET | JWT | Get KYC approval status |
| `/resident-portal/rent-history/` | GET | JWT | Rent payment records |
| `/resident-portal/invoices/<id>/` | GET | JWT | Single invoice detail |
| `/resident-portal/complaints/` | GET | JWT | List resident complaints |
| `/resident-portal/complaints/submit/` | POST | JWT | Submit new complaint |
| `/resident-portal/complaints/<id>/` | GET | JWT | Complaint detail with timeline |
| `/resident-portal/lease/` | GET | JWT | Lease documents (Zoho e-sign) |
| `/resident-portal/register-push-token/` | POST | JWT | Register push notification token |

### Contracts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/contract/property-table/` | GET | List property contracts |
| `/contract/submit-contract/` | POST | Create property contract |
| `/resident-details/resident-table/` | GET | List resident contracts |
| `/resident-details/resident-data/` | POST | Submit resident contract |

---

## Deployment

### Production Server (EC2)

The backend is deployed to an AWS EC2 instance at `54.146.58.251`:

```bash
# Frontend build
cd frontend && npm run build && bash deploy.sh

# Backend (Gunicorn behind Nginx)
cd backend
gunicorn stayease_project.wsgi:application --bind 0.0.0.0:8000
```

### Mobile App

```bash
cd StayEase-Mobile

# Development build
npx expo start

# Production build (EAS)
npx eas build --platform android
npx eas build --platform ios
```

---

## Brand Guidelines

| Element | Value |
|---------|-------|
| **Primary Color** | Gold `#D4A017` |
| **Background/Dark** | Black `#0A0A0A` |
| **Primary Light** | `#E8C547` |
| **Primary Dark** | `#B8860B` |
| **Error** | `#EF4444` |
| **Success** | `#10B981` |
| **Warning** | `#F59E0B` |
| **Text Primary** | `#111827` |
| **Text Secondary** | `#6B7280` |
| **Surface/Card** | `#FFFFFF` |
| **Background** | `#F9FAFB` |

The brand uses a gold-on-black theme across all surfaces — sidebar, navbar, tab bars, login screens, and active states.

---

## Default Credentials (Development)

| Username | Password | Role |
|----------|----------|------|
| admin | Stayease@123 | Superuser (Admin) |
| accounts | Stayease@123 | Accounts |
| operations | Stayease@123 | Operations |
| sales | Stayease@123 | Sales |
| supply | Stayease@123 | Supply |

Partners login with phone number + OTP (no password).

Residents are auto-created when onboarded through the Sales portal. The login credentials (phone + generated password) are returned at creation time.

**Default resident password formula:** First 4 characters of the last word of the resident's name (as-is casing) + `@` + last 4 digits of their phone number. Example: "Ravi Kumar" with phone 9876547890 → `Kuma@7890`

---

## License

Proprietary — StayEase. All rights reserved.
