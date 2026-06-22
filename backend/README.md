# StayEase Backend — Django REST API

The backend is a Django 6.0.6 project serving REST APIs for the web frontend, mobile app, and partner portal. It uses Django REST Framework, session-based auth (web), JWT auth (mobile), and PostgreSQL.

---

## Table of Contents

- [Architecture](#architecture)
- [Django Apps](#django-apps)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Integrations](#integrations)
- [Setup](#setup)
- [Configuration Reference](#configuration-reference)

---

## Architecture

```
stayease_project/           # Django project (settings, urls, wsgi)
├── stayease_app/           # Website catch-all, enquiry forms, custom email backend
├── stayease_supply/        # Owners, properties, rooms, beds, website property listings
├── stayease_sales/         # residents, rent, leads, Zoho e-sign
├── stayease_accounts/      # Vendors, expenses, owner payouts, liabilities, rawdata, files
├── stayease_operations/    # Checklists, complaints, service requests, feedback
├── stayease_partners/      # Owner portal: OTP auth, portfolio views, deduction summaries
├── property_details/       # Property contract agreements
└── resident_details/         # resident contract agreements
```

### Request Flow

```
Client Request
     │
     ▼
SecurityMiddleware → WhiteNoiseMiddleware → CorsMiddleware
     │
     ▼
SessionMiddleware → CsrfViewMiddleware → AuthenticationMiddleware
     │
     ▼
DRF (SessionAuth or JWTAuth) → View → Serializer → Model → PostgreSQL
```

## Recent Changes

- **Django 6.0.6**: Upgraded from Django 5.1.4 to resolve Python 3.14 compatibility (`super.__dict__` AttributeError)
- **Resident checkout with reason**: Added `checkoutReason` field to `resident_Data` model. The sales portal Residents listing page has a checkout modal with date and reason fields
- **Residents listing endpoint**: New `GET /sales/get-all-residents/` queries `resident_Data` directly (bypasses Property→Room→Bed hierarchy) returning all resident fields including KYC, manager assignments, and stay details
- **Liability table fix**: New `GET /accounts/get-checked-out-residents/` endpoint queries checked-out residents directly. Matches on `residentStatus='Inactive'` or past `checkOut` date to handle legacy records
- **Async expense emails**: Expense submission email sends are now non-blocking via `threading.Thread(daemon=True)`
- **RBAC groups**: Migration `0035_create_rbac_groups` sets up Admin, Accounts, Operations, Sales, Supply permission groups
- **Dropdown config**: Centralized `DropdownConfig` model stores property managers, sales managers, comfort classes, meal types, liability statuses
- **Refund management**: Endpoints for eligible transactions, initiate refund, and refund history under `/sales/refunds/`
- **Lease agreements**: Upload lease PDFs per resident via `/sales/upload-lease/<resident_id>/`
- **Resident portal access**: Enable/disable resident portal login via `/sales/enable-portal/<resident_id>/`

---

## Django Apps

### `stayease_app`
- Serves the built React frontend via WhiteNoise
- Handles website enquiry form submissions (`Normal_Enquirie`, `Visit_Enquirie`)
- Custom email backend (`stayease_app.backends.email_backend.EmailBackend`)

### `stayease_resident`
- **Resident portal API** — Dashboard, profile, KYC, rent history, complaints, lease documents
- JWT-protected endpoints at `/resident-portal/`
- Models: `resident_Data`, `resident_Rent_Data` (references from stayease_sales)
- Views: `resident_dashboard()`, `resident_profile()`, `resident_kyc_upload()`, `resident_rent_history()`, `resident_complaints()`
- All endpoints require `@permission_classes([IsAuthenticated])`

### `stayease_supply`
- **Owner management**: CRUD for property owners with KYC documents (Aadhaar, PAN, cheque)
- **Property management**: Properties with amenities, meal types, images, legal documents
- **Room & bed management**: Room types, bed assignments, occupancy tracking
- **Website listings**: `Property_Detail` model with images, descriptions, neighbourhood photos, price boards

### `stayease_sales`
- **Resident management**: Full resident lifecycle — check-in, KYC, rent assignment, check-out
  - Models: `resident_Data` (core resident record), `resident_Rent_Data` (monthly rent tracking)
  - Views: `resident_form()` (create), `resident_data()` (read), `resident_data_update()` (update)
- **Rent tracking**: Monthly rent records with payment status, delay charges, UTR numbers
- **Lead management**: Track enquiry leads from source to conversion
- **E-signatures**: Zoho eSign integration for sending and tracking documents

### `stayease_accounts`
- **Vendor management**: Vendor details with bank info for payments
- **Expense tracking**: Two-level structure — `Expense_Detail` (property-level) → `Expense_Category_Detail` (line items with vendor, receipt, status)
- **Owner payouts**: Fixed expenses (monthly rental payments to owners with TDS deduction)
- **Liabilities**: resident deposit refund tracking
- **Bank rawdata**: Upload bank statements, parse entries, categorize transactions
- **File management**: General-purpose file upload/download

### `stayease_operations`
- **Move-in checklists**: Property condition assessment at resident move-in
- **Move-in feedback**: resident satisfaction survey at check-in
- **Move-out checklists**: Property condition assessment at resident departure
- **Move-out feedback**: resident experience survey at check-out
- **Complaints**: Property complaints with category-based ticket system (electrical, plumbing, furniture, kitchen, internet)
- **Service requests**: Vendor assignment, follow-up tracking, resolution feedback

### `stayease_partners`
- **OTP authentication**: Phone-based login for property owners
- **Portfolio overview**: Total earnings, deductions, property count
- **Property data**: Occupancy rates, room details per property
- **Deduction summaries**: `YearlyDeductionSummary` — monthly deduction values stored as JSON
- **Owner profile**: Personal info, KYC details, bank information

### `property_details`
- **Property contracts**: Agreement documents with terms (rent, deposit, duration, move-out terms)

### `resident_details`
- **Resident contracts**: Public-facing form for resident identity verification (Aadhaar/PAN front/back copies)
- Templates: `templates/resident/resident-form.html`, `resident-success.html`
- Static: `static/resident/css/resident-form.css`, `js/resident-form-v14.js`
- Endpoints: `GET /resident-details/resident-table/`, `POST /resident-details/resident-data/`

---

## Data Model

### Core Entity Hierarchy

```
Owner_Data (supply)
  └── Property_Data (supply)
        └── Room_Data (supply)
              └── Bed_Data (supply)
                    └── resident_Data (sales)
                          ├── resident_Rent_Data (sales)
                          ├── MoveInChecklistDetail (operations)
                          ├── MoveInFeedback (operations)
                          ├── MoveOutChecklistDetail (operations)
                          ├── MoveOutFeedback (operations)
                          ├── PropertyComplaintDetail (operations)
                          └── Liability_Detail (accounts)
```

### Cross-App References

| From (App) | Model | → To (App) | Model | Relationship |
|------------|-------|------------|-------|-------------|
| supply | `Property_Data` | supply | `Owner_Data` | ForeignKey |
| supply | `Room_Data` | supply | `Property_Data` | ForeignKey |
| supply | `Bed_Data` | supply | `Room_Data` | ForeignKey |
| sales | `resident_Data` | supply | `Bed_Data` | ForeignKey (resident assigned to bed) |
| sales | `resident_Rent_Data` | sales | `resident_Data` | ForeignKey |
| accounts | `Expense_Detail` | supply | `Owner_Data` | ForeignKey |
| accounts | `Expense_Category_Detail` | accounts | `Expense_Detail` | ForeignKey |
| accounts | `Expense_Category_Detail` | accounts | `Vendor_Detail` | ForeignKey |
| accounts | `Fixed_Expense_Detail` | supply | `Owner_Data` | ForeignKey |
| accounts | `Liability_Detail` | sales | `resident_Data` | ForeignKey |
| accounts | `Rawdata_Detail` | supply | `Owner_Data` | ForeignKey |
| operations | `MoveInChecklistDetail` | sales | `resident_Data` | ForeignKey |
| operations | `ComplaintCategory` | accounts | `Vendor_Detail` | ForeignKey |
| partners | `YearlyDeductionSummary` | supply | `Owner_Data` | ForeignKey |

### Key Models Summary

| Model | App | Description | Key Fields |
|-------|-----|-------------|------------|
| `Owner_Data` | supply | Property owner | name, phone, email, KYC (Aadhaar/PAN), bank details, document files |
| `Property_Data` | supply | Managed property | name, type, address, rent, deposit, amenities (JSON), meal types (JSON), status |
| `Room_Data` | supply | Room in property | building level, room number, room type, status |
| `Bed_Data` | supply | Individual bed | bed label, room details, resident info, check-in/out, rent, deposit, status |
| `Property_Detail` | supply | Website listing | images (6 slots), description, location, path, iframe link |
| `resident_Data` | sales | Resident record | name, phone, email, KYC (Aadhaar/PAN), check-in/out dates, checkoutReason, rent, deposit, status (Active/Inactive), kycApprovalStatus (Pending/Approved/Rejected), lease agreement |
| `resident_Rent_Data` | sales | Monthly rent record | month, rent amount, delay charges, payment method, UTR, status |
| `Leads_Detail` | sales | Sales lead | date, source, contact info, result, reason if not converted |
| `Vendor_Detail` | accounts | Service vendor | name, contact, category, billing type, bank details |
| `Expense_Detail` | accounts | Expense header | property, head of expense, type, owner |
| `Expense_Category_Detail` | accounts | Expense line item | category, amount, GST, vendor, priority, deadline, receipt, status |
| `Fixed_Expense_Detail` | accounts | Owner payout | property, owner, rental, TDS, deductions, transfer status |
| `Liability_Detail` | accounts | Deposit refund | resident ref, amount, status, UTR, transfer date |
| `RawdataFile` | accounts | Bank statement | uploaded file |
| `Rawdata_Detail` | accounts | Statement entry | date, description, debit/credit, category, status |
| `MoveInChecklistDetail` | operations | Move-in checklist | condition ratings, comments per area |
| `PropertyComplaintDetail` | operations | Complaint | resident, description, preferred time |
| `ComplaintCategory` | operations | Complaint ticket | category type, vendor, status (Open/Follow Up/Closed) |
| `YearlyDeductionSummary` | partners | Owner deductions | year, monthly values (JSON), cumulative total |

---

## Authentication

### Web (Session-based)
- Login: `POST /accounts/login-data/` with `{username, password}`
- Session cookie: `stayease_session`, 8-hour lifetime, HttpOnly, SameSite=Lax
- Logout: `POST /accounts/logout/`
- Auth check: `GET /accounts/auth-check/`

### Mobile (JWT)
- Staff login: `POST /api/token/` with `{username, password}` → returns `{access, refresh, user_type, username}`
- Partner login: `POST /api/partner-login/` with `{phone, otp}` → returns `{access, refresh, phone, user_type: "partners"}`
- Token refresh: `POST /api/token/refresh/` with `{refresh}` → returns `{access}`
- Access token lifetime: 2 hours
- Refresh token lifetime: 7 days (rotated on refresh)
- Header: `Authorization: Bearer <access_token>`

### Partners (OTP)
- Send OTP: `POST /partners/send-otp/` with `{phone}`
- Verify OTP (web): `POST /partners/verify-otp/` with `{phone, otp}` → session
- Verify OTP (mobile): `POST /api/partner-login/` with `{phone, otp}` → JWT

---

## API Endpoints

All endpoints require session or JWT authentication unless noted.

### Mobile Auth (no auth required)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/token/` | `{username, password}` | `{access, refresh, user_type, username}` |
| POST | `/api/token/refresh/` | `{refresh}` | `{access}` |
| POST | `/api/partner-login/` | `{phone, otp}` | `{access, refresh, phone, user_type}` |

### Accounts — `/accounts/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `login-data/` | Staff login (session) |
| POST | `logout/` | Staff logout |
| GET | `auth-check/` | Check session validity |
| GET | `get-vendor-data/` | List all vendors |
| POST | `vendor-form-submit/` | Create vendor |
| PUT | `vendor-data-update/<id>/` | Update vendor |
| GET | `get-expense-data/` | List expenses with categories |
| POST | `expense-form-submit/` | Create expense (multipart) |
| PUT | `accounts-form-update/<id>/` | Update expense category |
| DELETE | `accounts-form-delete/<id>/` | Delete expense/category |
| GET | `get-fixed-expense-data/` | List owner payouts |
| POST | `fixed-expense-form-submit/` | Create owner payout |
| PUT | `accounts-fixed-expense-update/<id>/` | Update payout |
| DELETE | `accounts-fixed-expense-delete/<id>/` | Delete payout |
| GET | `get-liability-data/` | List liabilities |
| POST | `liability-form-submit/` | Create liability |
| PUT | `liability-data-update/<id>/` | Update liability |
| GET | `get-rawdata-file/` | List bank rawdata files |
| POST | `rawdata-file-upload/` | Upload rawdata file |
| GET | `get-rawdata-content/<id>/` | Get file entries |
| DELETE | `rawdata-file-delete/<id>/` | Delete rawdata file |
| GET | `get-other-files/` | List misc files |
| POST | `other-files-upload/` | Upload misc file |
| DELETE | `other-file-delete/<id>/` | Delete misc file |
| GET | `get-beds-data/` | Beds with resident + liability info |
| GET | `get-checked-out-residents/` | Checked-out residents with liability data |
| GET | `get-owner-data/` | Owners with rent + expense totals |
| GET | `get-user-activity-data/` | User login/logout activity |
| GET | `get-dropdown-config/` | Centralized dropdown options |
| GET | `get-staff-names/` | Staff names for assignments |
| POST | `employee-form-submit/` | Create employee record |

### Operations — `/operations/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `get-checklistfeedback-data/` | All checklists & feedbacks |
| POST | `moveinchecklist-form-submit/` | Submit move-in checklist |
| POST | `moveinfeedback-form-submit/` | Submit move-in feedback |
| POST | `moveoutchecklist-form-submit/` | Submit move-out checklist |
| POST | `moveoutfeedback-form-submit/` | Submit move-out feedback |
| GET | `get-propertycomplaint-data/` | All complaints with categories |
| POST | `propertycomplaint-form-submit/` | Submit complaint |
| PUT | `operations-form-update/<id>/` | Update complaint category |
| POST | `feedback-form-submit/` | Submit complaint feedback |
| GET | `get-room-data/` | Rooms & beds data |

### Sales — `/sales/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `get-beds-data/` | Beds with resident + rent records |
| GET | `get-all-residents/` | All residents (direct query, bypasses bed hierarchy) |
| POST | `resident-form-submit/` | Create resident (multipart) |
| PUT | `resident-data-update/<id>/` | Update resident (multipart), handles checkout |
| PUT | `rent-data-update/<id>/` | Update rent record |
| GET | `get-leads-data/` | List leads |
| POST | `leads-form-submit/` | Create lead |
| PUT | `leads-data-update/<id>/` | Update lead |
| DELETE | `leads-data-delete/<id>/` | Delete lead |
| POST | `send/` | Send doc for e-signature |
| GET | `documents/` | List e-sign documents |
| GET | `requests/` | List signing requests |
| POST | `upload-lease/<resident_id>/` | Upload lease agreement PDF |
| POST | `enable-portal/<resident_id>/` | Enable/disable resident portal |
| GET | `refunds/eligible/` | List refund-eligible transactions |
| POST | `refunds/initiate/` | Initiate a payment refund |
| GET | `refunds/history/` | Refund history |

### Supply — `/supply/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `get-owner-data/` | List owners |
| POST | `owner-form-submit/` | Create owner (multipart) |
| PUT | `owner-form-update/<id>/` | Update owner (multipart) |
| DELETE | `owner-form-delete/<id>/` | Delete owner |
| GET | `get-property-data/<id>/` | Properties (0 = all) |
| POST | `property-data-submit/<id>/` | Create property (multipart) |
| PUT | `property-form-update/<id>/` | Update property |
| DELETE | `property-form-delete/<id>/` | Delete property |
| GET | `get-room-data/<id>/` | Rooms (0 = all) |
| POST | `room-form-submit/<id>/` | Create room with beds |
| PUT | `room-data-update/<id>/` | Update room |

### Partners — `/partners/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `send-otp/` | Send OTP to owner phone |
| POST | `verify-otp/` | Verify OTP (session) |
| GET | `get-expense-data/?phone=` | Owner's deductions |
| GET | `get-overall-data/?phone=` | Owner's portfolio overview |
| GET | `get-owner-data/?phone=` | Owner profile + financials |
| GET | `get-property-data/?phone=` | Owner's properties + occupancy |

### Contracts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contract/property-table/` | List property contracts |
| POST | `/contract/submit-contract/` | Create property contract |
| GET | `/resident-details/resident-table/` | List resident contracts |
| POST | `/resident-details/resident-data/` | Submit resident contract |

### Website — `/` (catch-all)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `enquiry-form/` | Submit general enquiry |
| POST | `visit-enquiry-form/` | Submit visit enquiry |
| GET | `get-property-data/` | Public property listings |
| GET | `*` | Serves React SPA (index.html) |

---

## Integrations

### Email (Gmail SMTP)
- Custom backend: `stayease_app.backends.email_backend.EmailBackend`
- Used for: OTP delivery, complaint ticket emails, payout notifications
- Config: `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` in `.env`

### Zoho eSign
- Sends rental agreements for digital signing
- Config: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_REGION`
- Endpoints: `POST /sales/send/`, `GET /sales/documents/`

### AWS S3 (optional)
- File storage for uploaded documents (KYC, receipts, contracts)
- Config: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Currently using local storage with WhiteNoise static serving

---

## Setup

### Prerequisites
- Python 3.14+ (Django 6.0.6 requires Python 3.14 compatibility)
- PostgreSQL running
- `.env` file in project root (see main README)

### Install & Run

```bash
# From project root
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Management Commands

```bash
python manage.py migrate                    # Apply database migrations
python manage.py createsuperuser            # Create admin user
python manage.py collectstatic --noinput    # Collect static files for production
python manage.py makemigrations             # Generate new migrations
python manage.py runserver                  # Start dev server at :8000
```

---

## Configuration Reference

Key settings in `stayease_project/settings.py`:

| Setting | Value | Description |
|---------|-------|-------------|
| `DEBUG` | From `.env` | Enable debug mode |
| `ALLOWED_HOSTS` | `54.146.58.251`, `127.0.0.1`, `localhost` | Permitted hostnames |
| `SESSION_COOKIE_AGE` | 28800 (8 hours) | Session lifetime |
| `SESSION_COOKIE_HTTPONLY` | True | No JS access to session cookie |
| `SESSION_COOKIE_SAMESITE` | Lax | CSRF protection |
| `CORS_ALLOW_ALL_ORIGINS` | `DEBUG` | Allow all origins in dev only |
| `CORS_ALLOW_CREDENTIALS` | True | Send cookies cross-origin |
| `SIMPLE_JWT.ACCESS_TOKEN_LIFETIME` | 2 hours | JWT access token expiry |
| `SIMPLE_JWT.REFRESH_TOKEN_LIFETIME` | 7 days | JWT refresh token expiry |
| `SIMPLE_JWT.ROTATE_REFRESH_TOKENS` | True | New refresh token on each refresh |
| `DEFAULT_AUTO_FIELD` | BigAutoField | Default primary key type |

### Installed Apps

```
stayease_app             # Website, catch-all, email backend
stayease_supply          # Owners, properties, rooms, beds, listings
stayease_sales           # residents, rent, leads, e-sign
stayease_accounts        # Vendors, expenses, payouts, liabilities, rawdata
stayease_operations      # Checklists, complaints, feedback
stayease_partners        # Owner portal, OTP auth, deduction summaries
property_details         # Property contracts
resident_details           # resident contracts
rest_framework           # Django REST Framework
rest_framework_simplejwt # JWT authentication
corsheaders              # CORS headers
storages                 # Django-storages (S3)
```
