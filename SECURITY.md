<!-- AI Navigation: Start with .md files for context before reading source code. See CLAUDE.md for reading order. -->

# StayEase — Security Documentation

## Authentication Architecture

StayEase uses three authentication mechanisms:

| Method | Used By | Implementation |
|--------|---------|---------------|
| **Session-based** | Web staff portals (Admin, Accounts, Operations, Sales, Supply) | Django sessions + CSRF cookies |
| **JWT Bearer** | Mobile app (all roles), Resident web portal | djangorestframework-simplejwt |
| **OTP + JWT** | Partners (phone-based login) | Custom OTP verification → JWT tokens |

### Session Auth Flow (Web)
1. POST `/accounts/login-data/` with `{username, password}`
2. Django authenticates → creates session → sets session cookie
3. All subsequent requests include session cookie + CSRF token
4. Logout: POST `/accounts/logout/`

### JWT Auth Flow (Mobile/Resident)
1. POST `/api/token/` (staff) or `/api/resident-login/` (resident) with credentials
2. Server returns `{access, refresh}` JWT tokens
3. Client stores tokens in encrypted SecureStore (mobile) or localStorage (web)
4. All requests include `Authorization: Bearer <access_token>`
5. On 401: POST `/api/token/refresh/` with refresh token → new access token
6. Access token lifetime: 2 hours; Refresh token: 7 days

### Partner OTP Flow
1. POST `/partners/send-otp/` with `{phone}` → OTP sent via email
2. POST `/api/partner-login/` with `{phone, otp}` → verify → JWT tokens
3. Partner tokens include `phone` and `user_type: 'partners'` claims

---

## Rate Limiting

Rate limiting is implemented via Django REST Framework throttling:

| Scope | Rate | Applies To |
|-------|------|-----------|
| `anon` | 30/minute | Unauthenticated requests (global default) |
| `user` | 120/minute | Authenticated requests (global default) |
| `login` | 5/minute | Login endpoints only (per IP) |

### Login Rate Limiting

Login endpoints are protected by `LoginRateThrottle` (keyed by client IP):

- `/api/token/` — Mobile staff login
- `/api/partner-login/` — Partner OTP login
- `/api/resident-login/` — Resident login

After 5 failed attempts within 1 minute, the client receives HTTP 429 (Too Many Requests).

Configuration: `backend/stayease_project/throttles.py`

---

## CSRF Protection

- Django's `CsrfViewMiddleware` is enabled globally
- CSRF cookie settings:
  - `CSRF_COOKIE_HTTPONLY = False` — JS needs to read the token for SPA requests
  - `CSRF_COOKIE_SAMESITE = 'Lax'` — Prevents cross-site POST
  - `CSRF_COOKIE_SECURE = True` in production (HTTPS only)
- `@csrf_exempt` is used on some views that serve both session and JWT clients; DRF's `APIView` handles this correctly by exempting CSRF for token-authenticated requests

---

## CORS Configuration

- `CORS_ALLOW_ALL_ORIGINS = True` in development only (`DEBUG=True`)
- `CORS_ALLOW_CREDENTIALS = True` — Required for session cookie transmission
- In production: Use `CORS_ALLOWED_ORIGINS` whitelist

---

## Security Headers

Configured in `settings.py`:

| Setting | Value | Purpose |
|---------|-------|---------|
| `SECURE_BROWSER_XSS_FILTER` | `True` | X-XSS-Protection header |
| `SECURE_CONTENT_TYPE_NOSNIFF` | `True` | Prevents MIME sniffing |
| `X_FRAME_OPTIONS` | `DENY` | Prevents clickjacking |
| `SESSION_COOKIE_SECURE` | `True` (prod) | HTTPS-only session cookies |
| `CSRF_COOKIE_SECURE` | `True` (prod) | HTTPS-only CSRF cookies |
| `SESSION_COOKIE_HTTPONLY` | `True` | JS cannot access session cookie |
| `SESSION_COOKIE_SAMESITE` | `Lax` | Prevents CSRF via cross-site requests |

---

## Password Policy

Django password validators are enabled:

1. **UserAttributeSimilarityValidator** — Prevents passwords similar to username/email
2. **MinimumLengthValidator** — Minimum 8 characters
3. **CommonPasswordValidator** — Blocks common passwords (20,000+ dictionary)
4. **NumericPasswordValidator** — Prevents all-numeric passwords

**Resident password formula**: First 4 chars of last name + `@` + last 4 digits of phone.
Example: "Ravi Kumar" + 9876547890 → `Kuma@7890`

---

## Input Validation

### Backend Validators (`stayease_project/validators.py`)

| Validator | Rules |
|-----------|-------|
| `validate_phone` | 10 digits, starts with 6-9, strips +91 prefix |
| `validate_email` | Standard email regex |
| `validate_financial_amount` | Numeric, non-negative, max 99,999,999 |
| `validate_aadhaar` | 12 digits |
| `validate_pan` | ABCDE1234F format |
| `validate_ifsc` | ABCD0123456 format |
| `validate_pincode` | 6 digits |
| `validate_file_size` | Max 10MB (documents), 5MB (images) |
| `validate_image_file` | Allowed extensions: jpg, jpeg, png, gif, bmp, webp, pdf |
| `validate_document_file` | Allowed extensions: jpg, jpeg, png, gif, bmp, webp, pdf |
| `validate_data_file` | Allowed extensions: csv, xlsx, xls |
| `sanitize_text` | Strip whitespace, max 500 chars |
| `validate_required` | Non-empty check |

### Frontend/Mobile Validators (Zod schemas)

Identical validation schemas are used in both web frontend and mobile app:
- `frontend/src/shared/validation/schemas.js`
- `StayEase-Mobile/src/utils/validation.js`

See `TESTING.md` for the full schema list.

---

## File Upload Security

- File size limits enforced: 5MB for images, 10MB for documents
- File type validation by extension (server-side)
- Files stored via Django's default storage backend (local or S3)
- Upload paths use date-based directories: `documents/<type>/%Y/%m/%d/`

---

## Session Security

| Setting | Value |
|---------|-------|
| Session lifetime | 8 hours |
| Renew on each request | Yes (`SESSION_SAVE_EVERY_REQUEST = True`) |
| HTTPOnly | Yes |
| SameSite | Lax |
| Secure (prod) | Yes |

---

## Known Limitations

1. **Financial data as CharField**: Rent, deposit, and expense amounts are stored as `CharField` in the database, not `DecimalField`. Validation is enforced at the view/frontend level but not at the database level.

2. **No RBAC on API endpoints**: All authenticated staff users can access all staff endpoints regardless of their role. Role-based access is enforced at the frontend routing level only.

3. **Partner tokens are stateless**: Partner JWT tokens contain `phone` and `user_type` claims but are not tied to a Django User object. Token revocation is not possible without implementing a blacklist.

4. **No certificate pinning**: The mobile app does not pin SSL certificates. This is acceptable for development but should be considered for production.

---

## Reporting Security Issues

If you discover a security vulnerability, please report it privately to the development team. Do not create public issues for security vulnerabilities.
