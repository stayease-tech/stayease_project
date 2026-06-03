# StayEase Payment System — Technical Documentation

## 1. Overview

StayEase uses **Razorpay** as the payment gateway. Supported payment methods:

- **Card** (credit/debit — Visa, Mastercard, Rupay)
- **UPI** (Razorpay modal)
- **Net Banking**
- **Wallets** (Paytm, PhonePe, etc.)
- **UPI QR Code** (single-use, fixed-amount, 5-minute expiry)
- **Subscriptions / Auto-Pay** (Razorpay e-mandates for recurring monthly rent)

Card and bank data are handled entirely by Razorpay's hosted checkout modal. Our servers never see or process card numbers — PCI DSS scope is **SAQ A**.

---

## 2. Architecture

### 2.1 One-Time Payment Flow

```
Resident clicks Pay
    → POST /payments/init/       (backend creates Razorpay order, returns orderId + keyId)
    → Frontend opens Razorpay modal (window.Razorpay)
    → Resident pays in modal
    → Razorpay calls handler(response) in JS
    → POST /payments/verify/      (backend verifies HMAC signature, updates DB)
    → Navigate to /resident/payment-result
    
    [Safety net] Razorpay webhook → POST /payments/webhook/
                                  → handles payment.captured event
```

### 2.2 UPI QR Code Flow

```
Resident clicks QR
    → POST /payments/qr/generate/  (backend creates single-use QR, returns image URL + expiry)
    → Frontend shows QR modal with 5-minute countdown
    → Frontend polls GET /payments/qr/status/ every 5 seconds
    → Resident scans QR on phone
    → Payment captured → GET /payments/qr/status/ returns {status: 'paid'}
    → Navigate to success page

    [Safety net] Razorpay webhook → POST /payments/webhook/
                                  → handles qr_code.closed event
```

### 2.3 Subscription / Auto-Pay Flow

```
Resident clicks Set up Auto-Pay
    → POST /payments/subscription/init/   (create Razorpay plan + subscription)
    → Frontend opens Razorpay modal with subscription_id
    → Resident authorises mandate
    → Razorpay calls handler(response) in JS
    → POST /payments/subscription/verify/ (verify subscription signature, activate mandate)
    
    [Monthly auto-charge] Razorpay charges automatically
    → Webhook → subscription.charged → creates resident_Rent_Data record
    
    [Reconciliation] charge_recurring_rents management command (daily cron)
    → Checks for missed charges, expires old mandates
```

---

## 3. API Reference

### 3.1 POST `/payments/init/`
**Auth:** JWT (IsResident)

**Request:**
```json
{
  "amount": "10000",
  "rentId": 42,
  "productInfo": "Rent - June 2026"
}
```

**Response (200):**
```json
{
  "success": true,
  "orderId": "order_XYZ",
  "keyId": "rzp_live_XXXX",
  "amount": 1000000,
  "currency": "INR",
  "prefill": {"name": "...", "email": "...", "contact": "..."},
  "notes": {"resident_id": "5", "rent_id": "42"}
}
```

---

### 3.2 POST `/payments/verify/`
**Auth:** JWT (IsResident)

**Request:**
```json
{
  "razorpay_payment_id": "pay_XXXX",
  "razorpay_order_id": "order_XXXX",
  "razorpay_signature": "HMAC_SIG"
}
```

**Response (200):**
```json
{"success": true, "txnid": "SE...", "amount": "10000.00"}
```

---

### 3.3 POST `/payments/qr/generate/`
**Auth:** JWT (IsResident)

**Request:**
```json
{"amount": "10000", "rentId": 42}
```

**Response (200):**
```json
{
  "success": true,
  "qrCodeId": "qr_XXXX",
  "qrImageUrl": "https://rzp.io/i/qr.png",
  "amount": "10000",
  "expiresAt": 1748900000
}
```

---

### 3.4 GET `/payments/qr/status/?qrCodeId=qr_XXXX`
**Auth:** JWT (IsResident)

**Response:**
```json
{"status": "pending" | "paid" | "expired"}
```

---

### 3.5 POST `/payments/webhook/`
**Auth:** None (HMAC-SHA256 via `X-Razorpay-Signature` header)

Receives Razorpay server-to-server events. Always returns `{"status": "ok"}` (200).

---

### 3.6 POST `/payments/subscription/init/`
**Auth:** JWT (IsResident)

**Response (200):**
```json
{
  "success": true,
  "subscriptionId": "sub_XXXX",
  "keyId": "rzp_live_XXXX",
  "prefill": {"name": "...", "email": "...", "contact": "..."}
}
```

---

### 3.7 POST `/payments/subscription/verify/`
**Auth:** JWT (IsResident)

**Request:**
```json
{
  "razorpay_payment_id": "pay_XXXX",
  "razorpay_subscription_id": "sub_XXXX",
  "razorpay_signature": "HMAC_SIG"
}
```

**Response:** `{"success": true, "type": "mandate"}`

---

### 3.8 GET `/payments/mandate/status/`
**Auth:** JWT (IsResident)

**Response:**
```json
{
  "success": true,
  "hasMandate": true,
  "mandate": {
    "id": 1,
    "status": "active",
    "billingAmount": "10000.00",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "nextChargeDate": "2026-07-01"
  }
}
```

---

### 3.9 POST `/payments/mandate/cancel/`
**Auth:** JWT (IsResident)

Cancels the active subscription on Razorpay and marks mandate `revoked`.

---

## 4. Environment Variables

| Variable | Purpose | Where to get it |
|----------|---------|----------------|
| `RAZORPAY_KEY_ID` | Public key for frontend modal | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Secret key for backend API calls | Razorpay Dashboard → Settings → API Keys (shown once) |
| `RAZORPAY_WEBHOOK_SECRET` | HMAC secret for webhook verification | Razorpay Dashboard → Settings → Webhooks → Secret |

**Test mode:** Use keys prefixed `rzp_test_` for development.
**Live mode:** Use keys prefixed `rzp_live_` for production.

---

## 5. Razorpay Dashboard Setup

1. **API Keys:** Settings → API Keys → Generate Key Pair
2. **Webhook URL:** Settings → Webhooks → Add New Webhook
   - URL: `https://<your-domain>/resident-portal/payments/webhook/`
   - Enable events: `payment.captured`, `payment.failed`, `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `qr_code.closed`
3. **Webhook Secret:** Copy the generated secret → set as `RAZORPAY_WEBHOOK_SECRET` in `.env`
4. **Subscriptions:** Ensure "Subscriptions" product is enabled on your Razorpay account

---

## 6. QR Code Flow Details

- QR codes are **single-use** (`usage: 'single_use'`) — one payment per QR
- Amount is **fixed** (`fixed_amount: True`) — cannot be modified by the payer
- QR expires in **5 minutes** (`close_by: now + 300`)
- Frontend shows a live countdown timer
- Frontend polls `/payments/qr/status/` every 5 seconds
- Webhook `qr_code.closed` is the authoritative update path

---

## 7. Subscription Flow Details

- One Razorpay Plan is created per subscription setup
- `total_count` = number of months in the lease
- `customer_notify: 1` — Razorpay sends pre-debit SMS/email (RBI requirement)
- Residents can cancel anytime via `/payments/mandate/cancel/`
- Webhook `subscription.charged` creates the `resident_Rent_Data` record

---

## 8. Reconciliation Cron

**Command:** `python manage.py charge_recurring_rents`

**Schedule (recommended):** `0 8 * * *` (8 AM daily)

**What it does:**
1. Expires mandates where `end_date < today`
2. For active mandates where `next_charge_date <= today`:
   - Fetches subscription status from Razorpay
   - Syncs cancelled subscriptions → marks mandate `revoked`
   - Creates missing rent records if Razorpay shows a charge but our webhook missed it

---

## 9. Refund Process

**Endpoint:** `POST /sales/refunds/initiate/` (Sales team only)

**Process:**
1. Admin provides `txnid`, `amount`, `reason`
2. Backend validates refund amount ≤ remaining refundable balance
3. Calls `client.payment.refund(gateway_payment_id, {amount: paise})`
4. On success: `PaymentRefund.status = 'processing'`, `gateway_refund_id` stored
5. If full refund: `resident_Rent_Data.rentStatus = 'Refunded'`
6. Timeline: 5–7 business days to original payment method (RBI mandate)

**Partial refunds:** Multiple partial refunds are allowed as long as total ≤ original amount.

---

## 10. Compliance

### PCI DSS v4.0.1 (SAQ A)
- No card data on our servers — Razorpay hosted checkout handles all sensitive data
- Only `gateway_order_id`, `gateway_payment_id`, `gateway_status` stored in our DB
- TLS/HTTPS mandatory in production

### RBI Guidelines
- Pre-debit notification handled by Razorpay (`customer_notify: 1`)
- Mandate cancellation available anytime (no conditions)
- AFA (UPI PIN / OTP) handled by Razorpay checkout
- Refund to original payment method enforced by Razorpay

### NPCI UPI Standards
- NPCI-compliant UPI QR generated by Razorpay API
- `close_by` = 5 minutes, `usage = 'single_use'`, `fixed_amount = True`

---

## 11. Troubleshooting

### Signature Verification Fails
- Verify `RAZORPAY_WEBHOOK_SECRET` matches the secret in Razorpay Dashboard
- For payment verify: ensure `razorpay_payment_id + "|" + razorpay_order_id` is signed correctly
- Never log raw signature values in production

### Webhook Not Received
- Verify webhook URL is publicly accessible (HTTPS required)
- Check Razorpay Dashboard → Webhooks → Delivery Attempts for error details
- Razorpay retries for 24 hours — the reconciliation cron is the final fallback

### QR Code Not Scanning
- Ensure `image_url` from Razorpay is served over HTTPS
- QR may have expired (5-minute window) — have resident generate a new one
- Check `close_reason` via `/payments/qr/status/`

### Subscription Not Charging
- Verify subscription `status = 'active'` on Razorpay Dashboard
- Check `total_count` — subscription auto-expires after all charges complete
- Run `python manage.py charge_recurring_rents` manually to reconcile
