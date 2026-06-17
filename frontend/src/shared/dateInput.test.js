/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { isValidIsoDateInRange, normalizeDateTextValue, validateFormInputs } from './dateInput';

describe('dateInput validation', () => {
  it('allows lease end dates in a future year', () => {
    const nextYear = `${new Date().getFullYear() + 1}-06-01`;

    expect(isValidIsoDateInRange(nextYear)).toBe(true);
  });
});

describe('form validation', () => {
  it('normalizes keyboard-entered dates like 2026 into a valid ISO date', () => {
    expect(normalizeDateTextValue('2026')).toBe('2026-01-01');
    expect(normalizeDateTextValue('202605')).toBe('2026-05-01');
  });

  it('blocks empty required fields before submit', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.required = true;
    input.name = 'name';
    form.appendChild(input);

    const result = validateFormInputs(form);

    expect(result.valid).toBe(false);
    expect(result.input).toBe(input);
  });

  it('rejects names that contain digits or special characters', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'fullName';
    input.value = 'John2';
    form.appendChild(input);

    const result = validateFormInputs(form);

    expect(result.valid).toBe(false);
    expect(result.input).toBe(input);
  });

  it('allows username fields to keep special characters that are valid for login credentials', () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'username';
    input.value = 'john.doe_123';
    form.appendChild(input);

    const result = validateFormInputs(form);

    expect(result.valid).toBe(true);
    expect(result.input).toBe(null);
  });
});
