# StayEase Frontend — React SPA

A multi-portal single-page application built with React 19, Vite, and Tailwind CSS v4. Serves a **public website**, **5 staff portals**, an **admin dashboard**, and a **partner portal** — all from one codebase with role-based routing and lazy-loaded components.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Portals & Routes](#portals--routes)
- [Authentication Flow](#authentication-flow)
- [Key Libraries](#key-libraries)
- [Development](#development)
- [Build & Deploy](#build--deploy)
- [Brand Theme](#brand-theme)

---

## Architecture

```
index.html
  └── main.jsx
        └── App.jsx
              ├── AuthProvider (context)
              └── BrowserRouter
                    └── Routing.jsx
                          ├── / (Public Website)
                          ├── /login
                          ├── /admin/dashboard
                          ├── /accounts/* (Protected)
                          ├── /operations/* (Protected)
                          ├── /sales/* (Protected)
                          ├── /supply/* (Protected)
                          └── /partners/* (Protected)
```

- All portal routes are **lazy-loaded** via `React.lazy()` + `Suspense`
- Role-based access enforced by `ProtectedRoute` wrapper
- API requests proxied to Django backend at `http://127.0.0.1:8000` in dev (Vite proxy)
- Smart proxy logic: frontend routes (dashboards, table pages) stay in SPA; API calls pass through to Django

## Recent Progress (2026-04-23)

- **Completed resident refactoring** across all frontend code (formerly "tenant"):
  - All route definitions use `/resident/*`, `/resident-login`
  - All component files named `Resident*.jsx` (ResidentForm, ResidentsTable, ResidentDetails, ResidentDashboard, etc.)
  - All folder paths use `/src/resident/`, related templates updated
  - Updated `src/auth/AuthContext.jsx`: `loginresident()` function, resident token keys, API_PREFIX_MAP
  - Updated `src/resident/residentApi.js`: Base URL `/resident-portal/`, JWT interceptors, token refresh logic
  - All lazy-imported components corrected to match actual renamed file paths
  - Frontend build validated: 2352 modules transformed successfully
- Date validation: Global date input guard enforces range `1900-01-01` to `2099-12-31` across all forms
- Resident portal UX: Discreet login via footer/mobile nav at `/resident-login`, full portal access at `/resident/*`

---

## Project Structure

```
src/
├── App.jsx                 # Root component (AuthProvider + Router)
├── Routing.jsx             # All route definitions (~200 routes)
├── main.jsx                # Entry point
├── index.css               # Global styles + Tailwind imports
│
├── auth/                   # Authentication
│   ├── Login.jsx           # Login page (staff + partner tabs)
│   ├── AuthContext.jsx      # Auth state, login/logout functions, session check
│   └── ProtectedRoute.jsx  # Role gate — redirects unauthorized users
│
├── shared/                 # Cross-portal components
│   ├── Dashboard.jsx       # Portal dashboard (role-adaptive)
│   ├── Navbar.jsx          # Top navigation bar
│   ├── Sidebar.jsx         # Side navigation (role-specific menu items)
│   ├── PublicLayout.jsx    # Website layout (header + footer)
│   └── ...                 # Shared UI components
│
├── accounts/               # Accounts Portal
│   └── components/
│       ├── activity-components/     # User activity & login data
│       ├── vendor-components/       # Vendor CRUD (form, table, details)
│       ├── expense-components/      # Expense CRUD (form, table, category)
│       ├── rawdata-components/      # Bank statement upload & categorization
│       ├── liability_components/    # Deposit refund tracking
│       ├── other-files-components/  # File uploads
│       └── beds_components/         # Bed overview & agreements
│
├── operations/             # Operations Portal
│   └── components/
│       ├── beds-components/         # Bed overview
│       ├── checklist-feedback-components/  # Checklists & feedback list
│       ├── movein-checklist-components/    # Move-in checklist forms
│       ├── movein-feedback-components/     # Move-in feedback forms
│       ├── moveout-checklist-components/   # Move-out checklist forms
│       ├── moveout-feedback-components/    # Move-out feedback forms
│       ├── property-complaint-service-request-components/  # Complaints & service requests
│       └── expense-components/      # Expense forms (vendor assignment)
│
├── sales/                  # Sales Portal
│   └── components/
│       ├── beds-components/         # Beds, residents, rent, agreements
│       ├── lead-components/         # Lead tracking (form, table, details)
│       └── expense-components/      # Expense forms
│
├── supply/                 # Supply Portal
│   └── components/
│       ├── owner-components/        # Owner CRUD with KYC
│       ├── property-components/     # Property CRUD
│       ├── supply-room-components/  # Room & bed management
│       └── expense-components/      # Expense forms
│
├── partners/               # Partners Portal (Owner-facing)
│   └── pages/
│       ├── Home.jsx                 # Portfolio overview
│       ├── Properties.jsx           # Property list with occupancy
│       ├── PropertyDetails.jsx      # Single property details
│       ├── Expenses.jsx             # Deduction breakdown
│       ├── KycDetails.jsx           # KYC documents
│       ├── BankDetails.jsx          # Bank info
│       └── OwnerDetails.jsx         # Personal profile
│
├── website/                # Public Website
│   └── components/
│       ├── pages/                   # Home, About, Properties, Blog, Contact, etc.
│       ├── property-components/     # Property detail pages
│       ├── blog-components/         # 8 blog post pages
│       └── ...                      # Header, Footer, shared website UI
│
└── assets/                 # Static assets (images, icons)
```

---

## Portals & Routes

### Public Website
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page |
| `/about` | MainAbout | Company about page |
| `/properties` | Properties | Property listings |
| `/properties/:slug` | PropertyDetails | Single property page |
| `/blog` | Blog | Blog listing |
| `/blog/:slug` | Blog1–Blog8 | Individual blog posts |
| `/contact` | Contact | Contact form |
| `/privacy-policy` | PrivacyPolicyPage | Privacy policy |
| `/Terms-conditions` | TermsConditionsPage | Terms & conditions |

### Staff Portals (Protected)

**Admin** — `/admin/dashboard`

**Accounts** — `/accounts/*`
| Route | Feature |
|-------|---------|
| `dashboard` | Accounts dashboard |
| `accounts-vendor-form` | Add vendor |
| `accounts-vendor-table` | Vendor list |
| `accounts-vendor-data/:id` | Vendor details |
| `accounts-expense-form` | Add expense |
| `accounts-expense-table` | Expense list |
| `accounts-category-data/:id` | Expense category details |
| `accounts-rawdatafile-upload` | Upload bank statement |
| `accounts-rawdatafile-table` | Bank statement list |
| `accounts-rawdata-table/:id` | Statement entries |
| `accounts-rawdata-form/:id` | Categorize entry |
| `accounts-rawdata-data/:id` | Entry details |
| `accounts-liability-table` | Liabilities list |
| `accounts-liability-form/:id` | Liability form |
| `accounts-liability-data/:id` | Liability details |
| `accounts-otherfiles-upload` | Upload file |
| `accounts-otherfiles-table` | Files list |
| `accounts-beds-table` | Beds overview |
| `accounts-beds-details/:id` | Bed details |
| `accounts-agreement-pdf/:id` | Agreement PDF |

**Operations** — `/operations/*`
| Route | Feature |
|-------|---------|
| `dashboard` | Operations dashboard |
| `operations-beds-table` | Beds overview |
| `operations-checklistfeedback-table` | Checklists & feedback list |
| `operations-movein-checklist-form/:id` | Move-in checklist |
| `operations-movein-feedback-form/:id` | Move-in feedback |
| `operations-moveout-checklist-form/:id` | Move-out checklist |
| `operations-moveout-feedback-form/:id` | Move-out feedback |
| `operations-propertycomplaint-form` | New complaint |
| `operations-propertycomplaint-table` | Complaints list |
| `operations-propertycomplaint-data/:id` | Complaint details |
| `operations-expense-form` | Expense form |
| `operations-expense-table` | Expense list |

**Sales** — `/sales/*`
| Route | Feature |
|-------|---------|
| `dashboard` | Sales dashboard |
| `sales-beds-table` | Beds overview |
| `sales-residents-table` | Residents list |
| `sales-resident-form/:id` | Add/edit resident |
| `sales-resident-details/:id` | Resident details |
| `sales-lead-form` | Add lead |
| `sales-lead-table` | Leads list |
| `sales-lead-details/:id` | Lead details |
| `sales-expense-form` | Expense form |
| `sales-expense-table` | Expense list |

**Supply** — `/supply/*`
| Route | Feature |
|-------|---------|
| `dashboard` | Supply dashboard |
| `supply-owner-form` | Add owner |
| `supply-owner-table` | Owners list |
| `supply-owner-details/:id` | Owner details |
| `supply-property-form/:id` | Add property |
| `supply-property-table` | Properties list |
| `supply-property-details/:id` | Property details |
| `supply-room-table/:id` | Rooms list |
| `supply-room-form/:id` | Add room |
| `supply-room-details/:id` | Room details |
| `supply-expense-form` | Expense form |
| `supply-expense-table` | Expense list |

**Partners** — `/partners/*`
| Route | Feature |
|-------|---------|
| `home` | Portfolio overview |
| `properties` | Properties list |
| `property-details/:id` | Property details |
| `expenses` | Deduction breakdown |
| `kyc-details` | KYC documents |
| `bank-details` | Bank info |
| `owner-details` | Personal profile |

---

## Authentication Flow

1. User navigates to `/login`
2. Login page has tabs: **Staff Login** (username + password) and **Partner Login** (phone + OTP)
3. Staff login calls `POST /accounts/login-data/` → sets session cookie
4. Partner login calls `POST /partners/send-otp/` then `POST /partners/verify-otp/` → sets session
5. `AuthContext` stores `{username, user_type, is_superuser}` in state
6. `ProtectedRoute` checks `user_type` against `allowedType` prop — redirects to `/login` if unauthorized
7. Admin (superuser) can access all portals

---

## Key Libraries

| Library | Purpose |
|---------|---------|
| `react` 19.2.4 | UI framework |
| `react-router-dom` 7.14.0 | Client-side routing |
| `axios` 1.15.0 | HTTP requests to Django backend |
| `tailwindcss` 4.2.2 | Utility-first CSS (via `@tailwindcss/vite` plugin) |
| `framer-motion` 12.38.0 | Animations and transitions |
| `leaflet` + `react-leaflet` | Interactive maps (property locations) |
| `xlsx` 0.18.5 | Excel file parsing (rawdata upload) |
| `@headlessui/react` 2.3.0 | Accessible UI primitives (dialogs, dropdowns) |
| `@heroicons/react` 2.2.0 | Icon set |
| `lucide-react` 0.512.0 | Additional icon set |
| `html2canvas` + `jspdf` | PDF generation (agreements) |
| `recharts` 2.16.0 | Charts and data visualization |
| `react-hot-toast` 2.5.2 | Toast notifications |
| `js-cookie` 3.0.5 | Cookie management (CSRF token) |

---

## Development

### Prerequisites
- Node.js 18+
- Backend running at `http://127.0.0.1:8000`

### Start Dev Server

```bash
cd frontend
npm install
npm run dev       # Starts at http://localhost:5173
```

Vite proxies API requests (`/accounts/`, `/operations/`, `/sales/`, `/supply/`, `/partners/`, `/contract/`, `/resident-details/`, `/resident-portal/`, `/api/`) to Django. Frontend routes (dashboards, table pages) are served by the SPA.

### Testing on iPhone (Safari)

Both your MacBook and iPhone must be on the **same Wi-Fi network**.

#### Step 1 — Start the Backend

```bash
cd backend
source ../.venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

> `0.0.0.0` makes Django listen on all network interfaces, not just localhost.

#### Step 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

Vite is configured with `host: true`, so it will show a **Network** URL like:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.71:5173/
```

#### Step 3 — Open on iPhone

1. Open **Safari** on your iPhone
2. Navigate to `http://192.168.1.71:5173`
3. The full web app loads — login, dashboards, all portals

#### Troubleshooting

| Issue | Fix |
|-------|-----|
| Page won't load | Ensure both devices are on the same Wi-Fi network |
| API calls fail (CORS/network) | Make sure backend is running with `0.0.0.0:8000`, not `127.0.0.1:8000` |
| "Connection refused" | Check Mac firewall: System Settings → Network → Firewall → allow incoming connections |
| IP changed | Run `ipconfig getifaddr en0` in terminal to get the current IP |

### Lint

```bash
npm run lint
```

---

## Build & Deploy

```bash
npm run build     # Outputs to frontend/build/
```

The build output is copied to `backend/build/` for production serving via WhiteNoise:

```bash
cp -r frontend/build backend/build
```

Or use the deploy script:

```bash
bash deploy.sh
```

---

## Brand Theme

| Token | Value | Usage |
|-------|-------|-------|
| Gold `#D4A017` | Primary | Buttons, active states, links, sidebar highlights |
| Black `#0A0A0A` | Dark | Sidebar background, navbar, login page |
| Gold Light `#E8C547` | Hover | Button hover, subtle highlights |
| Gold Dark `#B8860B` | Active/pressed | Active button states |
| White `#FFFFFF` | Surface | Cards, content areas |
| Gray `#F9FAFB` | Background | Page background |

All portals share the same gold-on-black sidebar and navbar. The website uses the same colors with a lighter tone for public-facing pages.
