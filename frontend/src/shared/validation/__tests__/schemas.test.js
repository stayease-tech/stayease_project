import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  emailSchema,
  optionalEmailSchema,
  amountSchema,
  aadhaarSchema,
  panSchema,
  ifscSchema,
  pincodeSchema,
  loginSchema,
  residentLoginSchema,
  ownerFormSchema,
  vendorFormSchema,
  leadFormSchema,
  validateForm,
} from '../schemas';

// ─── phoneSchema ────────────────────────────────────────────────────

describe('phoneSchema', () => {
  it.each(['9876543210', '6000000000', '7123456789', '8999999999'])(
    'accepts valid phone %s',
    (val) => {
      expect(phoneSchema.safeParse(val).success).toBe(true);
    },
  );

  it('trims whitespace before validating', () => {
    expect(phoneSchema.safeParse(' 9876543210 ').success).toBe(true);
  });

  it.each([
    ['5000000000', 'does not start with 6-9'],
    ['1234567890', 'starts with 1'],
    ['987654321', 'only 9 digits'],
    ['98765432101', '11 digits'],
    ['98765abcde', 'contains letters'],
    ['', 'empty string'],
  ])('rejects %s (%s)', (val) => {
    expect(phoneSchema.safeParse(val).success).toBe(false);
  });
});

// ─── emailSchema ────────────────────────────────────────────────────

describe('emailSchema', () => {
  it.each(['user@example.com', 'a.b+c@test.co.in', 'name@domain.org'])(
    'accepts valid email %s',
    (val) => {
      expect(emailSchema.safeParse(val).success).toBe(true);
    },
  );

  it('trims whitespace', () => {
    expect(emailSchema.safeParse(' user@example.com ').success).toBe(true);
  });

  it.each(['notanemail', '@missing.com', 'user@', 'user@.com', ''])(
    'rejects invalid email %s',
    (val) => {
      expect(emailSchema.safeParse(val).success).toBe(false);
    },
  );
});

// ─── optionalEmailSchema ────────────────────────────────────────────

describe('optionalEmailSchema', () => {
  it('accepts a valid email', () => {
    expect(optionalEmailSchema.safeParse('a@b.com').success).toBe(true);
  });

  it('accepts empty string', () => {
    expect(optionalEmailSchema.safeParse('').success).toBe(true);
  });

  it('accepts undefined', () => {
    expect(optionalEmailSchema.safeParse(undefined).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(optionalEmailSchema.safeParse('bad').success).toBe(false);
  });
});

// ─── amountSchema ───────────────────────────────────────────────────

describe('amountSchema', () => {
  it.each(['0', '100', '99999999', '1234.56', '0.99'])(
    'accepts valid amount %s',
    (val) => {
      expect(amountSchema.safeParse(val).success).toBe(true);
    },
  );

  it('rejects negative amounts', () => {
    const r = amountSchema.safeParse('-1');
    expect(r.success).toBe(false);
  });

  it('rejects amount exceeding maximum', () => {
    const r = amountSchema.safeParse('100000000');
    expect(r.success).toBe(false);
  });

  it.each(['abc', '12.345', '', '12..34', '12,34'])(
    'rejects non-numeric / bad format %s',
    (val) => {
      expect(amountSchema.safeParse(val).success).toBe(false);
    },
  );
});

// ─── aadhaarSchema ──────────────────────────────────────────────────

describe('aadhaarSchema', () => {
  it('accepts valid 12-digit aadhaar', () => {
    expect(aadhaarSchema.safeParse('123456789012').success).toBe(true);
  });

  it('accepts empty string (optional)', () => {
    expect(aadhaarSchema.safeParse('').success).toBe(true);
  });

  it('accepts undefined (optional)', () => {
    expect(aadhaarSchema.safeParse(undefined).success).toBe(true);
  });

  it.each(['12345678901', '1234567890123', 'abcdefghijkl', '12345 678901'])(
    'rejects invalid aadhaar %s',
    (val) => {
      expect(aadhaarSchema.safeParse(val).success).toBe(false);
    },
  );
});

// ─── panSchema ──────────────────────────────────────────────────────

describe('panSchema', () => {
  it('accepts valid PAN ABCDE1234F', () => {
    expect(panSchema.safeParse('ABCDE1234F').success).toBe(true);
  });

  it('accepts empty string (optional)', () => {
    expect(panSchema.safeParse('').success).toBe(true);
  });

  it('accepts undefined (optional)', () => {
    expect(panSchema.safeParse(undefined).success).toBe(true);
  });

  it.each(['abcde1234f', 'ABCDE1234', '12345ABCDE', 'ABCDEABCDF', 'ABCD12345F'])(
    'rejects invalid PAN %s',
    (val) => {
      expect(panSchema.safeParse(val).success).toBe(false);
    },
  );
});

// ─── ifscSchema ─────────────────────────────────────────────────────

describe('ifscSchema', () => {
  it('accepts valid IFSC like SBIN0001234', () => {
    expect(ifscSchema.safeParse('SBIN0001234').success).toBe(true);
  });

  it('accepts empty string (optional)', () => {
    expect(ifscSchema.safeParse('').success).toBe(true);
  });

  it('accepts undefined (optional)', () => {
    expect(ifscSchema.safeParse(undefined).success).toBe(true);
  });

  it.each(['sbin0001234', 'SBIN1001234', 'SBIN000123', 'SBIN00012345'])(
    'rejects invalid IFSC %s',
    (val) => {
      expect(ifscSchema.safeParse(val).success).toBe(false);
    },
  );
});

// ─── pincodeSchema ──────────────────────────────────────────────────

describe('pincodeSchema', () => {
  it('accepts valid 6-digit pincode', () => {
    expect(pincodeSchema.safeParse('560001').success).toBe(true);
  });

  it.each(['56000', '5600011', 'abcdef', ''])(
    'rejects invalid pincode %s',
    (val) => {
      expect(pincodeSchema.safeParse(val).success).toBe(false);
    },
  );
});

// ─── loginSchema ────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const r = loginSchema.safeParse({ username: 'admin', password: 'secret' });
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ username: 'admin', password: 'secret' });
  });

  it('fails when username is missing', () => {
    const r = loginSchema.safeParse({ username: '', password: 'secret' });
    expect(r.success).toBe(false);
  });

  it('fails when password is missing', () => {
    const r = loginSchema.safeParse({ username: 'admin', password: '' });
    expect(r.success).toBe(false);
  });

  it('trims username', () => {
    const r = loginSchema.safeParse({ username: ' admin ', password: 'p' });
    expect(r.success).toBe(true);
    expect(r.data.username).toBe('admin');
  });
});

// ─── residentLoginSchema ────────────────────────────────────────────

describe('residentLoginSchema', () => {
  it('accepts valid phone and password', () => {
    const r = residentLoginSchema.safeParse({ phone: '9876543210', password: 'pass' });
    expect(r.success).toBe(true);
  });

  it('fails with invalid phone', () => {
    const r = residentLoginSchema.safeParse({ phone: '1234', password: 'pass' });
    expect(r.success).toBe(false);
  });

  it('fails with missing password', () => {
    const r = residentLoginSchema.safeParse({ phone: '9876543210', password: '' });
    expect(r.success).toBe(false);
  });
});

// ─── ownerFormSchema ────────────────────────────────────────────────

describe('ownerFormSchema', () => {
  const validOwner = {
    ownerName: 'John Doe',
    ownerPhone: '9876543210',
    ownerEmail: 'john@example.com',
    aadharNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    bankAccountNumber: '12345678',
    bankIfscCode: 'SBIN0001234',
  };

  it('accepts a complete valid owner form', () => {
    expect(ownerFormSchema.safeParse(validOwner).success).toBe(true);
  });

  it('accepts with optional fields empty', () => {
    const r = ownerFormSchema.safeParse({
      ownerName: 'Jane',
      ownerPhone: '9876543210',
      ownerEmail: '',
      aadharNumber: '',
      panNumber: '',
      bankAccountNumber: '',
      bankIfscCode: '',
    });
    expect(r.success).toBe(true);
  });

  it('fails when ownerName is missing', () => {
    const r = ownerFormSchema.safeParse({ ...validOwner, ownerName: '' });
    expect(r.success).toBe(false);
  });

  it('fails when ownerPhone is invalid', () => {
    const r = ownerFormSchema.safeParse({ ...validOwner, ownerPhone: '123' });
    expect(r.success).toBe(false);
  });
});

// ─── vendorFormSchema ───────────────────────────────────────────────

describe('vendorFormSchema', () => {
  const validVendor = {
    vendorName: 'Acme Corp',
    vendorPhone: '9876543210',
    vendorEmail: 'vendor@acme.com',
    vendorCategory: 'plumbing',
  };

  it('accepts a valid vendor form', () => {
    expect(vendorFormSchema.safeParse(validVendor).success).toBe(true);
  });

  it('accepts with optional email empty', () => {
    const r = vendorFormSchema.safeParse({ ...validVendor, vendorEmail: '' });
    expect(r.success).toBe(true);
  });

  it('fails when vendorName is missing', () => {
    const r = vendorFormSchema.safeParse({ ...validVendor, vendorName: '' });
    expect(r.success).toBe(false);
  });

  it('fails when vendorPhone is invalid', () => {
    const r = vendorFormSchema.safeParse({ ...validVendor, vendorPhone: '000' });
    expect(r.success).toBe(false);
  });

  it('fails when vendorCategory is missing', () => {
    const r = vendorFormSchema.safeParse({ ...validVendor, vendorCategory: '' });
    expect(r.success).toBe(false);
  });
});

// ─── leadFormSchema ─────────────────────────────────────────────────

describe('leadFormSchema', () => {
  const validLead = {
    leadName: 'Alice',
    leadPhone: '9123456789',
    leadSource: 'website',
  };

  it('accepts a valid lead form', () => {
    expect(leadFormSchema.safeParse(validLead).success).toBe(true);
  });

  it('fails when leadName is empty', () => {
    const r = leadFormSchema.safeParse({ ...validLead, leadName: '' });
    expect(r.success).toBe(false);
  });

  it('fails when leadPhone is invalid', () => {
    const r = leadFormSchema.safeParse({ ...validLead, leadPhone: '5555' });
    expect(r.success).toBe(false);
  });

  it('fails when leadSource is missing', () => {
    const r = leadFormSchema.safeParse({ ...validLead, leadSource: '' });
    expect(r.success).toBe(false);
  });
});

// ─── validateForm helper ────────────────────────────────────────────

describe('validateForm', () => {
  it('returns { success: true, data } for valid input', () => {
    const result = validateForm(loginSchema, { username: 'admin', password: 'pass' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ username: 'admin', password: 'pass' });
    expect(result.errors).toBeUndefined();
  });

  it('returns { success: false, errors } for invalid input', () => {
    const result = validateForm(loginSchema, { username: '', password: '' });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors.username).toBeDefined();
    expect(result.errors.password).toBeDefined();
  });

  it('only includes the first error per field', () => {
    // phone fails the regex, which is the single error for that field
    const result = validateForm(residentLoginSchema, { phone: 'x', password: '' });
    expect(result.success).toBe(false);
    expect(typeof result.errors.phone).toBe('string');
  });

  it('works with nested form schemas', () => {
    const result = validateForm(ownerFormSchema, {
      ownerName: '',
      ownerPhone: 'bad',
      ownerEmail: 'notanemail',
      aadharNumber: '123',
      panNumber: 'bad',
      bankAccountNumber: '',
      bankIfscCode: 'bad',
    });
    expect(result.success).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(2);
  });
});
