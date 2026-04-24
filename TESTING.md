<!-- AI Navigation: Start with .md files for context before reading source code. See CLAUDE.md for reading order. -->

# StayEase — Testing Guide

## Overview

StayEase uses three testing frameworks across its codebases:

| Codebase | Framework | Config | Command |
|----------|-----------|--------|---------|
| **Backend** (Django) | pytest + pytest-django | `backend/pytest.ini` | `cd backend && pytest` |
| **Frontend** (React) | Vitest + @testing-library/react | `frontend/vite.config.js` | `cd frontend && npm test` |
| **Mobile** (React Native) | Jest + @testing-library/react-native | `StayEase-Mobile/jest.config.js` | `cd StayEase-Mobile && npm test` |

---

## Backend Tests

### Setup

```bash
cd backend
source ../.venv/bin/activate
pip install -r requirements.txt   # includes pytest, pytest-django, pytest-cov, factory-boy, faker
```

### Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest stayease_accounts/test_auth.py

# Run specific test
pytest stayease_accounts/test_auth.py::test_staff_login_valid_credentials

# Run with coverage report
pytest --cov=. --cov-report=html

# Skip slow tests (if marked)
pytest -m "not slow"
```

### Test Structure

```
backend/
├── conftest.py                          # Shared fixtures (client, users, auth)
├── pytest.ini                           # pytest configuration
├── tests/
│   └── test_smoke.py                    # Smoke tests for all endpoints
├── stayease_accounts/
│   ├── test_auth.py                     # Auth flow tests (login, logout, JWT, rate limiting)
│   └── test_accounts.py                # Accounts CRUD tests
├── stayease_supply/
│   └── test_supply.py                  # Supply CRUD tests
├── stayease_sales/
│   └── test_sales.py                   # Sales endpoint tests
├── stayease_operations/
│   └── test_operations.py             # Operations endpoint tests
└── stayease_project/
    └── test_validators.py              # Input validator unit tests
```

### Shared Fixtures (conftest.py)

| Fixture | Description |
|---------|-------------|
| `client` | Django test client |
| `staff_user` | Regular staff user (username: teststaff) |
| `admin_user` | Superuser (username: testadmin) |
| `authenticated_client` | Pre-logged-in Django client |
| `api_client` | DRF APIClient |
| `authenticated_api_client` | DRF APIClient with forced auth |

### Test Categories

- **Auth tests**: Login/logout flows, JWT token generation, rate limiting verification
- **Validator tests**: Phone, email, financial amount, Aadhaar, PAN, IFSC, file upload validation
- **CRUD tests**: Endpoint response codes, data retrieval, authentication requirements
- **Smoke tests**: Every GET endpoint returns non-500 response

---

## Frontend Tests

### Setup

```bash
cd frontend
npm install   # includes vitest, @testing-library/react, @testing-library/jest-dom
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/shared/validation/__tests__/schemas.test.js
```

### Test Structure

```
frontend/src/
├── test/
│   └── setup.js                         # Global test setup (@testing-library/jest-dom)
├── shared/
│   ├── validation/
│   │   ├── schemas.js                   # Zod validation schemas
│   │   └── __tests__/
│   │       └── schemas.test.js          # Schema unit tests
│   └── __tests__/
│       └── Dashboard.test.jsx           # Dashboard smoke test
└── website/
    └── components/pages/
        └── __tests__/
            └── ResidentLogin.test.jsx   # Resident login component tests
```

### Writing Frontend Tests

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## Mobile Tests

### Setup

```bash
cd StayEase-Mobile
npm install   # includes jest-expo, @testing-library/react-native
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npx jest --watch

# Run with coverage
npx jest --coverage

# Run specific test
npx jest src/utils/__tests__/validation.test.js
```

### Test Structure

```
StayEase-Mobile/src/
├── utils/
│   ├── validation.js                    # Zod validation schemas
│   └── __tests__/
│       ├── validation.test.js           # Schema tests
│       └── helpers.test.js              # Utility function tests
├── api/
│   └── __tests__/
│       └── client.test.js               # API client & interceptor tests
└── components/
    └── __tests__/
        ├── Button.test.js               # Button component tests
        └── Input.test.js                # Input component tests
```

---

## Validation Schemas (Shared)

Both frontend and mobile use identical Zod schemas for input validation:

| Schema | Fields Validated |
|--------|-----------------|
| `phoneSchema` | 10-digit Indian mobile (starts with 6-9) |
| `emailSchema` | Standard email format |
| `amountSchema` | Non-negative number, max 99,999,999 |
| `aadhaarSchema` | 12-digit Aadhaar number |
| `panSchema` | ABCDE1234F format |
| `ifscSchema` | ABCD0123456 format |
| `pincodeSchema` | 6-digit Indian pincode |
| `loginSchema` | Username + password required |
| `ownerFormSchema` | Name, phone, email, identity docs |
| `propertyFormSchema` | Name, type, year, address, financials |
| `residentFormSchema` | Name, phone, email, identity docs |
| `vendorFormSchema` | Name, phone, email, category |
| `leadFormSchema` | Name, phone, source |

Usage:
```js
import { validateForm, ownerFormSchema } from './validation/schemas';

const result = validateForm(ownerFormSchema, formData);
if (!result.success) {
  // result.errors = { fieldName: 'error message', ... }
}
```

---

## Adding New Tests

### Backend
1. Create `test_*.py` in the relevant app directory
2. Use pytest fixtures from `conftest.py`
3. Follow the pattern: `def test_<action>_<condition>(fixture):`

### Frontend
1. Create `__tests__/<Component>.test.jsx` next to the component
2. Import from `vitest` and `@testing-library/react`
3. Mock external dependencies with `vi.mock()`

### Mobile
1. Create `__tests__/<module>.test.js` next to the source file
2. Use `jest-expo` preset for React Native compatibility
3. Mock native modules (SecureStore, etc.) with `jest.mock()`
