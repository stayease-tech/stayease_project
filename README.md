# StayEase — Property Management System

A full-stack property management platform for co-living and PG operators. This repo includes:
- a Django backend
- a React web frontend
- a resident portal
- a partner portal
- a mobile app integration

## Table of Contents

- [Overview](#overview)
- [Supported Portals](#supported-portals)
- [Requirements](#requirements)
- [Windows Setup](#windows-setup)
- [macOS Setup](#macos-setup)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Demo Users](#demo-users)
- [Environment Variables](#environment-variables)
- [Useful Commands](#useful-commands)
- [Notes](#notes)

## Overview

StayEase is a multi-portal property management system for co-living and PG businesses. It handles property onboarding, resident management, rent collection, expense tracking, complaints, owner payouts, and partner access.

## Supported Portals

- **Public Website** — property listings, blog, enquiry forms
- **Supply Portal** — owner/property/room/bed management
- **Sales Portal** — resident onboarding, rent tracking, leads, KYC management, checkout with reason, lease agreements, e-sign
- **Accounts Portal** — vendor payments, expenses, fixed expenses, liabilities (deposit refunds), rawdata
- **Operations Portal** — checklists, complaints, service requests
- **Partner Portal** — owner earnings, deductions, portfolio
- **Resident Portal** — profile, KYC, rent history, complaints, lease

## Requirements

- Python 3.14
- PostgreSQL
- Node.js 18+ and npm
- Optional: Expo CLI for the mobile app repository

## Windows Setup

1. Open PowerShell.
2. From the repo root:

```powershell
cd C:\Users\swamy\Project\PMS_Stayease
python -m venv .venv
.\.venv\Scripts\activate
cd backend
pip install -r requirements.txt
```

3. Create `.env` in the repo root using `.env.example` as a template.
4. Create the database and configure `.env`.
5. Run migrations and create a superuser:

```powershell
cd backend
python manage.py migrate
python manage.py createsuperuser
```

6. Start the backend:

```powershell
python manage.py runserver
```

7. In another PowerShell window, start the frontend:

```powershell
cd C:\Users\swamy\Project\PMS_Stayease\frontend
npm install
npm run dev
```

## macOS Setup

1. Open Terminal.
2. From the repo root:

```bash
cd /Users/swamy/Project/PMS_Stayease
python3 -m venv .venv
source .venv/bin/activate
cd backend
pip install -r requirements.txt
```

3. Create `.env` in the repo root from `.env.example`.
4. Create the database and configure `.env`.
5. Run migrations and create a superuser:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

6. Start the backend:

```bash
python manage.py runserver
```

7. In another terminal window, start the frontend:

```bash
cd /Users/swamy/Project/PMS_Stayease/frontend
npm install
npm run dev
```

## Running the Backend

From the repo root:

```bash
cd backend
source ../.venv/bin/activate   # macOS
# or .\.venv\Scripts\activate   # Windows
python manage.py runserver
```

The backend listens on `http://127.0.0.1:8000`.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend listens on `http://localhost:5173`.

## Demo Users

A root-level demo script is included: `create_demo_users.py`.

### Run the demo user script

From the repo root:

```bash
# macOS
source .venv/bin/activate
python create_demo_users.py

# Windows
.\.venv\Scripts\activate
python create_demo_users.py
```

### Demo credentials

- Admin: `admin` / `Stayease@123`
- Accounts: `accounts` / `Stayease@123`
- Operations: `operations` / `Stayease@123`
- Sales: `sales` / `Stayease@123`
- Supply: `supply` / `Stayease@123`
- Resident: `9876543210` / `Resident@1234`
- Partner: `partner_9999999999` (OTP flow only)

## Environment Variables

Create a `.env` file in the repo root with the following values:

```text
SECRET_KEY=django-insecure-...
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
NAME=stayease_local
USER=swamy
PASSWORD=Pass@1234
HOST=localhost
PORT=5432
EMAIL_HOST_USER=hello@mystayease.com
EMAIL_HOST_PASSWORD=<app-password>
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
FRONTEND_BASE_URL=http://localhost:5173
```

Optional values:

```text
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_REGION=in
```

## Useful Commands

```bash
cd backend
python manage.py migrate
python manage.py makemigrations
python manage.py createsuperuser
python manage.py test
python manage.py collectstatic --noinput
```

```bash
cd frontend
npm install
npm run dev
npm run build
```

## Notes

- Do not commit `.env`.
- The repo root now contains `create_demo_users.py` and `DEMO_USERS.md`.
- The backend settings load `.env` from the repo root.
