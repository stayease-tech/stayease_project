import { z } from 'zod';

// ─── Reusable field schemas ──────────────────────────────────────────

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Phone must be 10 digits starting with 6-9');

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address');

export const optionalEmailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .or(z.literal(''))
  .optional();

export const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount')
  .refine(v => parseFloat(v) >= 0, 'Amount cannot be negative')
  .refine(v => parseFloat(v) <= 99999999, 'Amount exceeds maximum');

export const aadhaarSchema = z
  .string()
  .trim()
  .regex(/^\d{12}$/, 'Aadhaar must be 12 digits')
  .or(z.literal(''))
  .optional();

export const panSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'PAN must be in ABCDE1234F format')
  .or(z.literal(''))
  .optional();

export const ifscSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
  .or(z.literal(''))
  .optional();

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Pincode must be 6 digits');

// ─── Form schemas ────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const residentLoginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

export const ownerFormSchema = z.object({
  ownerName: z.string().trim().min(1, 'Owner name is required'),
  ownerPhone: phoneSchema,
  ownerEmail: optionalEmailSchema,
  aadharNumber: aadhaarSchema,
  panNumber: panSchema,
  bankAccountNumber: z.string().trim().optional(),
  bankIfscCode: ifscSchema,
});

export const propertyFormSchema = z.object({
  propertyName: z.string().trim().min(1, 'Property name is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  foundedYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
  doorBuilding: z.string().trim().min(1, 'Building number is required'),
  streetAddress: z.string().trim().min(1, 'Street address is required'),
  area: z.string().trim().min(1, 'Area is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  pincode: pincodeSchema,
  rent: amountSchema,
  deposit: amountSchema,
});

export const residentFormSchema = z.object({
  residentName: z.string().trim().min(1, 'Name is required'),
  phoneNumber: phoneSchema,
  email: optionalEmailSchema,
  aadharNumber: aadhaarSchema,
  panNumber: panSchema,
});

export const vendorFormSchema = z.object({
  vendorName: z.string().trim().min(1, 'Vendor name is required'),
  vendorPhone: phoneSchema,
  vendorEmail: optionalEmailSchema,
  vendorCategory: z.string().min(1, 'Category is required'),
});

export const expenseFormSchema = z.object({
  expensePropertyName: z.string().min(1, 'Property name is required'),
  expenseName: z.string().trim().min(1, 'Expense name is required'),
});

export const leadFormSchema = z.object({
  leadName: z.string().trim().min(1, 'Lead name is required'),
  leadPhone: phoneSchema,
  leadSource: z.string().min(1, 'Lead source is required'),
});

export const liabilityFormSchema = z.object({
  residentName: z.string().trim().min(1, 'Resident name is required'),
  refundAmount: amountSchema,
});

// ─── Validation helper ────────────────────────────────────────────────

/**
 * Validate form data against a Zod schema.
 * Returns { success: true, data } or { success: false, errors: { fieldName: 'error message' } }
 */
export function validateForm(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}
