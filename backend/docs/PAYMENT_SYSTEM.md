# Stayease Payment System — Technical Documentation

## Overview

Stayease uses **PayU India** as the payment gateway with a **Hosted Checkout** integration pattern. The resident is redirected to PayU's secure payment page — card data never touches our servers, keeping PCI DSS compliance scope at **SAQ A** level.

The system supports three payment modes:
1. **One-time rent payment** — resident pays a specific month's rent
2. **Recurring auto-pay (Standing Instructions)** — automated monthly deductions tied to lease duration
3. **Admin-initiated refunds** — processed back to the original payment method

---

## Architecture

```
┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend   │────▶│   PayU API   │
│  (React 19)  │◀────│  (Django)   │◀────│  (Hosted)    │
└──────────────┘     └─────────────┘     └──────────────┘
                           ▲│
┌──────────────┐           ││
│  Mobile App  │───────────┘│
│ (React Native│◀───────────┘
│  + Expo)     │
└──────────────┘     ┌────────────┐
                     │ PostgreSQL │
                     └────────────┘
```

**Key Principle**: All hash computation and sensitive operations happen server-side only. The merchant salt is never exposed to the frontend.

---

## Data Models

### `PaymentTransaction` (`stayease_sales/models.py`)

Audit trail for every one-time payment attempt.

| Field | Type | Description |
|-------|------|-------------|
| `txnid` | CharField(64), unique | Transaction ID (format: `SE` + 18 hex chars) |
| `resident` | FK → resident_Data | The paying resident |
| `rent_record` | FK → resident_Rent_Data, nullable | The rent month being paid |
| `amount` | DecimalField(10,2) | Payment amount |
| `product_info` | CharField(100) | Description (e.g., "Rent - April 2026") |
| `status` | CharField(20) | `initiated` / `success` / `failed` |
| `payu_status` | CharField(50), nullable | Raw status from PayU callback |
| `created_at` | DateTimeField | When payment was initiated |
| `updated_at` | DateTimeField | Last update |

### `RecurringMandate` (`stayease_sales/models.py`)

Tracks PayU Standing Instruction mandates for auto-pay.

| Field | Type | Description |
|-------|------|-------------|
| `txnid` | CharField(64), unique | Consent transaction ID (format: `SESI` + 16 hex) |
| `resident` | FK → resident_Data | The resident who set up auto-pay |
| `auth_payu_id` | CharField(128), nullable | PayU mandate token (set after consent success) |
| `billing_amount` | DecimalField(10,2) | Monthly charge amount (from `rentPerMonth`) |
| `billing_cycle` | CharField(20) | Always `MONTHLY` |
| `start_date` | DateField | From resident's `checkIn` |
| `end_date` | DateField | From resident's `checkOut` |
| `status` | CharField(20) | `initiated` / `active` / `paused` / `revoked` / `expired` |
| `next_charge_date` | DateField, nullable | When the next charge will execute |
| `last_charged_date` | DateField, nullable | When the last charge succeeded |

### `PaymentRefund` (`stayease_sales/models.py`)

Tracks refunds against successful payments.

| Field | Type | Description |
|-------|------|-------------|
| `transaction` | FK → PaymentTransaction | The original payment being refunded |
| `refund_amount` | DecimalField(10,2) | Amount to refund (supports partial) |
| `reason` | TextField | Admin-provided reason for refund |
| `status` | CharField(20) | `initiated` / `processing` / `success` / `failed` |
| `payu_refund_id` | CharField(128), nullable | PayU's refund reference ID |
| `initiated_by` | FK → User, nullable | Admin user who triggered the refund |

---

## Payment Flows

### Flow 1: One-Time Rent Payment

**Resident Portal → PayU Hosted Checkout → Callback → Rent Updated**

```
Step 1: Resident clicks "Pay ₹X" on pending rent
     ↓
Step 2: Frontend POSTs to /resident-portal/payments/payu/init/
        Backend:
        - Validates resident owns the rent record
        - Generates txnid (SE + uuid)
        - Computes SHA-512 forward hash:
          key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
        - Creates PaymentTransaction(status='initiated')
        - Returns PayU form data to frontend
     ↓
Step 3: Frontend auto-submits hidden HTML form to PayU base URL
        Resident completes payment on PayU's hosted page
     ↓
Step 4a: SUCCESS → PayU POSTs to /resident-portal/payments/payu/success/
         Backend:
         - Verifies reverse hash (salt|status||||||udf5|...|key)
         - Checks idempotency (won't process same txnid twice)
         - Verifies callback amount matches initiated amount
         - Marks PaymentTransaction → 'success'
         - Updates rent record: rentStatus='Received', transferType='Online - PayU'
         - Redirects to frontend /resident/payment-result?status=success

Step 4b: FAILURE → PayU POSTs to /resident-portal/payments/payu/failure/
         Backend:
         - Verifies reverse hash
         - Marks PaymentTransaction → 'failed'
         - Redirects to frontend /resident/payment-result?status=failed

Step 4c: WEBHOOK (fallback) → PayU POSTs to /resident-portal/payments/payu/webhook/
         Catches cases where browser redirect was missed (user closed tab, network issue)
         Same processing logic as success/failure callbacks
```

### Flow 2: Recurring Mandate Setup (SI Consent)

**Resident Portal → PayU SI Hosted Page → Consent Callback → Mandate Activated**

```
Step 1: Resident clicks "Set up Auto-Pay"
     ↓
Step 2: Frontend POSTs to /resident-portal/payments/payu/si-consent/
        Backend:
        - Checks no active mandate exists for this resident
        - Validates checkIn/checkOut dates (YYYY-MM-DD format)
        - Validates rentPerMonth as billing amount
        - Builds si_details JSON (minified):
          {"billingAmount":"X","billingCurrency":"INR","billingCycle":"MONTHLY",
           "billingInterval":1,"paymentStartDate":"YYYY-MM-DD",
           "paymentEndDate":"YYYY-MM-DD","billingRule":"MAX","billingLimit":"ON"}
        - Computes SI hash:
          key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||si_details|salt
        - Creates RecurringMandate(status='initiated')
        - Returns form data with si=1, api_version=7, si_details
     ↓
Step 3: Frontend auto-submits form to PayU
        Resident authorizes e-mandate on PayU's page
     ↓
Step 4a: SUCCESS → PayU POSTs to /resident-portal/payments/payu/si-success/
         - Verifies reverse hash
         - Extracts authPayUId (the mandate token for future charges)
         - Sets mandate status → 'active'
         - Calculates next_charge_date (1st of next month or start_date, whichever is later)

Step 4b: FAILURE → PayU POSTs to /resident-portal/payments/payu/si-failure/
         - Verifies hash, keeps mandate as 'initiated'
```

### Flow 3: Recurring Charge Execution (Server-Side Cron)

**Management Command → Pre-Debit Notification → SI Charge → Rent Record Created**

```
Daily cron: 0 6 * * * ./venv/bin/python manage.py charge_recurring_rents

Phase 1 — Pre-Debit Notifications (48 hours before charge):
  - Find mandates WHERE status='active' AND next_charge_date = today + 2 days
  - Call PayU pre_debit_SI API [STUB — requires SI enablement]
  - RBI requires minimum 24-hour notice; we send 48 hours early

Phase 2 — Execute Charges (due today):
  - Find mandates WHERE status='active' AND next_charge_date = today
  - If end_date < today → mark mandate as 'expired', skip
  - Call PayU si_transaction API [STUB — requires SI enablement]
  - On success:
    - Create resident_Rent_Data record (month, amount, transferType='Auto-Pay (SI)')
    - Update mandate: last_charged_date = today, advance next_charge_date by 1 month
    - If next_charge_date > end_date → mark mandate as 'expired'
```

### Flow 4: Mandate Cancellation

**Resident cancels anytime (RBI requirement)**

```
Step 1: Resident clicks "Cancel Auto-Pay" (with confirmation dialog)
     ↓
Step 2: Frontend POSTs to /resident-portal/payments/mandate/cancel/
        Backend:
        - Finds active mandate for this resident
        - Calls PayU mandate_revoke API [STUB]
        - Sets mandate status → 'revoked'
```

### Flow 5: Admin-Initiated Refund

**Admin dashboard → Select transaction → Issue refund → Credited to original method**

```
Step 1: Admin views eligible transactions
        GET /sales/refunds/eligible/
        Returns successful payments with remaining refundable balance

Step 2: Admin initiates refund
        POST /sales/refunds/initiate/
        Body: { txnid, amount, reason }
        Backend:
        - Validates txnid is a successful transaction
        - Calculates total already refunded on this txn
        - Validates refund_amount ≤ remaining refundable balance
        - Creates PaymentRefund(status='initiated')
        - Calls PayU cancel_refund_transaction API [STUB]
        - On success: status → 'processing', updates PayU refund ID
        - If full refund: rent record status → 'Refunded'

Step 3: Admin views refund history
        GET /sales/refunds/history/
        Lists all refunds with status, amounts, who initiated

PayU API (when keys are live):
  - Command: cancel_refund_transaction
  - Hash: sha512(key|command|var1|salt) where var1 = txnid
  - Refund goes to original payment method (RBI mandate)
  - Timeline: 5-7 business days
```

### Flow 6: Webhook (Server-to-Server Fallback)

```
PayU POSTs to /resident-portal/payments/payu/webhook/
  - Verifies hash
  - Checks PaymentTransaction table first, then RecurringMandate table
  - Processes the same way as redirect callbacks
  - Returns JSON status (not redirect)
  - Configure this URL in PayU merchant dashboard
```

---

## API Endpoints Reference

### Resident Portal (JWT-authenticated, prefix: `/resident-portal/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/payu/init/` | JWT | Initiate one-time payment |
| POST | `/payments/payu/success/` | None (CSRF exempt) | PayU success callback |
| POST | `/payments/payu/failure/` | None (CSRF exempt) | PayU failure callback |
| POST | `/payments/payu/webhook/` | None (CSRF exempt) | PayU server-to-server webhook |
| POST | `/payments/payu/si-consent/` | JWT | Initiate SI mandate consent |
| POST | `/payments/payu/si-success/` | None (CSRF exempt) | SI consent success callback |
| POST | `/payments/payu/si-failure/` | None (CSRF exempt) | SI consent failure callback |
| GET | `/payments/mandate/status/` | JWT | Get active mandate info |
| POST | `/payments/mandate/cancel/` | JWT | Cancel active mandate |
| GET | `/rent-history/` | JWT | List rent records |
| GET | `/invoices/<id>/` | JWT | Invoice detail |

### Admin / Sales Portal (Session-authenticated, prefix: `/sales/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/refunds/eligible/` | Session | List refund-eligible transactions |
| POST | `/refunds/initiate/` | Session | Initiate a refund |
| GET | `/refunds/history/` | Session | List all refunds |

---

## Security & Compliance

### Hash Verification

**Forward hash** (payment init → PayU):
```
SHA-512( key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt )
```

**SI forward hash** (SI consent init → PayU):
```
SHA-512( key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||si_details|salt )
```
Note: `si_details` is the minified JSON string (no whitespace).

**Reverse hash** (PayU callback → our server):
```
SHA-512( salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key )
```

**Server-to-server API hash** (for SI charges, refunds, mandate revoke):
```
SHA-512( key|command|var1|salt )
```

### PCI DSS v4.0.1

- **Hosted Checkout** — card data handled entirely by PayU (SAQ A scope)
- **No raw card storage** — we only store transaction IDs and mandate tokens
- **Hash salt** stored in environment variable, never in client code

### TLS / Transport Security

```python
SECURE_SSL_REDIRECT = True          # Force HTTPS in production
SECURE_HSTS_SECONDS = 31536000      # 1-year HSTS
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```

### RBI Compliance

| Requirement | Implementation |
|-------------|---------------|
| Pre-debit notification (24hr+) | Sent 48 hours before charge via management command |
| Mandate cancellation anytime | `/payments/mandate/cancel/` endpoint |
| Refund to original method | PayU `cancel_refund_transaction` routes refund to original instrument |
| Data localisation | Deploy on India-based servers (AWS ap-south-1) |
| e-Mandate AFA | First consent requires OTP on PayU's hosted page |
| >₹15k monthly debit | Requires OTP each cycle (RBI limit) — consider e-NACH for higher limits |

### Website Disclosures (PayU Activation Requirements)

| Disclosure | URL | Status |
|------------|-----|--------|
| Terms & Conditions | `/Terms-conditions` | Live |
| Privacy Policy | `/privacy-policy` | Live |
| Refund & Cancellation Policy | `/refund-policy` | Live |
| Contact Information | Footer (address, phone, email) | Live |
| Grievance Officer | `/refund-policy` section 7 | Live |

---

## Configuration

### Environment Variables (`.env`)

```env
PAYU_MERCHANT_KEY=              # From PayU dashboard
PAYU_MERCHANT_SALT=             # From PayU dashboard (NEVER expose client-side)
PAYU_BASE_URL=https://test.payu.in/_payment          # Test: test.payu.in, Live: secure.payu.in
PAYU_SUCCESS_URL=https://yourdomain.com/resident-portal/payments/payu/success/
PAYU_FAILURE_URL=https://yourdomain.com/resident-portal/payments/payu/failure/
PAYU_SI_SUCCESS_URL=https://yourdomain.com/resident-portal/payments/payu/si-success/
PAYU_SI_FAILURE_URL=https://yourdomain.com/resident-portal/payments/payu/si-failure/
FRONTEND_BASE_URL=https://yourdomain.com
```

### Django Settings (`settings.py`)

```python
PAYU_CONFIG = {
    'merchant_key': os.getenv('PAYU_MERCHANT_KEY', ''),
    'merchant_salt': os.getenv('PAYU_MERCHANT_SALT', ''),
    'base_url': os.getenv('PAYU_BASE_URL', 'https://test.payu.in/_payment'),
    'success_url': ...,
    'failure_url': ...,
    'si_success_url': ...,
    'si_failure_url': ...,
}
```

### Cron Job (Recurring Charges)

```bash
# Run daily at 6:00 AM IST
0 6 * * * cd /path/to/backend && ./venv/bin/python manage.py charge_recurring_rents >> /var/log/stayease/recurring_charges.log 2>&1
```

---

## Stubbed Components (Pending PayU SI Enablement)

These functions are fully structured but log intent instead of making real API calls. They become functional once PayU merchant keys are provided and SI is enabled on the account.

| Function | Location | PayU Command |
|----------|----------|-------------|
| `_execute_si_charge()` | `stayease_resident/views.py` | `si_transaction` |
| `_send_pre_debit_notification()` | `stayease_resident/views.py` | `pre_debit_SI` |
| `_revoke_mandate_on_payu()` | `stayease_resident/views.py` | `mandate_revoke` |
| `_process_payu_refund()` | `stayease_sales/views.py` | `cancel_refund_transaction` |

Each stub contains commented-out implementation code with the correct hash formula and API endpoint, ready to uncomment when keys are available.

---

## Mobile App Integration

The React Native + Expo mobile app (`StayEase-Mobile/`) uses a **WebView-based checkout** pattern that works identically for both one-time payments and SI mandate consent.

### Flow

```
1. Resident taps "Pay Now" (invoice) or "Set up Auto-Pay" (dashboard)
2. Mobile calls backend init endpoint (payu/init/ or payu/si-consent/)
3. Backend returns { payuBaseUrl, paymentData } with server-computed hash
4. Mobile generates auto-submit HTML form via createPayUCheckoutHtml()
5. WebView loads the HTML → auto-submits to PayU hosted checkout
6. Resident completes payment on PayU's page
7. PayU POSTs to backend success/failure callback
8. Backend redirects to: {FRONTEND_BASE_URL}/resident/payment-result?status=...&txnid=...
9. WebView intercepts URL containing "/resident/payment-result"
10. Mobile parses query params → navigates to native ResidentPaymentResultScreen
```

### Key Files (Mobile)

| File | Purpose |
|------|---------|
| `src/payments/payu.js` | `createPayUCheckoutHtml()` — generates auto-submit HTML form with hidden fields |
| `src/screens/resident/ResidentPaymentScreen.js` | WebView screen with redirect interception (`handled` ref guard prevents double-fire) |
| `src/screens/resident/ResidentPaymentResultScreen.js` | Native success/failure result screen |
| `src/screens/resident/ResidentInvoiceScreen.js` | "Pay Now" button triggers one-time payment |
| `src/screens/resident/ResidentDashboardScreen.js` | Auto-pay setup/cancel UI with mandate status |
| `src/api/endpoints.js` | `initResidentPayUPayment`, `initResidentSIConsent`, `getResidentMandateStatus`, `cancelResidentMandate` |

### Mobile Endpoints Used

| Function | Backend Endpoint | Purpose |
|----------|-----------------|---------|
| `initResidentPayUPayment(data)` | `POST /resident-portal/payments/payu/init/` | One-time payment init |
| `initResidentSIConsent(data)` | `POST /resident-portal/payments/payu/si-consent/` | SI mandate consent init |
| `getResidentMandateStatus()` | `GET /resident-portal/payments/mandate/status/` | Check active mandate |
| `cancelResidentMandate()` | `POST /resident-portal/payments/mandate/cancel/` | Cancel active mandate |

### WebView Redirect Interception

The backend's `_payu_redirect()` helper generates `HttpResponseRedirect` to `{FRONTEND_BASE_URL}/resident/payment-result?status=...&txnid=...&amount=...&type=...`. The mobile WebView intercepts any URL containing `/resident/payment-result`, parses the query string, and uses `navigation.replace()` to show the native result screen. A `useRef(false)` guard prevents the handler from firing twice on iOS (where both `onShouldStartLoadWithRequest` and `onNavigationStateChange` trigger).

---

## File Map

```
backend/
├── stayease_sales/
│   ├── models.py                    # PaymentTransaction, RecurringMandate, PaymentRefund
│   ├── views.py                     # Refund endpoints (admin)
│   ├── urls.py                      # /sales/refunds/*
│   └── migrations/
│       ├── 0012_paymenttransaction.py
│       ├── 0013_recurringmandate.py
│       └── 0014_paymentrefund.py
├── stayease_resident/
│   ├── views.py                     # All payment views (init, callbacks, webhook, SI, mandate)
│   ├── urls.py                      # /resident-portal/payments/*
│   └── management/
│       └── commands/
│           └── charge_recurring_rents.py  # Daily cron for SI charges
├── stayease_project/
│   └── settings.py                  # PAYU_CONFIG, TLS/HSTS settings
└── docs/
    └── PAYMENT_SYSTEM.md            # This file

StayEase-Mobile/src/         # React Native + Expo mobile app
├── payments/
│   └── payu.js                      # Auto-submit HTML generator for WebView checkout
├── screens/resident/
│   ├── ResidentPaymentScreen.js     # WebView checkout (one-time + SI)
│   ├── ResidentPaymentResultScreen.js  # Native result screen
│   ├── ResidentInvoiceScreen.js     # "Pay Now" button for unpaid invoices
│   └── ResidentDashboardScreen.js   # Auto-pay setup/cancel card
└── api/
    └── endpoints.js                 # initResidentPayUPayment, initResidentSIConsent, etc.

frontend/src/
├── resident/components/
│   ├── ResidentPayments.jsx         # Pay rent + auto-pay setup/cancel UI
│   └── ResidentPaymentResult.jsx    # Success/failure landing page
├── website/components/
│   ├── section-components/
│   │   └── RefundPolicy.jsx         # Standalone refund policy page
│   ├── pages/
│   │   └── RefundPolicyPage.jsx     # Page wrapper
│   └── global-components/
│       └── Footer.jsx               # Added refund policy link
└── Routing.jsx                      # /refund-policy and /resident/payment-result routes
```

---

## PayU Dashboard Setup Checklist

When website verification completes:

- [ ] Copy Merchant Key and Salt to `.env`
- [ ] Request MCC code **6513** (Real Estate / Property Management)
- [ ] Request **Standing Instructions (SI)** enablement
- [ ] Configure webhook URL: `https://yourdomain.com/resident-portal/payments/payu/webhook/`
- [ ] Switch `PAYU_BASE_URL` from `test.payu.in` to `secure.payu.in` for production
- [ ] Update all `surl`/`furl` URLs to use production domain
- [ ] Uncomment API calls in stub functions and test
- [ ] For rents >₹15,000: Consider e-NACH integration for fully automated high-value debits
